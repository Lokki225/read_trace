# ReadTrace — User Flows & Navigation Architecture

**Last Updated**: 2026-02-18  
**Status**: APPROVED FOR IMPLEMENTATION  
**Relates to**: FR25, FR26, FR27 (Quick Onboarding), Story 2-4 (Extension Guide)

---

## Overview

This document defines the exact page-by-page navigation flows for all user journeys in ReadTrace. It serves as the authoritative reference before implementing routing logic, middleware, and redirects.

---

## Flow 1: New User Registration (Email/Password)

```
[/]
  │
  ├─ NOT authenticated → redirect to /register
  │
[/register]
  │  User fills email + password → submits
  │
[/register/confirm?email=xxx]
  │  "Check your email" page — user clicks link in email
  │
[Supabase email link] → /auth/confirm-email?code=xxx
  │  Code exchanged for session
  │  ⚠️  CURRENT BUG: redirects to /login (WRONG)
  │  ✅  CORRECT:     redirect to /onboarding
  │
[/onboarding]
  │  Step 1: Welcome
  │  Step 2: Extension Installation Guide ← Story 2-4 lives HERE
  │  Step 3: Complete → auto-redirect after 2s
  │
[/dashboard]
  │  Main app — user is authenticated + onboarded
```

**Gap to fix**: `src/app/auth/confirm-email/page.tsx` line 79  
Change: `redirect('/login?message=...')` → `redirect('/onboarding')`

---

## Flow 2: New User Registration (OAuth — Google / Discord)

```
[/register]
  │  User clicks "Sign up with Google" or "Sign up with Discord"
  │
[OAuth Provider] → Supabase OAuth callback
  │
  ├─ First-time OAuth user → redirect to /onboarding
  │
  └─ Returning OAuth user  → redirect to /dashboard
  │
[/onboarding] or [/dashboard]
```

**Gap to fix**: `src/app/register/page.tsx` line 15  
Change: `handleOAuthSuccess → router.push('/dashboard')` → `router.push('/onboarding')`  
**Note**: Needs logic to distinguish first-time vs returning OAuth user (check `onboarding_completed` flag on user profile).

---

## Flow 3: Returning User Login (Email)

```
[/]
  │
  ├─ NOT authenticated → redirect to /auth/login
  │
[/auth/login]
  │  User clicks "Sign in with Email" → /auth/login-email (not yet implemented)
  │  OR user clicks Google/Discord OAuth
  │
  ├─ Auth success → redirect to /dashboard
  │
[/dashboard]
```

**Gap**: `/auth/login-email` page does not exist yet (login page links to it).

---

## Flow 4: Returning User Login (OAuth)

```
[/auth/login]
  │  User clicks "Sign in with Google" or "Sign in with Discord"
  │
[OAuth Provider] → Supabase OAuth callback
  │
[/dashboard]  ← handleOAuthSuccess already does this ✅
```

**Status**: Implemented correctly.

---

## Flow 5: Extension Guide (Post-Onboarding Access)

```
[/dashboard]
  │  User clicks "Install Extension" banner or settings link
  │
[/extension-guide]
  │  Standalone guide — same InstallationGuide component
  │  Skip → /dashboard
  │  Complete → /dashboard
```

**Status**: Page implemented (`/extension-guide/page.tsx`). Dashboard link not yet implemented.

---

## Flow 6: Root Page Routing Logic

```
[/]
  ├─ Authenticated + onboarding_completed = true  → /dashboard
  ├─ Authenticated + onboarding_completed = false → /onboarding
  └─ Not authenticated                            → /register
```

**Gap**: `src/app/page.tsx` is currently a Next.js placeholder — needs auth-aware redirect logic.

---

## Page Inventory

| Route | Status | Purpose | Redirects To |
|---|---|---|---|
| `/` | ❌ Placeholder | Entry point | `/register` or `/dashboard` |
| `/register` | ✅ Implemented | Email/OAuth signup | `/register/confirm` or `/onboarding` |
| `/register/confirm` | ✅ Implemented | "Check your email" screen | — (waits for email click) |
| `/auth/confirm-email` | ✅ Implemented | Supabase email callback | ⚠️ `/login` (should be `/onboarding`) |
| `/auth/login` | ✅ Implemented | OAuth login hub | `/dashboard` |
| `/auth/login-email` | ❌ Missing | Email/password login form | `/dashboard` |
| `/onboarding` | ✅ Implemented | 3-step wizard (welcome → extension → complete) | `/dashboard` |
| `/extension-guide` | ✅ Implemented | Standalone extension guide | `/dashboard` |
| `/dashboard` | ⚠️ Placeholder | Main app | — |
| `/profile` | ✅ Implemented | User profile settings | — |

---

## Gaps Summary (Ordered by Priority)

### P1 — Breaks the new user flow (must fix before testing)

1. **`/auth/confirm-email` wrong redirect** — redirects to `/login` instead of `/onboarding` after email confirmation
2. **`/` is a placeholder** — needs auth-aware routing (unauthenticated → `/register`, authenticated → `/dashboard`)

### P2 — Breaks OAuth new user flow

3. **OAuth signup always goes to `/dashboard`** — first-time OAuth users should go to `/onboarding`
4. **No `onboarding_completed` flag** — no way to distinguish first-time vs returning user

### P3 — Missing pages

5. **`/auth/login-email`** — email/password login form (login page links to it but it doesn't exist)
6. **`/dashboard`** — placeholder only, needs real content (Epic 3 scope)

### P4 — Missing middleware

7. **No route protection** — `/dashboard`, `/profile`, `/onboarding` are accessible without auth
8. **No `src/middleware.ts`** — needed to protect routes and handle auth redirects server-side

---

## How to Manually Test the Extension Guide (Right Now)

Until P1 gaps are fixed, you can test the extension guide directly:

1. Start dev server: `npm run dev`
2. Navigate directly to `http://localhost:3000/onboarding`
3. Click "Get Started" → extension step appears
4. Test browser detection, store links, skip button, troubleshooting
5. Or navigate to `http://localhost:3000/extension-guide` for the standalone page

---

## Implementation Plan (Stories to Create)

| Story ID | Title | Fixes |
|---|---|---|
| 2-5 | Root Page & Auth-Aware Routing | Gap P1 (#2), P4 (#7, #8) |
| 2-6 | Email/Password Login Form | Gap P3 (#5) |
| 2-7 | Onboarding Completion Tracking | Gap P2 (#3, #4) |
| 3-x | Dashboard Content | Gap P3 (#6) |

**Recommended next story**: **2-5 — Root Page & Auth-Aware Routing**, which unblocks the full testable end-to-end flow.

---

## Data Model Requirements

### `user_profiles` fields needed for routing

| Field | Type | Purpose |
|---|---|---|
| `onboarding_completed` | `boolean` | Distinguish first-time vs returning user |
| `onboarding_completed_at` | `timestamp` | When onboarding was finished |

These fields do not yet exist in the database. Story 2-5 or 2-7 should add them via migration.

---

## Routing Decision Tree (for middleware implementation)

```
Request arrives at any protected route
  │
  ├─ Has valid Supabase session?
  │    NO  → redirect to /register
  │    YES ↓
  │
  ├─ Route is /onboarding or /extension-guide?
  │    YES → allow (no further checks)
  │    NO  ↓
  │
  ├─ Route is /dashboard or /profile?
  │    YES → allow (authenticated)
  │    NO  ↓
  │
  └─ Route is / ?
       → onboarding_completed = true  → /dashboard
       → onboarding_completed = false → /onboarding
```
