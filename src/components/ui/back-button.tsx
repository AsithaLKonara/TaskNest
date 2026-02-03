"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export function BackButton({ className }: { className?: string }) {
    const router = useRouter()
    const pathname = usePathname()

    // Don't show back button on main landing page
    if (pathname === '/') return null

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className={`gap-2 ${className}`}
        >
            <ArrowLeft className="h-4 w-4" />
            Back
        </Button>
    )
}
