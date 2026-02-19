# Implementation Tasks - Phase 1: Architecture & Setup

> **Purpose**: Break down feature implementation into granular, trackable tasks for AI agents and developers.
> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done
> **Tech Stack**: Next.js 14+, TypeScript, React, Supabase, TailwindCSS

---

## Pre-Implementation Checklist

### Product Requirements Validation
- [ ] **Read spec.md** - Understand feature requirements and user flows
  - File: `product/features/unified-reading-state-across-platforms/spec.md` 
  - Verify: All goals, non-goals, and constraints are clear
  
- [ ] **Read acceptance-criteria.md** - Understand success criteria
  - File: `product/features/unified-reading-state-across-platforms/acceptance-criteria.md` 
  - Verify: All requirements have clear testable behaviors
  
- [ ] **Read test-scenarios.md** - Understand testing requirements
  - File: `product/features/unified-reading-state-across-platforms/test-scenarios.md` 
  - Verify: Test scenarios cover all acceptance criteria
  
- [ ] **Read risks.md** - Understand potential issues
  - File: `product/features/unified-reading-state-across-platforms/risks.md` 
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

### Type Definitions
- [ ] **Create TypeScript types** - Type safety
  - Create: `src/model/schemas/unifiedState.ts` 
  - Include: UnifiedProgress, PlatformProgress, AlternativeProgress types
  - Verify: Strict TypeScript mode enabled
  
- [ ] **Update extension types** - Add platform field
  - Modify: `src/model/schemas/extension.ts` 
  - Add: platform: string to ProgressData interface
  - Verify: Backward compatible with existing code

### Database Schema
- [ ] **Create migration file**
  - Create: `database/migrations/014_add_platform_to_reading_progress.sql` 
  - Add: platform VARCHAR(50) NOT NULL column to reading_progress
  - Add: Index on (series_id, updated_at) for query performance
  - Verify: Migration is idempotent (uses IF NOT EXISTS)

### Utility Libraries
- [ ] **Create unifiedStateService** - Business logic for state resolution
  - Create: `src/backend/services/dashboard/unifiedStateService.ts` 
  - Implement: getUnifiedProgress(series_id, user_id) function
  - Verify: Pure function, no side effects
  
- [ ] **Create platformPreference utility** - Resume URL selection logic
  - Create: `src/lib/platformPreference.ts` 
  - Implement: selectResumeUrl(series_id, platforms, preferences) function
  - Verify: Handles fallback and manual override

### Database Type Updates
- [ ] **Update Supabase types** - Add platform to reading_progress
  - Modify: `src/lib/supabase.ts` 
  - Add: platform field to reading_progress Row/Insert/Update types
  - Verify: Matches database schema

---

## Task Dependencies Legend

**Blocking Dependencies**: Tasks that must complete before others can start
- ✅ Product docs (spec, acceptance-criteria, test-scenarios) → All implementation tasks
- ✅ Type definitions → Services → Components
- ✅ Database schema → API integration
- ✅ Core implementation → Testing

**Parallel Tasks**: Can be done simultaneously
- 🔄 Type definitions + Database migration
- 🔄 unifiedStateService + platformPreference utility
- 🔄 Database updates + Schema validation

---

## Verification Commands (Copy-Paste Ready)

```bash
# Check TypeScript compilation
npm run build

# Run linter
npm run lint

# Run type checking
npx tsc --noEmit

# Check database migration syntax
cat database/migrations/014_add_platform_to_reading_progress.sql
```

---

## Notes Section

**Implementation Notes**:
- Platform field should use adapter registry identifiers (e.g., 'mangadex', 'webtoon')
- Ensure backward compatibility with existing progress entries
- Consider adding default platform value for legacy entries

**Questions & Clarifications**:
- Should legacy entries without platform be migrated or left as NULL?
- What is the maximum length for platform identifiers?

**Time Estimates**:
- Phase 1 (Setup): ~2 hours

---

## References

- **Spec**: `product/features/unified-reading-state-across-platforms/spec.md` 
- **Acceptance Criteria**: `product/features/unified-reading-state-across-platforms/acceptance-criteria.md` 
- **Test Scenarios**: `product/features/unified-reading-state-across-platforms/test-scenarios.md` 
- **Risks**: `product/features/unified-reading-state-across-platforms/risks.md` 
- **Feature Status**: `product/FEATURE_STATUS.json` 
- **AI Constitution**: `docs/AI_CONSTITUTION.md`
