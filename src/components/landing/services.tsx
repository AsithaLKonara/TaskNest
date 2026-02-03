import { Code2, PenTool, BarChart3, Languages, Camera, MonitorSmartphone, Database, Music } from "lucide-react"

export function Services() {
    const services = [
        { name: "Web Development", icon: Code2 },
        { name: "Graphic Design", icon: PenTool },
        { name: "Digital Marketing", icon: BarChart3 },
        { name: "Writing & Translation", icon: Languages },
        { name: "Video & Animation", icon: Camera },
        { name: "Mobile Apps", icon: MonitorSmartphone },
        { name: "Data Entry", icon: Database },
        { name: "Audio & Voiceover", icon: Music },
    ]

    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Popular Services</h2>
                    <p className="text-muted-foreground">Find experts in every field.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {services.map((service, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col items-center justify-center p-6 bg-background rounded-xl border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <service.icon className="h-8 w-8 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="font-medium text-sm md:text-base">{service.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
