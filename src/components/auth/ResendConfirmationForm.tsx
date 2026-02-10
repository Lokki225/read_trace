'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const resendSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ResendFormData = z.infer<typeof resendSchema>;

interface ResendConfirmationFormProps {
  initialEmail?: string | null;
}

export function ResendConfirmationForm({ initialEmail }: ResendConfirmationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [lastSentTime, setLastSentTime] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResendFormData>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: initialEmail || ''
    }
  });

  const onSubmit = async (data: ResendFormData) => {
    // Rate limiting: prevent sending more than one request per minute
    if (lastSentTime && Date.now() - lastSentTime < 60000) {
      const remainingTime = Math.ceil((60000 - (Date.now() - lastSentTime)) / 1000);
      setServerError(`Please wait ${remainingTime} seconds before requesting another email.`);
      return;
    }

    setIsLoading(true);
    setServerError(null);
    setIsSuccess(false);

    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.error || 'Failed to resend confirmation email. Please try again.');
        return;
      }

      setIsSuccess(true);
      setLastSentTime(Date.now());
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.');
      console.error('Resend confirmation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-md bg-success/10 p-4 border border-success/30">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-success" aria-hidden="true" />
          <p className="text-sm text-success font-medium">
            Confirmation email sent successfully!
          </p>
        </div>
        <p className="mt-1 text-xs text-success">
          Please check your inbox (including spam folder).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-md bg-error/10 p-3 border border-error/30">
          <p className="text-sm text-error">{serverError}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
          Email address
        </label>
        <div className="flex gap-2">
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            disabled={isLoading}
            placeholder="you@example.com"
            className={cn(
              'flex-1 rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background text-foreground placeholder-muted',
              errors.email
                ? 'border-error/50 focus:ring-error'
                : 'border-border',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'rounded-md bg-primary text-background px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Sending...
              </>
            ) : (
              'Resend'
            )}
          </button>
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-error" id="email-error">
            {errors.email.message}
          </p>
        )}
      </div>

      <p className="text-xs text-muted">
        Note: You can only request a confirmation email once per minute.
      </p>
    </form>
  );
}
