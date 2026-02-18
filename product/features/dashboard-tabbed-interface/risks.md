# Risk Assessment: Dashboard Layout with Tabbed Interface

## Overview

**Feature**: Dashboard Layout with Tabbed Interface
**Feature ID**: dashboard-tabbed-interface
**Story**: 3-1
**Last Updated**: 2026-02-18
**Risk Assessment Date**: 2026-02-18

This document identifies and provides mitigation strategies for risks associated with the dashboard tabbed interface.

## Risk Assessment Framework

### Risk Scoring

**Risk Score = Probability × Impact**

- **Probability**: 1 (Low) to 5 (High)
- **Impact**: 1 (Low) to 5 (High)
- **Risk Score**: 1-25

| Score | Category | Action |
|-------|----------|--------|
| 1-5 | Low | Monitor |
| 6-12 | Medium | Plan mitigation |
| 13-20 | High | Active mitigation required |
| 21-25 | Critical | Escalate immediately |

---

## Technical Risks

### Risk 1: Supabase Query Performance with 100 Series

**Risk ID**: TR-001
**Category**: Technical / Performance
**Severity**: HIGH

**Description**:
The `user_series` query without a proper index on `(user_id, status)` may perform a full table scan as the dataset grows, causing dashboard load times to exceed the 3-second target.

**Probability**: 3 (Medium) — Supabase uses PostgreSQL; without index, sequential scan likely at scale
**Impact**: 4 (High) — Violates hard performance requirement (FR9, NFR1)
**Risk Score**: 12 — Medium

**Affected Components**:
- `src/backend/services/dashboard/seriesQueryService.ts`
- Supabase `user_series` table
- Dashboard page load time

**Mitigation Strategy**:
- Add composite index `(user_id, status)` on `user_series` table in migration
- Use server-side data fetching (Next.js server component) to avoid client-side waterfall
- Implement `select` with only required columns (avoid `SELECT *`)
- Add Supabase query timeout of 5 seconds with graceful error handling
- Monitor query performance via Supabase dashboard logs

**Contingency Plan**:
- If query exceeds 500ms, add `EXPLAIN ANALYZE` to identify bottleneck
- Consider pagination (limit 20 per tab) as fallback if 100-series target cannot be met
- Cache grouped series data in React state to avoid re-fetching on tab switch

---

### Risk 2: Hydration Mismatch Between Server and Client Components

**Risk ID**: TR-002
**Category**: Technical / Architecture
**Severity**: MEDIUM

**Description**:
Next.js App Router requires careful separation of server and client components. Incorrect use of `useState` or browser APIs in server components, or mismatched HTML between server render and client hydration, will cause React hydration errors that break the dashboard.

**Probability**: 3 (Medium) — Common pitfall with Next.js 14 App Router
**Impact**: 4 (High) — Dashboard completely broken if hydration fails
**Risk Score**: 12 — Medium

**Affected Components**:
- `src/app/dashboard/page.tsx` (server component)
- `src/components/dashboard/DashboardTabs.tsx` (client component)
- React hydration boundary

**Mitigation Strategy**:
- Keep `page.tsx` as a pure server component (no `useState`, no browser APIs)
- Mark `DashboardTabs.tsx` with `'use client'` directive
- Pass serializable data only from server to client components (no functions, no class instances)
- Test with `next build` + `next start` to catch hydration issues early
- Use `Suspense` boundary correctly around async server components

**Contingency Plan**:
- If hydration errors occur, convert page to full client component as temporary fix
- Add `suppressHydrationWarning` only as last resort with documented justification

---

### Risk 3: Tab State Lost on Navigation

**Risk ID**: TR-003
**Category**: Technical / UX
**Severity**: LOW

**Description**:
When a user navigates away from the dashboard and returns (e.g., via browser back button), the active tab resets to "Reading" instead of the previously selected tab, causing a minor UX disruption.

**Probability**: 4 (High) — React `useState` does not persist across navigation
**Impact**: 2 (Low) — Minor inconvenience, not a functional failure
**Risk Score**: 8 — Medium

**Affected Components**:
- `src/components/dashboard/DashboardTabs.tsx`
- Browser navigation history

**Mitigation Strategy**:
- For MVP: Accept this behavior; "Reading" as default is a reasonable UX choice
- Document as known limitation in story completion notes
- Future enhancement: Use URL search params (`?tab=completed`) for persistent tab state

**Contingency Plan**:
- If user feedback indicates this is a significant pain point, implement URL-based tab state in Story 3.3 or as a follow-up

---

### Risk 4: Empty State Discourages New Users

**Risk ID**: TR-004
**Category**: Technical / UX
**Severity**: HIGH

