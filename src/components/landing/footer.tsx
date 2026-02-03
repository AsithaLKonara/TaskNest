import Link from "next/link"

export function Footer() {
    return (
        <footer className="bg-background border-t py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            TaskNest
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Sri Lanka's premier platform for connecting top freelance talent with businesses.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">For Clients</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/freelancers" className="hover:text-foreground">Find Talent</Link></li>
                            <li><Link href="/dashboard/client/post-job" className="hover:text-foreground">Post a Job</Link></li>
                            <li><Link href="/" className="hover:text-foreground">Trust & Safety</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">For Freelancers</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/jobs" className="hover:text-foreground">Browse Jobs</Link></li>
                            <li><Link href="/register" className="hover:text-foreground">Join as Freelancer</Link></li>
                            <li><Link href="/" className="hover:text-foreground">Success Stories</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                            <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} TaskNest. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
