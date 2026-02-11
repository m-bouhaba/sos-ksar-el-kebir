'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export type LoginWithCredentialsResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Signs in the user with email and password using Better Auth.
 * Session cookie is set by nextCookies plugin. Client should redirect to "/" on success.
 */
export async function loginWithCredentialsAction(
  email: string,
  password: string
): Promise<LoginWithCredentialsResult> {
  try {
    const requestHeaders = await headers();

    await auth.api.signInEmail({
      body: {
        email: email.trim(),
        password,
        callbackURL: '/',
      },
      headers: requestHeaders,
    });

    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'An error occurred during sign-in.';
    console.error('[loginWithCredentials]', message, err);

    // User-friendly messages for common cases
    if (
      typeof message === 'string' &&
      (message.toLowerCase().includes('invalid') ||
        message.toLowerCase().includes('credential') ||
        message.toLowerCase().includes('incorrect'))
    ) {
      return { success: false, error: 'Invalid email or password.' };
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
