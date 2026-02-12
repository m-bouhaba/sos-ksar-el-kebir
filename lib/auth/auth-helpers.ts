import { headers } from 'next/headers';
import { auth } from './auth';
import { UserRole } from '@/types';
import { UnauthorizedError, ForbiddenError } from './errors';
import type { SessionUser } from './session';

/** User shape from Better Auth session (id may be number or string). */
type AuthUser = { id: string | number; email?: string; name?: string; role?: string };

/**
 * TASK 4.1 — getCurrentUser()
 * Returns the currently authenticated user, or null if not authenticated.
 * Usable in server actions and server components.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  const u = session.user as AuthUser;
  return {
    id: String(u.id),
    email: u.email ?? '',
    role: typeof u.role === 'string' ? u.role : 'citizen',
  };
}

/**
 * TASK 4.2 — requireAuth()
 * Returns the current user. Throws UnauthorizedError when not authenticated.
 * Usable in server actions: catch UnauthorizedError to return a structured error response.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }
  return user;
}

/**
 * TASK 4.3 — requireRole(role)
 * Returns the current user if they have the required role. Throws when unauthorized or forbidden.
 * Usable in server actions: catch UnauthorizedError / ForbiddenError to return a structured response.
 */
export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new ForbiddenError(`Role '${role}' required`);
  }
  return user;
}

/**
 * Require any of the specified roles. Throws when unauthorized or forbidden.
 */
export async function requireAnyRole(roles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role as UserRole)) {
    throw new ForbiddenError(`One of roles [${roles.join(', ')}] required`);
  }
  return user;
}
