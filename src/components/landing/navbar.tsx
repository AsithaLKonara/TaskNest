"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
    const { user, logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    const navLinks = [
        { name: "Find Talent", href: "/freelancers" },
        { name: "Find Work", href: "/jobs" },
        { name: "Why TaskNest", href: "/#features" },
    ]

    return (
        <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    TaskNest
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link key={link.name} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <>
                            <Button variant="ghost" asChild>
                                <Link href="/dashboard/freelancer">Dashboard</Link>
                            </Button>
                            <ModeToggle />
                            <Button onClick={() => logout()}>Log Out</Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                                Log In
                            </Link>
                            <ModeToggle />
                            <Button asChild>
                                <Link href="/register">Join Now</Link>
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile Nav */}
                <div className="md:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <div className="flex flex-col gap-6 mt-6">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="text-lg font-medium"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                <div className="h-px bg-border my-2" />
                                {user ? (
                                    <>
                                        <Link href="/dashboard/freelancer" onClick={() => setIsOpen(false)} className="text-lg font-medium">Dashboard</Link>
                                        <Button onClick={() => { logout(); setIsOpen(false); }}>Log Out</Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium">Log In</Link>
                                        <Button asChild onClick={() => setIsOpen(false)}>
                                            <Link href="/register">Join Now</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
