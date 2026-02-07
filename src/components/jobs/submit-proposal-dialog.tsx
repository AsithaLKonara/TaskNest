"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { db } from "@/lib/firebase"
import { increment, doc, updateDoc, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore"
import { createNotification } from "@/lib/notifications"
import { Job } from "@/types"
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
import { Loader2 } from "lucide-react"

interface SubmitProposalDialogProps {
    job: Job
}

export function SubmitProposalDialog({ job }: SubmitProposalDialogProps) {
    const { user, role } = useAuth()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [coverLetter, setCoverLetter] = useState("")
    const [quote, setQuote] = useState(job.budget.toString())
    const [estimatedDays, setEstimatedDays] = useState("7")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || role !== 'freelancer') return

        if (!coverLetter.trim()) {
            toast.error("Please write a cover letter")
            return
        }

        setLoading(true)
        try {
            // Check if already applied
            const q = query(
                collection(db, "proposals"),
                where("jobId", "==", job.jobId),
                where("freelancerId", "==", user.uid)
            )
            const existing = await getDocs(q)
            if (!existing.empty) {
                toast.error("You have already applied for this job.")
                setLoading(false)
                return
            }

            await addDoc(collection(db, "proposals"), {
                jobId: job.jobId,
                freelancerId: user.uid,
                freelancerName: user.displayName,
                message: coverLetter,
                quote: parseFloat(quote),
                estimatedDays: parseInt(estimatedDays),
                status: "pending",
                createdAt: serverTimestamp(),
            })

            // Notify Client
            await createNotification(
                job.clientId,
                "New Proposal",
                `${user.displayName} sent a proposal for "${job.title}"`,
                "info",
                `/dashboard/client/jobs/${job.jobId}`
            )

            // Update freelancer metrics
            const freelancerRef = doc(db, "freelancerProfiles", user.uid)
            await updateDoc(freelancerRef, {
                "metrics.proposalsSentCount": increment(1),
                "lastActiveAt": Date.now()
            })

            toast.success("Proposal submitted successfully!")
            setOpen(false)
            setCoverLetter("")
        } catch (error) {
            console.error("Error submitting proposal:", error)
            toast.error("Failed to submit proposal")
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null
    if (role !== 'freelancer') return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full">Apply Now</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Submit Proposal</DialogTitle>
                    <DialogDescription>
                        Apply for <strong>{job.title}</strong>. Client budget is ${job.budget}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quote">Your Quote ($)</Label>
                            <Input
                                id="quote"
                                type="number"
                                value={quote}
                                onChange={(e) => setQuote(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="days">Estimated Days</Label>
                            <Input
                                id="days"
                                type="number"
                                value={estimatedDays}
                                onChange={(e) => setEstimatedDays(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="coverLetter">Cover Letter</Label>
                        <Textarea
                            id="coverLetter"
                            placeholder="Why are you the best fit for this job?"
                            className="min-h-[150px]"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Proposal
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
