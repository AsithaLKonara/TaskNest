"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { useChat } from "@/hooks/use-chat"
import { db } from "@/lib/firebase"
import { Job } from "@/types"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Calendar, DollarSign, Clock, MapPin, Send } from "lucide-react"
import { format } from "date-fns"
import { formatSafeDate } from "@/lib/utils"
import Link from "next/link"
import { SubmitProposalDialog } from "@/components/jobs/submit-proposal-dialog"

export default function JobDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, role } = useAuth()
    const [job, setJob] = useState<Job | null>(null)
    const [loading, setLoading] = useState(true)

    const { startChat } = useChat()
    const [startingChat, setStartingChat] = useState(false)

    const handleMessageClient = async () => {
        if (!user || !job?.clientId) return
        setStartingChat(true)
        try {
            const chatId = await startChat(job.clientId, job.clientName || "Client")
            if (chatId) {
                router.push(`/dashboard/messages`)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setStartingChat(false)
        }
    }

    useEffect(() => {
        async function fetchJob() {
            if (!params.id) return
            try {
                const docRef = doc(db, "jobs", params.id as string)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setJob({ jobId: docSnap.id, ...docSnap.data() } as Job)
                }
            } catch (error) {
                console.error("Error fetching job:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchJob()
    }, [params.id])

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>

    if (!job) return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
            <p className="text-muted-foreground mb-4">This job post may have been removed or does not exist.</p>
            <Link href="/jobs"><Button variant="outline">Browse Jobs</Button></Link>
        </div>
    )

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{job.title}</h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Badge variant="secondary" className="rounded-md">{job.category}</Badge>
                                <span>•</span>
                                <span className="text-sm">Posted {formatSafeDate(job.createdAt, "PPP")}</span>
                            </div>
                        </div>

                        <Separator />

                        <div className="py-4">
                            <h3 className="text-lg font-semibold mb-3">Project Description</h3>
                            <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                {job.description}
                            </div>
                        </div>

                        <Separator />

                        <div className="py-4">
                            <h3 className="text-lg font-semibold mb-3">Skills Required</h3>
                            <div className="flex flex-wrap gap-2">
                                {/* Mock skills for now, schema doesn't have it yet on Job */}
                                {["React", "TypeScript", "Next.js", "Firebase"].map(skill => (
                                    <Badge key={skill} variant="outline">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="border-2 border-primary/10 shadow-lg">
                        <CardHeader>
                            {role === 'freelancer' && user ? (
                                <SubmitProposalDialog job={job} />
                            ) : role === 'client' ? (
                                <Button size="lg" className="w-full" asChild>
                                    <Link href={`/dashboard/client/jobs/${job.jobId}`}>Manage Job</Link>
                                </Button>
                            ) : (
                                <Button size="lg" className="w-full" asChild>
                                    <Link href="/login">Log in to Apply</Link>
                                </Button>
                            )}

                            {user && role === 'freelancer' && (
                                <p className="text-xs text-center text-muted-foreground mt-2">Connects Required: 2</p>
                            )}
                            {!user && (
                                <p className="text-xs text-center text-muted-foreground mt-2">
                                    Join TaskNest to apply for this job.
                                </p>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="flex items-center gap-3 text-sm font-medium mb-1">
                                    <DollarSign className="h-4 w-4 text-primary" /> Budget
                                </div>
                                <p className="text-xl font-bold px-7">${job.budget}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 text-sm font-medium mb-1">
                                    <Calendar className="h-4 w-4 text-primary" /> Delivery Date
                                </div>
                                <p className="text-base px-7">{formatSafeDate(job.deadline, "PPP")}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 text-sm font-medium mb-1">
                                    <Clock className="h-4 w-4 text-primary" /> Experience Level
                                </div>
                                <p className="text-base px-7">Intermediate</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h4 className="font-semibold mb-4">About the Client</h4>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>{job.clientName?.[0] || "C"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{job.clientName || "Unknown Client"}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" /> Sri Lanka
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Jobs Posted</span>
                                    <span className="font-medium text-foreground">12</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Hire Rate</span>
                                    <span className="font-medium text-foreground">85%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
