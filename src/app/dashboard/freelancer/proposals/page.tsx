"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Proposal } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, DollarSign, Clock, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface ProposalWithJob extends Proposal {
    jobTitle?: string;
    clientName?: string;
}

export default function MyProposalsPage() {
    const { user } = useAuth()
    const [proposals, setProposals] = useState<ProposalWithJob[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProposals() {
            if (!user) return
            try {
                const q = query(
                    collection(db, "proposals"),
                    where("freelancerId", "==", user.uid)
                )
                const querySnapshot = await getDocs(q)

                const fetchedProposals: ProposalWithJob[] = querySnapshot.docs.map(doc => ({
                    proposalId: doc.id,
                    ...doc.data()
                })) as ProposalWithJob[]

                // Enrich with Job details (title)
                // In a real app, maybe index this or fetch in parallel
                const enriched = await Promise.all(fetchedProposals.map(async (p) => {
                    if (!p.jobId) return p
                    try {
                        const jobRef = doc(db, "jobs", p.jobId)
                        const jobSnap = await getDoc(jobRef)
                        if (jobSnap.exists()) {
                            const data = jobSnap.data()
                            return {
                                ...p,
                                jobTitle: data.title,
                                clientName: data.clientName
                            }
                        }
                    } catch (e) {
                        console.error("Error fetching job for proposal", p.proposalId)
                    }
                    return p
                }))

                // Sort by recent
                enriched.sort((a, b) => b.createdAt - a.createdAt)
                setProposals(enriched)
            } catch (error) {
                console.error("Error fetching proposals:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProposals()
    }, [user])

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">My Proposals</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Track the status of your sent proposals.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {proposals.length === 0 ? (
                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                            <p className="mb-4">You haven't sent any proposals yet.</p>
                            <Link href="/jobs">
                                <Button>Browse Jobs</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    proposals.map((proposal) => (
                        <Card key={proposal.proposalId} className="flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all">
                            <div className="flex-1">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">
                                                <Link href={`/jobs/${proposal.jobId}`} className="hover:underline flex items-center gap-2">
                                                    {proposal.jobTitle || "Unknown Job"}
                                                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                                </Link>
                                            </CardTitle>
                                            <CardDescription>
                                                Sent to {proposal.clientName || "Client"} on {format(new Date(proposal.createdAt), "MMM d, yyyy")}
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant={
                                                proposal.status === 'accepted' ? 'default' :
                                                    proposal.status === 'rejected' ? 'destructive' : 'secondary'
                                            }
                                        >
                                            {proposal.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-6 text-sm">
                                        <div className="flex items-center gap-1 font-medium">
                                            <DollarSign className="h-4 w-4 text-primary" />
                                            Quote: ${proposal.quote}
                                        </div>
                                        <div className="flex items-center gap-1 font-medium">
                                            <Clock className="h-4 w-4 text-primary" />
                                            Duration: {proposal.estimatedDays} Days
                                        </div>
                                    </div>
                                    <div className="mt-3 bg-muted/40 p-3 rounded-md text-sm text-muted-foreground line-clamp-2">
                                        {proposal.message}
                                    </div>
                                </CardContent>
                            </div>
                            {proposal.status === 'accepted' && (
                                <div className="p-6 flex items-center border-t md:border-t-0 md:border-l bg-green-50/20">
                                    <Link href="/dashboard/freelancer/orders">
                                        <Button className="w-full md:w-auto">View Order</Button>
                                    </Link>
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
