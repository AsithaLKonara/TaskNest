import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                <div className="space-y-4 text-muted-foreground">
                    <p>Last updated: October 2023</p>
                    <p>At TaskNest, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
                    <h2 className="text-xl font-semibold text-foreground mt-6">1. Information We Collect</h2>
                    <p>We collect information you provide directly to us, such as when you create an account, update your profile, or post a job.</p>
                    <h2 className="text-xl font-semibold text-foreground mt-6">2. How We Use Information</h2>
                    <p>We use your information to provide our services, process payments, and communicate with you.</p>
                    {/* Add more legal filler content as needed */}
                </div>
            </main>
            <Footer />
        </div>
    )
}
