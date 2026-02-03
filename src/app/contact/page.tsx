import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-xl">
                <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
                <p className="text-muted-foreground mb-8">Have a question? We'd love to hear from you.</p>

                <form className="space-y-6">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input placeholder="Your name" />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" placeholder="your@email.com" />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Message</label>
                        <Textarea placeholder="How can we help?" className="min-h-[150px]" />
                    </div>
                    <Button className="w-full">Send Message</Button>
                </form>
            </main>
            <Footer />
        </div>
    )
}
