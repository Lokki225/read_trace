# Implementation Tasks Template

> **Purpose**: Break down feature implementation into granular, trackable tasks for AI agents and developers.
> **Usage**: Copy this template when starting a new feature. Update task statuses as you progress.
> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done
> **Tech Stack**: Next.js 14+, TypeScript, React, Supabase, TailwindCSS

---

## Pre-Implementation Checklist

### Product Requirements Validation
- [ ] **Read spec.md** - Understand feature requirements and user flows
  - File: `product/features/<feature-name>/spec.md` 
  - Verify: All goals, non-goals, and constraints are clear
  
- [ ] **Read acceptance-criteria.md** - Understand success criteria
  - File: `product/features/<feature-name>/acceptance-criteria.md` 
  - Verify: All requirements have clear testable behaviors
  
- [ ] **Read test-scenarios.md** - Understand testing requirements
  - File: `product/features/<feature-name>/test-scenarios.md` 
  - Verify: Test scenarios cover all acceptance criteria
  
- [ ] **Read risks.md** - Understand potential issues
  - File: `product/features/<feature-name>/risks.md` 
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

### Project Structure Setup
- [ ] **Create feature directory** - Organize feature files
  - Create: `src/features/<feature-name>/` 
  - Create: `src/features/<feature-name>/components/` 
  - Create: `src/features/<feature-name>/hooks/` 
  - Create: `src/features/<feature-name>/lib/` 
  - Create: `src/features/<feature-name>/types/` 
  - Verify: Folder structure follows feature-based organization

### Type Definitions
- [ ] **Create TypeScript types** - Type safety
  - Create: `src/features/<feature-name>/types/index.ts` 
  - Include: All domain models, API contracts, UI props
  - Verify: Strict TypeScript mode enabled
  
- [ ] **Create API types** - Request/response contracts
  - Create: `src/features/<feature-name>/types/api.ts` 
  - Include: Request/response DTOs, error types
  - Verify: Matches Supabase schema

### Utility Libraries
- [ ] **Create helper functions** - Business logic utilities
  - Create: `src/features/<feature-name>/lib/helpers.ts` 
  - Verify: Pure functions, well-tested
  
- [ ] **Create hooks** - React custom hooks
  - Create: `src/features/<feature-name>/hooks/use<Feature>.ts` 
  - Verify: Single responsibility, reusable

---

## Phase 2: Database & Backend Integration

### Supabase Database Schema
- [ ] **Create migration file**
  - Create: `supabase/migrations/<timestamp>_<feature_name>.sql` 
  - Naming: Use timestamp + descriptive name
  - Verify: Includes tables, indexes, RLS policies
  
- [ ] **Define tables** - Database structure
  - Include: Primary keys, foreign keys, constraints
  - Include: created_at, updated_at timestamps
  - Verify: Follows naming conventions (snake_case)
  
- [ ] **Define Row Level Security (RLS)** - Access control
  - Include: SELECT, INSERT, UPDATE, DELETE policies
  - Verify: Policies enforce authentication and authorization
  
- [ ] **Create database indexes** - Performance optimization
  - Include: Frequently queried columns
  - Verify: No over-indexing

### Supabase Edge Functions (if needed)
- [ ] **Create Edge Function**
  - Create: `supabase/functions/<function-name>/index.ts` 
  - Verify: Handles authentication, validation, error handling
  
- [ ] **Test Edge Function locally**
  - Command: `supabase functions serve <function-name>` 
  - Verify: Returns expected responses

### API Integration
- [ ] **Create API client** - Supabase integration
  - Create: `src/features/<feature-name>/lib/api.ts` 
  - Verify: Type-safe queries, error handling
  
- [ ] **Implement data fetching** - Server/client components
  - Verify: Use Next.js server components where possible
  - Verify: Error handling, loading states
  
- [ ] **Test API integration** - Connectivity
  - Verify: Can fetch/post data successfully

---

## Phase 3: Core Implementation

### Business Logic Implementation
- [ ] **Implement utility functions** - Domain operations
  - Verify: Each function has single responsibility
  - Verify: Pure functions, no side effects
  
- [ ] **Implement data transformations** - Data mapping
  - Verify: API responses → UI models
  - Verify: Form inputs → API requests

### React Components Implementation
- [ ] **Create page components** - Next.js pages
  - Create: `src/app/features/<feature-name>/page.tsx` 
  - Verify: Follows Next.js App Router conventions
  - Verify: Server/client component split
  
