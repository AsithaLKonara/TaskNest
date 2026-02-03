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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { ReviewModal } from "@/components/reviews/review-modal"
import Link from "next/link"

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
                                        {/* Payment Upload Logic */}
                                        {!order.paymentProofUrl && order.status === 'awaiting_payment' && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline" className="gap-2">
                                                        <Upload className="h-4 w-4" /> Upload Proof
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Upload Bank Transfer Proof</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="py-4 text-sm text-muted-foreground space-y-4">
                                                        <p>Please transfer <strong>${order.price}</strong> to our bank account and upload the receipt below.</p>
                                                        <FileUpload
                                                            folder={`payments/${order.orderId}`}
                                                            onChange={(urls) => {
                                                                if (urls.length > 0) handlePaymentUpload(order.orderId, urls[0])
                                                            }}
                                                            maxFiles={1}
                                                            value={[]}
                                                        />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                        {order.paymentProofUrl && order.status === 'awaiting_payment' && (
                                            <div className="flex items-center justify-end text-yellow-600 gap-1 text-sm">
                                                <Clock className="h-4 w-4" /> Verifying Payment
                                            </div>
                                        )}

                                        {/* Delivery Review Logic */}
                                        {order.status === 'delivered' && (
                                            <Dialog open={viewingDelivery?.orderId === order.orderId} onOpenChange={(open) => open ? setViewingDelivery(order) : setViewingDelivery(null)}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                                        <CheckCircle className="mr-2 h-3 w-3" /> Review Delivery
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Review Delivery</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="p-4 border rounded-lg bg-muted/50">
                                                            <h4 className="font-medium mb-2">Delivery Files</h4>
                                                            {order.deliveryUrl ? (
                                                                <Link href={order.deliveryUrl} target="_blank" className="text-blue-600 hover:underline flex items-center gap-2">
                                                                    <ExternalLink className="h-4 w-4" /> View Submitted Work
                                                                </Link>
                                                            ) : (
                                                                <span className="text-muted-foreground">No files linked.</span>
                                                            )}
                                                            {order.deliveryComment && (
                                                                <div className="mt-3">
                                                                    <h4 className="font-medium text-sm mb-1">Freelancer Message</h4>
                                                                    <p className="text-sm text-muted-foreground">{order.deliveryComment}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-3 pt-2">
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                                                                onClick={() => handleRequestRevision(order)}
                                                            >
                                                                <MessageSquare className="mr-2 h-4 w-4" /> Request Revision
                                                            </Button>
                                                            <Button
                                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                                onClick={() => handleApproveDelivery(order)}
                                                            >
                                                                <Check className="mr-2 h-4 w-4" /> Approve & Pay
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}

                                        {/* Completed Status */}
                                        {order.status === 'completed' && (
                                            <Badge variant="outline" className="text-green-600 border-green-200">
                                                Completed
                                            </Badge>
                                        )}
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
