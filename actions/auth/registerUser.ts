'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export type RegisterUserResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Creates a new user with email and password using Better Auth.
 * User gets default role (citizen). Session cookie is set; client should redirect to "/" on success.
 */
export async function registerUserAction(
  name: string,
  email: string,
  password: string
): Promise<RegisterUserResult> {
  try {
    const requestHeaders = await headers();

    await auth.api.signUpEmail({
      body: {
        name: name.trim() || email.trim().split('@')[0] || 'User',
        email: email.trim(),
        password,
        callbackURL: '/',
      },
      headers: requestHeaders,
    });

    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'An error occurred during sign-up.';
    console.error('[registerUser]', message, err);

    if (
      typeof message === 'string' &&
      (message.toLowerCase().includes('already') ||
        message.toLowerCase().includes('exists') ||
        message.toLowerCase().includes('unique'))
    ) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    if (
      typeof message === 'string' &&
      message.toLowerCase().includes('network')
    ) {
      return { success: false, error: 'Network error. Please try again.' };
    }

    return { success: false, error: message };
  }
}
