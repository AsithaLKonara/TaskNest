"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminChatsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Message Monitor & Disputes</h1>
                <p className="text-muted-foreground">Monitor chats and handle disputes between users.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Disputes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                        Dispute resolution interface will go here.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
