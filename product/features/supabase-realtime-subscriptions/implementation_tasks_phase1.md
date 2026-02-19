# Implementation Tasks - Phase 1: Architecture & Setup

> **Purpose**: Break down feature implementation into granular, trackable tasks for AI agents and developers.
> **Usage**: Update task statuses as you progress.
> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done
> **Tech Stack**: Next.js 14+, TypeScript, React, Supabase, TailwindCSS

---

## Pre-Implementation Checklist

### Product Requirements Validation
- [ ] **Read spec.md** - Understand feature requirements and user flows
  - File: `product/features/supabase-realtime-subscriptions/spec.md` 
  - Verify: All goals, non-goals, and constraints are clear
  
- [ ] **Read acceptance-criteria.md** - Understand success criteria
  - File: `product/features/supabase-realtime-subscriptions/acceptance-criteria.md` 
  - Verify: All requirements have clear testable behaviors
  
- [ ] **Read test-scenarios.md** - Understand testing requirements
  - File: `product/features/supabase-realtime-subscriptions/test-scenarios.md` 
  - Verify: Test scenarios cover all acceptance criteria
  
- [ ] **Read risks.md** - Understand potential issues
  - File: `product/features/supabase-realtime-subscriptions/risks.md` 
  - Verify: Mitigation strategies are documented

- [ ] **Check FEATURE_STATUS.json** - Verify feature is in SPECIFIED state
  - File: `product/FEATURE_STATUS.json` 
  - Verify: Feature state = "SPECIFIED" before coding

- [ ] **Check personas.md** - Verify feature serves target personas
  - File: `product/personas.md` 
  - Verify: Feature aligns with multi-device reader personas

- [ ] **Check roadmap.md** - Understand feature priority and timeline
  - File: `product/roadmap.md` 
  - Verify: Feature is on current roadmap

---

## Phase 1: Architecture & Setup

### Project Structure Setup
- [ ] **Create feature directory** - Organize feature files
  - Create: `src/backend/services/realtime/` 
  - Create: `src/hooks/` (for useRealtimeProgress)
  - Create: `src/extension/` (for extension integration)
  - Verify: Folder structure follows feature-based organization

### Type Definitions
- [ ] **Create TypeScript types** - Type safety
  - Create: `src/backend/services/realtime/types.ts` 
  - Include: RealtimePayload, ProgressUpdate, ConflictResolution types
  - Include: Subscription management types
  - Verify: Strict TypeScript mode enabled
  
- [ ] **Create API types** - Request/response contracts
  - Create: `src/model/schemas/realtime.ts` 
  - Include: Realtime event types, subscription types
  - Verify: Matches Supabase schema

### Utility Libraries
- [ ] **Create Realtime service** - Subscription management
  - Create: `src/backend/services/realtime/realtimeService.ts` 
  - Verify: Handles subscription lifecycle
  
- [ ] **Create conflict resolver** - Conflict handling
  - Create: `src/backend/services/realtime/conflictResolver.ts` 
  - Verify: Implements last-write-wins strategy

- [ ] **Create React hook** - Dashboard integration
  - Create: `src/hooks/useRealtimeProgress.ts` 
  - Verify: Single responsibility, reusable

### Database Setup
- [ ] **Create migration file** - Database schema updates
  - Create: `database/migrations/012_realtime_setup.sql` 
  - Include: Triggers for update broadcasting
  - Include: Indexes for performance
  - Verify: Idempotent (uses IF NOT EXISTS)

- [ ] **Create RLS policies** - Access control
  - Verify: Policies enforce user_id matching
  - Verify: Policies are tested before deployment

---

## Task Dependencies Legend

**Blocking Dependencies**: Tasks that must complete before others can start
- ✅ Product docs (spec, acceptance-criteria, test-scenarios) → All implementation tasks
- ✅ Type definitions → Services → Hooks
- ✅ Database schema → API integration
- ✅ Realtime service → Hook integration
- ✅ Conflict resolver → Service integration

**Parallel Tasks**: Can be done simultaneously
- 🔄 Type definitions + Database setup
- 🔄 Realtime service + Conflict resolver
- 🔄 Hook creation (different hooks)

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

# Deploy Edge Function
supabase functions deploy <function-name>
```

---

## Notes Section

**Implementation Notes**:
- Realtime subscriptions use Supabase's PostgreSQL LISTEN/NOTIFY mechanism
- Last-write-wins conflict resolution based on updated_at timestamp
- Optimistic updates provide immediate UI feedback while server reconciles
- Extension integration via existing message-passing pattern

**Questions & Clarifications**:
- Confirm Supabase Realtime is enabled on project
- Confirm PostgreSQL version supports LISTEN/NOTIFY
- Confirm RLS policies are properly configured

**Time Estimates**:
- Phase 1 (Setup): ~2 hours
- Phase 2 (Database): ~2 hours
- Phase 3 (Implementation): ~8 hours
- Phase 4 (Testing): ~6 hours
- **Total Estimate**: ~18 hours

---

## References

- **Spec**: `product/features/supabase-realtime-subscriptions/spec.md` 
- **Acceptance Criteria**: `product/features/supabase-realtime-subscriptions/acceptance-criteria.md` 
- **Test Scenarios**: `product/features/supabase-realtime-subscriptions/test-scenarios.md` 
- **Risks**: `product/features/supabase-realtime-subscriptions/risks.md` 
- **Feature Status**: `product/FEATURE_STATUS.json` 
- **Supabase Realtime**: https://supabase.com/docs/guides/realtime
- **AI Constitution**: `docs/AI_CONSTITUTION.md` 
