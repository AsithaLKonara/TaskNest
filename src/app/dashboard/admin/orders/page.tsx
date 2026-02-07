"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, updateDoc, query, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Order } from "@/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ShieldAlert, CheckCircle, XCircle, ExternalLink, Info } from "lucide-react"
import { toast } from "sonner"
import { formatSafeDate } from "@/lib/utils"
import { updateFreelancerMetrics, updateClientMetrics } from "@/lib/order-utils"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [clientMetrics, setClientMetrics] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'disputed'>('all')

    useEffect(() => {
        fetchOrders()
    }, [])

    async function fetchOrders() {
        try {
            const querySnapshot = await getDocs(collection(db, "orders"))
            const fetchedOrders = querySnapshot.docs.map(doc => ({
                orderId: doc.id,
                ...doc.data()
            })) as Order[]
            fetchedOrders.sort((a, b) => b.createdAt - a.createdAt)
            setOrders(fetchedOrders)

            // Fetch client metrics for these orders
            const clientIds = Array.from(new Set(fetchedOrders.map(o => o.clientId)))
            const metrics: Record<string, any> = {}
            for (const cid of clientIds) {
                const snap = await getDoc(doc(db, "users", cid))
                if (snap.exists()) {
                    metrics[cid] = snap.data().clientMetrics
                }
            }
            setClientMetrics(metrics)
        } catch (error) {
            console.error("Error fetching orders:", error)
        } finally {
            setLoading(false)
        }
    }

    const resolveDispute = async (orderId: string, result: 'refunded' | 'fulfilled') => {
        const resolution = prompt(`Provide mediation notes for this resolution (${result}):`)
        if (!resolution) return

        try {
            const orderRef = doc(db, "orders", orderId)
            await updateDoc(orderRef, {
                status: result === 'refunded' ? 'cancelled' : 'completed',
                mediationResult: resolution
            })

            // Trigger metric updates
            const orderSnap = await getDoc(orderRef)
            if (orderSnap.exists()) {
                const orderData = orderSnap.data()
                await updateFreelancerMetrics(orderData.freelancerId)
                await updateClientMetrics(orderData.clientId)
            }

            setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: result === 'refunded' ? 'cancelled' : 'completed', mediationResult: resolution } : o))
            toast.success(`Dispute resolved as ${result}`)
        } catch (error) {
            console.error(error)
            toast.error("Failed to resolve dispute")
        }
    }

    const filteredOrders = filter === 'disputed' ? orders.filter(o => o.status === 'disputed') : orders

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Order Mediation</h1>
                    <p className="text-muted-foreground">Monitor platform transactions and resolve conflicts.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All Orders</Button>
                    <Button variant={filter === 'disputed' ? 'destructive' : 'outline'} onClick={() => setFilter('disputed')} className="gap-2">
                        <ShieldAlert className="h-4 w-4" /> Disputed ({orders.filter(o => o.status === 'disputed').length})
                    </Button>
                </div>
            </div>

            <Card className="border-t-4 border-t-primary">
                <CardHeader>
                    <CardTitle>Platform Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Client / Freelancer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No orders found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order) => (
                                    <TableRow key={order.orderId}>
                                        <TableCell className="font-medium text-xs">#{order.orderId.slice(0, 8)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="text-xs">
                                                    <p><span className="text-muted-foreground font-normal">C:</span> {order.clientId.slice(0, 6)}...</p>
                                                    <p><span className="text-muted-foreground font-normal">F:</span> {order.freelancerId.slice(0, 6)}...</p>
                                                </div>
                                                {clientMetrics[order.clientId] && (
                                                    <Badge variant="outline" className={`h-4 text-[9px] mt-1 ${clientMetrics[order.clientId].trustScore > 80 ? 'text-green-600' :
                                                        clientMetrics[order.clientId].trustScore > 50 ? 'text-orange-600' : 'text-red-600'
                                                        }`}>
                                                        Trust: {clientMetrics[order.clientId].trustScore}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold">${order.price}</TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === 'disputed' ? 'destructive' : 'secondary'} className="capitalize">
                                                {order.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {order.status === 'disputed' ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="destructive" className="gap-2">
                                                            <ShieldAlert className="h-3 w-3" /> Mediate
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle className="flex items-center gap-2">
                                                                <ShieldAlert className="h-5 w-5 text-destructive" /> Dispute Review
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="bg-muted/50 p-4 rounded-lg border">
                                                                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Client Reason</h4>
                                                                <p className="text-sm italic">"{order.disputeReason || "No reason provided."}"</p>
                                                            </div>
                                                            <div className="flex gap-2 mt-4 text-xs italic text-muted-foreground bg-blue-50 p-2 rounded border border-blue-100">
                                                                <Info className="h-4 w-4 shrink-0" />
                                                                <p>Recommendation: Review chat history and delivery files before resolving.</p>
                                                            </div>
                                                            <div className="flex gap-3 pt-2">
                                                                <Button
                                                                    variant="outline"
                                                                    className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                                                                    onClick={() => resolveDispute(order.orderId, 'refunded')}
                                                                >
                                                                    <XCircle className="mr-2 h-4 w-4" /> Refund Client
                                                                </Button>
                                                                <Button
                                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                                    onClick={() => resolveDispute(order.orderId, 'fulfilled')}
                                                                >
                                                                    <CheckCircle className="mr-2 h-4 w-4" /> Release Funds
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <Button size="sm" variant="ghost" className="gap-2" asChild>
                                                    <Link href={`/dashboard/messages`}>
                                                        <ExternalLink className="h-3 w-3" /> Logs
                                                    </Link>
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
