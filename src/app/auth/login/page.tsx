'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { DiscordSignInButton } from '@/components/auth/DiscordSignInButton';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';
import { loginSchema } from '@/model/validation/authValidation';
import type { z } from 'zod';

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const message = searchParams.get('message');
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
  const urlError = searchParams.get('error_description') || searchParams.get('error');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('invalid')) {
          setServerError('Invalid email or password. Please try again.');
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setServerError('Please confirm your email address before signing in.');
        } else {
          setServerError(error.message);
        }
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  const handleOAuthSuccess = () => {
    router.push(redirectTo);
  };

  const handleOAuthError = (error: Error) => {
    setServerError(error.message);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Mobile logo */}
      <div className="flex lg:hidden items-center gap-2 justify-center">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-foreground">ReadTrace</span>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>

      {/* Alerts */}
      {message && (
        <div className="flex items-start gap-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-300">{message}</p>
        </div>
      )}

      {(serverError || urlError) && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{serverError || urlError}</p>
        </div>
      )}

      {/* OAuth buttons */}
      <div className="space-y-3">
        <GoogleSignInButton onSuccess={handleOAuthSuccess} onError={handleOAuthError} className="w-full" />
        <DiscordSignInButton onSuccess={handleOAuthSuccess} onError={handleOAuthError} className="w-full" />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-3 bg-background text-muted-foreground tracking-wider">Or sign in with email</span>
        </div>
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            placeholder="you@example.com"
            className={cn(
              'block w-full rounded-lg border px-4 py-2.5 text-sm shadow-sm transition-colors bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              errors.email ? 'border-red-400 focus:ring-red-400' : 'border-border',
              isSubmitting && 'opacity-50 cursor-not-allowed'
            )}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              disabled={isSubmitting}
              placeholder="••••••••"
              className={cn(
                'block w-full rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-sm transition-colors bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                errors.password ? 'border-red-400 focus:ring-red-400' : 'border-border',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors',
            isSubmitting && 'opacity-60 cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        By signing in, you agree to our{' '}
        <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">Terms</Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">Privacy Policy</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary/90 to-primary flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">ReadTrace</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Track every chapter.<br />Never lose your place.
          </h1>
          <p className="text-white/70 text-lg">
            Your personal reading progress tracker for manga, manhwa, and webtoons.
          </p>
        </div>
        <p className="text-white/40 text-sm">© {new Date().getFullYear()} ReadTrace</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12">
        <Suspense fallback={
          <div className="w-full max-w-md flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
