"use client"

import { useState } from "react"
import { doc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Order } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, UploadCloud } from "lucide-react"

interface DeliverableFormProps {
    order: Order
    onSuccess?: () => void
}

export function DeliverableForm({ order, onSuccess }: DeliverableFormProps) {
    const [loading, setLoading] = useState(false)
    const [fileUrl, setFileUrl] = useState("")
    const [comment, setComment] = useState("")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!fileUrl) return

        setLoading(true)
        try {
            const orderRef = doc(db, "orders", order.orderId)
            const newVersion = (order.deliverables?.length || 0) + 1

            await updateDoc(orderRef, {
                status: 'delivered',
                deliverables: arrayUnion({
                    version: newVersion,
                    url: fileUrl,
                    comment,
                    submittedAt: Date.now(),
                    status: 'pending'
                })
            })

            toast.success("Deliverable submitted successfully!")
            setFileUrl("")
            setComment("")
            if (onSuccess) onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Failed to submit deliverable")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
                <UploadCloud className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Submit Deliverable</h3>
            </div>

            <div className="space-y-2">
                <Label htmlFor="fileUrl">Deliverable Link (e.g. Drive, Dropbox, or File URL)</Label>
                <Input
                    id="fileUrl"
                    placeholder="https://..."
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="comment">Message to Client</Label>
                <Textarea
                    id="comment"
                    placeholder="Explain what you have delivered..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !fileUrl}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Approval
            </Button>
        </form>
    )
}
