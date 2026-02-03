import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function Testimonials() {
    const reviews = [
        {
            name: "Sarah Perera",
            role: "Founder, TechLabs",
            text: "I was skeptical about hiring remotely, but TaskNest made it so easy. Found an amazing developer within 48 hours.",
            avatar: "SP",
        },
        {
            name: "Dinesh Kumar",
            role: "Marketing Manager",
            text: "The quality of talent here is unmatched. We've hired three designers so far and all have been professional and skilled.",
            avatar: "DK",
        },
        {
            name: "Amanda Silva",
            role: "E-commerce Owner",
            text: "Safe payments were my biggest concern. The escrow system gave me total peace of mind. Highly recommended!",
            avatar: "AS",
        },
    ]

    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Trusted by businesses across Sri Lanka</h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review, idx) => (
                        <Card key={idx} className="bg-background border-none shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-4 h-4 fill-primary text-primary" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground mb-6">"{review.text}"</p>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback className="bg-primary/10 text-primary">{review.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">{review.name}</p>
                                        <p className="text-xs text-muted-foreground">{review.role}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
