"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { FreelancerProfile } from "@/types"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Briefcase } from "lucide-react"
import { useRouter } from "next/navigation"

interface HireFreelancerDialogProps {
    freelancer: FreelancerProfile
}

export function HireFreelancerDialog({ freelancer }: HireFreelancerDialogProps) {
    const { user, role } = useAuth()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form State
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [budget, setBudget] = useState("")
    const [deadline, setDeadline] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || role !== 'client') return

        if (!title || !description || !budget || !deadline) {
            toast.error("Please fill in all fields")
            return
        }

        setLoading(true)
        try {
            // 1. Create a "hidden" job for this order (optional, but good for data structure)
            // Or directly create the order. Blueprint says "Direct Hire (No job post)".
            // Let's create an Order directly. But wait, order needs a jobId usually?
            // The schema says: order -> { jobId, ... }. 
            // If we don't have a job, we can creating a placeholder job OR allow null jobId.
            // For data consistency, creating a "Direct Hire" job record (status: closed/in-progress) is safest.

            const jobRef = await addDoc(collection(db, "jobs"), {
                clientId: user.uid,
                clientName: user.displayName,
                title: `Direct Hire: ${title}`,
                description: description,
                category: "Direct Hire",
                budget: parseFloat(budget),
                deadline: new Date(deadline).getTime(),
                status: "in-progress", // Auto-assigned
                createdAt: serverTimestamp(),
            })

            // 2. Create the Order
            await addDoc(collection(db, "orders"), {
                jobId: jobRef.id,
                clientId: user.uid,
                freelancerId: freelancer.uid,
                price: parseFloat(budget),
                status: "active",
                paymentProofUrl: null,
                createdAt: serverTimestamp()
            })

            toast.success("Hiring request sent! Order created.")
            setOpen(false)
            router.push("/dashboard/client/orders")
        } catch (error) {
            console.error("Error hiring freelancer:", error)
            toast.error("Failed to process hiring request")
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null
    if (role !== 'client') return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full gap-2">
                    Hire Now <Briefcase className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Hire {freelancer.title || "Freelancer"}</DialogTitle>
                    <DialogDescription>
                        Create a direct order to start working immediately.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Project Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Redesign Company Logo"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="budget">Budget ($)</Label>
                            <Input
                                id="budget"
                                type="number"
                                placeholder="500"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Deadline</Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Project Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe what needs to be done..."
                            className="min-h-[100px]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm & Hire
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
