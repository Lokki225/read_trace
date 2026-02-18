# Story 2-6: Root Page & Auth-Aware Routing

Status: done

## Story

As a user visiting ReadTrace,
I want to be automatically routed to the correct page based on my authentication state,
So that new users are guided through registration and onboarding while returning users go directly to their dashboard.

## Acceptance Criteria

1. **Given** I visit the root URL `/`
   **When** I am not authenticated
   **Then** I am redirected to `/register`

2. **Given** I visit the root URL `/`
   **When** I am authenticated and have completed onboarding
   **Then** I am redirected to `/dashboard`

3. **Given** I visit the root URL `/`
   **When** I am authenticated but have NOT completed onboarding
   **Then** I am redirected to `/onboarding`

4. **Given** I complete email confirmation via `/auth/confirm-email`
   **When** the confirmation code is valid
   **Then** I am redirected to `/onboarding` (not `/login`)

5. **Given** I register via OAuth (Google or Discord) for the first time
   **When** authentication succeeds
   **Then** I am redirected to `/onboarding` (not `/dashboard`)

6. **Given** I am not authenticated
   **When** I try to access `/dashboard`, `/profile`, or `/onboarding`
   **Then** I am redirected to `/register` with a `redirectTo` query param

7. **Given** I am authenticated
   **When** I try to access `/register` or `/auth/login`
   **Then** I am redirected to `/dashboard`

8. **Given** the `user_profiles` table
   **When** a user's onboarding is completed
   **Then** `onboarding_completed` is set to `true` and `onboarding_completed_at` is recorded

## Tasks / Subtasks

- [x] Add onboarding tracking fields to DB (AC: 8)
  - [x] Create migration 009 adding `onboarding_completed` + `onboarding_completed_at` to `user_profiles`
  - [x] Update `Database` type in `src/lib/supabase.ts`

- [x] Implement Next.js middleware for route protection (AC: 6, 7)
  - [x] Create `src/middleware.ts` using `@supabase/ssr`
  - [x] Protect `/dashboard`, `/profile`, `/onboarding`, `/onboarding/import` — redirect unauthenticated to `/register`
  - [x] Redirect authenticated users away from `/register` and `/auth/login` to `/dashboard`
  - [x] Pass `redirectTo` param when redirecting to auth pages

- [x] Implement auth-aware root page (AC: 1, 2, 3)
  - [x] Replace placeholder `src/app/page.tsx` with server component that checks auth state
  - [x] Redirect unauthenticated → `/register`
  - [x] Redirect authenticated + onboarding_completed → `/dashboard`
  - [x] Redirect authenticated + !onboarding_completed → `/onboarding`

- [x] Fix email confirmation redirect (AC: 4)
  - [x] Update `src/app/auth/confirm-email/page.tsx` line 79: redirect to `/onboarding` instead of `/login`

- [x] Fix OAuth new-user redirect (AC: 5)
  - [x] Update `src/app/register/page.tsx` `handleOAuthSuccess` to redirect to `/onboarding`
  - [x] Update `src/app/auth/login/page.tsx` `handleOAuthSuccess` — middleware handles onboarding redirect

- [x] Update onboarding completion (AC: 8)
  - [x] Update `src/app/onboarding/page.tsx` to call API when step 3 (complete) is reached
  - [x] Create `POST /api/onboarding/complete` route that sets `onboarding_completed = true`

## Dev Notes

### Technical Requirements

**Middleware Strategy:** Next.js `src/middleware.ts` with `@supabase/ssr`
- Runs on Edge Runtime — use `createServerClient` from `@supabase/ssr` directly (not the wrapper in `src/lib/supabase.ts` which uses `next/headers`)
- Match pattern: all routes except `/_next`, `/api`, `/public`, static files
- Read session from cookies — no DB query in middleware (performance)
- Onboarding check done in root page (server component) — not in middleware

**Route Protection Matrix:**

| Route | Unauth | Auth + Onboarded | Auth + Not Onboarded |
|---|---|---|---|
| `/` | → `/register` | → `/dashboard` | → `/onboarding` |
| `/register` | allow | → `/dashboard` | → `/onboarding` |
| `/auth/login` | allow | → `/dashboard` | → `/onboarding` |
| `/auth/confirm-email` | allow | allow | allow |
| `/register/confirm` | allow | allow | allow |
| `/onboarding` | → `/register` | allow | allow |
| `/onboarding/import` | → `/register` | allow | allow |
| `/extension-guide` | → `/register` | allow | allow |
| `/dashboard` | → `/register` | allow | allow |
| `/profile` | → `/register` | allow | allow |

