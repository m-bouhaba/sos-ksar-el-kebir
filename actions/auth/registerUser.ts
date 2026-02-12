'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// ... (imports remain)
import { UserRole } from '@/types';

export type RegisterUserResult =
  | { success: true; url: string }
  | { success: false; error: string };

/**
 * Creates a new user with email, password, and role.
 * Redirects to the appropriate dashboard based on the selected role.
 */
export async function registerUserAction(
  name: string,
  email: string,
  password: string,
  role: string
): Promise<RegisterUserResult> {
  try {
    const requestHeaders = await headers();

    // Validate role
    if (role !== UserRole.CITIZEN && role !== UserRole.VOLUNTEER) {
      return { success: false, error: 'Invalid role selected.' };
    }

    const callbackURL = role === UserRole.VOLUNTEER ? '/dashboard/volunteer' : '/dashboard/citizen';

    await auth.api.signUpEmail({
      body: {
        name: name.trim() || email.trim().split('@')[0] || 'User',
        email: email.trim(),
        password,
        role,
        callbackURL,
      },
      headers: requestHeaders,
    });

    return { success: true, url: callbackURL };
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