- [ ] **Create UI components** - Reusable components
  - Create: `src/features/<feature-name>/components/<Component>.tsx` 
  - Verify: Props typed, documented
  - Verify: Accessibility (a11y) compliant
  
- [ ] **Create forms** - User input (if applicable)
  - Verify: Validation, error messages
  - Verify: Accessible form controls

### State Management
- [ ] **Implement React hooks** - Local state
  - Verify: useState, useEffect properly used
  - Verify: No unnecessary re-renders
  
- [ ] **Implement custom hooks** - Shared logic
  - Create: `src/features/<feature-name>/hooks/use*.ts` 
  - Verify: Single responsibility
  
- [ ] **Implement context** - Global state (if needed)
  - Verify: Minimal context, avoid prop drilling
  - Verify: Memoization for performance

### Error Handling
- [ ] **Implement error boundaries** - React error handling
  - Verify: Graceful error UI
  - Verify: Error logging
  
- [ ] **Implement error messages** - User feedback
  - Verify: Clear, actionable messages
  - Verify: Internationalization ready (i18n)

---

## Phase 4: Testing & Validation

### Unit Tests
- [ ] **Test utility functions** - Business logic
  - Create: `tests/unit/features/<feature-name>/lib/*.test.ts` 
  - Verify: Edge cases, error handling
  
- [ ] **Test hooks** - React hooks
  - Create: `tests/unit/features/<feature-name>/hooks/*.test.ts` 
  - Verify: Mock dependencies, test state changes

### Component Tests
- [ ] **Test components** - React component behavior
  - Create: `tests/unit/features/<feature-name>/components/*.test.tsx` 
  - Verify: Renders correctly, props work
  - Verify: User interactions work
  
- [ ] **Test forms** - Form validation and submission
  - Verify: Validation works
  - Verify: Submit handlers called

### Integration Tests
- [ ] **Test user flows** - End-to-end scenarios
  - Create: `tests/integration/<feature-name>.test.ts` 
  - Verify: User can complete full flow from spec.md
  
- [ ] **Test Supabase integration** - Database connectivity
  - Verify: Can read/write data
  - Verify: RLS policies enforce access control

### E2E Tests (if applicable)
- [ ] **Test with Playwright** - Full user journeys
  - Create: `tests/e2e/<feature-name>.spec.ts` 
  - Verify: Critical user paths work end-to-end

### Acceptance Testing
- [ ] **Verify all acceptance criteria** - Checklist
  - Reference: `acceptance-criteria.md` 
  - Verify: All checkboxes can be marked complete
  
- [ ] **Verify all test scenarios** - Test coverage
  - Reference: `test-scenarios.md` 
  - Verify: All scenarios pass

---

## Phase 5: Documentation & Cleanup

### Code Documentation
- [ ] **Document components** - JSDoc comments
  - Verify: All exported components documented
  - Verify: Props documented with types
  
- [ ] **Document functions** - Function documentation
  - Verify: Purpose, parameters, return values documented
  - Verify: Examples provided for complex functions

### Feature Documentation
- [ ] **Update feature decisions** - Architecture decisions
  - File: `product/features/<feature-name>/decisions.md` (create if needed)
  - Document: Major architectural choices, tradeoffs
  
- [ ] **Update FEATURE_STATUS.json** - State transition
  - File: `product/FEATURE_STATUS.json` 
  - Update: Feature state from SPECIFIED → IMPLEMENTED
  - Update: completionPercentage, lastModified

### Code Quality
- [ ] **Run linter** - Code style
  - Command: `npm run lint` 
  - Verify: No errors or warnings
  
- [ ] **Run formatter** - Code formatting
  - Command: `npm run format` 
  - Verify: All files formatted
  
- [ ] **Run tests** - Test suite
  - Command: `npm run test` 
  - Verify: All tests pass, coverage ≥90%

---

## Phase 6: Verification & Confidence Scoring

### Verification Checklist
- [ ] **Verify spec alignment** - Requirements met
  - Reference: `spec.md` 
  - Verify: All goals achieved, non-goals respected
  
- [ ] **Verify acceptance criteria** - Quality met
  - Reference: `acceptance-criteria.md` 
  - Verify: All criteria met
  
- [ ] **Verify test coverage** - Testing complete
  - Reference: `test-scenarios.md` 
  - Verify: All scenarios tested
  
- [ ] **Verify risk mitigation** - Risks addressed
  - Reference: `risks.md` 
  - Verify: Mitigation strategies implemented

