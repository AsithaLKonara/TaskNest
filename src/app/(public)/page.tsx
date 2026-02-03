"use client"

import { Hero } from "@/components/landing/hero"
import { Growth } from "@/components/landing/growth"
import { Features } from "@/components/landing/features"
import { Services } from "@/components/landing/services"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Testimonials } from "@/components/landing/testimonials"
import LorenzBackground from "@/components/landing/lorenz-background"

export default function Home() {
  return (
    <>
      <LorenzBackground />
      <Hero />
      <Growth />
      <Features />
      <Services />
      <HowItWorks />
      <Testimonials />
    </>
  );
}
