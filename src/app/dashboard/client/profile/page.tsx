"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const clientProfileSchema = z.object({
    companyName: z.string().min(2, "Company name is required"),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    description: z.string().max(500, "Description too long").optional(),
    industry: z.string().optional(),
})

export default function ClientProfilePage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)

    const form = useForm<z.infer<typeof clientProfileSchema>>({
        resolver: zodResolver(clientProfileSchema),
        defaultValues: {
            companyName: "",
            website: "",
            description: "",
            industry: "",
        },
    })

    useEffect(() => {
        if (!user) return
        async function fetchProfile() {
            try {
                const docRef = doc(db, "clientProfiles", user!.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    form.reset({
                        companyName: data.companyName || "",
                        website: data.website || "",
                        description: data.description || "",
                        industry: data.industry || "",
                    })
                }
            } catch (error) {
                console.error("Error fetching profile:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [user, form])

    async function onSubmit(values: z.infer<typeof clientProfileSchema>) {
        if (!user) return
        try {
            await setDoc(doc(db, "clientProfiles", user.uid), {
                ...values,
                uid: user.uid,
                updatedAt: new Date().toISOString()
            }, { merge: true })
            toast.success("Profile updated")
        } catch (error) {
            toast.error("Failed to save profile")
        }
    }

    if (loading) return <div className="flex h-40 justify-center items-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-2">Company Profile</h1>
            <p className="text-muted-foreground mb-8">Manage how your company appears to freelancers.</p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name / Your Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Acme Inc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Website (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://acme.inc" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Industry</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Technology, Retail" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>About</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Tell us what you do..." className="min-h-[100px]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit">Save Profile</Button>
                </form>
            </Form>
        </div>
    )
}
