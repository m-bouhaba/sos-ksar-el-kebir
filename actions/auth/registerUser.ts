'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';

/** Min/max password length aligned with Better Auth config. */
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

/** Input schema for user registration (Zod). */
const registerUserSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255, 'Name is too long')
      .trim(),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      .max(MAX_PASSWORD_LENGTH, `Password must be at most ${MAX_PASSWORD_LENGTH} characters`),
    callbackURL: z.string().url().optional().or(z.literal('')),
  });

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

/** User shape returned after successful registration. */
export type RegisteredUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string | null;
  emailVerified?: boolean;
};

/** Result of the register user server action. */
export type RegisterUserResult =
  | { success: true; user: RegisteredUser }
  | { success: false; error: string };

/**
 * Registers a new user with email and password via Better Auth.
 * User is stored in the database; default role is "citizen" (set in auth config).
 * Session is created and stored in cookies after signup.
 *
 * @param input - Name, email, and password (optional callbackURL for redirect)
 * @returns { success: true, user } or { success: false, error } with a message
 */
export async function registerUserAction(
  input: RegisterUserInput
): Promise<RegisterUserResult> {
  try {
    const parsed = registerUserSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return { success: false, error: first?.message ?? 'Invalid input' };
    }

    const { name, email, password, callbackURL } = parsed.data;

    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        ...(callbackURL && callbackURL.trim() && { callbackURL: callbackURL.trim() }),
      },
      headers: await headers(),
    });

    if (!result?.user) {
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    }

    const user: RegisteredUser = {
      id: String(result.user.id),
      email: result.user.email ?? '',
      name: result.user.name ?? '',
      role: (result.user as { role?: string }).role ?? 'citizen',
      image: result.user.image ?? null,
      emailVerified: (result.user as { emailVerified?: boolean }).emailVerified,
    };

    return { success: true, user };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    const message = mapRegisterError(raw);
    console.error('[registerUser]', raw, err);
    return { success: false, error: message };
  }
}

/** Map Better Auth / API errors to user-facing messages. */
function mapRegisterError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('already') && (lower.includes('email') || lower.includes('exist')))
    return 'An account with this email already exists. Sign in or use another email.';
  if (lower.includes('unique') || lower.includes('duplicate')) return 'This email is already registered.';
  if (lower.includes('password') && lower.includes('length'))
    return `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`;
  if (lower.includes('email and password') && !lower.includes('enabled'))
    return 'Email and password sign-up is not available.';
  return raw || 'Registration failed. Please try again.';
}
