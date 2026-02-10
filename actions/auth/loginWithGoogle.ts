'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/** Result of the Google login server action (for UI: redirect to `url` on success). */
export type LoginWithGoogleResult =
  | { success: true; url: string }
  | { success: false; error: string };

/**
 * Starts the Google OAuth login flow via Better Auth.
 * Use from a button: on success, redirect the user to the returned `url` (e.g. window.location.href = url).
 *
 * @param options.callbackURL - Where to send the user after successful login (default: "/")
 * @returns { success: true, url } to redirect, or { success: false, error } with a message
 */
export async function loginWithGoogleAction(
  options?: { callbackURL?: string }
): Promise<LoginWithGoogleResult> {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return {
        success: false,
        error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
      };
    }

    const callbackURL = options?.callbackURL ?? '/';
    const result = await auth.api.signInSocial({
      body: {
        provider: 'google',
        callbackURL,
      },
      headers: await headers(),
    });

    if (!result?.url) {
      return {
        success: false,
        error: 'Could not start Google login. No redirect URL received.',
      };
    }

    return { success: true, url: result.url };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'An error occurred during Google sign-in.';
    console.error('[loginWithGoogle]', message, err);
    return { success: false, error: message };
  }
}
