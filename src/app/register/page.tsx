import { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account | ReadTrace',
  description: 'Create your ReadTrace account to start tracking your reading progress',
};

export default function RegisterPage() {
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

        <RegisterForm />

        <div className="text-center text-sm">
          <span className="text-muted">Already have an account? </span>
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
