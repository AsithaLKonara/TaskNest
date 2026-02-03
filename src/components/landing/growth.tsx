export function Growth() {
    const stats = [
        { label: "Active Freelancers", value: "2,000+" },
        { label: "Projects Completed", value: "5,400+" },
        { label: "Money Paid Out", value: "$4.2M+" },
        { label: "Client Satisfaction", value: "98%" },
    ]

    return (
        <section className="py-16 bg-muted/30 border-y">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((stat, index) => (
                        <div key={index} className="space-y-2">
                            <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                            <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
