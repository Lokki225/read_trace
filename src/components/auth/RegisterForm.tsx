'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { registrationSchema, type RegistrationFormData } from '@/model/validation/authValidation';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { cn } from '@/lib/utils';

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur'
  });

  const password = watch('password');

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.error || 'Registration failed. Please try again.');
        return;
      }

      router.push(`/register/confirm?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      {serverError && (
        <div className="rounded-md bg-error/10 p-4 border border-error/30 dark:bg-error/20 dark:border-error/40">
          <p className="text-sm text-error dark:text-error">{serverError}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            disabled={isLoading}
            className={cn(
              'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background text-foreground placeholder-muted',
              errors.email
                ? 'border-error/50 focus:ring-error'
                : 'border-border',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
            placeholder="you@example.com"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error" id="email-error">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative mt-1">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={isLoading}
              className={cn(
                'block w-full rounded-md border px-3 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background text-foreground placeholder-muted',
                errors.password
                  ? 'border-error/50 focus:ring-error'
                  : 'border-border',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
              placeholder="••••••••"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-foreground transition-colors disabled:cursor-not-allowed"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-error" id="password-error">
              {errors.password.message}
            </p>
          )}
          {password && !errors.password && (
            <div className="mt-2">
              <PasswordStrengthIndicator password={password} />
            </div>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'w-full flex justify-center items-center gap-2 rounded-md bg-primary text-background px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background transition-colors',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </div>

      <div className="text-xs text-muted text-center">
        By creating an account, you agree to our{' '}
        <a href="/terms" className="text-primary hover:text-primary-dark underline transition-colors">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-primary hover:text-primary-dark underline transition-colors">
          Privacy Policy
        </a>
      </div>
    </form>
  );
}
