"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, query, where, getDocs, runTransaction, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createNotification } from "@/lib/notifications"
import { Job, Proposal } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { formatSafeDate } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ClientJobDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [job, setJob] = useState<Job | null>(null)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            if (!params.id) return
            try {
                // Fetch Job
                const jobRef = doc(db, "jobs", params.id as string)
                const jobSnap = await getDoc(jobRef)

                if (jobSnap.exists()) {
                    setJob({ jobId: jobSnap.id, ...jobSnap.data() } as Job)

                    // Fetch Proposals
                    const q = query(
                        collection(db, "proposals"),
                        where("jobId", "==", params.id)
                    )
                    const proposalsSnap = await getDocs(q)
                    const fetchedProposals = proposalsSnap.docs.map(doc => ({
                        proposalId: doc.id,
                        ...doc.data()
                    })) as Proposal[]

                    setProposals(fetchedProposals)
                }
            } catch (error) {
                console.error("Error fetching data:", error)
                toast.error("Failed to load job details")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [params.id])

    const handleAcceptProposal = async (proposal: Proposal) => {
        if (!job) return
        if (!confirm(`Are you sure you want to accept ${proposal.freelancerName}'s proposal for $${proposal.quote}?`)) return

        setProcessingId(proposal.proposalId)
        try {
            await runTransaction(db, async (transaction) => {
                // 1. Create Order
                const orderRef = doc(collection(db, "orders"))
                transaction.set(orderRef, {
                    orderId: orderRef.id,
                    jobId: job.jobId,
                    clientId: job.clientId,
                    freelancerId: proposal.freelancerId,
                    price: proposal.quote,
                    status: "awaiting_payment", // Changed from 'active'
                    paymentProofUrl: null,
                    createdAt: serverTimestamp()
                })

                // 2. Update Job Status
                const jobRef = doc(db, "jobs", job.jobId)
                transaction.update(jobRef, { status: "in-progress" })

                // 3. Update Proposal Status
                const proposalRef = doc(db, "proposals", proposal.proposalId)
                transaction.update(proposalRef, { status: "accepted" })
            })

            // Notify Freelancer (Wait for payment?)
            // User rules: "Freelancer is notified only when Order becomes `active`" (Step 2.3.5 in docs)
            // So we DO NOT notify Freelancer yet? 
            // OR we notify them "Proposal Accepted (Pending Payment)".
            // Let's notify them that they were CHOSEN, but work hasn't started.
            await createNotification(
                proposal.freelancerId,
                "Proposal Accepted",
                `Your proposal for "${job.title}" has been accepted. Order is awaiting client payment.`,
                "info", // Info, not Success yet
                "/dashboard/freelancer/orders"
            )

            toast.success("Proposal accepted! Order created (Awaiting Payment).")
            router.push("/dashboard/client/orders")
        } catch (error) {
            console.error("Error accepting proposal:", error)
            toast.error("Failed to accept proposal")
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>

    if (!job) return <div className="p-8 text-center text-muted-foreground">Job not found.</div>

    return (
        <div className="space-y-8 max-w-5xl mx-auto py-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Badge variant="outline">{job.status}</Badge>
                        <span>•</span>
                        <span>Posted {formatSafeDate(job.createdAt, "PPP")}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">Budget</p>
                    <p className="text-2xl font-bold">${job.budget}</p>
                </div>
            </div>

            <Separator />

            <div>
                <h2 className="text-xl font-semibold mb-4">Proposals ({proposals.length})</h2>

                {proposals.length === 0 ? (
                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                            <p>No proposals yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                        {proposals.map((proposal) => (
                            <Card key={proposal.proposalId} className={`flex flex-col ${proposal.status === 'accepted' ? 'border-green-500 bg-green-50/10' : ''}`}>
                                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{proposal.freelancerName?.[0] || "F"}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg">{proposal.freelancerName}</CardTitle>
                                            <CardDescription className="text-xs">
                                                {formatSafeDate(proposal.createdAt, "MMM d, h:mm a")}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant={proposal.status === 'accepted' ? 'default' : 'secondary'}>
                                        {proposal.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="flex-1 mt-2">
                                    <div className="flex gap-4 mb-4 text-sm font-medium">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4 text-primary" /> Quote: ${proposal.quote}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4 text-primary" /> {proposal.estimatedDays} Days
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
                                        {proposal.message}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    {job.status === 'open' && proposal.status === 'pending' && (
                                        <Button
                                            className="w-full gap-2"
                                            onClick={() => handleAcceptProposal(proposal)}
                                            disabled={!!processingId}
                                        >
                                            {processingId === proposal.proposalId ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4" />
                                            )}
                                            Accept Proposal
                                        </Button>
                                    )}
                                    {proposal.status === 'accepted' && (
                                        <Button variant="outline" className="w-full border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800 cursor-default">
                                            <CheckCircle className="mr-2 h-4 w-4" /> Accepted
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
