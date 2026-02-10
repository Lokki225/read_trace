# Implementation Tasks - Phase 1: Domain Layer

**Feature**: OAuth Authentication (Google & Discord)  
**Phase**: Domain Layer (Business Logic & Validation)  
**Dependencies**: None  
**Estimated Duration**: 1 day

## Phase Overview

Phase 1 establishes the foundational business logic, validation rules, and domain models for OAuth authentication. This phase focuses on pure business logic with no UI or database dependencies.

## Phase Completion Criteria

- [ ] All OAuth domain models and interfaces defined
- [ ] All OAuth validation logic implemented and tested
- [ ] All OAuth business rules documented
- [ ] Unit tests passing (>85% coverage)
- [ ] No dependencies on UI or database

---

## Task 1.1: Define OAuth Domain Models and TypeScript Interfaces

**File**: `model/schemas/oauth.ts`

**Description**: Create TypeScript interfaces for OAuth providers, tokens, and profiles.

**Acceptance Criteria**:
- OAuthProvider enum with Google and Discord
- OAuthToken interface with access/refresh tokens
- OAuthProfile interface with provider data
- OAuthConfig interface for provider configuration

**Implementation Details**:
```typescript
// model/schemas/oauth.ts

export enum OAuthProvider {
  GOOGLE = 'google',
  DISCORD = 'discord'
}

export interface OAuthToken {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  token_type: string;
  scope: string;
}

export interface OAuthProfile {
  provider_id: string;
  provider_name: OAuthProvider;
  email: string;
  display_name?: string;
  avatar_url?: string;
  raw_data: Record<string, any>;
}

export interface OAuthConfig {
  provider: OAuthProvider;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthCallbackData {
  code: string;
  state: string;
  provider: OAuthProvider;
}

export interface OAuthLinkRequest {
  provider: OAuthProvider;
  profile: OAuthProfile;
  token: OAuthToken;
}
```

**Verification**:
```bash
npm run type-check
tsc --noEmit
```

**Dependencies**: None

**Estimated Time**: 1 hour

---

## Task 1.2: Implement OAuth State Token Generation

**File**: `backend/services/oauth/stateTokenGenerator.ts`

**Description**: Create functions for generating and validating CSRF protection state tokens.

**Acceptance Criteria**:
- Generate cryptographically secure random state tokens
- State token expiration (5 minutes)
- Validate state tokens against stored values
- Clear error messages for invalid states

**Implementation Details**:
```typescript
// backend/services/oauth/stateTokenGenerator.ts

import crypto from 'crypto';

export interface StateTokenData {
  token: string;
  createdAt: number;
  expiresAt: number;
}

const STATE_TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function generateStateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function createStateTokenData(token: string): StateTokenData {
  const now = Date.now();
  return {
    token,
    createdAt: now,
    expiresAt: now + STATE_TOKEN_EXPIRY_MS
  };
}

export function validateStateToken(
  storedToken: StateTokenData,
  providedToken: string
): { isValid: boolean; error?: string } {
  if (storedToken.token !== providedToken) {
    return { isValid: false, error: 'Invalid state token' };
  }
  
  if (Date.now() > storedToken.expiresAt) {
    return { isValid: false, error: 'State token expired' };
  }
  
  return { isValid: true };
}
```

**Verification**:
```bash
npm run test -- stateTokenGenerator.test.ts
```

**Dependencies**: Node.js crypto module

**Estimated Time**: 1 hour

---

## Task 1.3: Implement OAuth Token Encryption/Decryption

**File**: `backend/services/oauth/tokenEncryption.ts`

**Description**: Create functions for encrypting and decrypting OAuth tokens.

**Acceptance Criteria**:
- Encrypt tokens using AES-256-GCM
- Decrypt tokens securely
- Handle encryption errors gracefully
- No tokens logged or exposed

**Implementation Details**:
```typescript
// backend/services/oauth/tokenEncryption.ts

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCODING = 'hex';

export interface EncryptedToken {
  iv: string;
  encryptedData: string;
  authTag: string;
}

export function encryptToken(
  token: string,
  encryptionKey: Buffer
): EncryptedToken {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
  
  let encryptedData = cipher.update(token, 'utf8', ENCODING);
  encryptedData += cipher.final(ENCODING);
  
  const authTag = cipher.getAuthTag();
  
  return {
    iv: iv.toString(ENCODING),
    encryptedData,
    authTag: authTag.toString(ENCODING)
  };
}

export function decryptToken(
  encrypted: EncryptedToken,
  encryptionKey: Buffer
): string {
  const iv = Buffer.from(encrypted.iv, ENCODING);
  const authTag = Buffer.from(encrypted.authTag, ENCODING);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted.encryptedData, ENCODING, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

**Verification**:
```bash
npm run test -- tokenEncryption.test.ts
```

**Dependencies**: Node.js crypto module

**Estimated Time**: 1 hour

---

## Task 1.4: Implement OAuth Profile Validation

**File**: `backend/services/oauth/profileValidator.ts`

**Description**: Create functions for validating OAuth provider profiles.

**Acceptance Criteria**:
- Validate required profile fields
- Sanitize profile data
- Handle missing optional fields
- Clear error messages

**Implementation Details**:
```typescript
// backend/services/oauth/profileValidator.ts

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedProfile?: OAuthProfile;
}

export function validateOAuthProfile(
  profile: any,
  provider: OAuthProvider
): ProfileValidationResult {
  const errors: string[] = [];
  
  // Validate required fields
  if (!profile.id) {
    errors.push('Provider ID is required');
  }
  
  if (!profile.email) {
    errors.push('Email is required');
  }
  
  // Provider-specific validation
  if (provider === OAuthProvider.GOOGLE) {
    if (!profile.email_verified) {
      errors.push('Email must be verified by Google');
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // Sanitize and return profile
  const sanitizedProfile: OAuthProfile = {
    provider_id: String(profile.id),
    provider_name: provider,
    email: String(profile.email).toLowerCase(),
    display_name: profile.name ? String(profile.name) : undefined,
    avatar_url: profile.picture ? String(profile.picture) : undefined,
    raw_data: profile
  };
  
  return { isValid: true, sanitizedProfile };
}
```

**Verification**:
```bash
npm run test -- profileValidator.test.ts
```

**Dependencies**: None

**Estimated Time**: 1 hour

---

## Phase 1 Completion Checklist

- [ ] All OAuth domain models defined
- [ ] State token generation implemented
- [ ] Token encryption/decryption implemented
- [ ] Profile validation implemented
- [ ] All unit tests passing (>85% coverage)
- [ ] No external dependencies in this phase
- [ ] Code review approved
- [ ] Ready for Phase 2

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]
