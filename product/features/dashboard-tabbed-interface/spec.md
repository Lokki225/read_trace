# Feature Specification: Dashboard Layout with Tabbed Interface

## Overview

**Feature ID**: dashboard-tabbed-interface  
**Feature Title**: Dashboard Layout with Tabbed Interface  
**Epic**: 3 - Series Management & Dashboard  
**Story**: 3-1  
**Status**: SPECIFIED  
**Confidence Level**: HIGH  
**Priority**: CRITICAL  
**Last Updated**: 2026-02-18  

## Executive Summary

The dashboard tabbed interface is the primary surface users interact with daily. It organizes all tracked series into four status-based tabs (Reading, Completed, On Hold, Plan to Read), enabling users to quickly navigate their reading library. The dashboard must load in under 3 seconds with up to 100 series and be fully responsive across mobile and desktop.

## Problem Statement

### User Problem
Users with growing manga/series libraries have no organized way to view their reading status at a glance. Without categorization, finding a specific series or understanding what they are actively reading versus what they have completed becomes increasingly difficult.

### Business Problem
A well-organized, fast-loading dashboard is the core retention driver. Users who can quickly resume reading and manage their library are more likely to continue using ReadTrace daily. Poor dashboard UX directly translates to churn.

### Current State
No dashboard exists. After authentication and onboarding, users have no organized view of their tracked series. The `/dashboard` route exists but renders no meaningful content.

### Desired State
Users land on a fully functional tabbed dashboard that categorizes their series by reading status, loads in under 3 seconds, and works seamlessly on both mobile and desktop devices.

## Feature Description

