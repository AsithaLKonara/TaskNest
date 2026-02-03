"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2 } from "lucide-react"
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc, runTransaction } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { Order } from "@/types"

interface ReviewModalProps {
    isOpen: boolean
    onClose: () => void
    order: Order
    onReviewSubmitted: () => void
}

export function ReviewModal({ isOpen, onClose, order, onReviewSubmitted }: ReviewModalProps) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating")
            return
        }

        setSubmitting(true)
        try {
            await runTransaction(db, async (transaction) => {
                // 1. Create Review Document
                const reviewRef = doc(collection(db, "reviews"))
                transaction.set(reviewRef, {
                    orderId: order.orderId,
                    reviewerId: order.clientId,
                    targetId: order.freelancerId,
                    rating,
                    comment,
                    createdAt: serverTimestamp()
                })

                // 2. Update Freelancer Profile Stats
                const freelancerRef = doc(db, "freelancerProfiles", order.freelancerId)
                const freelancerDoc = await transaction.get(freelancerRef)

                if (freelancerDoc.exists()) {
                    const data = freelancerDoc.data()
                    const currentRating = data.rating || 0
                    const currentCount = data.reviewCount || 0

                    // Simple average update logic
                    // New Average = ((Current * Count) + New) / (Count + 1)
                    const newRating = ((currentRating * currentCount) + rating) / (currentCount + 1)

                    transaction.update(freelancerRef, {
                        rating: newRating,
                        reviewCount: increment(1)
                    })
                }
            })

            toast.success("Review submitted successfully!")
            onReviewSubmitted()
            onClose()
        } catch (error) {
            console.error("Error submitting review:", error)
            toast.error("Failed to submit review")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rate Freelancer</DialogTitle>
                    <DialogDescription>
                        Please rate your experience with this freelancer to complete the order.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                    <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`p-1 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                                <Star className="w-8 h-8 fill-current" />
                            </button>
                        ))}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                        {rating > 0 ? `${rating} Star${rating > 1 ? 's' : ''}` : 'Select a rating'}
                    </div>
                </div>

                <div className="space-y-4">
                    <Textarea
                        placeholder="Share your feedback..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Skip</Button>
                    <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
