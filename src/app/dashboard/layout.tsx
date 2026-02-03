"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Loader2, LogOut, LayoutDashboard, Briefcase, FileText, MessageSquare, CreditCard, Users, ShieldAlert, Cog, Building, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, role, loading, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login")
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) return null // Will redirect

    // Simple Sidebar Navigation based on Role
    const freelancerNav = [
        { name: "Overview", href: "/dashboard/freelancer", icon: LayoutDashboard },
        { name: "My Profile", href: "/dashboard/freelancer/profile", icon: Users },
        { name: "Browse Jobs", href: "/jobs", icon: Briefcase },
        { name: "Proposals", href: "/dashboard/freelancer/proposals", icon: FileText },
        { name: "Orders", href: "/dashboard/freelancer/orders", icon: CreditCard },
        { name: "My Reviews", href: "/dashboard/freelancer/reviews", icon: Star },
        { name: "Settings", href: "/dashboard/settings", icon: Cog },
    ]

    const clientNav = [
        { name: "Overview", href: "/dashboard/client", icon: LayoutDashboard },
        { name: "Post Job", href: "/dashboard/client/post-job", icon: Briefcase },
        { name: "My Jobs", href: "/dashboard/client/jobs", icon: FileText },
        { name: "Orders", href: "/dashboard/client/orders", icon: CreditCard },
        { name: "My Reviews", href: "/dashboard/client/reviews", icon: Star },
        { name: "Company Profile", href: "/dashboard/client/profile", icon: Building },
        { name: "Settings", href: "/dashboard/settings", icon: Cog },
    ]

    const adminNav = [
        { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
        { name: "Freelancers", href: "/dashboard/admin/freelancers", icon: Users },
        { name: "Jobs", href: "/dashboard/admin/jobs", icon: Briefcase },
        { name: "Payments", href: "/dashboard/admin/payments", icon: CreditCard },
        { name: "Users", href: "/dashboard/admin/users", icon: Users },
        { name: "Settings", href: "/dashboard/settings", icon: Cog },
    ]

    let navItems = freelancerNav
    if (role === 'client') navItems = clientNav
    if (role === 'admin') navItems = adminNav

    return (
        <div className="flex h-screen bg-muted/40 font-sans">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-background md:flex">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
                        TaskNest
                    </Link>
                </div>
                <nav className="flex-1 space-y-1 px-4 py-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-primary",
                                pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                    <Link
                        href="/dashboard/messages"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-primary",
                            pathname.includes("messages") ? "bg-muted text-primary" : "text-muted-foreground"
                        )}
                    >
                        <MessageSquare className="h-4 w-4" />
                        Messages
                    </Link>
                </nav>
                <div className="border-t p-4">
                    <div className="flex items-center gap-3 mb-4 px-3">
                        <div className="text-sm">
                            <p className="font-medium truncate max-w-[150px]">{user.displayName || "User"}</p>
                            <p className="text-xs text-muted-foreground capitalize">{role}</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => logout()}>
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    )
}
