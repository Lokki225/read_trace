'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, AlertCircle, Sparkles, Shield, Zap } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { DiscordSignInButton } from '@/components/auth/DiscordSignInButton';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleOAuthSuccess = () => {
    router.push('/onboarding');
  };

  const handleOAuthError = (err: Error) => {
    setError(err.message);
  };

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

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Start tracking.<br />Never forget a chapter.
            </h1>
            <p className="text-white/70 text-lg">
              Join thousands of readers who never lose their place again.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Instant sync</p>
                <p className="text-white/60 text-sm">Browser extension tracks your progress automatically</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Smart library</p>
                <p className="text-white/60 text-sm">Organize manga, manhwa, and webtoons in one place</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Free forever</p>
                <p className="text-white/60 text-sm">Core features are always free, no credit card needed</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-white/40 text-sm">© {new Date().getFullYear()} ReadTrace</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md space-y-7">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">ReadTrace</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Create your account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* OAuth Sign-up */}
          <div className="space-y-3">
            <GoogleSignInButton onSuccess={handleOAuthSuccess} onError={handleOAuthError} className="w-full" mode="signup" />
            <DiscordSignInButton onSuccess={handleOAuthSuccess} onError={handleOAuthError} className="w-full" mode="signup" />
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3 bg-background text-muted-foreground tracking-wider">Or register with email</span>
            </div>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
