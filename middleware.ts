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

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // In a production app, we would verify the session cookie here.
    // const session = request.cookies.get('__session')?.value

    // Protection Logic (Conceptual for Enterprise Roadmap)
    if (pathname.startsWith('/dashboard/admin')) {
        // Here we would check if (userRole !== 'admin') -> redirect
    }

    if (pathname.startsWith('/dashboard/freelancer')) {
        // Here we would check if (userRole !== 'freelancer') -> redirect
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*'],
}
