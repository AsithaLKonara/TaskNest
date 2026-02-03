"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { updatePassword, updateProfile } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(user?.displayName || "")
    const [newPassword, setNewPassword] = useState("")

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault()
        if (!user) return
        setLoading(true)
        try {
            await updateProfile(user, { displayName: name })
            toast.success("Profile updated successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault()
        if (!user || !newPassword) return
        setLoading(true)
        try {
            await updatePassword(user, newPassword)
            toast.success("Password updated successfully")
            setNewPassword("")
        } catch (error: any) {
            // Re-auth usually required here for sensitive actions
            if (error.code === 'auth/requires-recent-login') {
                toast.error("Please log out and log in again to change your password.")
            } else {
                toast.error(error.message || "Failed to update password")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-4 md:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Account Settings</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Manage your account preferences and security.</p>
                </div>
            </div>

            <Tabs defaultValue="account" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                {/* Account Tab */}
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your name and personal details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={user?.email || ""} disabled className="bg-muted" />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed easily.</p>
                                </div>
                                <Button disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>Change your password to keep your account secure.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>New Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="Min 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        minLength={6}
                                    />
                                </div>
                                <Button variant="destructive" disabled={loading || !newPassword}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Password
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Preferences</CardTitle>
                            <CardDescription>Manage what emails you receive.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">New Message Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Get notified when someone sends you a message.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Job Updates</Label>
                                    <p className="text-sm text-muted-foreground">Get notified about status changes to your jobs/proposals.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Marketing</Label>
                                    <p className="text-sm text-muted-foreground">Receive updates about new features and promotions.</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
