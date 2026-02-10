'use client';

import { OAuthButton } from './OAuthButton';
import { OAuthProvider } from '@/model/schemas/oauth';

interface GoogleSignInButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: Error) => void;
  className?: string;
  mode?: 'signin' | 'signup';
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  className = '',
  mode = 'signin'
}: GoogleSignInButtonProps) {
  return (
    <OAuthButton
      provider={OAuthProvider.GOOGLE}
      onSuccess={onSuccess}
      onError={onError}
      className={className}
      mode={mode}
    />
  );
}
