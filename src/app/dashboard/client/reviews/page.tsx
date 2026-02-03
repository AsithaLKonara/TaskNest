"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Review } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Star } from "lucide-react"
import { format } from "date-fns"
import { formatSafeDate } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ClientReviewsPage() {
    const { user } = useAuth()
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchReviews() {
            if (!user) return
            try {
                // Fetch reviews given by this client
                const q = query(
                    collection(db, "reviews"),
                    where("reviewerId", "==", user.uid)
                )
                const querySnapshot = await getDocs(q)
                const fetchedReviews = querySnapshot.docs.map(doc => ({
                    reviewId: doc.id,
                    ...doc.data()
                })) as Review[]

                fetchedReviews.sort((a, b) => b.createdAt - a.createdAt)
                setReviews(fetchedReviews)
            } catch (error) {
                console.error("Error fetching reviews:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchReviews()
    }, [user])

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">My Reviews</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Reviews you have given to freelancers.</p>
                </div>
            </div>

            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                            <Star className="h-12 w-12 mb-4 opacity-20" />
                            <p>You haven't left any reviews yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    reviews.map((review) => (
                        <Card key={review.reviewId}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                />
                                            ))}
                                            <span className="text-sm font-medium ml-2">{review.rating.toFixed(1)}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            For Order #{review.orderId.slice(0, 6)} • {formatSafeDate(review.createdAt)}
                                        </p>
                                    </div>
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>FL</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="mt-4 text-sm">
                                    "{review.comment}"
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