**Description**:
New users who have not imported series or installed the extension will see an empty dashboard on all four tabs. A poorly designed empty state could make the product feel broken or useless, leading to immediate churn.

**Probability**: 5 (High) — All new users start with zero series
**Impact**: 4 (High) — High churn risk for new users
**Risk Score**: 20 — High

**Affected Components**:
- `src/components/dashboard/EmptyState.tsx`
- User onboarding flow

**Mitigation Strategy**:
- Design empty state with encouraging copy ("Your reading journey starts here!")
- Include clear CTA linking to import flow (`/onboarding/import`) or extension guide (`/extension-guide`)
- Use brand illustration or icon to make empty state visually appealing
- Test empty state copy with target personas (Alex, Sam, Jordan)
- Ensure CTA is prominent and accessible (not just a text link)

**Contingency Plan**:
- A/B test different empty state messages if churn remains high
- Add "sample series" preview mode to show what the dashboard looks like with data

---

### Risk 5: Accessibility Violations in Tab Implementation

**Risk ID**: TR-005
**Category**: Technical / Accessibility
**Severity**: HIGH

**Description**:
Incorrect ARIA implementation for the tab pattern (missing `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-labelledby`) will cause WCAG 2.1 AA failures and screen reader incompatibility.

**Probability**: 3 (Medium) — ARIA tab pattern is complex and easy to implement incorrectly
**Impact**: 4 (High) — WCAG 2.1 AA is a hard requirement (NFR16)
**Risk Score**: 12 — Medium

**Affected Components**:
- `src/components/dashboard/DashboardTabs.tsx`
- `src/components/dashboard/TabPanel.tsx`

**Mitigation Strategy**:
- Follow WAI-ARIA Authoring Practices Guide for Tabs pattern exactly
- Implement full keyboard navigation (Arrow keys, Home, End, Enter, Space)
- Run axe-core automated accessibility tests in unit tests
- Test manually with VoiceOver (macOS) and NVDA (Windows)
- Reference: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

**Contingency Plan**:
- If axe-core reports violations, fix before marking story complete (non-negotiable)
- Use a pre-built accessible tab component (e.g., Radix UI Tabs) if custom implementation proves too complex

---

### Risk 6: Mobile Tab Overflow

**Risk ID**: TR-006
**Category**: Technical / Responsive Design
**Severity**: MEDIUM

**Description**:
On narrow mobile viewports (320px), four tab labels may overflow the viewport, causing horizontal page scroll or tab labels being cut off, making the interface unusable on small devices.

**Probability**: 3 (Medium) — Four tabs with full labels can be tight on 320px
**Impact**: 3 (Medium) — Mobile users cannot use the tab interface
**Risk Score**: 9 — Medium

**Affected Components**:
- `src/components/dashboard/DashboardTabs.tsx`
- Tailwind CSS responsive styles

**Mitigation Strategy**:
- Use `overflow-x: auto` on tab bar container with `scrollbar-hide` for clean UX
- Ensure active tab is always visible (scroll into view on tab change)
- Test on 320px viewport in Chrome DevTools
- Use shorter tab labels on mobile if needed (e.g., "Reading" → "Reading", "Plan to Read" → "Plan to Read" with `text-sm`)
- Ensure `white-space: nowrap` on tab buttons to prevent label wrapping

**Contingency Plan**:
- If labels are too long, abbreviate "Plan to Read" to "Planned" on mobile only
- Consider icon + label on desktop, icon-only on mobile (with tooltip)

---

## Business Risks

### Risk 7: Dashboard Becomes Stale Without Real-Time Updates

**Risk ID**: BR-001
**Category**: Business
**Severity**: MEDIUM

**Description**:
The dashboard fetches series data once on page load. If the user's reading progress is updated by the browser extension while they have the dashboard open, the dashboard will show stale data until they refresh.

**Probability**: 3 (Medium) — Users may have extension active while viewing dashboard
**Impact**: 2 (Low) — Data is stale but not incorrect; user can refresh
**Risk Score**: 6 — Medium

**Affected Components**:
- Dashboard data fetching strategy
- Supabase Realtime subscriptions (future story)

**Mitigation Strategy**:
- For Story 3-1: Accept static fetch on load; document as known limitation
- Future: Story 4.3 (Supabase Realtime Subscriptions) will add real-time updates
- Add a manual refresh button as a low-cost workaround

**Contingency Plan**:
- If user feedback indicates stale data is a major pain point, prioritize Story 4.3

---

### Risk 8: Series Count Exceeds 100 Before Pagination Is Implemented

**Risk ID**: BR-002
**Category**: Business
**Severity**: LOW

**Description**:
Story 3-1 targets up to 100 series without pagination. Power users (persona: Alex) may have more than 100 series, causing the dashboard to load all of them or silently truncate results.

