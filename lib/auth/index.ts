/**
 * Auth module: Better Auth instance, session helpers, and types.
 */

export { auth, type Session } from './auth';
export {
  getSession,
  getServerSession,
  type SessionUser,
  type SessionMeta,
  type SessionResult,
} from './session';
