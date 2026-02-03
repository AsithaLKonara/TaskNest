"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"


export function Hero() {
    return (
        <section className="relative py-20 lg:py-32 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mr-auto text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge variant="secondary" className="mb-6 px-4 py-2 text-primary text-sm rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10">
                            🚀 Sri Lanka's #1 Remote Freelance Marketplace
                        </Badge>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground leading-[1.1]"
                    >
                        Hire Top Local Talent. <br />
                        <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Zero Friction.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl"
                    >
                        Connect with verified Sri Lankan freelancers for your next big project.
                        Secure payments, remote-first, and built for trust.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-start"
                    >
                        <Button size="lg" className="rounded-full text-lg h-12 px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow" asChild>
                            <Link href="/freelancers">
                                Find Talent <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full text-lg h-12 px-8" asChild>
                            <Link href="/dashboard/client/post-job">
                                Post a Job
                            </Link>
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-12 flex flex-wrap items-center justify-start gap-4 sm:gap-8 text-muted-foreground text-sm font-medium"
                    >
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-1 rounded-full"><CheckCircle2 className="text-primary h-4 w-4" /></div> Verified Pros
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-1 rounded-full"><CheckCircle2 className="text-primary h-4 w-4" /></div> Secure Pay
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-1 rounded-full"><CheckCircle2 className="text-primary h-4 w-4" /></div> 100% Remote
                        </div>
                    </motion.div>
                </div>
            </div>

        </section>
    )
}
