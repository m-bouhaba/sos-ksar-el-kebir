/**
 * Auth module: Better Auth instance, session helpers, auth helpers, and types.
 */

export { auth, type Session } from './auth';
export {
  getSession,
  getServerSession,
  type SessionUser,
  type SessionMeta,
  type SessionResult,
} from './session';
export {
  getCurrentUser,
  requireAuth,
  requireRole,
  requireAnyRole,
} from './auth-helpers';
export { UnauthorizedError, ForbiddenError } from './errors';
