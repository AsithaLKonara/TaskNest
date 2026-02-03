"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { FreelancerProfile } from "@/types"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, Eye } from "lucide-react"
import { VerificationModal } from "@/components/dashboard/admin/verification-modal"
import { toast } from "sonner"

export const dynamic = "force-dynamic"

export default function AdminFreelancersPage() {
    const [profiles, setProfiles] = useState<FreelancerProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProfile, setSelectedProfile] = useState<FreelancerProfile | null>(null)
    const [verifying, setVerifying] = useState(false)

    useEffect(() => {
        fetchProfiles()
    }, [])

    async function fetchProfiles() {
        try {
            // In a real app, use pagination and server-side filtering
            const querySnapshot = await getDocs(collection(db, "freelancerProfiles"))
            const fetchedProfiles = querySnapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            })) as FreelancerProfile[]
            setProfiles(fetchedProfiles)
        } catch (error) {
            console.error("Error fetching profiles:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async () => {
        if (!selectedProfile) return
        setVerifying(true)
        try {
            const docRef = doc(db, "freelancerProfiles", selectedProfile.uid)
            await updateDoc(docRef, { verified: true })

            toast.success("Freelancer verified successfully")

            // Update local state
            setProfiles(prev => prev.map(p =>
                p.uid === selectedProfile.uid ? { ...p, verified: true } : p
            ))
            setSelectedProfile(null)
        } catch (error) {
            console.error("Error verifying:", error)
            toast.error("Verification failed")
        } finally {
            setVerifying(false)
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Freelancer Verification v2</h1>
                <p className="text-muted-foreground">Review and verify freelancer identities.</p>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Hourly Rate</TableHead>
                            <TableHead>NIC Status</TableHead>
                            <TableHead>Verification</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {profiles.map((profile) => (
                            <TableRow key={profile.uid}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="font-bold">{profile.name || "Unknown User"}</span>
                                        <span className="text-sm">{profile.title || "Untitled"}</span>
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{profile.bio}</div>
                                    </div>
                                </TableCell>
                                <TableCell>{profile.priceRange}</TableCell>
                                <TableCell>
                                    {profile.nicUrl ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Uploaded</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {profile.verified ? (
                                        <Badge className="bg-blue-600 hover:bg-blue-700"><ShieldCheck className="w-3 h-3 mr-1" /> Verified</Badge>
                                    ) : (
                                        <Badge variant="secondary">Unverified</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant={profile.verified ? "outline" : "default"} onClick={() => setSelectedProfile(profile)}>
                                        <Eye className="mr-2 h-3 w-3" /> {profile.verified ? "View" : "Review"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <VerificationModal
                isOpen={!!selectedProfile}
                onClose={() => setSelectedProfile(null)}
                profile={selectedProfile}
                onVerify={handleVerify}
                loading={verifying}
            />
        </div>
    )
}
