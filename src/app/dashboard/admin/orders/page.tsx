"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminOrdersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Orders</h1>
                <p className="text-muted-foreground">Track and manage all platform orders.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Orders List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                        Order management table will go here.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