### Confidence Score Update
- [ ] **Update IMPLEMENTATION_STATUS.json** - Global confidence
  - File: `IMPLEMENTATION_STATUS.json` 
  - Update: confidenceScore based on evidence
  - Update: Individual pillars (functionality, performance, security, etc.)
  - Verify: No pillar <75, global ≥90 for production

### Feature State Transition
- [ ] **Update FEATURE_STATUS.json** - Mark as VERIFIED
  - File: `product/FEATURE_STATUS.json` 
  - Update: Feature state → VERIFIED (if all tests pass)
  - Update: verificationDate
  - Verify: Feature ready for SHIPPED state

---

## Phase 7: Deployment Preparation

### Pre-Deployment Checklist
- [ ] **Run migration** - Database updates
  - Command: `supabase db push` 
  - Verify: Migration applied successfully
  
- [ ] **Deploy Edge Functions** - Serverless functions
  - Command: `supabase functions deploy <function-name>` 
  - Verify: Function deployed, accessible
  
- [ ] **Update environment variables** - Configuration
  - Verify: All required env vars set (.env.local)
  
- [ ] **Build production** - Production build
  - Command: `npm run build` 
  - Verify: Build succeeds, no errors

### Final Validation
- [ ] **Manual testing** - QA pass
  - Verify: Feature works in production build
  - Verify: All edge cases handled
  
- [ ] **Performance testing** - Production-like conditions
  - Verify: Meets performance criteria under load
  - Verify: Core Web Vitals acceptable
  
- [ ] **Security review** - Vulnerability check
  - Verify: No sensitive data exposed
  - Verify: RLS policies enforced
  - Verify: Input validation in place

---

## Rollback Plan (If Issues Arise)

### Rollback Steps
1. [ ] **Revert code changes** - Git rollback
   - Command: `git revert <commit-hash>` 
   
2. [ ] **Rollback migration** - Database rollback (if needed)
   - Command: `supabase db reset` 
   
3. [ ] **Update FEATURE_STATUS.json** - Mark as FAILED or BLOCKED
   - Document: Reason for rollback in `issues` field

4. [ ] **Create incident report** - Post-mortem
   - File: `product/features/<feature-name>/incident-<date>.md` 
   - Document: What went wrong, why, how to prevent

---

## Task Dependencies Legend

**Blocking Dependencies**: Tasks that must complete before others can start
- ✅ Product docs (spec, acceptance-criteria, test-scenarios) → All implementation tasks
- ✅ Type definitions → Components → Tests
- ✅ Database schema → API integration
- ✅ Core implementation → Testing
- ✅ Testing → Documentation
- ✅ Documentation → Deployment

**Parallel Tasks**: Can be done simultaneously
- 🔄 Type definitions + Utility functions
- 🔄 Component creation (different components)
- 🔄 Unit tests for different modules
- 🔄 Integration tests + E2E tests

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

# Run E2E tests
npm run test:e2e

# Supabase migrations
supabase db push

# Deploy Edge Function
supabase functions deploy <function-name>
```

---

## Notes Section

**Implementation Notes**:
- [Add any important notes, decisions, or context here]
- [Document any deviations from the plan and why]
- [Record any blockers and how they were resolved]

**Questions & Clarifications**:
- [List any questions that arose during implementation]
- [Document answers and decisions made]

**Time Estimates**:
- Phase 1 (Setup): ~X hours
- Phase 2 (Database): ~X hours
- Phase 3 (Implementation): ~X hours
- Phase 4 (Testing): ~X hours
- Phase 5 (Documentation): ~X hours
- Phase 6 (Verification): ~X hours
- Phase 7 (Deployment): ~X hours
- **Total Estimate**: ~X hours

---

## References

- **Spec**: `product/features/<feature-name>/spec.md` 
- **Acceptance Criteria**: `product/features/<feature-name>/acceptance-criteria.md` 
- **Test Scenarios**: `product/features/<feature-name>/test-scenarios.md` 
- **Risks**: `product/features/<feature-name>/risks.md` 
- **Feature Status**: `product/FEATURE_STATUS.json` 
- **Implementation Status**: `IMPLEMENTATION_STATUS.json` 
- **Personas**: `product/personas.md` 
- **Roadmap**: `product/roadmap.md` 
- **Architecture**: `docs/architecture.md` 
- **AI Constitution**: `docs/AI_CONSTITUTION.md` 
