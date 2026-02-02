import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Navbar Placeholder */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            TaskNest
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log In
            </Link>
            <Button>Join Now</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-primary text-sm rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10">
              🚀 Sri Lanka's #1 Remote Freelance Marketplace
            </Badge>
            <h1 className="text-4xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground leading-[1.1]">
              Hire Top Local Talent. <br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Zero Friction.
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Connect with verified Sri Lankan freelancers for your next big project.
              Secure payments, remote-first, and built for trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full text-lg h-12 px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                Find Talent <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-lg h-12 px-8">
                Post a Job
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-muted-foreground text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1 rounded-full"><CheckCircle2 className="text-primary h-4 w-4" /></div> Verified Pros
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1 rounded-full"><CheckCircle2 className="text-primary h-4 w-4" /></div> Secure Pay
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1 rounded-full"><CheckCircle2 className="text-primary h-4 w-4" /></div> 100% Remote
              </div>
            </div>
          </div>
        </div>

        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-100px] left-[-100px] sm:left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[0px] right-[-100px] sm:right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-500/20 rounded-full blur-[100px]" />
        </div>
      </section>
    </div>
  );
}
