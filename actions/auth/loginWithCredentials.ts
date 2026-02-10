'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';

/** Input schema for credential login (Zod). */
const loginCredentialsSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(true),
  callbackURL: z.string().url().optional().or(z.literal('')),
});

export type LoginCredentialsInput = z.infer<typeof loginCredentialsSchema>;

/** User shape returned on successful login (session user). */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
  image?: string | null;
  emailVerified?: boolean;
};

/** Result of the credential login server action. */
export type LoginWithCredentialsResult =
  | { success: true; user: AuthUser }
  | { success: false; error: string };

/**
 * Signs in a user with email and password via Better Auth.
 * Session is stored in cookies (nextCookies plugin). Use with Server Actions only.
 *
 * @param input - Email, password, and optional rememberMe / callbackURL
 * @returns { success: true, user } or { success: false, error } with a message
 */
export async function loginWithCredentialsAction(
  input: LoginCredentialsInput
): Promise<LoginWithCredentialsResult> {
  try {
    const parsed = loginCredentialsSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return { success: false, error: first?.message ?? 'Invalid input' };
    }

    const { email, password, rememberMe, callbackURL } = parsed.data;

    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe,
        ...(callbackURL && callbackURL.trim() && { callbackURL: callbackURL.trim() }),
      },
      headers: await headers(),
    });

    if (!result?.user) {
      return {
        success: false,
        error: 'Invalid email or password. Please try again.',
      };
    }

    const user: AuthUser = {
      id: String(result.user.id),
      email: result.user.email ?? '',
      name: result.user.name ?? '',
      role: (result.user as { role?: string }).role,
      image: result.user.image ?? null,
      emailVerified: (result.user as { emailVerified?: boolean }).emailVerified,
    };

    return { success: true, user };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    const message = mapAuthError(raw);
    console.error('[loginWithCredentials]', raw, err);
    return { success: false, error: message };
  }
}

/** Map Better Auth / API errors to user-facing messages. */
function mapAuthError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('invalid') && (lower.includes('password') || lower.includes('credential')))
    return 'Invalid email or password. Please try again.';
  if (lower.includes('user not found') || lower.includes('no user')) return 'Invalid email or password.';
  if (lower.includes('email and password') && !lower.includes('enabled'))
    return 'Email and password sign-in is not available.';
  return raw || 'Sign-in failed. Please try again.';
}
