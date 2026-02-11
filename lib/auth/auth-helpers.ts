import { auth } from './auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types';

/**
 * Get the currently authenticated user.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    return session?.user || null;
}

/**
 * Require authentication.
 * Throws an error (or redirects) if no session exists.
 */
export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/auth/login');
    }

    return user;
}

/**
 * Require a specific role.
 * Throws if user is not authenticated or has the wrong role.
 */
export async function requireRole(role: UserRole) {
    const user = await requireAuth();

    if ((user as any).role !== role) {
        redirect('/unauthorized');
    }

    return user;
}

/**
 * Require any of the specified roles.
 * Throws if user is not authenticated or does not have one of the allowed roles.
 */
export async function requireAnyRole(roles: UserRole[]) {
    const user = await requireAuth();

    // We cast user.role to UserRole to ensure comparison works if type differs slightly
    if (!roles.includes((user as any).role as UserRole)) {
        redirect('/unauthorized');
    }

    return user;
}
