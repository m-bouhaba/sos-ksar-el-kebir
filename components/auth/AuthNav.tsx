'use client';

import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

type SessionUser = {
  id: string;
  email: string;
  role: string;
};

type AuthNavProps = {
  session: { user: SessionUser } | null;
};

/**
 * Renders auth-related nav: Logout when session exists, Login link when not.
 * Use in layout; pass session from getServerSession().
 */
export function AuthNav({ session }: AuthNavProps) {
  const hasSession = session?.user?.id != null;

  return (
    <nav
      className="flex items-center gap-3 justify-end p-3 border-b bg-background/80 backdrop-blur"
      aria-label="Account"
    >
      {hasSession ? (
        <LogoutButton variant="outline" size="sm" />
      ) : (
        <Link
          href="/auth"
          className="text-sm font-medium text-primary hover:underline underline-offset-2"
        >
          Sign in
        </Link>
      )}
    </nav>
  );
}