**Probability**: 2 (Low) — Most users at MVP launch will have fewer than 100 series
**Impact**: 3 (Medium) — Power users get degraded experience
**Risk Score**: 6 — Medium

**Affected Components**:
- `seriesQueryService.ts` — query limit
- Dashboard page performance

**Mitigation Strategy**:
- Implement a soft limit of 100 series in the query (`LIMIT 100`) with a visible warning if user has more
- Story 3.5 (Infinite Scroll) will address this properly
- Document the 100-series limit in the story completion notes

**Contingency Plan**:
- If a user reports more than 100 series, prioritize Story 3.5 (Infinite Scroll)

---

## Integration Risks

### Risk 9: user_series Table Schema Mismatch

**Risk ID**: IR-001
**Category**: Integration
**Severity**: HIGH

**Description**:
The `user_series` table was created in Story 2-5 migration `007_create_user_series.sql`. If the schema differs from what Story 3-1 expects (e.g., different column names, missing `status` column), the dashboard query will fail.

**Probability**: 2 (Low) — Migration is already applied and tested
**Impact**: 5 (Critical) — Dashboard cannot load any series
**Risk Score**: 10 — Medium

**Affected Components**:
- `database/migrations/007_create_user_series.sql`
- `src/backend/services/dashboard/seriesQueryService.ts`
- `src/model/schemas/dashboard.ts`

**Mitigation Strategy**:
- Read `007_create_user_series.sql` before implementing query service to verify exact column names
- Use TypeScript interfaces that match the actual DB schema
- Run integration tests against the actual Supabase schema
- Add schema validation in `seriesQueryService.ts` with clear error messages

**Contingency Plan**:
- If schema mismatch found, create a new migration to add missing columns
- Use `ALTER TABLE user_series ADD COLUMN IF NOT EXISTS` for idempotent migrations

---

### Risk 10: Middleware Redirect Interferes with Dashboard Access

**Risk ID**: IR-002
**Category**: Integration
**Severity**: LOW

**Description**:
The route protection middleware (Story 2-6) redirects unauthenticated users away from `/dashboard`. If the middleware has a bug or the session cookie is not properly set, authenticated users may be incorrectly redirected away from the dashboard.

**Probability**: 1 (Low) — Middleware is tested with 26 integration tests
**Impact**: 4 (High) — Authenticated users cannot access dashboard
**Risk Score**: 4 — Low

**Affected Components**:
- `src/middleware.ts`
- `src/lib/routing.ts`
- Dashboard page access

**Mitigation Strategy**:
- Verify middleware tests cover the `/dashboard` protected route case
- Test dashboard access with a valid session in integration tests
- Monitor for unexpected redirects in production error logs

**Contingency Plan**:
- If middleware incorrectly blocks dashboard, add debug logging to `getRoutingDecision()`
- Temporarily bypass middleware for dashboard route while investigating

---

## Risk Summary

| Risk ID | Title | Probability | Impact | Score | Category | Status |
|---------|-------|-------------|--------|-------|----------|--------|
| TR-001 | Supabase Query Performance | 3 | 4 | 12 | Medium | Mitigated |
| TR-002 | Hydration Mismatch | 3 | 4 | 12 | Medium | Mitigated |
| TR-003 | Tab State Lost on Navigation | 4 | 2 | 8 | Medium | Accepted |
| TR-004 | Empty State Discourages Users | 5 | 4 | 20 | High | Mitigated |
| TR-005 | Accessibility Violations | 3 | 4 | 12 | Medium | Mitigated |
| TR-006 | Mobile Tab Overflow | 3 | 3 | 9 | Medium | Mitigated |
| BR-001 | Stale Data Without Realtime | 3 | 2 | 6 | Medium | Accepted |
| BR-002 | Series Count > 100 | 2 | 3 | 6 | Medium | Mitigated |
| IR-001 | user_series Schema Mismatch | 2 | 5 | 10 | Medium | Mitigated |
| IR-002 | Middleware Redirect Bug | 1 | 4 | 4 | Low | Monitored |

## Risk Monitoring

### Key Metrics

- Dashboard load time: Target <3 seconds (P95)
- Tab switch time: Target <100ms
- Accessibility violations: Target 0 (axe-core)
- Empty state CTA click rate: Target >20%
- Mobile usability score: Target >90 (Lighthouse)

### Review Schedule

- During implementation: Check TR-001, TR-002, TR-005 at each phase
- Before story completion: Full risk review against all acceptance criteria
- Post-deployment: Monitor performance and error rates for 1 week

---

**Document Status**: APPROVED
**Last Reviewed**: 2026-02-18
**Next Review**: 2026-03-18