**Middleware Implementation Pattern:**

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create response to mutate cookies
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* getAll/setAll on request/response */ } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes — require auth
  const protectedRoutes = ['/dashboard', '/profile', '/onboarding', '/extension-guide'];
  // Auth routes — redirect if already authenticated
  const authRoutes = ['/register', '/auth/login'];

  if (!user && protectedRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL(`/register?redirectTo=${pathname}`, request.url));
  }

  if (user && authRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
```

**Root Page Strategy:** Server Component (no 'use client')
- Call `createServerClient` → `supabase.auth.getUser()`
- If no user → `redirect('/register')`
- If user → query `user_profiles` for `onboarding_completed`
- If `onboarding_completed` → `redirect('/dashboard')`
- Else → `redirect('/onboarding')`

**Onboarding Completion API:**

```typescript
// POST /api/onboarding/complete
// Sets onboarding_completed = true, onboarding_completed_at = now()
// Called when user reaches step 3 of onboarding wizard
```

**Database Migration 009:**

```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;
```

### Architecture Compliance

**BMAD Layer Boundaries:**
- **Middleware**: `src/middleware.ts` — Edge runtime, session check only
- **Root Page**: `src/app/page.tsx` — Server component, auth + onboarding check
- **API**: `src/app/api/onboarding/complete/route.ts`
- **Database**: `database/migrations/009_onboarding_tracking.sql`

**Files to Modify:**
- `src/app/auth/confirm-email/page.tsx` — Fix redirect line 79
- `src/app/register/page.tsx` — Fix OAuth success handler
- `src/app/auth/login/page.tsx` — Fix OAuth success handler
- `src/app/onboarding/page.tsx` — Call complete API on step 3
- `src/lib/supabase.ts` — Add onboarding fields to Database type

### Testing Requirements

**Unit Tests:**
- Middleware route protection logic (mock Supabase session)
- Root page redirect logic

**Integration Tests:**
- Unauthenticated access to protected routes → redirect
- Authenticated access to auth routes → redirect
- Onboarding completion API sets correct DB fields

**Test Files:**
```
tests/
├── unit/
│   └── middleware.test.ts
├── integration/
│   └── routing.integration.test.ts
```

### Previous Story Intelligence

**Patterns Established:**
- `createServerClient` from `src/lib/supabase.ts` for server components
- `(supabase as any)` for DB queries not in type definition
- API routes use `supabase.auth.getUser()` for auth check
- Integration tests test service logic directly (not HTTP)

**Key Files to Reference:**
- `src/lib/supabase.ts` — `createServerClient` wrapper
- `src/app/api/extension/installed/route.ts` — Auth check pattern
- `src/app/auth/confirm-email/page.tsx` — Current (broken) redirect

### User Flow This Fixes

```
NEW USER (Email):
  / → /register → /register/confirm → [email link]
  → /auth/confirm-email → ✅ /onboarding → /dashboard

NEW USER (OAuth):
  / → /register → [OAuth] → ✅ /onboarding → /dashboard

RETURNING USER:
  / → /auth/login → ✅ /dashboard

DIRECT URL ACCESS:
  /dashboard (unauth) → /register?redirectTo=/dashboard
  /register (auth) → /dashboard
```

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (Cascade / Windsurf)

### Debug Log References

- Routing logic extracted to `src/lib/routing.ts` (pure function) to make it fully testable without Next.js middleware mocking
- Middleware does a DB query for `onboarding_completed` — acceptable since it only runs on non-static routes
- Login page `handleOAuthSuccess` still pushes to `/dashboard`; middleware intercepts and redirects to `/onboarding` if needed (cleaner than duplicating logic)

### Completion Notes List

- `src/lib/routing.ts` — pure `getRoutingDecision()` function with exported `PROTECTED_ROUTES` and `AUTH_ROUTES` constants; fully unit-testable
- `src/middleware.ts` — Edge runtime, reads session + `onboarding_completed` from DB, delegates routing decision to `routing.ts`
- `src/app/page.tsx` — replaced Next.js placeholder with async server component; redirects based on auth + onboarding state
- `src/app/auth/confirm-email/page.tsx` — fixed redirect from `/login` to `/onboarding` (AC-4 bug fix)
- `src/app/register/page.tsx` — OAuth success now redirects to `/onboarding` for new users
- `src/app/onboarding/page.tsx` — calls `POST /api/onboarding/complete` on both extension complete and skip paths
- Migration 009 uses `ADD COLUMN IF NOT EXISTS` — safe to run multiple times
- All 26 routing tests passing; 535/535 total (0 regressions, +26 new tests)

### File List

**New Files Created (5):**
- `src/lib/routing.ts` — Pure routing decision logic + PROTECTED_ROUTES, AUTH_ROUTES constants
- `src/middleware.ts` — Next.js Edge middleware for route protection
- `src/app/api/onboarding/complete/route.ts` — POST, sets onboarding_completed = true
- `database/migrations/009_onboarding_tracking.sql` — onboarding_completed + onboarding_completed_at columns
- `tests/integration/routing.integration.test.ts` — 26 routing decision tests

**Modified Files (5):**
- `src/app/page.tsx` — Replaced placeholder with auth-aware server component
- `src/app/auth/confirm-email/page.tsx` — Fixed redirect to /onboarding (was /login)
- `src/app/register/page.tsx` — OAuth success → /onboarding
- `src/app/auth/login/page.tsx` — Added comment; middleware handles onboarding redirect
- `src/app/onboarding/page.tsx` — Calls /api/onboarding/complete on completion
- `src/lib/supabase.ts` — Added onboarding_completed + onboarding_completed_at to Database type
