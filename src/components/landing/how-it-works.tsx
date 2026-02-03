import { Button } from "@/components/ui/button"

export function HowItWorks() {
    const steps = [
        {
            num: "01",
            title: "Post a Job",
            desc: "Describe your project, budget, and timeline. It’s free and takes minutes.",
        },
        {
            num: "02",
            title: "Hire Top Talent",
            desc: "Get proposals from verified freelancers. Compare profiles and reviews.",
        },
        {
            num: "03",
            title: "Get Work Done",
            desc: "Collaborate securely. Use our workspace to share files and chat.",
        },
        {
            num: "04",
            title: "Pay Securely",
            desc: "Only pay when you are 100% satisfied with the work delivered.",
        },
    ]

    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                            Get work done in 4 easy steps
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            From posting your job to making the final payment, our platform ensures a smooth and secure experience every step of the way.
                        </p>
                        <Button size="lg">How It Works</Button>
                    </div>

                    <div className="lg:w-1/2 grid gap-6">
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                    {step.num}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                                    <p className="text-muted-foreground">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
