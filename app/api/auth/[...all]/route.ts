import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

/**
 * Better Auth catch-all: handles /api/auth/* (callback, get-session, sign-in, etc.).
 * Required for Google OAuth callback: /api/auth/callback/google
 */
export const { GET, POST } = toNextJsHandler(auth);
