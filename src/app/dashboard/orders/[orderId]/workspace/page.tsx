"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Order, FreelancerProfile } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DeliverableForm } from "@/components/orders/deliverable-form"
import { processWalletTransaction } from "@/lib/wallet-utils"
import {
    Loader2,
    FileText,
    CheckCircle2,
    RefreshCcw,
    ExternalLink,
    Clock,
    ShieldCheck,
    MessageSquare
} from "lucide-react"
import { toast } from "sonner"
import { useChat } from "@/hooks/use-chat"
import { ChatWindow } from "@/components/dashboard/chat/chat-window"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateFreelancerMetrics, updateClientMetrics } from "@/lib/order-utils"

export default function OrderWorkspacePage() {
    const { orderId } = useParams()
    const { profile } = useAuth()
    const router = useRouter()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [releasing, setReleasing] = useState(false)

    const {
        messages,
        loadingMessages,
        selectedChatId,
        setSelectedChatId,
        sendMessage,
        chats
    } = useChat()

    useEffect(() => {
        if (!orderId) return

        const unsub = onSnapshot(doc(db, "orders", orderId as string), (doc) => {
            if (doc.exists()) {
                const data = { orderId: doc.id, ...doc.data() } as Order
                setOrder(data)
                // Set selected chat if order has one
                if (data.chatId) setSelectedChatId(data.chatId)
            }
            setLoading(false)
        })

        return () => unsub()
    }, [orderId, setSelectedChatId])

    async function handleApprove() {
        if (!order || !profile) return
        setReleasing(true)
        try {
            // 1. Update Order Status
            const orderRef = doc(db, "orders", order.orderId)
            await updateDoc(orderRef, {
                status: 'completed',
                escrowStatus: 'released'
            })

            // 2. Release Escrow Funds to Freelancer
            await processWalletTransaction({
                userId: order.freelancerId,
                orderId: order.orderId,
                amount: order.price,
                type: 'escrow_release',
                status: 'completed',
                gateway: 'manual', // Internal move
                reference: `Order ${order.orderId} Completed`
            })

            // 3. Update Metrics (Phase 5 Automation)
            await updateFreelancerMetrics(order.freelancerId)
            await updateClientMetrics(order.clientId)

            toast.success("Order completed! Funds released and metrics updated.")
        } catch (error: any) {
            toast.error(error.message || "Failed to complete order")
        } finally {
            setReleasing(false)
        }
    }

    async function handleRequestRevision() {
        const reason = prompt("Enter revision requirements:")
        if (!reason || !order) return

        try {
            const orderRef = doc(db, "orders", order.orderId)
            await updateDoc(orderRef, {
                status: 'revision_requested',
                deliveryComment: `Revision Requested: ${reason}`
            })
            toast.info("Revision requested.")
        } catch (error) {
            toast.error("Failed to request revision")
        }
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
    if (!order) return <div className="text-center p-20">Order not found.</div>

    const isFreelancer = profile?.uid === order.freelancerId
    const isClient = profile?.uid === order.clientId
    const selectedChat = chats.find(c => c.chatId === selectedChatId)

    return (
        <div className="container mx-auto py-8 max-w-6xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Project Workspace</h1>
                    <p className="text-muted-foreground italic">Order ID: {order.orderId}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className="text-sm px-3 py-1 capitalize" variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status.replace('_', ' ')}
                    </Badge>
                    {order.escrowStatus === 'held' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Funds in Escrow
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Context & Deliverables */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="deliverables" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="deliverables" className="gap-2">
                                <FileText className="h-4 w-4" /> Deliverables
                            </TabsTrigger>
                            <TabsTrigger value="messages" className="gap-2">
                                <MessageSquare className="h-4 w-4" /> Messaging
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="deliverables" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" /> Submission History
                                    </CardTitle>
                                    <CardDescription>Track project progress and file versions.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(!order.deliverables || order.deliverables.length === 0) ? (
                                        <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
                                            No deliverables submitted yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {[...(order.deliverables || [])].reverse().map((del, idx) => (
                                                <div key={idx} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">v{del.version}</span>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="w-3 h-3" /> {new Date(del.submittedAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <a
                                                            href={del.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium"
                                                        >
                                                            View Asset <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                    {del.comment && <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">{del.comment}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {isFreelancer && order.status !== 'completed' && (
                                <DeliverableForm order={order} />
                            )}
                        </TabsContent>

                        <TabsContent value="messages" className="h-[600px] border rounded-lg overflow-hidden flex flex-col bg-card">
                            {selectedChatId ? (
                                <ChatWindow
                                    chat={selectedChat}
                                    messages={messages}
                                    loading={loadingMessages}
                                    onSendMessage={(text) => sendMessage(selectedChatId, text)}
                                />
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-muted/5">
                                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                                    <h3 className="text-lg font-medium">No active chat for this order</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs mt-2">
                                        Use the main chat dashboard to contact the other party if no link exists yet.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Actions & Details */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Milestone: Delivery</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm py-2 border-b">
                                <span className="text-muted-foreground">Order Amount</span>
                                <span className="font-bold">LKR {order.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b">
                                <span className="text-muted-foreground">Revisions</span>
                                <span>{order.currentRevision || 0} / {order.maxRevisions || 3}</span>
                            </div>

                            {isClient && order.status === 'delivered' && (
                                <div className="flex flex-col gap-2 pt-4">
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={handleApprove}
                                        disabled={releasing}
                                    >
                                        {releasing ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                        Approve & Release Funds
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleRequestRevision}
                                    >
                                        <RefreshCcw className="mr-2 h-4 w-4" /> Request Revision
                                    </Button>
                                </div>
                            )}

                            {order.status === 'completed' && (
                                <div className="bg-green-50 p-4 border border-green-200 rounded-lg text-green-800 text-sm flex gap-3">
                                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                                    <p>This order is complete. Funds have been released to the freelancer.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
