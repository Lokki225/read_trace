# Implementation Tasks: Phase 4 - Testing, Validation & Documentation

> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done

---

## Phase 4: Testing & Validation

### Unit Tests

- [ ] **Test scrollValidation utility**
  - Create: `tests/unit/scrollValidation.test.ts`
  - Test: `isValidPosition()` with valid/invalid positions
  - Test: `clampPosition()` with edge cases (0, negative, exceeds max)
  - Test: `calculateScrollPercentage()` with various heights
  - Verify: All edge cases covered (8+ tests)
  - Verify: 100% code coverage

- [ ] **Test useScrollRestoration hook**
  - Create: `tests/unit/useScrollRestoration.test.ts`
  - Test: Hook fetches scroll position on mount
  - Test: Hook waits for page load completion
  - Test: Hook validates position before restoring
  - Test: Hook handles missing data gracefully
  - Test: Hook respects 1-second timeout
  - Test: Hook cleans up on unmount
  - Verify: All acceptance criteria covered (15+ tests)
  - Verify: 90%+ code coverage

### Integration Tests

- [ ] **Test scroll restoration flow**
  - Create: `tests/integration/scroll-restoration.integration.test.ts`
  - Test: Resume → page load → scroll restoration
  - Test: Different page heights and content
  - Test: Timing validation (within 1 second)
  - Test: Visual feedback animation
  - Test: Invalid position fallback
  - Verify: All scenarios covered (10+ tests)
  - Verify: No regressions in existing tests

### Acceptance Testing

- [ ] **Verify all acceptance criteria**
  - Reference: `acceptance-criteria.md`
  - Verify: AC-1 - Automatic scroll to last position ✓
  - Verify: AC-2 - Scroll restoration timing ✓
  - Verify: AC-3 - Page load completion ✓
  - Verify: AC-4 - Scroll position accuracy ✓
  - Verify: AC-5 - Invalid position handling ✓
  - Verify: AC-6 - Visual feedback ✓

- [ ] **Verify all test scenarios**
  - Reference: `test-scenarios.md`
  - Verify: All unit test scenarios pass
  - Verify: All integration test scenarios pass
  - Verify: All E2E test scenarios pass

---

## Phase 5: Documentation & Cleanup

### Code Documentation

- [ ] **Document scrollValidation functions**
  - Add: JSDoc comments to all functions
  - Add: Parameter descriptions and return types
  - Add: Usage examples for complex functions

- [ ] **Document useScrollRestoration hook**
  - Add: Hook purpose and usage
  - Add: Parameter descriptions
  - Add: Return value documentation
  - Add: Example usage in component

### Feature Documentation

- [ ] **Update FEATURE_STATUS.json**
  - File: `product/FEATURE_STATUS.json`
  - Update: Feature state from SPECIFIED → IMPLEMENTED
  - Update: completionPercentage to 100
  - Update: lastModified to current date

### Code Quality

- [ ] **Run linter**
  - Command: `npm run lint`
  - Verify: No errors or warnings

- [ ] **Run formatter**
  - Command: `npm run format`
  - Verify: All files formatted

- [ ] **Run tests**
  - Command: `npm run test`
  - Verify: All tests pass (33+ new tests)
  - Verify: Coverage ≥90%

---

## Phase 6: Verification & Confidence Scoring

### Verification Checklist

- [ ] **Verify spec alignment**
  - Reference: `spec.md`
  - Verify: All goals achieved
  - Verify: Non-goals respected

- [ ] **Verify acceptance criteria**
  - Reference: `acceptance-criteria.md`
  - Verify: All 6 criteria met

- [ ] **Verify test coverage**
  - Reference: `test-scenarios.md`
  - Verify: All scenarios tested

- [ ] **Verify risk mitigation**
  - Reference: `risks.md`
  - Verify: Mitigation strategies implemented

### Confidence Score Update

- [ ] **Update IMPLEMENTATION_STATUS.json**
  - File: `IMPLEMENTATION_STATUS.json`
  - Update: confidenceScore based on evidence
  - Update: Individual pillars (functionality, performance, security, etc.)
  - Verify: No pillar <75, global ≥90 for production

### Feature State Transition

- [ ] **Update FEATURE_STATUS.json to VERIFIED**
  - File: `product/FEATURE_STATUS.json`
  - Update: Feature state → VERIFIED
  - Update: verificationDate to current date
  - Verify: Feature ready for SHIPPED state

---

## Phase 7: Deployment Preparation

### Pre-Deployment Checklist

- [ ] **Run migration**
  - Command: `supabase db push`
  - Verify: Migration applied successfully

- [ ] **Update environment variables**
  - Verify: All required env vars set (.env.local)

- [ ] **Build production**
  - Command: `npm run build`
  - Verify: Build succeeds, no errors

### Final Validation

- [ ] **Manual testing**
  - Verify: Feature works in production build
  - Verify: All edge cases handled

- [ ] **Performance testing**
  - Verify: Scroll restoration within 1 second
  - Verify: No memory leaks
  - Verify: No performance regressions

- [ ] **Security review**
  - Verify: No sensitive data exposed
  - Verify: RLS policies enforced
  - Verify: Input validation in place

---

## Rollback Plan (If Issues Arise)

### Rollback Steps

1. [ ] **Revert code changes**
   - Command: `git revert <commit-hash>`

2. [ ] **Rollback migration**
   - Command: `supabase db reset`

3. [ ] **Update FEATURE_STATUS.json**
   - Document: Reason for rollback in `issues` field

4. [ ] **Create incident report**
   - File: `product/features/automatic-scroll-restoration-to-last-position/incident-<date>.md`
   - Document: What went wrong, why, how to prevent

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
```

---

## Notes Section

**Implementation Notes**:
- Scroll position stored as pixel offset (not percentage)
- Use document.readyState === 'complete' for page load detection
- Debounce scroll tracking at 500ms (from Story 4.1)
- Visual feedback via CSS pulse animation
- Timeout set to 1 second max for scroll restoration

**Questions & Clarifications**:
- Should scroll position be stored as pixels or percentage? → Pixels for accuracy
- What's the timeout for scroll restoration? → 1 second max
- How should invalid positions be handled? → Scroll to chapter start

**Time Estimates**:
- Phase 1 (Setup): ~2 hours
- Phase 2 (Database): ~1 hour
- Phase 3 (Implementation): ~4 hours
- Phase 4 (Testing): ~3 hours
- Phase 5 (Documentation): ~1 hour
- Phase 6 (Verification): ~1 hour
- Phase 7 (Deployment): ~1 hour
- **Total Estimate**: ~13 hours

---

## References

- **Spec**: `product/features/automatic-scroll-restoration-to-last-position/spec.md`
- **Acceptance Criteria**: `product/features/automatic-scroll-restoration-to-last-position/acceptance-criteria.md`
- **Test Scenarios**: `product/features/automatic-scroll-restoration-to-last-position/test-scenarios.md`
- **Risks**: `product/features/automatic-scroll-restoration-to-last-position/risks.md`
- **Feature Status**: `product/FEATURE_STATUS.json`
- **Story 4.1**: Content Script for DOM monitoring
- **Story 4.3**: Realtime Subscriptions for cross-device sync
- **Story 5.1**: Resume Button on Series Cards
- **AI Constitution**: `docs/AI_CONSTITUTION.md`
