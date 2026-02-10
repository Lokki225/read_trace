# Story 2.3: User Profile Management

Status: ready-for-dev

## Story

As an authenticated user,
I want to view and edit my profile information,
So that I can manage my account settings and preferences.

## Acceptance Criteria

1. **Given** I am logged in
   **When** I navigate to my profile page
   **Then** I can view my email, username, and account creation date
   **And** I can update my profile information
   **And** I can change my password
   **And** changes are saved to Supabase and reflected immediately
   **And** profile data is protected by Row Level Security policies

## Tasks / Subtasks

- [ ] Create profile page UI (AC: 1)
  - [ ] Design profile page layout with sections
  - [ ] Display current user information (email, username, avatar)
  - [ ] Add edit mode toggle for profile fields
  - [ ] Show account creation date and last login
- [ ] Implement profile edit functionality (AC: 1)
  - [ ] Create editable form for profile fields
  - [ ] Add username validation (unique, alphanumeric)
  - [ ] Implement avatar upload (optional)
  - [ ] Add form submission with optimistic updates
- [ ] Add password change functionality (AC: 1)
  - [ ] Create password change form with current/new password fields
  - [ ] Implement password strength validation
  - [ ] Add confirmation field for new password
  - [ ] Send confirmation email after password change
- [ ] Implement profile data persistence (AC: 1)
  - [ ] Create updateProfile service in authService.ts
  - [ ] Implement optimistic UI updates
  - [ ] Handle validation errors from backend
  - [ ] Update Zustand auth store with new data
- [ ] Add Row Level Security policies (AC: 1)
  - [ ] Implement RLS policy: users can only view their own profile
  - [ ] Implement RLS policy: users can only update their own profile
  - [ ] Test RLS policies prevent unauthorized access
  - [ ] Document RLS policy structure

## Dev Notes

### Technical Requirements

**Database Schema:** Supabase user_profiles table
- Primary key: `id` (UUID, references auth.users)
- Fields: `username`, `avatar_url`, `bio`, `preferences`, `created_at`, `updated_at`
- RLS policies: SELECT, UPDATE own records only
- Unique constraint on `username`

**Frontend Framework:** Next.js 14+ App Router
- Profile page: `src/app/profile/page.tsx`
- Edit mode with client-side state management
- Server Actions for profile updates
- Optimistic UI updates for instant feedback

**UI Components:** shadcn/ui + Tailwind CSS
- Form components for profile editing
- Avatar upload component with preview
- Button, Input, Label, Textarea components
- Toast notifications for success/error feedback

**State Management:** Zustand
- Update `useAuthStore` with profile data
- Sync profile changes across components
- Persist profile data in local state
- Clear profile data on logout

### Architecture Compliance

**BMAD Layer Boundaries:**
- **Frontend**: `src/app/profile/page.tsx` + `src/components/profile/ProfileForm.tsx`
- **Backend**: `backend/services/auth/profileService.ts` (profile business logic)
- **API**: Supabase Client SDK for direct database access
- **Model**: `model/schemas/profile.ts` (profile TypeScript interfaces)
- **Database**: `database/migrations/002_create_profiles.sql` (user_profiles table + RLS)

**Communication Flow:**
```
Profile Form (src/app/)
  → profileService (backend/services/auth/)
  → Supabase Client SDK (lib/supabase.ts)
  → user_profiles table (with RLS)
  → Update authStore (src/store/)
```

**Forbidden Patterns:**
- Do NOT allow users to edit other users' profiles
- Do NOT bypass RLS policies
- Do NOT store sensitive data in profile table
- Do NOT skip validation on username changes

### Library/Framework Requirements

**Required Dependencies:**
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/auth-helpers-nextjs": "^0.8.0",
  "zod": "^3.22.0",
  "react-hook-form": "^7.49.0",
  "@hookform/resolvers": "^3.3.0"
}
```

**Avatar Upload (Optional Enhancement):**
```json
{
  "@supabase/storage-js": "^2.5.0"
}
```

**Profile Update Validation Schema (Zod):**
```typescript
const profileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notifications: z.boolean().optional()
  }).optional()
});
```

**Password Change Validation Schema (Zod):**
```typescript
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
```

### File Structure Requirements

**New Files to Create:**
```
src/
├── app/
│   └── profile/
│       ├── page.tsx                  # Profile page
│       └── edit/
│           └── page.tsx              # Edit profile page (optional)
├── components/
│   └── profile/
│       ├── ProfileHeader.tsx         # Profile header with avatar
│       ├── ProfileForm.tsx           # Editable profile form
│       ├── PasswordChangeForm.tsx    # Password change form
│       └── AvatarUpload.tsx          # Avatar upload component
backend/
├── services/
│   └── auth/
│       ├── profileService.ts         # Profile CRUD operations
│       └── avatarService.ts          # Avatar upload/delete logic
model/
├── schemas/
│   └── profile.ts                    # Profile TypeScript interfaces
└── validation/
    └── profileValidation.ts          # Zod validation schemas
