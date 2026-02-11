'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Signs out the user via Better Auth, clears session cookie, then redirects to home.
 * Use from a client component: call this action then redirect on client if needed.
 */
export async function logoutAction(): Promise<void> {
  const requestHeaders = await headers();
  await auth.api.signOut({
    headers: requestHeaders,
  });
  redirect('/');
}
