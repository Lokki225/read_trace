# Implementation Tasks: Phase 1 - Architecture & Setup

> **Purpose**: Break down feature implementation into granular, trackable tasks for AI agents and developers.
> **Usage**: Update task statuses as you progress.
> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done
> **Tech Stack**: Next.js 14+, TypeScript, React, Supabase, TailwindCSS

---

## Pre-Implementation Checklist

### Product Requirements Validation
- [ ] **Read spec.md** - Understand feature requirements and user flows
  - File: `product/features/automatic-scroll-restoration-to-last-position/spec.md` 
  - Verify: All goals, non-goals, and constraints are clear
  
- [ ] **Read acceptance-criteria.md** - Understand success criteria
  - File: `product/features/automatic-scroll-restoration-to-last-position/acceptance-criteria.md` 
  - Verify: All requirements have clear testable behaviors
  
- [ ] **Read test-scenarios.md** - Understand testing requirements
  - File: `product/features/automatic-scroll-restoration-to-last-position/test-scenarios.md` 
  - Verify: Test scenarios cover all acceptance criteria
  
- [ ] **Read risks.md** - Understand potential issues
  - File: `product/features/automatic-scroll-restoration-to-last-position/risks.md` 
  - Verify: Mitigation strategies are documented

- [ ] **Check FEATURE_STATUS.json** - Verify feature is in SPECIFIED state
  - File: `product/FEATURE_STATUS.json` 
  - Verify: Feature state = "SPECIFIED" before coding

- [ ] **Check personas.md** - Verify feature serves target personas
  - File: `product/personas.md` 
  - Verify: Feature aligns with at least one persona's needs

- [ ] **Check roadmap.md** - Understand feature priority and timeline
  - File: `product/roadmap.md` 
  - Verify: Feature is on current roadmap

---

## Phase 1: Architecture & Setup

### Database Schema Design
- [ ] **Add scroll_position column to reading_progress**
  - Create: `database/migrations/014_add_scroll_position_to_reading_progress.sql`
  - Add: `scroll_position INTEGER` column to reading_progress table
  - Add: Index on (user_id, series_id, chapter_id) for query performance
  - Verify: Migration is idempotent (uses IF NOT EXISTS)

### Type Definitions
- [ ] **Update ProgressData schema**
  - File: `src/model/schemas/extension.ts`
  - Add: `scroll_position?: number` field
  - Verify: TypeScript strict mode compliance

- [ ] **Update Supabase types**
  - File: `src/lib/supabase.ts`
  - Add: `scroll_position` to reading_progress Row/Insert/Update types
  - Verify: Matches database schema

### Utility Libraries
- [ ] **Create scrollValidation utility**
  - Create: `src/lib/scrollValidation.ts`
  - Implement: `isValidPosition(position: number, pageHeight: number): boolean`
  - Implement: `clampPosition(position: number, pageHeight: number): number`
  - Implement: `calculateScrollPercentage(pixels: number, pageHeight: number): number`
  - Verify: Pure functions with no side effects

- [ ] **Create scroll restoration hook**
  - Create: `src/hooks/useScrollRestoration.ts`
  - Implement: Hook signature and error handling
  - Verify: Follows React hooks best practices

---

## Task Dependencies Legend

**Blocking Dependencies**: Tasks that must complete before others can start
- ✅ Product docs (spec, acceptance-criteria, test-scenarios) → All implementation tasks
- ✅ Database schema → API integration
- ✅ Type definitions → Components → Tests
- ✅ Core implementation → Testing

**Parallel Tasks**: Can be done simultaneously
- 🔄 Type definitions + Utility functions
- 🔄 Database migration + Hook creation

---

## Verification Commands (Copy-Paste Ready)

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Format code
npm run format

# Build project
npm run build

# Start dev server
npm run dev

# Supabase migrations
supabase db push
```

---

## Notes Section

**Implementation Notes**:
- Scroll position stored as pixel offset (not percentage) for accuracy
- Use document.readyState === 'complete' to detect page load
- Debounce scroll tracking at 500ms (from Story 4.1)
- Visual feedback via CSS animation (pulse effect)

**Questions & Clarifications**:
- Should scroll position be stored as pixels or percentage? → Pixels for accuracy
- What's the timeout for scroll restoration? → 1 second max

**Time Estimates**:
- Phase 1 (Setup): ~2 hours
- Phase 2 (Database): ~1 hour
- Phase 3 (Implementation): ~4 hours
- Phase 4 (Testing): ~3 hours
- **Total Estimate**: ~10 hours

---

## References

- **Spec**: `product/features/automatic-scroll-restoration-to-last-position/spec.md` 
- **Acceptance Criteria**: `product/features/automatic-scroll-restoration-to-last-position/acceptance-criteria.md` 
- **Test Scenarios**: `product/features/automatic-scroll-restoration-to-last-position/test-scenarios.md` 
- **Risks**: `product/features/automatic-scroll-restoration-to-last-position/risks.md` 
- **Feature Status**: `product/FEATURE_STATUS.json` 
- **Story 4.1**: Content Script for DOM monitoring
- **Story 4.3**: Realtime Subscriptions for cross-device sync
- **AI Constitution**: `docs/AI_CONSTITUTION.md`
