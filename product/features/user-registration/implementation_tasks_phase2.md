# Implementation Tasks - Phase 2: Data Layer

**Feature**: User Registration with Email & Password  
**Phase**: Data Layer (Database, Migrations, Supabase Integration)  
**Dependencies**: Phase 1 (Domain Layer)  
**Estimated Duration**: 1 day

## Phase Overview

Phase 2 establishes the data persistence layer, database schema, Supabase client configuration, and authentication service that interfaces with Supabase Auth.

## Phase Completion Criteria

- [ ] Database schema created and migrated
- [ ] Supabase client properly configured
- [ ] Auth service implements all registration operations
- [ ] Row Level Security policies enforced
- [ ] Integration tests passing
- [ ] Database triggers functional

---

## Task 2.1: Configure Supabase Client

**File**: `src/lib/supabase.ts`

**Description**: Initialize Supabase client for both client and server components.

**Acceptance Criteria**:
- Client-side client for Client Components
- Server-side client for Server Components
- Proper TypeScript types
- Environment variables configured

**Implementation Details**:
```typescript
// src/lib/supabase.ts
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// Client-side Supabase client (for Client Components)
export const createClient = () => {
  return createClientComponentClient<Database>();
};

// Server-side Supabase client (for Server Components and API routes)
export const createServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

// Type helpers
export type SupabaseClient = ReturnType<typeof createClient>;
```

**Environment Variables**:
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # NEVER expose to client
```

**Verification**:
```bash
# Verify Supabase connection
npm run dev
# Check browser console for Supabase connection
```

**Dependencies**: 
- Phase 1 complete
- Supabase project created

**Estimated Time**: 30 minutes

---

## Task 2.2: Create Database Migration for Users and Profiles

**File**: `database/migrations/001_create_user_profiles.sql`

**Description**: Create user_profiles table with proper schema, indexes, and constraints.

**Acceptance Criteria**:
- user_profiles table with all required columns
- Foreign key to auth.users with CASCADE DELETE
- Unique constraint on email (case-insensitive)
- Indexes on frequently queried columns
- Default values for preferences
- Timestamps with automatic updates

**Implementation Details**:
```sql
-- database/migrations/001_create_user_profiles.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'email' CHECK (auth_provider IN ('email', 'google', 'discord')),
  status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'active', 'suspended', 'deleted')),
  preferences JSONB NOT NULL DEFAULT '{"email_notifications": true, "theme": "system", "default_scan_site": null}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique index on lowercase email
CREATE UNIQUE INDEX user_profiles_email_unique ON user_profiles (LOWER(email));

-- Create index on status for filtering
CREATE INDEX user_profiles_status_idx ON user_profiles (status);

