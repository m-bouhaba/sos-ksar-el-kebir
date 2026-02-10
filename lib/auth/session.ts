/**
 * Session utilities for Next.js 15 Server Components and Server Actions.
 * Uses the shared Better Auth instance; returns user id, email, and role.
 */

import { headers } from 'next/headers';
import { auth } from './auth';

/** Session payload returned by Better Auth getSession. */
type AuthSession = typeof auth.$Infer.Session;

/** User shape returned by session helpers (id, email, role). */
export type SessionUser = {
  id: string;
  email: string;
  role: string;
};

/** Session metadata (id, expiresAt) for use when needed. */
export type SessionMeta = {
  id: string;
  expiresAt: Date;
};

/** Result of getSession / getServerSession: user + session meta, or null when unauthenticated. */
export type SessionResult = {
  user: SessionUser;
  session: SessionMeta;
};

/**
 * Gets the current session from request headers.
 * Use when you already have headers (e.g. in a Server Action that receives context).
 *
 * @param requestHeaders - Headers instance or Promise<Headers> (e.g. from next/headers)
 * @returns Session with user.id, user.email, user.role and session meta, or null
 */
export async function getSession(
  requestHeaders: Headers | Promise<Headers>
): Promise<SessionResult | null> {
  const headersList = await requestHeaders;
  const raw = await auth.api.getSession({
    headers: headersList,
  });

  if (!raw?.user) return null;

  return toSessionResult(raw as AuthSession);
}

/**
 * Gets the current session in Next.js Server Components or Server Actions.
 * Calls next/headers() internally — use only in server context (RSC or "use server").
 *
 * @returns Session with user.id, user.email, user.role and session meta, or null
 */
export async function getServerSession(): Promise<SessionResult | null> {
  const requestHeaders = await headers();
  return getSession(requestHeaders);
}

/** Maps Better Auth session shape to SessionResult (id, email, role). */
function toSessionResult(raw: AuthSession): SessionResult {
  const user = raw.user as { id: string; email?: string; name?: string; role?: string };
  const session = raw.session as { id: string; expiresAt: Date };

  return {
    user: {
      id: String(user.id),
      email: user.email ?? '',
      role: typeof user.role === 'string' ? user.role : 'citizen',
    },
    session: {
      id: session.id,
      expiresAt: session.expiresAt,
    },
  };
}
