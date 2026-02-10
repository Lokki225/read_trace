# Story 2.1: User Registration with Email & Password

Status: ready-for-dev

## Story

As a new user,
I want to create an account with email and password through Supabase Auth,
So that I can access ReadTrace and start tracking my reading progress.

## Acceptance Criteria

1. **Given** I am on the registration page
   **When** I enter a valid email and password and submit the form
   **Then** my account is created in Supabase Auth
   **And** I receive a confirmation email
   **And** I can log in with my credentials
   **And** password meets security requirements (minimum 8 characters, complexity rules)
   **And** email validation prevents duplicate accounts

## Tasks / Subtasks

- [ ] Create registration page component (AC: 1)
  - [ ] Design form with email and password fields
  - [ ] Implement form validation (email format, password strength)
  - [ ] Add password visibility toggle
  - [ ] Add loading and error states
- [ ] Integrate Supabase Auth SDK (AC: 1)
  - [ ] Configure Supabase client in lib/supabase.ts
  - [ ] Implement signUp function in backend/services/auth/authService.ts
  - [ ] Handle email confirmation flow
  - [ ] Set up error handling for duplicate accounts
- [ ] Create user profile on registration (AC: 1)
  - [ ] Design user_profiles table schema in database/migrations/001_create_users.sql
  - [ ] Implement Row Level Security policies
  - [ ] Create profile record after successful registration
  - [ ] Set default user preferences
- [ ] Implement security requirements (AC: 1)
  - [ ] Password minimum 8 characters validation
  - [ ] Password complexity rules (uppercase, lowercase, number, special char)
  - [ ] Email format validation
  - [ ] Rate limiting for registration attempts
- [ ] Add confirmation email handling (AC: 1)
  - [ ] Configure Supabase email templates
  - [ ] Handle email verification callbacks
  - [ ] Display confirmation message after registration
  - [ ] Implement resend confirmation email feature

## Dev Notes

### Technical Requirements

**Authentication Platform:** Supabase Auth
- Supabase PostgreSQL 15.1 with built-in authentication
- Email/Password provider configuration required
- Email confirmation enabled by default
- Password strength policies configurable in Supabase dashboard

**Frontend Framework:** Next.js 14+ App Router
- Registration page: `src/app/auth/register/page.tsx`
- Server Actions for form submission (recommended pattern)
- Client components for interactive form elements
- TypeScript strict mode enabled

**UI Components:** shadcn/ui + Tailwind CSS
- Use shadcn/ui Form components for validation
- Button, Input, Label components from shadcn/ui
- Toast notifications for success/error messages
- Loading spinners during async operations

**State Management:** Zustand
- Create `useAuthStore` in `src/store/authStore.ts`
- Store user session state
- Handle authentication state persistence
- Clear state on logout

### Architecture Compliance

**BMAD Layer Boundaries:**
- **Frontend**: `src/app/auth/register/page.tsx` (Next.js page)
- **Backend**: `backend/services/auth/authService.ts` (business logic)
- **API**: Direct Supabase Client SDK (no custom API routes needed)
- **Model**: `model/schemas/user.ts` (TypeScript interfaces)
- **Database**: `database/migrations/001_create_users.sql` (Supabase tables)

**Communication Flow:**
```
Registration Form (src/app/) 
  → authService (backend/services/auth/)
  → Supabase Auth SDK (lib/supabase.ts)
  → Supabase Database (users + user_profiles tables)
```

**Forbidden Patterns:**
- Do NOT call database directly from frontend
- Do NOT bypass Supabase Auth for user creation
- Do NOT store passwords in plain text anywhere
- Do NOT skip Row Level Security policies

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

**Supabase Configuration:**
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Initialize client in `src/lib/supabase.ts`
- Use `createClientComponentClient` for client components
- Use `createServerComponentClient` for server components

**Form Validation Library:** Zod + React Hook Form
- Define registration schema with Zod
- Integrate with React Hook Form using `@hookform/resolvers/zod`
- Client-side validation before submission
- Server-side validation in authService

### File Structure Requirements

