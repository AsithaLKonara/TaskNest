"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Order } from "@/types"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileUpload } from "@/components/dashboard/file-upload"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { doc, updateDoc } from "firebase/firestore"

export default function OrdersPage() {
    const { user } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null)
    const [deliveryFiles, setDeliveryFiles] = useState<string[]>([])
    const [deliveryComment, setDeliveryComment] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        async function fetchOrders() {
            if (!user) return
            try {
                const q = query(
                    collection(db, "orders"),
                    where("freelancerId", "==", user.uid)
                )
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

    const handleDeliverWork = async () => {
        if (!deliveringOrderId) return
        if (deliveryFiles.length === 0) {
            toast.error("Please upload at least one file.")
            return
        }

        setSubmitting(true)
        try {
            const orderRef = doc(db, "orders", deliveringOrderId)
            await updateDoc(orderRef, {
                status: 'delivered',
                deliveryUrl: deliveryFiles[0], // MVP: Single file or first file
                deliveryComment: deliveryComment
            })

            setOrders(prev => prev.map(o =>
                o.orderId === deliveringOrderId
                    ? { ...o, status: 'delivered', deliveryUrl: deliveryFiles[0], deliveryComment }
                    : o
            ))

            toast.success("Work delivered successfully!")
            setDeliveringOrderId(null)
            setDeliveryFiles([])
            setDeliveryComment("")
        } catch (error) {
            console.error("Error delivering work:", error)
            toast.error("Failed to deliver work")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Active Orders</h1>
                <p className="text-muted-foreground">Manage your ongoing projects and payments.</p>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableCaption>Your active and completed orders.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Started On</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No active orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.orderId}>
                                    <TableCell className="font-medium">#{order.orderId.slice(0, 6)}</TableCell>
                                    <TableCell>{format(new Date(order.createdAt), "MMM d, yyyy")}</TableCell>
                                    <TableCell>${order.price}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            order.status === "completed" ? "default" : "outline"
                                        }>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {(order.status === 'active' || order.status === 'in-progress') && (
                                            <Dialog open={deliveringOrderId === order.orderId} onOpenChange={(open) => {
                                                if (!open) setDeliveringOrderId(null)
                                                else setDeliveringOrderId(order.orderId)
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="default">
                                                        <Upload className="mr-2 h-3 w-3" /> Deliver Work
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>Deliver Work</DialogTitle>
                                                        <DialogDescription>
                                                            Upload your finished work files for the client to review.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">Delivery Files</label>
                                                            <FileUpload
                                                                folder={`deliveries/${order.orderId}`}
                                                                value={deliveryFiles}
                                                                onChange={setDeliveryFiles}
                                                                maxFiles={5}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">Message (Optional)</label>
                                                            <Textarea
                                                                placeholder="Describe the work you are delivering..."
                                                                value={deliveryComment}
                                                                onChange={(e) => setDeliveryComment(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setDeliveringOrderId(null)}>Cancel</Button>
                                                        <Button onClick={handleDeliverWork} disabled={submitting || deliveryFiles.length === 0}>
                                                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            Submit Delivery
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                        {order.status === 'delivered' && (
                                            <Badge variant="secondary">In Review</Badge>
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
