import { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Confirm Your Email | ReadTrace',
  description: 'Check your email to confirm your account',
};

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-100 p-6">
            <Mail className="h-12 w-12 text-blue-600" aria-hidden="true" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Check your email
          </h1>
          <p className="mt-4 text-base text-gray-600">
            We've sent you a confirmation email with a link to verify your account.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please check your inbox and click the verification link to complete your registration.
          </p>
        </div>

        <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Didn't receive the email?</span>
            <br />
            Check your spam folder or{' '}
            <Link
              href="/register/resend"
              className="font-semibold text-blue-600 hover:text-blue-500 underline"
            >
              request a new confirmation email
            </Link>
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600">
            Already confirmed?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