database/
└── migrations/
    ├── 002_create_profiles.sql       # User profiles table (update)
    └── 003_profile_rls_policies.sql  # RLS policies for profiles
```

**File Naming Conventions:**
- Components: PascalCase (`ProfileForm.tsx`)
- Services: camelCase (`profileService.ts`)
- Database: snake_case (`002_create_profiles.sql`)
- Types: PascalCase (`ProfileData`, `ProfileUpdateRequest`)

### Testing Requirements

**Unit Tests Required:**
- Username validation logic
- Profile update service functions
- Password change validation
- RLS policy enforcement

**Integration Tests Required:**
- Complete profile update flow
- Password change flow
- Avatar upload flow (if implemented)
- Profile view with data fetching
- Unauthorized access prevention

**Test Files:**
```
tests/
├── unit/
│   ├── profileService.test.ts
│   ├── profileValidation.test.ts
│   └── rls-policies.test.ts
├── integration/
│   ├── profile-update.integration.test.ts
│   └── password-change.integration.test.ts
└── __mocks__/
    └── profileData.ts                # Mock profile objects
```

**Test Coverage Target:** 90% for profile services

**Critical Test Scenarios:**
- User can view their own profile
- User can update username (unique constraint)
- User can change password successfully
- User cannot access another user's profile (RLS)
- Invalid username is rejected (validation)
- Password strength requirements enforced
- Optimistic updates roll back on error
- Profile changes sync to authStore

### Previous Story Intelligence

**Story 2.1 & 2.2 Learnings:**
- Supabase Auth client configured and working
- `user_profiles` table created in database
- RLS policies pattern established
- Auth store (`useAuthStore`) managing user session
- Form validation with Zod + React Hook Form
- Toast notifications for user feedback
- Optimistic updates pattern implemented

**Key Patterns Established:**
- Server Actions for data mutations
- Zustand store updates after successful operations
- Form components with shadcn/ui
- Error handling with toast notifications
- TypeScript interfaces in model/schemas/

**Files to Reference:**
- `database/migrations/002_create_profiles.sql` - Extend with profile fields
- `backend/services/auth/authService.ts` - Add profile update methods
- `src/store/authStore.ts` - Update with profile data management
- `model/schemas/user.ts` - Add profile interfaces

**Reusable Components:**
- Form validation patterns from Story 2.1
- Toast notification system
- Loading states and error handling
- Supabase client usage patterns

### Latest Technical Information

**Supabase Row Level Security Best Practices (2026):**
- Always enable RLS on user-facing tables
- Use `auth.uid()` function to reference current user
- Test RLS policies with multiple user contexts
- Document RLS policies in migration files
- Use policy names that describe what they allow

**RLS Policy Examples:**
```sql
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

**Profile Update Performance Optimization:**
- Use optimistic updates for instant feedback
- Debounce username availability checks (500ms)
- Cache profile data in Zustand store
- Minimize database queries with selective fetching
- Use Supabase Realtime for multi-device sync (optional)

**Avatar Upload Best Practices:**
- Store avatars in Supabase Storage
- Use user ID as folder name for organization
- Implement file size limits (2MB max recommended)
- Validate image types (jpeg, png, webp only)
- Generate thumbnails for performance (optional)
- Clean up old avatars when uploading new ones

**Username Validation Rules:**
- Minimum 3 characters, maximum 20 characters
- Alphanumeric plus underscore only (regex: `^[a-zA-Z0-9_]+$`)
- Check uniqueness in database before allowing change
- Case-insensitive uniqueness (store lowercase in unique index)
- Reserved usernames list (admin, moderator, system, etc.)

**Password Change Security:**
- Require current password for verification
- Email confirmation after password change
- Invalidate other sessions after password change (optional)
- Log password changes for audit trail
- Rate limit password change attempts

### Project Context Reference

**Product Layer:** `product/features/quick-onboarding/spec.md`
**Architecture:** `docs/contracts.md` - BMAD layer communication
**User Personas:**
- Alex (college student): Wants customizable profile with avatar
- Sam (working professional): Needs secure password management
- Jordan (return reader): Appreciates simple profile editing

**Related Stories:**
- Story 2.1: User Registration (creates initial profile)
- Story 2.2: OAuth Authentication (OAuth profiles have provider data)
- Story 3.1: Dashboard Layout (displays user avatar/name)

**Profile Data Use Cases:**
- Display username in dashboard header
- Show avatar in series cards (future)
- Store reading preferences (theme, notification settings)
- Personalize user experience based on preferences

## Dev Agent Record

### Agent Model Used

<!-- Dev agent to fill in model name and version -->

### Debug Log References

<!-- Dev agent to add links to debug logs if needed -->

### Completion Notes List

<!-- Dev agent to document implementation notes and decisions -->

### File List

<!-- Dev agent to list all files created or modified -->
