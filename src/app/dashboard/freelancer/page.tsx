"use client"

import { useAuth } from "@/context/auth-context"

export default function FreelancerDashboard() {
    const { profile } = useAuth()
    const wallet = profile?.wallet || { availableBalance: 0, lockedBalance: 0, currency: 'LKR' }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Freelancer Dashboard</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Welcome back! Manage your proposals and active orders here.</p>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-8">
                <div className="p-4 md:p-6 rounded-xl bg-card border shadow-sm transition-all hover:shadow-md">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Active Orders</p>
                </div>
                <div className="p-4 md:p-6 rounded-xl bg-card border shadow-sm transition-all hover:shadow-md">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Proposals Sent</p>
                </div>
                <div className="p-4 md:p-6 rounded-xl bg-card border shadow-sm transition-all hover:shadow-md relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-2xl font-bold">{wallet.currency} {wallet.availableBalance.toFixed(2)}</div>
                            <p className="text-sm text-muted-foreground">Available Earnings</p>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-semibold text-yellow-600">{wallet.currency} {wallet.lockedBalance.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">In Escrow</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
