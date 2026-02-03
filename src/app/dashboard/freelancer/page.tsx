export default function FreelancerDashboard() {
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
                <div className="p-4 md:p-6 rounded-xl bg-card border shadow-sm transition-all hover:shadow-md">
                    <div className="text-2xl font-bold">$0.00</div>
                    <p className="text-sm text-muted-foreground">Earnings</p>
                </div>
            </div>
        </div>
    )
}
