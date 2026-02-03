"use client"

import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Growth } from "@/components/landing/growth"
import { Features } from "@/components/landing/features"
import { Services } from "@/components/landing/services"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Testimonials } from "@/components/landing/testimonials"
import { Footer } from "@/components/landing/footer"
import LorenzBackground from "@/components/landing/lorenz-background"

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      <LorenzBackground />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Growth />
        <Features />
        <Services />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
