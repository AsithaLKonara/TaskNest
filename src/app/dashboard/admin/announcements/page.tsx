"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminAnnouncementsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                <p className="text-muted-foreground">Broadcast system messages to all users.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Send Announcement</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                        Announcement form will go here.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
