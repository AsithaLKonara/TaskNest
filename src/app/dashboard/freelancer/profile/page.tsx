"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FreelancerProfile } from "@/types"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { SkillSelector } from "@/components/dashboard/skill-selector"
import { FileUpload } from "@/components/dashboard/file-upload"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

const profileSchema = z.object({
    title: z.string().min(2, "Professional title is too short"),
    bio: z.string().min(10, "Bio should be at least 10 characters"),
    hourlyRate: z.string().min(1, "Please enter your rate"),
    skills: z.array(z.string()).min(1, "Add at least one skill"),
    portfolio: z.array(z.string()).optional(),
    availability: z.boolean().optional(),
    kycDocuments: z.array(z.object({
        type: z.enum(['nic', 'passport', 'driving_license']),
        url: z.string(),
        submittedAt: z.number()
    })).optional(),
})

export default function ProfilePage() {
    const { user, profile } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            title: "",
            bio: "",
            hourlyRate: "",
            skills: [],
            portfolio: [],
            availability: true,
            kycDocuments: [],
        },
    })

    useEffect(() => {
        async function fetchProfile() {
            if (!user) return
            try {
                const docRef = doc(db, "freelancerProfiles", user.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    const data = docSnap.data() as FreelancerProfile
                    form.reset({
                        title: data.title || "",
                        bio: data.bio || "",
                        hourlyRate: data.priceRange || "",
                        skills: data.skills || [],
                        portfolio: data.portfolio || [],
                        availability: data.availability === 'full-time',
                        kycDocuments: data.kycDocuments || [],
                    } as any)
                }
            } catch (error) {
                console.error("Error fetching profile:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [user, form])

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        if (!user) return
        setSaving(true)
        try {
            const currentKycs = form.getValues('kycDocuments') || [];
            const profileData = {
                uid: user.uid,
                name: user.displayName,
                title: values.title,
                bio: values.bio,
                priceRange: values.hourlyRate,
                skills: values.skills,
                portfolio: values.portfolio || [],
                availability: values.availability ? 'full-time' : 'part-time',
                kycDocuments: values.kycDocuments || [],
                kycStatus: currentKycs.length > 0 ? (profile?.kycStatus === 'verified' ? 'verified' : 'pending') : 'unverified',
                verified: profile?.kycStatus === 'verified',
            }

            await setDoc(doc(db, "freelancerProfiles", user.uid), profileData, { merge: true })
            toast.success("Profile updated successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to save profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin" /></div>
    }

    const kycStatus = profile?.kycStatus || 'unverified';

    return (
        <div className="max-w-4xl mx-auto py-4 md:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Edit Profile</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Manage your public appearance and rates.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={form.handleSubmit(onSubmit)} className="w-full sm:w-auto" disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* KYC Status Alert */}
            {kycStatus === 'unverified' && (
                <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold">Identity Verification Required</h4>
                        <p className="text-sm">Please upload your ID documents below to access all platform features.</p>
                    </div>
                </div>
            )}
            {kycStatus === 'pending' && (
                <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
                    <h4 className="font-semibold">Verification Pending</h4>
                    <p className="text-sm">Our admins are currently reviewing your documents. This usually takes 24-48 hours.</p>
                </div>
            )}
            {kycStatus === 'verified' && (
                <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
                    <h4 className="font-semibold">Verified Freelancer</h4>
                    <p className="text-sm">Your identity has been verified. You now have the "Verified" badge on your profile.</p>
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <div className="grid gap-6 border p-4 md:p-6 rounded-xl bg-card shadow-sm transition-all hover:shadow-md">
                        <h2 className="text-xl font-semibold">Basic Info</h2>
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Professional Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Senior Full Stack Developer" {...field} />
                                    </FormControl>
                                    <FormDescription>This will be displayed under your name.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell clients about your experience, expertise, and what makes you unique."
                                            className="min-h-[150px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid gap-6 border p-4 md:p-6 rounded-xl bg-card shadow-sm transition-all hover:shadow-md">
                        <h2 className="text-xl font-semibold">Skills & Experience</h2>
                        <FormField
                            control={form.control}
                            name="skills"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Skills</FormLabel>
                                    <FormControl>
                                        <SkillSelector value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormDescription>Press Enter to add tags.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hourlyRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hourly Rate / Price Range</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. $25/hr" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="availability"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Available for Work</FormLabel>
                                        <FormDescription>
                                            Turn this off if you are not accepting new clients.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid gap-6 border p-4 md:p-6 rounded-xl bg-card shadow-sm transition-all hover:shadow-md">
                        <h2 className="text-xl font-semibold">Portfolio & Identity</h2>
                        <FormField
                            control={form.control}
                            name="portfolio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Portfolio Images</FormLabel>
                                    <FormControl>
                                        <FileUpload
                                            value={field.value}
                                            onChange={field.onChange}
                                            folder="portfolio"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="kycDocuments"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormLabel>NIC / ID Verification</FormLabel>
                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Securely Stored</span>
                                    </div>
                                    <FormControl>
                                        <FileUpload
                                            value={field.value?.map(d => d.url) || []}
                                            onChange={(urls) => {
                                                const newDocs = urls.map(url => ({
                                                    type: 'nic' as const,
                                                    url,
                                                    submittedAt: Date.now()
                                                }));
                                                field.onChange(newDocs);
                                            }}
                                            folder="kyc"
                                            maxFiles={1}
                                            label="Upload ID Document"
                                        />
                                    </FormControl>
                                    <FormDescription>Upload a clear photo of your National ID or Passport.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end pb-10">
                        <Button type="submit" size="lg" disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Profile
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
