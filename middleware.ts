import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/auth/auth';
import { UserRole } from './types';

/** Routes that require the user to be logged in. */
const AUTH_REQUIRED_PREFIXES = ['/dashboard', '/sos', '/inventory', '/command-center'] as const;

/** Admin-only routes: citizens and volunteers are redirected to /unauthorized. */
const ADMIN_ONLY_PREFIXES = ['/command-center', '/dashboard/admin'] as const;

/** Routes that only admin can access (role management, etc.). Volunteers blocked from admin role management. */
const ROLE_MANAGEMENT_PREFIXES = ['/dashboard/admin'] as const;

function isAuthRequired(path: string): boolean {
  return AUTH_REQUIRED_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + '/'));
}

function isAdminOnly(path: string): boolean {
  return ADMIN_ONLY_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + '/'));
}

function isRoleManagement(path: string): boolean {
  return ROLE_MANAGEMENT_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + '/'));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAuthRequired(pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // TASK 3.2: Redirect unauthenticated users to login
  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  const userRole = (session.user as { role?: string }).role as UserRole | undefined;
  const role = userRole ?? UserRole.CITIZEN;

  // TASK 3.2: Citizens blocked from admin pages
  if (isAdminOnly(pathname) && role !== UserRole.ADMIN) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // TASK 3.2: Volunteers blocked from admin role management
  if (isRoleManagement(pathname) && role !== UserRole.ADMIN) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Role-specific dashboard redirect: /dashboard -> /dashboard/{role}
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
  }

  if (pathname.startsWith('/dashboard/')) {
    if (pathname.startsWith('/dashboard/admin') && role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (pathname.startsWith('/dashboard/volunteer') && role !== UserRole.VOLUNTEER) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (pathname.startsWith('/dashboard/citizen') && role !== UserRole.CITIZEN) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/sos',
    '/sos/:path*',
    '/inventory',
    '/inventory/:path*',
    '/command-center',
    '/command-center/:path*',
  ],
};
