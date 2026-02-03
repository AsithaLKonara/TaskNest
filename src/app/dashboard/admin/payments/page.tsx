"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Order } from "@/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { formatSafeDate } from "@/lib/utils"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminPaymentsPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchOrders() {
            try {
                const querySnapshot = await getDocs(collection(db, "orders"))
                const fetchedOrders = querySnapshot.docs.map(doc => ({
                    orderId: doc.id,
                    ...doc.data()
                })) as Order[]
                // Sort by potentially pending verification first? Or just date.
                fetchedOrders.sort((a, b) => b.createdAt - a.createdAt)
                setOrders(fetchedOrders)
            } catch (error) {
                console.error("Error fetching orders:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    const handleVerifyPayment = async (order: Order) => {
        if (!confirm("Confirm payment verification? This will notify the freelancer to start work.")) return
        try {
            const docRef = doc(db, "orders", order.orderId)
            await updateDoc(docRef, { status: 'active' })

            // Notify Freelancer
            const { createNotification } = await import("@/lib/notifications")
            await createNotification(
                order.freelancerId,
                "Payment Verified!",
                `The client's payment for Order #${order.orderId.slice(0, 6)} has been verified. You can start working now.`,
                "success",
                "/dashboard/freelancer/orders"
            )

            setOrders(prev => prev.map(o => o.orderId === order.orderId ? { ...o, status: 'active' } : o))
            toast.success("Payment verified. Freelancer notified.")
        } catch (e) {
            console.error(e)
            toast.error("Failed to verify payment")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'awaiting_payment': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Awaiting Payment</Badge>
            case 'active': return <Badge variant="default" className="bg-blue-600 text-white">Active</Badge>
            case 'completed': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
            default: return <Badge variant="secondary">{status}</Badge>
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payment Verification</h1>
                <p className="text-muted-foreground">Review and approve manual bank transfer receipts.</p>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Proof</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No payments found.</TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.orderId}>
                                    <TableCell className="font-medium">#{order.orderId.slice(0, 6)}</TableCell>
                                    <TableCell>${order.price}</TableCell>
                                    <TableCell>{formatSafeDate(order.createdAt)}</TableCell>
                                    <TableCell>
                                        {getStatusBadge(order.status)}
                                    </TableCell>
                                    <TableCell>
                                        {order.paymentProofUrl ? (
                                            <Link href={order.paymentProofUrl} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                                                View Proof <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">None</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {order.paymentProofUrl && order.status === 'awaiting_payment' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-green-200 text-green-700 hover:bg-green-50"
                                                onClick={() => handleVerifyPayment(order)}
                                            >
                                                Approve Payment
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
