# Implementation Tasks - Phase 2: Backend API Layer

**Feature**: User Profile Management  
**Phase**: Backend API Layer (API Routes & Database Integration)  
**Dependencies**: Phase 1 complete  
**Estimated Duration**: 2 days

## Phase Overview

Phase 2 implements the backend API routes and database integration for profile management. This phase includes profile CRUD operations, password changes, and OAuth provider management.

## Phase Completion Criteria

- [ ] Profile retrieval endpoint implemented
- [ ] Profile update endpoint implemented
- [ ] Password change endpoint implemented
- [ ] OAuth provider management endpoints implemented
- [ ] RLS policies configured
- [ ] Integration tests passing (>80% coverage)
- [ ] Error handling comprehensive

---

## Task 2.1: Create Profile API Routes

**File**: `src/app/api/profile/route.ts`

**Description**: Implement GET and PUT endpoints for profile management.

**Acceptance Criteria**:
- GET /api/profile returns current user profile
- PUT /api/profile updates profile information
- Proper authentication and authorization
- Comprehensive error handling

**Implementation Details**:
```typescript
// src/app/api/profile/route.ts

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await getProfile(user.id);
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updates = await request.json();
  
  try {
    const updated = await updateProfile(user.id, updates);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
```

**Verification**:
```bash
npm run test -- profile-api.integration.test.ts
```

**Dependencies**: Phase 1 complete

**Estimated Time**: 2 hours

---

## Task 2.2: Create Password Change Endpoint

**File**: `src/app/api/profile/password/route.ts`

**Description**: Implement POST endpoint for password changes.

**Acceptance Criteria**:
- Validate current password
- Validate new password strength
- Update password in Supabase Auth
- Return success/error response

**Implementation Details**:
```typescript
// src/app/api/profile/password/route.ts

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { currentPassword, newPassword, confirmPassword } = await request.json();

  try {
    // Validate password change
    const validation = validatePasswordChange(
      currentPassword,
      newPassword,
      confirmPassword
    );
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Update password in Supabase Auth
    await updatePassword(user.id, currentPassword, newPassword);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
```

**Verification**:
```bash
npm run test -- password-change.integration.test.ts
```

**Dependencies**: Phase 1 complete

**Estimated Time**: 2 hours

---

## Task 2.3: Create OAuth Provider Management Endpoints

**File**: `src/app/api/profile/oauth/route.ts`

**Description**: Implement endpoints for managing connected OAuth providers.

**Acceptance Criteria**:
- GET /api/profile/oauth returns connected providers
- DELETE /api/profile/oauth/:provider unlinks provider
- Proper authentication and authorization
- Prevent unlinking all auth methods

**Implementation Details**:
```typescript
// src/app/api/profile/oauth/route.ts

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const providers = await getConnectedProviders(user.id);
    return NextResponse.json({ providers });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { provider } = await request.json();

  try {
    await unlinkProvider(user.id, provider);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to unlink provider' },
      { status: 500 }
    );
  }
}
```

**Verification**:
```bash
npm run test -- oauth-management.integration.test.ts
```

**Dependencies**: Phase 1 complete

**Estimated Time**: 2 hours

---

## Task 2.4: Configure RLS Policies for Profile Data

**File**: `supabase/migrations/xxx_profile_rls.sql`

**Description**: Create RLS policies for profile data protection.

**Acceptance Criteria**:
- Users can only view their own profile
- Users can only update their own profile
- Proper index configuration
- Audit logging in place

**Implementation Details**:
```sql
-- supabase/migrations/xxx_profile_rls.sql

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

**Verification**:
```bash
supabase db push
```

**Dependencies**: Phase 1 complete

**Estimated Time**: 1 hour

---

## Phase 2 Completion Checklist

- [ ] Profile GET/PUT endpoints implemented
- [ ] Password change endpoint implemented
- [ ] OAuth provider management endpoints implemented
- [ ] RLS policies configured
- [ ] All integration tests passing (>80% coverage)
- [ ] Error handling comprehensive
- [ ] Code review approved
- [ ] Ready for Phase 3

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]
