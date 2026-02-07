import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Since we are using Firebase Client SDK, we don't have session cookies by default.
// This middleware is a placeholder to show structure. 
// Real server-side protection requires `next-firebase-auth-edge` or similar to set cookies.
//
// Current Strategy:
// 1. Client-side protection (AuthProvider/Layouts) handles the UX.
// 2. Middleware here can verify public paths vs private paths if we had a cookie.
//
// For this deliverable, we will rely on our robust Layout protection
// and use this file to protect against obvious route mismatches if possible, 
// or just return next() to avoid breaking the app without cookies.

import { globalRateLimit, sensitiveRateLimit } from '@/lib/ratelimit'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Identifer for Rate Limiting (IP-based)
    const ip = (request as any).ip || request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1'
    const identifier = ip.split(',')[0].trim()

    // 1. Specialized Sensitive Route Protection
    if (pathname.startsWith('/api/payments') || pathname.startsWith('/api/auth/mfa')) {
        const { success, limit, reset, remaining } = await sensitiveRateLimit.limit(identifier)
        if (!success) {
            return new NextResponse('Too many sensitive requests. Please wait 60s.', {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                    'X-RateLimit-Reset': reset.toString(),
                },
            })
        }
    }

    // 2. Global Rate Limiting
    const { success, limit, reset, remaining } = await globalRateLimit.limit(identifier)
    if (!success) {
        return new NextResponse('Global rate limit exceeded.', {
            status: 429,
            headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': reset.toString(),
            },
        })
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*'],
}
