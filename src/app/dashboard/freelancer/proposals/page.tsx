"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Proposal } from "@/types"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"

export default function ProposalsPage() {
    const { user } = useAuth()
    const [proposals, setProposals] = useState<Proposal[]>([])
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
                const fetchedProposals = querySnapshot.docs.map(doc => ({
                    proposalId: doc.id,
                    ...doc.data()
                })) as Proposal[]
                // Client-side sort to avoid index requirements for now
                fetchedProposals.sort((a, b) => b.createdAt - a.createdAt)
                setProposals(fetchedProposals)
            } catch (error) {
                console.error("Error fetching proposals:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProposals()
    }, [user])

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Proposals</h1>
                <p className="text-muted-foreground">Track the status of your job applications.</p>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableCaption>A list of your recent proposals.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job ID</TableHead>
                            <TableHead>Submitted On</TableHead>
                            <TableHead>Quote</TableHead>
                            <TableHead>Est. Days</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {proposals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    You haven&apos;t applied to any jobs yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            proposals.map((proposal) => (
                                <TableRow key={proposal.proposalId}>
                                    <TableCell className="font-medium">#{proposal.jobId.slice(0, 6)}</TableCell>
                                    <TableCell>{format(new Date(proposal.createdAt), "MMM d, yyyy")}</TableCell>
                                    <TableCell>${proposal.quote}</TableCell>
                                    <TableCell>{proposal.estimatedDays} days</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            proposal.status === "accepted" ? "default" :
                                                proposal.status === "rejected" ? "destructive" : "secondary"
                                        }>
                                            {proposal.status}
                                        </Badge>
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
