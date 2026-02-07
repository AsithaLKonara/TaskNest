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
            await updateDoc(docRef, {
                verified: true,
                kycStatus: 'verified'
            })

            toast.success("Freelancer verified successfully")

            // Update local state
            setProfiles(prev => prev.map(p =>
                p.uid === selectedProfile.uid ? { ...p, verified: true, kycStatus: 'verified' } : p
            ))
            setSelectedProfile(null)
        } catch (error) {
            console.error("Error verifying:", error)
            toast.error("Verification failed")
        } finally {
            setVerifying(false)
        }
    }

    const handleReject = async (reason: string) => {
        if (!selectedProfile) return
        setVerifying(true)
        try {
            const docRef = doc(db, "freelancerProfiles", selectedProfile.uid)
            await updateDoc(docRef, {
                kycStatus: 'rejected',
                verified: false
            })

            toast.error(`Verification rejected: ${reason}`)

            // Update local state
            setProfiles(prev => prev.map(p =>
                p.uid === selectedProfile.uid ? { ...p, kycStatus: 'rejected', verified: false } : p
            ))
            setSelectedProfile(null)
        } catch (error) {
            console.error("Error rejecting:", error)
            toast.error("Action failed")
        } finally {
            setVerifying(false)
        }
    }

    const updateVisibility = async (uid: string, level: 'normal' | 'limited' | 'hidden') => {
        try {
            const docRef = doc(db, "freelancerProfiles", uid)
            await updateDoc(docRef, { visibility: level })
            setProfiles(prev => prev.map(p => p.uid === uid ? { ...p, visibility: level } : p))
            toast.success(`Visibility updated to ${level}`)
        } catch (error) {
            toast.error("Failed to update visibility")
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    const getKycBadge = (status: string | undefined) => {
        switch (status) {
            case 'verified': return <Badge className="bg-green-600">Verified</Badge>
            case 'pending': return <Badge variant="outline" className="bg-blue-50 text-blue-700 animate-pulse">Pending Review</Badge>
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>
            default: return <Badge variant="outline">Unverified</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Freelancer Quality Control</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Manage verification and marketplace visibility (Shadow Controls).</p>
                </div>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Freelancer</TableHead>
                            <TableHead>Hourly Rate</TableHead>
                            <TableHead>KYC Status</TableHead>
                            <TableHead>Visibility</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {profiles.map((profile) => (
                            <TableRow key={profile.uid}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="font-bold">{profile.name || "Unknown User"}</span>
                                        <span className="text-sm text-muted-foreground">{profile.title || "Untitled"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{profile.priceRange}</TableCell>
                                <TableCell>
                                    {getKycBadge(profile.kycStatus)}
                                </TableCell>
                                <TableCell>
                                    {profile.visibility === 'normal' ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-5 text-[10px]">Public</Badge>
                                    ) : profile.visibility === 'limited' ? (
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 h-5 text-[10px]">Limited</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 h-5 text-[10px]">Hidden</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="flex border rounded-md overflow-hidden h-7">
                                            <Button
                                                size="xs"
                                                variant={profile.visibility === 'normal' ? 'default' : 'ghost'}
                                                onClick={() => updateVisibility(profile.uid, 'normal')}
                                                className="rounded-none px-2 text-[9px] h-full"
                                            >
                                                Norm
                                            </Button>
                                            <Button
                                                size="xs"
                                                variant={profile.visibility === 'limited' ? 'secondary' : 'ghost'}
                                                onClick={() => updateVisibility(profile.uid, 'limited')}
                                                className="rounded-none border-x px-2 text-[9px] h-full"
                                            >
                                                Limit
                                            </Button>
                                            <Button
                                                size="xs"
                                                variant={profile.visibility === 'hidden' ? 'destructive' : 'ghost'}
                                                onClick={() => updateVisibility(profile.uid, 'hidden')}
                                                className="rounded-none px-2 text-[9px] h-full"
                                            >
                                                Hide
                                            </Button>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => setSelectedProfile(profile)} className="h-7 px-2">
                                            <Eye className="h-4 w-4 mr-1" /> Review
                                        </Button>
                                    </div>
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
                onReject={handleReject}
                loading={verifying}
            />
        </div>
    )
}
