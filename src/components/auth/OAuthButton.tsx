'use client';

import { useState } from 'react';
import { OAuthProvider } from '@/model/schemas/oauth';
import { Loader2 } from 'lucide-react';

interface OAuthButtonProps {
  provider: OAuthProvider;
  onSuccess?: (user: any) => void;
  onError?: (error: Error) => void;
  className?: string;
  mode?: 'signin' | 'signup';
}

export function OAuthButton({
  provider,
  onSuccess,
  onError,
  className = '',
  mode = 'signin'
}: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call our OAuth API endpoint
      const response = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) {
        throw new Error('OAuth initiation failed');
      }

      const data = await response.json();

      // Redirect to OAuth provider
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('No OAuth URL received');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('OAuth failed');
      setError(error.message);
      onError?.(error);
      setIsLoading(false);
    }
  };

  const providerLabel = provider === OAuthProvider.GOOGLE ? 'Google' : 'Discord';
  const providerIcon = provider === OAuthProvider.GOOGLE ? '🔵' : '🟣';
  const actionText = mode === 'signup' ? 'Sign up' : 'Sign in';
  const loadingText = mode === 'signup' ? 'Signing up...' : 'Signing in...';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      aria-label={`${actionText} with ${providerLabel}`}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-border bg-background text-foreground font-semibold shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          <span>{providerIcon}</span>
          <span>{actionText} with {providerLabel}</span>
        </>
      )}
      {error && (
        <div className="absolute top-full mt-2 text-sm text-error bg-error/10 px-3 py-2 rounded border border-error/30">
          {error}
        </div>
      )}
    </button>
  );
}
