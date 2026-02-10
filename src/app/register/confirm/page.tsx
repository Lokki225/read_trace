import { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { ResendConfirmationForm } from '@/components/auth/ResendConfirmationForm';

export const metadata: Metadata = {
  title: 'Confirm Your Email | ReadTrace',
  description: 'Check your email to confirm your account',
};

interface SearchParams {
  email?: string;
}

export default function ConfirmEmailPage({ searchParams }: { searchParams: SearchParams }) {
  const { email } = searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-accent p-6">
            <Mail className="h-12 w-12 text-primary" aria-hidden="true" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="mt-4 text-base text-foreground">
            We've sent you a confirmation email with a link to verify your account.
          </p>
          <p className="mt-2 text-sm text-muted">
            Please check your inbox and click the verification link to complete your registration.
          </p>
          {email && (
            <p className="mt-2 text-sm text-muted">
              Sent to: <span className="font-medium">{email}</span>
            </p>
          )}
        </div>

        <div className="rounded-md bg-accent p-4 border border-border">
          <p className="text-sm text-foreground">
            <span className="font-medium">Didn't receive the email?</span>
            <br />
            Check your spam folder or use the form below to request a new confirmation email.
          </p>
        </div>

        <ResendConfirmationForm initialEmail={email} />

        <div className="border-t border-border pt-6">
          <p className="text-sm text-muted">
            Already confirmed?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
