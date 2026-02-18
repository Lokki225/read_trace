import { Metadata } from 'next';
import { createClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Email Confirmation | ReadTrace',
  description: 'Confirm your email address to activate your account',
};

interface SearchParams {
  code?: string;
  error?: string;
  error_description?: string;
}

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { code, error, error_description } = searchParams;

  // Handle errors from Supabase
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="rounded-full bg-error/10 p-6 border border-error/30">
            <div className="text-error text-4xl">✕</div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Email Confirmation Failed
            </h1>
            <p className="mt-4 text-base text-foreground">
              {error_description || 'An error occurred while confirming your email.'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-md bg-accent p-4 border border-border">
              <p className="text-sm text-foreground">
                <span className="font-medium">Error:</span> {error}
              </p>
            </div>

            <div className="space-y-2">
              <a
                href="/register"
                className="block w-full rounded-md bg-primary text-background px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              >
                Try Again
              </a>
              <a
                href="/login"
                className="block w-full rounded-md border border-border bg-background text-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle successful confirmation
  if (code) {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw error;
      }

      // Successfully confirmed email, redirect to onboarding
      redirect('/onboarding');
    } catch (error) {
      console.error('Email confirmation error:', error);
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="rounded-full bg-error/10 p-6 border border-error/30">
              <div className="text-error text-4xl">✕</div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Confirmation Failed
              </h1>
              <p className="mt-4 text-base text-foreground">
                We couldn't confirm your email. The confirmation link may have expired.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-md bg-accent p-4 border border-border">
                <p className="text-sm text-foreground">
                  Please try registering again or contact support if the problem persists.
                </p>
              </div>

              <div className="space-y-2">
                <a
                  href="/register"
                  className="block w-full rounded-md bg-primary text-background px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                  Register Again
                </a>
                <a
                  href="/login"
                  className="block w-full rounded-md border border-border bg-background text-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // No code or error parameter - invalid callback
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="rounded-full bg-warning/10 p-6 border border-warning/30">
          <div className="text-warning text-4xl">!</div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Invalid Confirmation Link
          </h1>
          <p className="mt-4 text-base text-foreground">
            This confirmation link is invalid or has expired.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-md bg-accent p-4 border border-border">
            <p className="text-sm text-foreground">
              Please check your email for a valid confirmation link or register again.
            </p>
          </div>

          <div className="space-y-2">
            <a
              href="/register"
              className="block w-full rounded-md bg-primary text-background px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            >
              Register Again
            </a>
            <a
              href="/login"
              className="block w-full rounded-md border border-border bg-background text-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
