"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Order } from "@/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { FileUpload } from "@/components/dashboard/file-upload"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function ClientOrdersPage() {
    const { user } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)

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
        setUploading(true)
        try {
            const orderRef = doc(db, "orders", orderId)
            await updateDoc(orderRef, {
                paymentProofUrl: url,
                status: 'active' // Assuming 'active' means paid/in-progress vs 'pending_payment'
                // For now, let's just save the proof.
            })
            setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, paymentProofUrl: url } : o))
            toast.success("Payment proof uploaded")
        } catch (error) {
            console.error("Error updating order:", error)
            toast.error("Failed to update order")
        } finally {
            setUploading(false)
            // Close dialog logic driven by state if needed, or let user close
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
                            <TableHead>Payment</TableHead>
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
                                        <Badge variant={order.status === 'completed' ? 'secondary' : 'default'}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {order.paymentProofUrl ? (
                                            <div className="flex items-center text-green-600 gap-1 text-sm">
                                                <CheckCircle className="h-4 w-4" /> Proof Sent
                                            </div>
                                        ) : (
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
                                                    <div className="py-4">
                                                        <FileUpload
                                                            folder={`payments/${order.orderId}`}
                                                            onChange={(urls) => {
                                                                if (urls.length > 0) {
                                                                    handlePaymentUpload(order.orderId, urls[urls.length - 1])
                                                                }
                                                            }}
                                                            maxFiles={1}
                                                            value={[]}
                                                        />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
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
