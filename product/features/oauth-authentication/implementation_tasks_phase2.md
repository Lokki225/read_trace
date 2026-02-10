# Implementation Tasks - Phase 2: Backend API Layer

**Feature**: OAuth Authentication (Google & Discord)  
**Phase**: Backend API Layer (API Routes & Database Integration)  
**Dependencies**: Phase 1 complete  
**Estimated Duration**: 2 days

## Phase Overview

Phase 2 implements the backend API routes and database integration for OAuth authentication. This phase includes OAuth provider configuration, callback handling, and token management.

## Phase Completion Criteria

- [ ] OAuth provider configuration complete
- [ ] OAuth callback endpoint implemented
- [ ] Token storage and retrieval working
- [ ] Account linking logic implemented
- [ ] Database migrations applied
- [ ] Integration tests passing (>80% coverage)
- [ ] Error handling comprehensive

---

## Task 2.1: Configure OAuth Providers in Supabase

**File**: Supabase project settings

**Description**: Configure Google and Discord OAuth providers in Supabase Auth.

**Acceptance Criteria**:
- Google OAuth configured with client ID and secret
- Discord OAuth configured with client ID and secret
- Redirect URIs configured for all environments
- Credentials stored in environment variables

**Implementation Details**:
```bash
# Environment variables needed
GOOGLE_OAUTH_CLIENT_ID=xxx
GOOGLE_OAUTH_CLIENT_SECRET=xxx
DISCORD_OAUTH_CLIENT_ID=xxx
DISCORD_OAUTH_CLIENT_SECRET=xxx
OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

**Verification**:
```bash
# Test OAuth provider configuration
curl -X GET https://your-project.supabase.co/auth/v1/providers
```

**Dependencies**: Supabase account

**Estimated Time**: 1 hour

---

## Task 2.2: Create OAuth Provider Linking Table

**File**: `supabase/migrations/xxx_create_oauth_providers.sql`

**Description**: Create database table for storing OAuth provider links.

**Acceptance Criteria**:
- oauth_providers table created
- Proper indexes on user_id and provider_name
- RLS policies for user isolation
- Timestamps for audit trail

**Implementation Details**:
```sql
-- supabase/migrations/xxx_create_oauth_providers.sql

CREATE TABLE oauth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, provider_name),
  UNIQUE(provider_name, provider_id)
);

CREATE INDEX idx_oauth_providers_user_id ON oauth_providers(user_id);
CREATE INDEX idx_oauth_providers_provider ON oauth_providers(provider_name, provider_id);

-- Enable RLS
ALTER TABLE oauth_providers ENABLE ROW LEVEL SECURITY;

-- Users can only see their own providers
CREATE POLICY "Users can view their own OAuth providers"
  ON oauth_providers FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own providers
CREATE POLICY "Users can link OAuth providers"
  ON oauth_providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own providers
CREATE POLICY "Users can unlink OAuth providers"
  ON oauth_providers FOR DELETE
  USING (auth.uid() = user_id);
```

**Verification**:
```bash
# Apply migration
supabase db push

# Verify table created
supabase db query "SELECT * FROM oauth_providers LIMIT 1;"
```

**Dependencies**: Supabase CLI

**Estimated Time**: 1 hour

---

## Task 2.3: Create OAuth Callback API Route

**File**: `src/app/api/auth/callback/route.ts`

**Description**: Implement OAuth callback handler for processing authorization codes.

**Acceptance Criteria**:
- Validate state token (CSRF protection)
- Exchange authorization code for tokens
- Create or update user profile
- Store encrypted tokens
- Establish user session
- Comprehensive error handling

**Implementation Details**:
```typescript
// src/app/api/auth/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const provider = searchParams.get('provider') as OAuthProvider;

  try {
    // Validate inputs
    if (!code || !state || !provider) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate state token
    const storedState = await getStoredState(state);
    if (!storedState) {
      return NextResponse.json(
        { error: 'Invalid or expired state token' },
        { status: 401 }
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, provider);
    
    // Get user profile from provider
    const profile = await getProviderProfile(provider, tokens.access_token);
    
    // Validate profile
    const validation = validateOAuthProfile(profile, provider);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Create or link account
    const user = await createOrLinkOAuthAccount(
      validation.sanitizedProfile!,
      tokens
    );

    // Establish session
    const session = await createSession(user);

    return NextResponse.redirect(
      new URL('/dashboard', request.url),
      { headers: { 'Set-Cookie': session.cookie } }
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
```

**Verification**:
```bash
npm run test -- callback.integration.test.ts
```

**Dependencies**: Phase 1, Supabase client

**Estimated Time**: 4 hours

---

## Task 2.4: Create OAuth Linking Endpoint

**File**: `src/app/api/auth/oauth/link/route.ts`

**Description**: Implement endpoint for linking OAuth providers to existing accounts.

**Acceptance Criteria**:
- Authenticate user first
- Prevent duplicate provider linking
- Store provider link in database
- Return success/error response

**Implementation Details**:
```typescript
// src/app/api/auth/oauth/link/route.ts

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { provider, profile, token } = await request.json();

  try {
    // Check if provider already linked
    const existing = await checkProviderLink(user.id, provider);
    if (existing) {
      return NextResponse.json(
        { error: 'Provider already linked' },
        { status: 400 }
      );
    }

    // Store provider link
    const link = await storeProviderLink(user.id, provider, profile, token);

    return NextResponse.json({ success: true, link });
  } catch (error) {
    console.error('OAuth linking error:', error);
    return NextResponse.json(
      { error: 'Failed to link provider' },
      { status: 500 }
    );
  }
}
```

**Verification**:
```bash
npm run test -- oauth-linking.integration.test.ts
```

**Dependencies**: Phase 1, Supabase client

**Estimated Time**: 2 hours

---

## Phase 2 Completion Checklist

- [ ] OAuth providers configured in Supabase
- [ ] oauth_providers table created with RLS
- [ ] OAuth callback endpoint implemented
- [ ] OAuth linking endpoint implemented
- [ ] Token storage encrypted
- [ ] All integration tests passing (>80% coverage)
- [ ] Error handling comprehensive
- [ ] Code review approved
- [ ] Ready for Phase 3

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]
