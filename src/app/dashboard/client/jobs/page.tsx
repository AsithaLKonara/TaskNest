"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Job } from "@/types"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, Edit } from "lucide-react"
import { format } from "date-fns"
import { formatSafeDate } from "@/lib/utils"
import Link from "next/link"

export default function MyJobsPage() {
    const { user } = useAuth()
    const [jobs, setJobs] = useState<Job[]>([])
    const [counts, setCounts] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchJobs() {
            if (!user) return
            try {
                const q = query(
                    collection(db, "jobs"),
                    where("clientId", "==", user.uid)
                )
                const querySnapshot = await getDocs(q)
                const fetchedJobs = querySnapshot.docs.map(doc => ({
                    jobId: doc.id,
                    ...doc.data()
                })) as Job[]

                // Manual sort
                fetchedJobs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                setJobs(fetchedJobs)

                // Fetch counts for each job
                const countsMap: Record<string, number> = {}
                await Promise.all(fetchedJobs.map(async (job) => {
                    const pq = query(collection(db, "proposals"), where("jobId", "==", job.jobId))
                    const psnap = await getDocs(pq)
                    countsMap[job.jobId] = psnap.size
                }))
                setCounts(countsMap)

            } catch (error) {
                console.error("Error fetching jobs:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchJobs()
    }, [user])

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Jobs</h1>
                    <p className="text-muted-foreground">Manage your postings and review proposals.</p>
                </div>
                <Link href="/dashboard/client/post-job">
                    <Button>Post New Job</Button>
                </Link>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableCaption>A list of your posted jobs.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Posted On</TableHead>
                            <TableHead>Proposals</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    You haven&apos;t posted any jobs yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job) => (
                                <TableRow key={job.jobId}>
                                    <TableCell className="font-medium">{job.title}</TableCell>
                                    <TableCell>{job.category}</TableCell>
                                    <TableCell>{formatSafeDate(job.createdAt)}</TableCell>
                                    <TableCell>{counts[job.jobId] || 0}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            job.status === "completed" ? "secondary" :
                                                job.status === "in-progress" ? "default" : "outline"
                                        }>
                                            {job.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Link href={`/dashboard/client/jobs/${job.jobId}`}>
                                                <Button size="icon" variant="outline">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
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
