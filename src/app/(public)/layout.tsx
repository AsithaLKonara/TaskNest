import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
// Force layout to be client if we use client-side only nav features, but usually Navbar is client.
// However, Layouts are Server Components by default. Navbar/Footer are likely Client Components.
// We can import them safely.

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
