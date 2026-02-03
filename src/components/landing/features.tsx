import { ShieldCheck, Zap, Globe2, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Features() {
    const features = [
        {
            title: "Verified Talent",
            description: "Every freelancer goes through a strict ID and skill verification process.",
            icon: ShieldCheck,
        },
        {
            title: "Fast Hiring",
            description: "Post a job and get proposals within minutes. Chat instantly.",
            icon: Zap,
        },
        {
            title: "100% Remote",
            description: "Access a nationwide pool of talent without geographical limits.",
            icon: Globe2,
        },
        {
            title: "Secure Payments",
            description: "Funds are held in escrow until you approve the work.",
            icon: Wallet,
        },
    ]

    return (
        <section id="features" className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Why Choose TaskNest?</h2>
                    <p className="text-muted-foreground">
                        We provide the tools and trust you need to get work done effortlessly.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Card key={index} className="border-none shadow-md bg-muted/40 hover:bg-muted/60 transition-colors">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
