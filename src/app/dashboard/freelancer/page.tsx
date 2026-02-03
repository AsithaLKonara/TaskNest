export default function FreelancerDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Freelancer Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome back! Manage your proposals and active orders here.</p>

            {/* TODO: Add Stats Cards here */}
            <div className="grid gap-4 md:grid-cols-3 mt-8">
                <div className="p-6 rounded-xl bg-card border shadow-sm">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Active Orders</p>
                </div>
                <div className="p-6 rounded-xl bg-card border shadow-sm">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Proposals Sent</p>
                </div>
                <div className="p-6 rounded-xl bg-card border shadow-sm">
                    <div className="text-2xl font-bold">$0.00</div>
                    <p className="text-sm text-muted-foreground">Earnings</p>
                </div>
            </div>
        </div>
    )
}