### What is this feature?
A tabbed dashboard interface that:
- Displays four tabs: "Reading", "Completed", "On Hold", and "Plan to Read"
- Shows only series matching the active tab's status
- Highlights the active tab clearly
- Loads series data from Supabase (`user_series` table)
- Renders within 3 seconds for up to 100 series
- Is fully responsive (mobile, tablet, desktop)
- Uses the ReadTrace brand color palette (Brand Orange #FF7A45, Background Cream #FFF8F2, Card Peach #FFEDE3)

### Who is it for?
- **Alex** (Power Reader): Needs fast access to 50+ active series organized by status
- **Sam** (Casual Reader): Needs a simple, clean view of their small library
- **Jordan** (Returning Reader): Needs to quickly identify what they were reading before a break

### When would they use it?
- Every reading session (daily or weekly)
- After returning from a break to find their active series
- When deciding what to read next from their backlog
- When checking completion status of finished series

### Why is it important?
The dashboard is the first screen users see after login. It is the primary engagement surface and the foundation for all Series Management features (Stories 3.2–3.6). Without it, no other Epic 3 feature can be delivered.

## Scope

### In Scope
- Four-tab navigation: Reading, Completed, On Hold, Plan to Read
- Tab-filtered series list (series cards as placeholders for Story 3.2)
- Active tab highlighting with brand orange accent
- Responsive tab layout (horizontal scroll on mobile, full display on desktop)
- Series data fetched from Supabase `user_series` table filtered by `status`
- Empty state UI per tab when no series match
- Loading skeleton while data fetches
- Dashboard page accessible at `/dashboard`
- Performance: <3 second load with up to 100 series
- WCAG 2.1 AA accessibility compliance

### Out of Scope
- Series card detailed design (Story 3.2)
- Search and filter functionality (Story 3.3)
- Progress indicators on cards (Story 3.4)
- Infinite scroll (Story 3.5)
- Preferred scan site configuration (Story 3.6)
- Series CRUD operations (add/edit/delete series)
- Drag-and-drop tab reordering

### Assumptions
- User is authenticated (middleware enforces this — Story 2-6)
- `user_series` table exists with `status` column (migration from Story 2-5)
- Series data is already populated via import or extension tracking
- Supabase client is configured and accessible server-side

## Technical Architecture

### System Components
- **Page**: `src/app/dashboard/page.tsx` — Server component, fetches series data
- **Tab Component**: `src/components/dashboard/DashboardTabs.tsx` — Client component, manages active tab state
- **Tab Panel**: `src/components/dashboard/TabPanel.tsx` — Renders series list for active tab
- **Empty State**: `src/components/dashboard/EmptyState.tsx` — Per-tab empty state UI
- **Loading Skeleton**: `src/components/dashboard/DashboardSkeleton.tsx` — Loading state
- **Series Service**: `src/backend/services/dashboard/seriesQueryService.ts` — Fetches and groups series by status
- **Domain Types**: `src/model/schemas/dashboard.ts` — TypeScript interfaces for dashboard data

### Data Model
```
user_series (existing from Story 2-5 migration 007)
├── id (UUID)
├── user_id (FK to auth.users)
├── title (TEXT)
├── platform (TEXT)
├── status (TEXT: 'reading' | 'completed' | 'on_hold' | 'plan_to_read')
├── current_chapter (INTEGER)
├── total_chapters (INTEGER nullable)
├── cover_url (TEXT nullable)
├── last_read_at (TIMESTAMP)
└── created_at (TIMESTAMP)

DashboardData (domain object)
├── reading: UserSeries[]
├── completed: UserSeries[]
├── on_hold: UserSeries[]
└── plan_to_read: UserSeries[]
```

### API Endpoints
No new API endpoints required. Data is fetched server-side via Supabase client in the page component.

### Integration Points
- Supabase `user_series` table (read-only for this story)
- Next.js App Router server components for data fetching
- Supabase Auth session for user identification

### Performance Requirements
- Dashboard page load: <3 seconds (LCP) with up to 100 series
- Tab switch: <100ms (client-side state change, no network request)
- Initial data fetch: <500ms Supabase query
- Time to Interactive: <300ms after data loads (web platform threshold)

## User Experience

### User Flows

1. **Authenticated User Views Dashboard**
   - User navigates to `/dashboard`
   - Loading skeleton displays while data fetches
   - Dashboard renders with "Reading" tab active by default
   - User sees their series organized under the active tab
   - User clicks another tab to view series in that status

2. **Empty Tab State**
   - User clicks "Completed" tab with no completed series
   - Empty state message displays: "No completed series yet"
   - Call-to-action encourages user to mark series as complete

3. **Mobile User**
   - Tabs display in a horizontally scrollable row
   - Active tab is visually distinct with orange underline/background
   - Touch targets are 44px minimum height

### Wireframes/Mockups
Per UX Design Specification:
- Tabbed interface at top of dashboard content area
- Tabs: Reading | Completed | On Hold | Plan to Read
- Active tab: Brand Orange (#FF7A45) underline or background highlight
- Inactive tabs: Text Charcoal (#222222) on Background Cream (#FFF8F2)
- Series grid below tabs (2 columns mobile, 3-4 columns desktop)

### Accessibility Requirements
- WCAG 2.1 Level AA compliance
- Tabs use `role="tablist"`, `role="tab"`, `role="tabpanel"` ARIA attributes
- Active tab has `aria-selected="true"`
- Tab panels have `aria-labelledby` pointing to their tab
- Keyboard navigation: Arrow keys to move between tabs, Enter/Space to select
- Color contrast: all text meets 4.5:1 ratio against backgrounds
- Focus indicators visible on all interactive elements

### Mobile Considerations
- Tab bar horizontally scrollable on small screens (overflow-x: auto)
- Minimum 44px touch targets for all tab buttons
- Series grid collapses to 2 columns on mobile
- No horizontal overflow on content area

## Acceptance Criteria

### Functional Requirements
- [ ] Dashboard displays four tabs: "Reading", "Completed", "On Hold", "Plan to Read"
- [ ] Each tab displays only series matching that status
- [ ] Active tab is clearly highlighted with brand orange
- [ ] Clicking a tab switches the displayed series without page reload
- [ ] Dashboard loads in under 3 seconds with up to 100 series
- [ ] Empty state is shown per tab when no series match
- [ ] Loading skeleton displays while data is being fetched

### Non-Functional Requirements
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Responsive layout works on mobile (320px+) and desktop (1280px+)
- [ ] Tab switch is <100ms (no network request)
- [ ] Supabase query completes in <500ms
- [ ] No TypeScript errors (strict mode)
- [ ] No ESLint errors

### Quality Gates
- [ ] Unit test coverage: 80%+
- [ ] Integration test coverage: 70%+
- [ ] All existing 535 tests continue to pass (zero regressions)
- [ ] Accessibility testing passed (axe-core or similar)
- [ ] Performance testing passed (<3s load)
- [ ] Code review approved

## Dependencies

### Technical Dependencies
- Next.js: 14+ with App Router (existing)
- Supabase SDK: `@supabase/ssr` (existing)
- Tailwind CSS (existing)
- TypeScript strict mode (existing)

### Feature Dependencies
- Story 2-1 (User Registration) — auth system in place ✅
- Story 2-5 (Import) — `user_series` table with `status` column exists ✅
- Story 2-6 (Route Protection) — middleware protects `/dashboard` ✅

### External Dependencies
- Supabase project running with `user_series` table populated

## Risks and Mitigations

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Supabase query slow with 100 series | Medium | High | Add index on `(user_id, status)`, use server-side fetch |
| Hydration mismatch (server/client) | Medium | Medium | Use client component for tab state, server component for data |
| Tab state lost on navigation | Low | Low | URL-based tab state or sessionStorage |

### Business Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Empty dashboard discourages new users | High | High | Compelling empty state with clear CTA to import or install extension |
| Mobile tab overflow confuses users | Medium | Medium | Horizontal scroll indicator, test on real devices |

## Success Metrics

### User Metrics
- Dashboard load time: <3 seconds (P95)
- Tab switch time: <100ms
- Empty state CTA click rate: >20%

### Business Metrics
- Dashboard daily active usage: >80% of logged-in users
- Bounce rate from dashboard: <15%

### Technical Metrics
- Supabase query time: <500ms (P95)
- Lighthouse Performance score: >85
- Zero accessibility violations (axe-core)

## Implementation Approach

### Phase 1: Domain Layer
Define TypeScript interfaces, status enums, and pure data transformation functions for grouping series by status.

### Phase 2: Data Layer
Implement `seriesQueryService.ts` to fetch and group series from Supabase, with proper error handling and type safety.

### Phase 3: Presentation Layer
Build `DashboardTabs`, `TabPanel`, `EmptyState`, and `DashboardSkeleton` components with full accessibility and responsive design.

### Phase 4: Integration & Testing
Wire up the dashboard page, write all unit/integration tests, validate accessibility, and verify performance targets.

## Timeline

- **Specification**: Complete (2026-02-18)
- **Implementation**: 2-3 days
- **Testing**: 1-2 days
- **Deployment**: Target 2026-02-25

## Resources

### Team
- **Product Owner**: [Name]
- **Lead Developer**: [Name]
- **QA Lead**: [Name]
- **Designer**: [Name]

### Effort Estimate
- Development: 8-10 story points
- Testing: 4-5 story points
- Documentation: 1-2 story points

## References

### Related Documents
- Story 3-2: Series Card Component with Magazine-Style Layout
- Story 3-3: Search & Filter Functionality
- Story 2-5: Optional Bookmark & Spreadsheet Import (user_series table)
- Story 2-6: Route Protection Middleware (dashboard protection)
- docs/THEME_SYSTEM.md — Brand color palette
- docs/USER_FLOWS.md — Dashboard user flows

### External References
- [WAI-ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [Next.js App Router Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Technical Lead | | | |
| QA Lead | | | |

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-18 | AI Agent | Initial specification |

## Notes and Comments

- Tab state should be managed client-side (no URL params needed for MVP)
- Series cards in this story are minimal placeholders; full card design is Story 3.2
- Empty state design should be encouraging, not discouraging — use brand voice
- Consider `Suspense` boundary for loading skeleton with React 18 streaming

---

**Document Status**: APPROVED  
**Last Reviewed**: 2026-02-18  
**Next Review Date**: 2026-03-18
