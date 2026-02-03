import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
                <div className="space-y-4 text-muted-foreground">
                    <p>Welcome to TaskNest. By using our website, you agree to these terms.</p>
                    <h2 className="text-xl font-semibold text-foreground mt-6">1. Acceptance of Terms</h2>
                    <p>By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
                    <h2 className="text-xl font-semibold text-foreground mt-6">2. User Accounts</h2>
                    <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.</p>
                    <h2 className="text-xl font-semibold text-foreground mt-6">3. Content</h2>
                    <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material.</p>
                </div>
            </main>
            <Footer />
        </div>
    )
}
