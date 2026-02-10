'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { DiscordSignInButton } from '@/components/auth/DiscordSignInButton';
import { Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Display success message from URL params
  const message = searchParams.get('message');
  if (message && !successMessage) {
    setSuccessMessage(message);
  }

  const handleOAuthSuccess = (user: any) => {
    router.push('/dashboard');
  };

  const handleOAuthError = (error: Error) => {
    setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Sign in to ReadTrace
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-md bg-success/10 p-4 border border-success/30">
            <p className="text-sm text-success">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-error/10 p-4 border border-error/30">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* OAuth Sign-in Buttons */}
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Sign in with
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <GoogleSignInButton
              onSuccess={handleOAuthSuccess}
              onError={handleOAuthError}
              className="w-full"
            />
            
            <DiscordSignInButton
              onSuccess={handleOAuthSuccess}
              onError={handleOAuthError}
              className="w-full"
            />
          </div>
        </div>

        {/* Email Sign-in Link */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/auth/login-email"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-border bg-background text-foreground font-semibold shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Sign in with Email
            </Link>
          </div>
        </div>

        {/* Help Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Forgot your password?
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
