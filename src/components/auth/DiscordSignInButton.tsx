'use client';

import { OAuthButton } from './OAuthButton';
import { OAuthProvider } from '@/model/schemas/oauth';

interface DiscordSignInButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: Error) => void;
  className?: string;
  mode?: 'signin' | 'signup';
}

export function DiscordSignInButton({
  onSuccess,
  onError,
  className = '',
  mode = 'signin'
}: DiscordSignInButtonProps) {
  return (
    <OAuthButton
      provider={OAuthProvider.DISCORD}
      onSuccess={onSuccess}
      onError={onError}
      className={className}
      mode={mode}
    />
  );
}
