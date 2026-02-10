/**
 * Better Auth configuration for SOS Ksar.
 *
 * - PostgreSQL via Drizzle adapter (users, session, account, verification)
 * - Email/password: signup, login, password hashing (scrypt), validation
 * - Google OAuth (env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
 * - Session in cookies; user created on first login (OAuth or signup)
 *
 * Use in middleware and server actions via auth.api.* and auth.handler.
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/db';
import { users, session, account, verification } from '@/db/schema';
import { UserRole } from '@/types';

/** Schema map: Better Auth expects model names "user" | "session" | "account" | "verification" */
const authSchema = {
  user: users,
  session,
  account,
  verification,
} as const;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),

  /**
   * Use existing "users" table with serial id; other tables use UUIDs.
   * User is created automatically on first OAuth login.
   */
  advanced: {
    database: {
      generateId: (options) => {
        if (options.model === 'user') return undefined; // let PostgreSQL serial generate
        return crypto.randomUUID();
      },
    },
  },

  /** Map to existing "users" table and add role (not set by user on signup). */
  user: {
    modelName: 'users',
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: UserRole.CITIZEN,
        input: false,
      },
    },
  },

  /** Session management: cookie-based (default). */
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  /**
   * Email/password authentication using existing Drizzle users + account tables.
   * Passwords are hashed automatically (scrypt). Login and signup return session.
   */
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  /** Google OAuth from environment variables. */
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  /**
   * Required for Server Actions to set cookies (e.g. sign-in, sign-up).
   * Must be last in the plugins array.
   */
  plugins: [nextCookies()],
});

/** Inferred session type for use in server actions and middleware. */
export type Session = typeof auth.$Infer.Session;
