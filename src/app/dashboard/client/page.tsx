import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ClientDashboard() {
    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Client Dashboard</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Manage your job postings and hire talent.</p>
                </div>
                <Link href="/dashboard/client/post-job" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto">Post a New Job</Button>
                </Link>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-8">
                <div className="p-4 md:p-6 rounded-xl bg-card border shadow-sm transition-all hover:shadow-md">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Active Jobs</p>
                </div>
                <div className="p-4 md:p-6 rounded-xl bg-card border shadow-sm transition-all hover:shadow-md">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Applications Received</p>
                </div>
                <div className="p-4 md:p-6 rounded-xl bg-card border shadow-sm transition-all hover:shadow-md">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Hires Made</p>
                </div>
            </div>
        </div>
    )
}
