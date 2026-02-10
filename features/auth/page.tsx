'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { loginWithCredentialsAction } from '@/actions/auth/loginWithCredentials';
import { registerUserAction } from '@/actions/auth/registerUser';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
});

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').trim(),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const defaultLoginValues: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: true,
};

const defaultRegisterValues: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formError, setFormError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues,
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: defaultRegisterValues,
  });

  async function onLoginSubmit(values: LoginFormValues) {
    setFormError(null);
    setIsLoading(true);
    try {
      const result = await loginWithCredentialsAction({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });
      if (result.success) {
        router.push('/');
        router.refresh();
        return;
      }
      setFormError(result.error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onRegisterSubmit(values: RegisterFormValues) {
    setFormError(null);
    setIsLoading(true);
    try {
      const result = await registerUserAction({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      if (result.success) {
        router.push('/');
        router.refresh();
        return;
      }
      setFormError(result.error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onGoogleClick() {
    setGoogleError(null);
    setIsGoogleLoading(true);
    try {
      // Start OAuth from the client so the API can set the state cookie in this response.
      // Starting from a server action never sets that cookie in the browser, causing "please_restart_the_process".
      const res = await fetch('/api/auth/sign-in/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google', callbackURL: '/' }),
        credentials: 'include',
        redirect: 'manual',
      });
      const redirectUrl = res.headers.get('Location');
      if (res.status >= 300 && res.status < 400 && redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string; message?: string };
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setGoogleError(data?.message ?? data?.error ?? 'Could not start Google sign-in.');
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Could not start Google sign-in.');
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            SOS Ksar El Kebir
          </CardTitle>
          <CardDescription className="text-center">
            Sign in or create an account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle Login / Register */}
          <div className="flex rounded-lg border bg-muted/50 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setFormError(null);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setFormError(null);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign up
            </button>
          </div>

          {formError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}

          {mode === 'login' ? (
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-input"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 font-normal cursor-pointer">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...registerForm}>
              <form
                onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your name"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="At least 8 characters"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account…' : 'Create account'}
                </Button>
              </form>
            </Form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
              <span className="bg-card px-2">Or continue with</span>
            </div>
          </div>

          {googleError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {googleError}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onGoogleClick}
            disabled={isGoogleLoading}
          >
            <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
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
            {isGoogleLoading ? 'Redirecting…' : 'Continue with Google'}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
