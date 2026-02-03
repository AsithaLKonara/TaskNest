import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ClientDashboard() {
    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Client Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Manage your job postings and hire talent.</p>
                </div>
                <Link href="/dashboard/client/post-job">
                    <Button>Post a New Job</Button>
                </Link>
            </div>

            {/* TODO: Add Stats Cards here */}
            <div className="grid gap-4 md:grid-cols-3 mt-8">
                <div className="p-6 rounded-xl bg-card border shadow-sm">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Active Jobs</p>
                </div>
                <div className="p-6 rounded-xl bg-card border shadow-sm">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Applications Received</p>
                </div>
                <div className="p-6 rounded-xl bg-card border shadow-sm">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Hires Made</p>
                </div>
            </div>
        </div>
    )
}
