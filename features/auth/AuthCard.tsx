'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginWithGoogleAction } from '@/actions/auth/loginWithGoogle';
import { loginWithCredentialsAction } from '@/actions/auth/loginWithCredentials';
import { registerUserAction } from '@/actions/auth/registerUser';

export function AuthCard() {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loginPending, startLoginTransition] = useTransition();
  const [signupPending, startSignupTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);

  function handleGoogleClick() {
    setError(null);
    setGooglePending(true);
    loginWithGoogleAction({ callbackURL: '/' })
      .then((result) => {
        if (result.success) {
          window.location.href = result.url;
        } else {
          setError(result.error);
          setGooglePending(false);
        }
      })
      .catch(() => {
        setError('Could not start Google sign-in.');
        setGooglePending(false);
      });
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isLoginMode) {
      startLoginTransition(async () => {
        const result = await loginWithCredentialsAction(email, password);
        if (result.success) {
          router.push('/');
        } else {
          setError(result.error);
        }
      });
    } else {
      startSignupTransition(async () => {
        const result = await registerUserAction(
          name.trim() || email.trim().split('@')[0] || 'User',
          email,
          password
        );
        if (result.success) {
          router.push('/');
        } else {
          setError(result.error);
        }
      });
    }
  }

  const emailValid = email.trim().length > 0;
  const passwordValid =
    password.length >= (isLoginMode ? 1 : 8) &&
    (!isLoginMode ? password.length <= 128 : true);
  const formValid = emailValid && passwordValid && (isLoginMode || name.trim().length > 0);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign in</CardTitle>
        <CardDescription className="text-center">
          Use Google or your email to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Social Login */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleGoogleClick}
          disabled={googlePending}
          aria-busy={googlePending}
        >
          {googlePending ? (
            'Connecting…'
          ) : (
            <>
              <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {!isLoginMode && (
            <div className="space-y-2">
              <Label htmlFor="auth-name">Name</Label>
              <Input
                id="auth-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={loginPending || signupPending}
                className="w-full"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loginPending || signupPending}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              placeholder={isLoginMode ? 'Your password' : 'At least 8 characters'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLoginMode ? 'current-password' : 'new-password'}
              disabled={loginPending || signupPending}
              className="w-full"
              required
              minLength={isLoginMode ? 1 : 8}
              maxLength={128}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!formValid || loginPending || signupPending}
            aria-busy={loginPending || signupPending}
          >
            {loginPending || signupPending
              ? isLoginMode
                ? 'Signing in…'
                : 'Creating account…'
              : isLoginMode
                ? 'Login'
                : 'Create account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setError(null);
          }}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          {isLoginMode
            ? "Don't have an account? Create one"
            : 'Already have an account? Sign in'}
        </button>
      </CardFooter>
    </Card>
  );
}
