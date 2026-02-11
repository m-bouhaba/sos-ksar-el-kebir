import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/auth/auth';
import { UserRole } from './types';

export async function middleware(request: NextRequest) {
    const { nextUrl } = request;
    const path = nextUrl.pathname;

    // Define protected routes
    const isDashboard = path.startsWith('/dashboard');
    const isCommandCenter = path.startsWith('/command-center');

    // Skip unrelated routes
    if (!isDashboard && !isCommandCenter) {
        return NextResponse.next();
    }

    // Fetch session
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    // 1. Unauthenticated -> Redirect to login
    if (!session) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const userRole = (session.user as any).role as UserRole;

    // 2. Command Center Protection (Admin Only)
    if (isCommandCenter) {
        // Requirements: "Admin -> access /command-center"
        // "Citizen -> only access /dashboard/citizen"
        // "Volunteer -> only access /dashboard/volunteer"
        if (userRole !== UserRole.ADMIN) {
            // "If logged in but wrong role -> redirect to /dashboard"
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // 3. Dashboard Route Protection
    if (isDashboard) {
        // Root /dashboard -> Redirect to role-specific dashboard
        if (path === '/dashboard') {
            return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
        }

        // Role-specific sub-routes
        if (path.startsWith('/dashboard/admin') && userRole !== UserRole.ADMIN) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        if (path.startsWith('/dashboard/volunteer') && userRole !== UserRole.VOLUNTEER) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        if (path.startsWith('/dashboard/citizen') && userRole !== UserRole.CITIZEN) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match dashboard and command-center routes
        '/dashboard/:path*',
        '/command-center/:path*',
    ],
};
