"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { FreelancerProfile } from "@/types"
import { useAuth } from "@/context/auth-context"
import { useChat } from "@/hooks/use-chat"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, MapPin, Star, Globe, MessageSquare, CheckCircle } from "lucide-react"
import Link from "next/link"
import { HireFreelancerDialog } from "@/components/freelancers/hire-freelancer-dialog"

export default function FreelancerProfilePage() {
    const params = useParams()
    const router = useRouter()
    const { user, role } = useAuth()
    const [profile, setProfile] = useState<FreelancerProfile | null>(null)
    const [loading, setLoading] = useState(true)

    const { startChat } = useChat()
    const [startingChat, setStartingChat] = useState(false)

    const handleMessage = async () => {
        if (!user || !profile) return
        setStartingChat(true)
        try {
            const chatId = await startChat(profile.uid, profile.title || "Freelancer")
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
        async function fetchProfile() {
            if (!params.id) return
            try {
                const docRef = doc(db, "freelancerProfiles", params.id as string)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setProfile({ uid: docSnap.id, ...docSnap.data() } as FreelancerProfile)
                }
            } catch (error) {
                console.error("Error fetching profile:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [params.id])

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>

    if (!profile) return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <h2 className="text-2xl font-bold mb-2">Freelancer Not Found</h2>
            <p className="text-muted-foreground mb-4">This profile may have been removed or does not exist.</p>
            <Link href="/freelancers"><Button variant="outline">Browse Freelancers</Button></Link>
        </div>
    )

    return (
        <div className="container max-w-5xl mx-auto py-10 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Sidebar - Profile Card */}
                <div className="space-y-6">
                    <Card className="shadow-lg border-t-4 border-t-primary">
                        <CardContent className="pt-8 flex flex-col items-center text-center">
                            <Avatar className="h-32 w-32 mb-4 border-4 border-muted">
                                <AvatarImage src={profile.photoURL} />
                                <AvatarFallback className="text-4xl">{profile.title?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>

                            <h1 className="text-2xl font-bold mb-1">{profile.title || "Freelancer"}</h1>

                            <div className="flex items-center gap-1 text-muted-foreground mb-4">
                                <MapPin className="h-4 w-4" /> Sri Lanka
                                {profile.verified && <CheckCircle className="h-4 w-4 text-blue-500 fill-blue-50 ml-1" />}
                            </div>

                            <div className="flex items-center justify-center gap-6 w-full mb-6">
                                <div className="text-center">
                                    <div className="flex items-center justify-center font-bold text-lg">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                                        {profile.rating || "N/A"}
                                    </div>
                                    <span className="text-xs text-muted-foreground">Rating</span>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-lg">{profile.reviewCount || 0}</div>
                                    <span className="text-xs text-muted-foreground">Reviews</span>
                                </div>
                            </div>

                            <div className="w-full space-y-3">
                                {role === 'client' ? (
                                    <>
                                        <HireFreelancerDialog freelancer={profile} />
                                        <p className="text-[10px] text-muted-foreground mt-2">Chat will be enabled once you start a hire.</p>
                                    </>
                                ) : !user ? (
                                    <Button className="w-full" asChild>
                                        <Link href="/login">Log in to Hire</Link>
                                    </Button>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Hourly Rate</span>
                                <p className="text-lg font-semibold">{profile.priceRange || "Negotiable"}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Availability</span>
                                <p className="text-base capitalize">{profile.availability || "Full-time"}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Languages</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {profile.languages?.length ? profile.languages.map(lang => (
                                        <Badge key={lang} variant="secondary" className="font-normal">{lang}</Badge>
                                    )) : <span className="text-sm">English, Sinhala</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content - Bio & Portfolio */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold">About</h2>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                    {profile.bio || "This freelancer has not added a bio yet."}
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills?.length ? profile.skills.map(skill => (
                                <Badge key={skill} className="px-3 py-1 text-sm">{skill}</Badge>
                            )) : <p className="text-muted-foreground">No skills listed.</p>}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold">Portfolio</h2>
                        {profile.portfolio?.length ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.portfolio.map((item, i) => (
                                    <Link href={item} key={i} target="_blank" className="block group">
                                        <Card className="overflow-hidden hover:shadow-md transition-all h-full">
                                            <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-muted/80 transition-colors">
                                                <Globe className="h-8 w-8" />
                                            </div>
                                            <CardContent className="p-4">
                                                <p className="font-medium truncate text-blue-600 group-hover:underline">Portfolio Link {i + 1}</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-muted/20 border-dashed">
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    No portfolio items added yet.
                                </CardContent>
                            </Card>
                        )}
                    </section>
                </div>

            </div>
        </div>
    )
}