**New Files to Create:**
```
src/
├── app/
│   └── auth/
│       ├── register/
│       │   └── page.tsx              # Registration page
│       ├── login/
│       │   └── page.tsx              # Login page (reference)
│       └── callback/
│           └── route.ts              # Email confirmation callback
├── components/
│   └── auth/
│       ├── RegisterForm.tsx          # Registration form component
│       └── PasswordStrength.tsx      # Password strength indicator
├── lib/
│   └── supabase.ts                   # Supabase client initialization
├── store/
│   └── authStore.ts                  # Zustand auth store
backend/
├── services/
│   └── auth/
│       ├── authService.ts            # Auth business logic
│       └── passwordValidator.ts      # Password validation utilities
model/
├── schemas/
│   └── user.ts                       # User TypeScript interfaces
└── validation/
    └── authValidation.ts             # Zod schemas for auth
database/
└── migrations/
    ├── 001_create_users.sql          # User tables and RLS policies
    └── 002_create_profiles.sql       # User profiles table
```

**File Naming Conventions:**
- Components: PascalCase (`RegisterForm.tsx`)
- Services: camelCase (`authService.ts`)
- Database: snake_case (`001_create_users.sql`)
- Stores: camelCase with 'Store' suffix (`authStore.ts`)

### Testing Requirements

**Unit Tests Required:**
- Password validation logic
- Email format validation
- Form validation schemas
- Auth service functions

**Integration Tests Required:**
- Complete registration flow
- Email confirmation process
- Duplicate account prevention
- Error handling scenarios

**Test Files:**
```
tests/
├── unit/
│   ├── passwordValidator.test.ts
│   └── authValidation.test.ts
├── integration/
│   └── registration.integration.test.ts
└── __mocks__/
    └── supabase.ts                   # Mock Supabase client
```

**Test Coverage Target:** 90% for auth services

**Critical Test Scenarios:**
- Valid registration completes successfully
- Duplicate email is rejected
- Weak passwords are rejected
- Email confirmation callback works
- Form validation catches invalid inputs
- Error messages display correctly

### Previous Story Intelligence

**Epic 1 Learnings:**
- Supabase client already initialized in `src/lib/supabase.ts` (from Story 1.1)
- Test infrastructure configured with Jest and React Testing Library (from Story 1.5)
- Global mocks for Supabase exist in `tests/__mocks__/supabase.ts` (from Story 1.5)
- shadcn/ui component library already installed (from Story 1.1)
- TypeScript strict mode enabled project-wide (from Story 1.1)

**Key Patterns Established:**
- Co-located test files (Component.tsx + Component.test.tsx)
- Feature-based directory organization
- Zustand stores for state management
- Supabase client usage patterns

**Files to Reference:**
- `tests/__mocks__/supabase.ts` - Existing Supabase mocks
- `jest.setup.js` - Test configuration
- `src/lib/supabase.ts` - Supabase client initialization

### Latest Technical Information

**Supabase Auth Best Practices (2026):**
- Use `@supabase/auth-helpers-nextjs` for Next.js 14+ App Router
- Implement Server Components for initial auth checks
- Use Client Components for interactive auth forms
- Enable email confirmation for production security
- Configure password strength policies in Supabase dashboard settings

**Next.js 14+ Authentication Patterns:**
- Server Actions for form submissions (recommended over API routes)
- Middleware for protected route authentication
- Session management with cookies (handled by Supabase Auth Helpers)
- Automatic token refresh via Auth Helpers

**Security Considerations:**
- NEVER expose `SUPABASE_SERVICE_ROLE_KEY` in client code
- Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side access
- Enable Row Level Security on all user-facing tables
- Implement rate limiting to prevent brute force attacks
- Use HTTPS for all authentication endpoints (Vercel handles this)

**Password Requirements (Industry Standard 2026):**
- Minimum 8 characters (recommend 12+)
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- No common passwords (use zxcvbn library for strength checking)

### Project Context Reference

**Product Layer:** `product/features/quick-onboarding/spec.md`
**Architecture:** `docs/contracts.md` - BMAD layer communication rules
**User Personas:** `product/personas.md` - Alex (college student), Sam (working professional), Jordan (return reader)

**Related Epics:**
- Epic 2: User Authentication & Profiles (current epic)
- Epic 3: Series Management & Dashboard (depends on auth)
- Epic 4: Cross-Platform Tracking (depends on user accounts)

## Dev Agent Record

### Agent Model Used

<!-- Dev agent to fill in model name and version -->

### Debug Log References

<!-- Dev agent to add links to debug logs if needed -->

### Completion Notes List

<!-- Dev agent to document implementation notes and decisions -->

### File List

<!-- Dev agent to list all files created or modified -->