-- Create index on created_at for sorting
CREATE INDEX user_profiles_created_at_idx ON user_profiles (created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user profile on auth.users insert
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, auth_provider, status, preferences)
  VALUES (
    NEW.id,
    NEW.email,
    'email', -- Default to email, can be updated later
    'pending_verification',
    '{"email_notifications": true, "theme": "system", "default_scan_site": null}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();

-- Comment on table and columns
COMMENT ON TABLE user_profiles IS 'Extended user profile information beyond Supabase Auth';
COMMENT ON COLUMN user_profiles.id IS 'UUID matching auth.users.id';
COMMENT ON COLUMN user_profiles.email IS 'User email address (denormalized from auth.users)';
COMMENT ON COLUMN user_profiles.display_name IS 'User display name for UI';
COMMENT ON COLUMN user_profiles.preferences IS 'User preferences as JSONB';
```

**Verification**:
```bash
# Apply migration via Supabase CLI
supabase db push

# Or via SQL Editor in Supabase Dashboard
# Copy and paste the migration SQL
```

**Dependencies**: 
- Task 2.1 (Supabase client)

**Estimated Time**: 1.5 hours

---

## Task 2.3: Create Row Level Security Policies

**File**: `database/migrations/002_create_rls_policies.sql`

**Description**: Implement Row Level Security to ensure users can only access their own data.

**Acceptance Criteria**:
- RLS enabled on user_profiles table
- Users can SELECT their own profile
- Users can UPDATE their own profile
- Users cannot INSERT or DELETE profiles (handled by trigger)
- No policy allows access to other users' profiles
- Service role can bypass RLS

**Implementation Details**:
```sql
-- database/migrations/002_create_rls_policies.sql

-- Enable Row Level Security on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: No direct INSERT (handled by trigger)
-- Profiles are created automatically via trigger when auth.users record is inserted

-- Policy: No direct DELETE (cascade delete via foreign key)
-- When auth.users record is deleted, profile is automatically deleted

-- Grant necessary permissions
GRANT SELECT, UPDATE ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- Comment on policies
COMMENT ON POLICY "Users can view own profile" ON user_profiles IS 'Allows users to read their own profile data';
COMMENT ON POLICY "Users can update own profile" ON user_profiles IS 'Allows users to update their own profile data';
```

**Verification**:
```bash
# Test RLS policies
# 1. Create test user via Supabase Auth
# 2. Attempt to query user_profiles as that user
# 3. Verify can only see own profile

# Test query (should return only current user's profile)
SELECT * FROM user_profiles WHERE id = auth.uid();

# Test query (should return empty - cannot see other profiles)
SELECT * FROM user_profiles WHERE id != auth.uid();
```

**Dependencies**: 
- Task 2.2 (Database schema)

**Estimated Time**: 1 hour

---

## Task 2.4: Implement Authentication Service

**File**: `backend/services/auth/authService.ts`

**Description**: Create service layer for authentication operations using Supabase Auth.

**Acceptance Criteria**:
- signUp function with email/password
- Validation before Supabase call
- Error handling for common scenarios
- Proper TypeScript types
- Async email confirmation

**Implementation Details**:
```typescript
// backend/services/auth/authService.ts
import { createClient } from '@/lib/supabase';
import { registrationSchema, type RegistrationFormData } from '@/model/validation/authValidation';
import type { RegistrationResult } from '@/model/schemas/user';

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

export class AuthService {
  /**
   * Register a new user with email and password
   * 
   * @param email - User email address
   * @param password - User password
   * @returns Registration result with user data
   * @throws AuthServiceError for validation or registration failures
   */
  async signUp(email: string, password: string): Promise<RegistrationResult> {
    try {
      // Validate input using Zod schema
      const validationResult = registrationSchema.safeParse({ email, password });
      
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        throw new AuthServiceError(
          firstError.message,
          'VALIDATION_ERROR',
          400
        );
      }

      const { email: normalizedEmail, password: validatedPassword } = validationResult.data;

      // Create Supabase client
      const supabase = createClient();

      // Attempt to sign up via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: validatedPassword,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          data: {
            email: normalizedEmail // Store in user metadata
          }
        }
      });

      // Handle Supabase errors
      if (error) {
        // Map Supabase error codes to user-friendly messages
        if (error.message.includes('already registered')) {
          throw new AuthServiceError(
            'An account with this email already exists. Please log in instead.',
            'USER_ALREADY_EXISTS',
            409
          );
        }

        if (error.message.includes('Email rate limit')) {
          throw new AuthServiceError(
            'Too many registration attempts. Please try again later.',
            'RATE_LIMIT_EXCEEDED',
            429
          );
        }

        // Generic error
        throw new AuthServiceError(
          'Registration failed. Please try again.',
          'REGISTRATION_FAILED',
          500
        );
      }

      if (!data.user) {
        throw new AuthServiceError(
          'Registration failed. Please try again.',
          'NO_USER_DATA',
          500
        );
      }

      // Return success result
      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          email_confirmed_at: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
          created_at: new Date(data.user.created_at!),
          updated_at: new Date(data.user.updated_at!)
        },
        requiresEmailConfirmation: !data.user.email_confirmed_at
      };

    } catch (error) {
      // Re-throw AuthServiceError as-is
      if (error instanceof AuthServiceError) {
        throw error;
      }

      // Wrap unexpected errors
      console.error('Unexpected error during registration:', error);
      throw new AuthServiceError(
        'An unexpected error occurred. Please try again.',
        'UNEXPECTED_ERROR',
        500
      );
    }
  }

  /**
   * Resend confirmation email
   * 
   * @param email - User email address
   */
  async resendConfirmationEmail(email: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });

    if (error) {
      throw new AuthServiceError(
        'Failed to resend confirmation email. Please try again.',
        'RESEND_FAILED',
        500
      );
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
```

**Verification**:
```bash
npm run test tests/unit/authService.test.ts
```

**Dependencies**: 
- Task 2.1 (Supabase client)
- Task 2.2 (Database schema)
- Phase 1 (Validation schemas)

**Estimated Time**: 2.5 hours

---

## Task 2.5: Create Integration Tests for Registration Flow

**File**: `tests/integration/registration.integration.test.ts`

**Description**: End-to-end tests for complete registration flow with real Supabase calls (mocked).

**Acceptance Criteria**:
- Test successful registration
- Test duplicate email handling
- Test validation errors
- Test Supabase error handling
- Mock Supabase client properly

**Implementation Details**: See test-scenarios.md TS-008 through TS-015

**Sample Test**:
```typescript
// tests/integration/registration.integration.test.ts
import { authService } from '@/backend/services/auth/authService';
import { createClient } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase');

describe('Registration Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully register a new user', async () => {
    // Mock successful Supabase response
    const mockSignUp = jest.fn().mockResolvedValue({
      data: {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          email_confirmed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        session: null
      },
      error: null
    });

    (createClient as jest.Mock).mockReturnValue({
      auth: { signUp: mockSignUp }
    });

    // Execute registration
    const result = await authService.signUp('test@example.com', 'SecurePass123!');

    // Assertions
    expect(result.user.email).toBe('test@example.com');
    expect(result.requiresEmailConfirmation).toBe(true);
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'SecurePass123!',
      options: expect.objectContaining({
        emailRedirectTo: expect.stringContaining('/auth/callback')
      })
    });
  });

  it('should handle duplicate email error', async () => {
    // Mock duplicate email error
    const mockSignUp = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' }
    });

    (createClient as jest.Mock).mockReturnValue({
      auth: { signUp: mockSignUp }
    });

    // Execute and expect error
    await expect(
      authService.signUp('existing@example.com', 'SecurePass123!')
    ).rejects.toThrow('An account with this email already exists');
  });
});
```

**Verification**:
```bash
npm run test:integration
```

**Dependencies**: 
- Task 2.4 (Auth service)

**Estimated Time**: 2 hours

---

## Phase 2 Verification Checklist

Before proceeding to Phase 3, verify:

- [ ] Supabase client configured and connecting
- [ ] Database migrations applied successfully
- [ ] user_profiles table exists with correct schema
- [ ] Database trigger creates profile on user signup
- [ ] Row Level Security policies enforced
- [ ] Auth service registration flow works
- [ ] Integration tests passing
- [ ] Can create test user via auth service
- [ ] Profile automatically created for new user
- [ ] Cannot query other users' profiles

## Phase 2 Deliverables

1. ✅ Supabase client configuration (`src/lib/supabase.ts`)
2. ✅ Database schema migration (`database/migrations/001_create_user_profiles.sql`)
3. ✅ RLS policies (`database/migrations/002_create_rls_policies.sql`)
4. ✅ Auth service (`backend/services/auth/authService.ts`)
5. ✅ Integration tests (90%+ coverage)

## Dependencies for Next Phase

Phase 3 (Presentation Layer) depends on:
- Supabase client from Task 2.1
- Auth service from Task 2.4
- Validation schemas from Phase 1

---

**Phase 2 Status**: Ready for implementation  
**Estimated Total Time**: 7.5 hours  
**Priority**: CRITICAL (blocks Phase 3)
