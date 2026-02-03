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

export default function OrdersPage() {
    const { user } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

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
                                        {order.status === 'active' && (
                                            <Button size="sm" variant="secondary">
                                                <Upload className="mr-2 h-3 w-3" /> Deliver Work
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
