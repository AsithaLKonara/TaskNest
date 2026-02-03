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
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)

    // Filter States
    const [searchTerm, setSearchTerm] = useState("")
    const [category, setCategory] = useState("All")
    const [minBudget, setMinBudget] = useState("")

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

                fetchedJobs.sort((a, b) => b.createdAt - a.createdAt)
                setJobs(fetchedJobs)
                setFilteredJobs(fetchedJobs)
            } catch (error) {
                console.error("Error fetching jobs:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchJobs()
    }, [])

    useEffect(() => {
        // Filter Logic
        let result = jobs

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase()
            result = result.filter(job =>
                job.title.toLowerCase().includes(lowerTerm) ||
                job.description.toLowerCase().includes(lowerTerm) ||
                job.skills?.some(skill => skill.toLowerCase().includes(lowerTerm))
            )
        }

        if (category !== "All") {
            result = result.filter(job => job.category === category)
        }

        if (minBudget) {
            result = result.filter(job => job.budget >= parseInt(minBudget))
        }

        setFilteredJobs(result)
    }, [jobs, searchTerm, category, minBudget])

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>

    const categories = ["All", "Web Development", "Mobile App", "UI/UX Design", "Content Writing", "Marketing"]

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-10 text-center max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Explore Opportunities</h1>
                <p className="text-muted-foreground text-lg">Find your next project from top clients. Work remotely, secure payments.</p>
            </div>

            {/* Search & Filters */}
            <div className="bg-muted/40 p-6 rounded-xl border mb-10 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by title, skill, or keyword..."
                        className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="w-full md:w-48">
                    <input
                        type="number"
                        placeholder="Min Budget ($)"
                        className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-muted/30 rounded-xl">
                        <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                        <p className="text-muted-foreground">Try adjusting your search terms or filters.</p>
                        <Button
                            variant="link"
                            onClick={() => { setSearchTerm(""); setCategory("All"); setMinBudget("") }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    filteredJobs.map((job) => (
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
