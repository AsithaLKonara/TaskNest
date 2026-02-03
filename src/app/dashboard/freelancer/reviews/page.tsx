"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Review } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Star, ThumbsUp } from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export default function FreelancerReviewsPage() {
    const { user } = useAuth()
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ average: 0, count: 0 })

    useEffect(() => {
        async function fetchReviews() {
            if (!user) return
            try {
                // Fetch reviews received by this freelancer
                const q = query(
                    collection(db, "reviews"),
                    where("targetId", "==", user.uid)
                )
                const querySnapshot = await getDocs(q)
                const fetchedReviews = querySnapshot.docs.map(doc => ({
                    reviewId: doc.id,
                    ...doc.data()
                })) as Review[]

                fetchedReviews.sort((a, b) => b.createdAt - a.createdAt)
                setReviews(fetchedReviews)

                // Calculate stats locally (though they are also in profile, good to verify)
                if (fetchedReviews.length > 0) {
                    const total = fetchedReviews.reduce((acc, r) => acc + r.rating, 0)
                    setStats({
                        average: total / fetchedReviews.length,
                        count: fetchedReviews.length
                    })
                }
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Client Feedback</h1>
                    <p className="text-muted-foreground">What clients are saying about your work.</p>
                </div>
                {/* Summary Stats */}
                <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                    <div className="text-center">
                        <div className="text-2xl font-bold flex items-center justify-center gap-1">
                            {stats.average.toFixed(1)} <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="text-xs text-muted-foreground">Average Rating</div>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="text-center">
                        <div className="text-2xl font-bold">{stats.count}</div>
                        <div className="text-xs text-muted-foreground">Total Reviews</div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {reviews.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                            <ThumbsUp className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No reviews yet</p>
                            <p className="text-sm">Complete your first order to get feedback!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {reviews.map((review) => (
                            <Card key={review.reviewId} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>CL</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-sm font-medium">Client</div>
                                                <div className="text-xs text-muted-foreground">{format(new Date(review.createdAt), "MMM d, yyyy")}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-xs font-bold ring-1 ring-inset ring-yellow-600/20">
                                            {review.rating.toFixed(1)} <Star className="w-3 h-3 ml-1 fill-current" />
                                        </div>
                                    </div>

                                    <div className="text-sm leading-relaxed">
                                        "{review.comment}"
                                    </div>

                                    <div className="pt-2 text-xs text-muted-foreground border-t mt-4 flex justify-between">
                                        <span>Order #{review.orderId.slice(0, 6)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
