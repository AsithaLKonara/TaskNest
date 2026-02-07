"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Order } from "@/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, CheckCircle, ExternalLink, MessageSquare, Check, Clock } from "lucide-react"
import { format } from "date-fns"
import { FileUpload } from "@/components/dashboard/file-upload"
import { updateFreelancerMetrics } from "@/lib/order-utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { ReviewModal } from "@/components/reviews/review-modal"
import Link from "next/link"
import { PayHereButton } from "@/components/payments/payhere-button"

export default function ClientOrdersPage() {
    const { user } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [reviewOrder, setReviewOrder] = useState<Order | null>(null)
    const [viewingDelivery, setViewingDelivery] = useState<Order | null>(null)

    useEffect(() => {
        async function fetchOrders() {
            if (!user) return
            try {
                const q = query(collection(db, "orders"), where("clientId", "==", user.uid))
                const querySnapshot = await getDocs(q)
                const fetchedOrders = querySnapshot.docs.map(doc => ({
                    orderId: doc.id,
                    ...doc.data()
                })) as Order[]
                fetchedOrders.sort((a, b) => b.createdAt - a.createdAt)
                setOrders(fetchedOrders)
            } catch (error) {
                console.error("Error fetching orders:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [user])

    const handlePaymentUpload = async (orderId: string, url: string) => {
        try {
            const orderRef = doc(db, "orders", orderId)
            await updateDoc(orderRef, {
                paymentProofUrl: url,
                // status remains 'awaiting_payment' until Admin verifies
            })
            setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, paymentProofUrl: url } : o))
            toast.success("Payment proof uploaded. Awaiting Admin verification.")
        } catch (error) {
            console.error("Error updating order:", error)
            toast.error("Failed to update order")
        }
    }

    const handleApproveDelivery = async (order: Order) => {
        if (!confirm("Are you sure you want to approve this delivery? This will release funds to the freelancer.")) return

        try {
            const orderRef = doc(db, "orders", order.orderId)
            await updateDoc(orderRef, {
                status: 'completed'
            })

            // Update metrics
            await updateFreelancerMetrics(order.freelancerId)

            setOrders(prev => prev.map(o => o.orderId === order.orderId ? { ...o, status: 'completed' } : o))
            toast.success("Delivery approved!")
            setViewingDelivery(null)
            setReviewOrder(order)
        } catch (error) {
            console.error("Error approving delivery:", error)
            toast.error("Failed to approve delivery")
        }
    }

    const handleRequestRevision = async (order: Order) => {
        const reason = prompt("Please provide a reason for the revision request:")
        if (!reason) return

        try {
            const orderRef = doc(db, "orders", order.orderId)
            await updateDoc(orderRef, {
                status: 'revision_requested',
            })
            setOrders(prev => prev.map(o => o.orderId === order.orderId ? { ...o, status: 'revision_requested' } : o))
            toast.success("Revision requested")
            setViewingDelivery(null)
        } catch (error) {
            console.error("Error requesting revision:", error)
            toast.error("Failed to request revision")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'awaiting_payment': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Awaiting Payment</Badge>
            case 'active': return <Badge variant="default" className="bg-blue-600 text-white">Active</Badge>
            case 'delivered': return <Badge variant="default" className="bg-purple-600 text-white">Delivered</Badge>
            case 'revision_requested': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Revision Requested</Badge>
            case 'completed': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
            case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>
            default: return <Badge variant="secondary">{status}</Badge>
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
                <p className="text-muted-foreground">Track ongoing work and payments.</p>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Freelancer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No active orders.</TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.orderId}>
                                    <TableCell className="font-medium">#{order.orderId.slice(0, 6)}</TableCell>
                                    <TableCell>{order.freelancerId.slice(0, 6)}...</TableCell>
                                    <TableCell>${order.price}</TableCell>
                                    <TableCell>
                                        {getStatusBadge(order.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button size="sm" variant="outline" asChild>
                                                <a href={`/dashboard/orders/${order.orderId}/workspace`}>
                                                    Open Workspace
                                                </a>
                                            </Button>

                                            {/* Payment Actions */}
                                            {order.status === 'awaiting_payment' && !order.paymentProofUrl && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="default">
                                                            Pay Now
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Complete Payment</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <PayHereButton
                                                                orderId={order.orderId}
                                                                clientId={user?.uid || ''}
                                                                amount={order.price}
                                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                                                buttonText="Pay with PayHere"
                                                            />
                                                            <div className="relative">
                                                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                                                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or manual transfer</span></div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-xs text-muted-foreground">Transfer <strong>LKR {order.price}</strong> to our bank and upload receipt.</p>
                                                                <FileUpload
                                                                    folder={`payments/${order.orderId}`}
                                                                    onChange={(urls) => {
                                                                        if (urls.length > 0) handlePaymentUpload(order.orderId, urls[0])
                                                                    }}
                                                                    maxFiles={1}
                                                                    value={[]}
                                                                />
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}

                                            {order.status === 'delivered' && (
                                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
                                                    <a href={`/dashboard/orders/${order.orderId}/workspace`}>
                                                        Review Submission
                                                    </a>
                                                </Button>
                                            )}

                                            {order.status === 'completed' && (
                                                <Button size="sm" variant="ghost" onClick={() => setReviewOrder(order)}>
                                                    Leave Review
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {reviewOrder && (
                <ReviewModal
                    isOpen={!!reviewOrder}
                    onClose={() => setReviewOrder(null)}
                    order={reviewOrder}
                    onReviewSubmitted={() => setReviewOrder(null)}
                />
            )}
        </div>
    )
}
