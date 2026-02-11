'use client';

import { useTransition } from 'react';
import { logoutAction } from '@/actions/auth/logout';
import { Button } from '@/components/ui/button';

type LogoutButtonProps = {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';
  children?: React.ReactNode;
};

/**
 * Reusable logout button. Only render when user session exists (e.g. from layout/navbar).
 * Calls Better Auth sign-out, clears session cookie, then redirects to home.
 */
export function LogoutButton({
  className,
  variant = 'outline',
  size = 'default',
  children = 'Logout',
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isPending}
      aria-busy={isPending}
    >
      {isPending ? 'Signing out…' : children}
    </Button>
  );
}
