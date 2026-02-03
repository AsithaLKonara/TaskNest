"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Job } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar, DollarSign, Briefcase } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchJobs() {
            try {
                const q = query(
                    collection(db, "jobs"),
                    where("status", "==", "open")
                )
                const querySnapshot = await getDocs(q)
                const fetchedJobs = querySnapshot.docs.map(doc => ({
                    jobId: doc.id,
                    ...doc.data()
                })) as Job[]

                // Manual sort 
                fetchedJobs.sort((a, b) => b.createdAt - a.createdAt)
                setJobs(fetchedJobs)
            } catch (error) {
                console.error("Error fetching jobs:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchJobs()
    }, [])

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-10 text-center max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Explore Opportunities</h1>
                <p className="text-muted-foreground text-lg">Find your next project from top clients. Work remotely, secure payments.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-muted/30 rounded-xl">
                        <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                        <p className="text-muted-foreground">Check back later or adjust your filters.</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <Card key={job.jobId} className="flex flex-col hover:shadow-lg transition-shadow border-primary/10">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                        {job.category}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{format(new Date(job.createdAt), "MMM d")}</span>
                                </div>
                                <CardTitle className="line-clamp-2 md:h-14">{job.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                    {job.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm font-medium text-foreground/80">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" /> ${job.budget}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" /> {format(new Date(job.deadline), "MMM d")}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-4 border-t bg-muted/20">
                                <Link href={`/jobs/${job.jobId}`} className="w-full">
                                    <Button className="w-full gap-2">
                                        View Details <Briefcase className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
