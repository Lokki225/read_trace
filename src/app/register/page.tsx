'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { DiscordSignInButton } from '@/components/auth/DiscordSignInButton';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleOAuthSuccess = (user: any) => {
    router.push('/onboarding');
  };

  const handleOAuthError = (error: Error) => {
    setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            ReadTrace
          </h1>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-muted">
            Start tracking your reading progress today
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-error/10 p-4 border border-error/30">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* OAuth Sign-up Options */}
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Sign up with
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <GoogleSignInButton
              onSuccess={handleOAuthSuccess}
              onError={handleOAuthError}
              className="w-full"
              mode="signup"
            />
            
            <DiscordSignInButton
              onSuccess={handleOAuthSuccess}
              onError={handleOAuthError}
              className="w-full"
              mode="signup"
            />
          </div>
        </div>

        {/* Email Registration */}
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

        <RegisterForm />

        <div className="text-center text-sm">
          <span className="text-muted">Already have an account? </span>
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
