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

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payment Verification</h1>
                <p className="text-muted-foreground">Review manual bank transfer proofs.</p>
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
                        {orders.map((order) => (
                            <TableRow key={order.orderId}>
                                <TableCell className="font-medium">#{order.orderId.slice(0, 6)}</TableCell>
                                <TableCell>${order.price}</TableCell>
                                <TableCell>{format(new Date(order.createdAt), "MMM d, yyyy")}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{order.status}</Badge>
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
                                    {order.paymentProofUrl && order.status !== 'completed' && order.status !== 'in-progress' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={async () => {
                                                if (!confirm("Confirm payment verification?")) return
                                                try {
                                                    const docRef = doc(db, "orders", order.orderId)
                                                    await updateDoc(docRef, { status: 'in-progress' })
                                                    setOrders(prev => prev.map(o => o.orderId === order.orderId ? { ...o, status: 'in-progress' } : o))
                                                    toast.success("Payment verified. Order in progress.")
                                                } catch (e) {
                                                    toast.error("Failed to verify payment")
                                                }
                                            }}
                                        >
                                            Mark Verified
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div >
    )
}
