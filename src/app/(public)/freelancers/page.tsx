"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { FreelancerProfile } from "@/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MapPin, Star, Filter } from "lucide-react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function FreelancersPage() {
    const [profiles, setProfiles] = useState<FreelancerProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    // Filtered Profiles
    const filteredProfiles = profiles.filter(profile => {
        const searchLower = searchTerm.toLowerCase()
        const matchesTitle = profile.title?.toLowerCase().includes(searchLower) || false
        const matchesSkill = profile.skills?.some(s => s.toLowerCase().includes(searchLower)) || false
        const matchesBio = profile.bio?.toLowerCase().includes(searchLower) || false

        return matchesTitle || matchesSkill || matchesBio
    })

    useEffect(() => {
        async function fetchFreelancers() {
            try {
                // Fetch all verified freelancers
                const q = query(collection(db, "freelancerProfiles")) // In real app, check verified filter: where("verified", "==", true)
                const querySnapshot = await getDocs(q)
                const fetchedProfiles = querySnapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                })) as FreelancerProfile[]
                setProfiles(fetchedProfiles)
            } catch (error) {
                console.error("Error fetching freelancers:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchFreelancers()
    }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hire Top Freelancers</h1>
                    <p className="text-muted-foreground">Find the perfect expert for your project.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by skill, title, or name..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProfiles.length > 0 ? filteredProfiles.map((profile) => (
                        <Card key={profile.uid} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={profile.photoURL} />
                                    <AvatarFallback>{profile.title?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="overflow-hidden">
                                    <h3 className="font-semibold truncate">{profile.title || "Freelancer"}</h3>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <MapPin className="w-3 h-3 mr-1" /> Sri Lanka
                                        {profile.verified && <Badge variant="secondary" className="ml-2 py-0 h-5 text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100">Verified</Badge>}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">
                                    {profile.bio || "No bio provided yet."}
                                </p>
                                <div className="flex flex-wrap gap-1 mb-4 h-14 overflow-hidden">
                                    {profile.skills?.slice(0, 4).map(skill => (
                                        <Badge key={skill} variant="outline" className="text-xs bg-muted/50 font-normal">{skill}</Badge>
                                    ))}
                                    {(profile.skills?.length || 0) > 4 && (
                                        <Badge variant="outline" className="text-xs">+{(profile.skills?.length || 0) - 4}</Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-sm font-medium">
                                    <span className="flex items-center"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" /> {profile.rating || "N/A"}</span>
                                    <span>{profile.priceRange || "Negotiable"}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button className="w-full" asChild>
                                    <Link href={`/freelancers/${profile.uid}`}>View Profile</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No freelancers found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
