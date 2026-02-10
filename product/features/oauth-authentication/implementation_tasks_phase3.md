# Implementation Tasks - Phase 3: Frontend Components

**Feature**: OAuth Authentication (Google & Discord)  
**Phase**: Frontend Components (UI & User Flows)  
**Dependencies**: Phase 1 & 2 complete  
**Estimated Duration**: 2 days

## Phase Overview

Phase 3 implements the frontend components and user flows for OAuth authentication. This phase includes OAuth buttons, login/signup pages, and account linking UI.

## Phase Completion Criteria

- [ ] OAuth button components created
- [ ] Login page with OAuth integration
- [ ] Signup page with OAuth integration
- [ ] Account linking UI implemented
- [ ] Error handling and loading states
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Responsive design on all devices

---

## Task 3.1: Create OAuth Button Components

**File**: `src/features/oauth/components/OAuthButton.tsx`

**Description**: Create reusable OAuth button components for Google and Discord.

**Acceptance Criteria**:
- Google OAuth button component
- Discord OAuth button component
- Loading and error states
- Accessibility attributes
- Consistent styling with design system

**Implementation Details**:
```typescript
// src/features/oauth/components/OAuthButton.tsx

import { useState } from 'react';
import { OAuthProvider } from '@/features/oauth/types';

interface OAuthButtonProps {
  provider: OAuthProvider;
  onSuccess?: (user: any) => void;
  onError?: (error: Error) => void;
}

export function OAuthButton({ provider, onSuccess, onError }: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/auth/oauth/${provider}`);
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('OAuth failed');
      setError(error.message);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const providerLabel = provider === OAuthProvider.GOOGLE ? 'Google' : 'Discord';
  const providerIcon = provider === OAuthProvider.GOOGLE ? '🔵' : '🟣';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      aria-label={`Sign in with ${providerLabel}`}
      className="oauth-button"
    >
      {providerIcon} {isLoading ? 'Signing in...' : `Sign in with ${providerLabel}`}
      {error && <span className="error-message">{error}</span>}
    </button>
  );
}
```

**Verification**:
```bash
npm run test -- OAuthButton.test.tsx
```

**Dependencies**: Phase 2 complete

**Estimated Time**: 2 hours

---

## Task 3.2: Update Login Page with OAuth

**File**: `src/app/auth/login/page.tsx`

**Description**: Add OAuth buttons to login page.

**Acceptance Criteria**:
- Email/password form
- OAuth buttons (Google, Discord)
- Error message display
- Loading states
- Responsive design

**Implementation Details**:
```typescript
// src/app/auth/login/page.tsx

import { OAuthButton } from '@/features/oauth/components/OAuthButton';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="login-container">
      <h1>Sign In</h1>
      
      <LoginForm />
      
      <div className="divider">OR</div>
      
      <div className="oauth-buttons">
        <OAuthButton provider="google" />
        <OAuthButton provider="discord" />
      </div>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- login.e2e.test.ts
```

**Dependencies**: Phase 2 complete, OAuthButton component

**Estimated Time**: 1 hour

---

## Task 3.3: Update Signup Page with OAuth

**File**: `src/app/auth/register/page.tsx`

**Description**: Add OAuth buttons to signup page.

**Acceptance Criteria**:
- Email/password form
- OAuth buttons (Google, Discord)
- Terms acceptance
- Error message display
- Responsive design

**Implementation Details**:
```typescript
// src/app/auth/register/page.tsx

import { OAuthButton } from '@/features/oauth/components/OAuthButton';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="register-container">
      <h1>Create Account</h1>
      
      <RegisterForm />
      
      <div className="divider">OR</div>
      
      <div className="oauth-buttons">
        <OAuthButton provider="google" />
        <OAuthButton provider="discord" />
      </div>
      
      <p className="terms">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- register.e2e.test.ts
```

**Dependencies**: Phase 2 complete, OAuthButton component

**Estimated Time**: 1 hour

---

## Task 3.4: Create OAuth Provider Manager Component

**File**: `src/features/oauth/components/OAuthProviderManager.tsx`

**Description**: Create UI for managing connected OAuth providers.

**Acceptance Criteria**:
- List connected providers
- Link/unlink buttons
- Confirmation dialogs
- Error handling
- Loading states

**Implementation Details**:
```typescript
// src/features/oauth/components/OAuthProviderManager.tsx

import { useState, useEffect } from 'react';
import { OAuthProvider } from '@/features/oauth/types';

export function OAuthProviderManager() {
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const response = await fetch('/api/profile/oauth');
      const data = await response.json();
      setProviders(data.providers);
    } catch (err) {
      setError('Failed to load providers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlink = async (provider: OAuthProvider) => {
    if (!confirm(`Unlink ${provider}?`)) return;

    try {
      await fetch(`/api/profile/oauth/${provider}`, { method: 'DELETE' });
      setProviders(providers.filter(p => p !== provider));
    } catch (err) {
      setError('Failed to unlink provider');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="oauth-manager">
      <h3>Connected Accounts</h3>
      {error && <div className="error">{error}</div>}
      
      <div className="provider-list">
        {providers.map(provider => (
          <div key={provider} className="provider-item">
            <span>{provider}</span>
            <button onClick={() => handleUnlink(provider)}>Unlink</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- OAuthProviderManager.test.tsx
```

**Dependencies**: Phase 2 complete

**Estimated Time**: 2 hours

---

## Phase 3 Completion Checklist

- [ ] OAuth button components created
- [ ] Login page updated with OAuth
- [ ] Signup page updated with OAuth
- [ ] OAuth provider manager component created
- [ ] All components have loading states
- [ ] All components have error handling
- [ ] Accessibility testing passed (WCAG 2.1 AA)
- [ ] Responsive design verified on all devices
- [ ] All E2E tests passing
- [ ] Code review approved
- [ ] Ready for Phase 4

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]
