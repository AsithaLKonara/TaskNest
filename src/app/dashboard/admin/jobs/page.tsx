"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Job } from "@/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Ban } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchJobs()
    }, [])

    async function fetchJobs() {
        try {
            const querySnapshot = await getDocs(collection(db, "jobs"))
            const fetchedJobs = querySnapshot.docs.map(doc => ({
                jobId: doc.id,
                ...doc.data()
            })) as Job[]
            fetchedJobs.sort((a, b) => b.createdAt - a.createdAt)
            setJobs(fetchedJobs)
        } catch (error) {
            console.error("Error fetching jobs:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (jobId: string) => {
        if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) return
        try {
            await deleteDoc(doc(db, "jobs", jobId))
            setJobs(prev => prev.filter(j => j.jobId !== jobId))
            toast.success("Job deleted successfully")
        } catch (error) {
            console.error("Error deleting job:", error)
            toast.error("Failed to delete job")
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Jobs</h1>
                <p className="text-muted-foreground">Oversight for all job postings.</p>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead>Posted On</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.map((job) => (
                            <TableRow key={job.jobId}>
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell>{job.clientName || "Unknown"}</TableCell>
                                <TableCell>${job.budget}</TableCell>
                                <TableCell>{format(new Date(job.createdAt), "MMM d, yyyy")}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{job.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="icon" variant="destructive" onClick={() => handleDelete(job.jobId)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
