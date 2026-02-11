import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';
import { AuthCard } from './AuthCard';

/**
 * Auth page: render UI immediately. Redirect to home only when session is valid.
 * Session check: session?.user?.id != null
 */
export default async function AuthPage() {
  const session = await getServerSession();

  if (session?.user?.id != null) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <AuthCard />
    </div>
  );
}
