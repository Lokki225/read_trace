# Implementation Tasks - Phase 3: Core Implementation

> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done

---

## Phase 3: Core Implementation

### Extension Platform Detection
- [ ] **Update extension content.ts** - Track platform
  - Modify: `src/extension/content.ts` 
  - Use: Adapter registry to detect current platform
  - Include: platform in progress updates sent to background script
  - Verify: Works with MangaDex and Webtoon adapters
  
- [ ] **Test extension platform detection** - Unit tests
  - Modify: `tests/unit/extension/content.test.ts` 
  - Test: Platform detection on MangaDex
  - Test: Platform detection on Webtoon
  - Test: Fallback when adapter not found
  - Verify: Tests passing

### ResumeButton Component Enhancement
- [ ] **Update ResumeButton component** - Add platform awareness
  - Modify: `src/components/dashboard/ResumeButton.tsx` 
  - Add: Platform indicator badge showing current platform
  - Add: Dropdown to select alternative platforms
  - Add: Platform selection logic using platformPreference
  - Verify: Responsive design on mobile and desktop
  
- [ ] **Create platform indicator component** - Reusable badge
  - Create: `src/components/dashboard/PlatformBadge.tsx` 
  - Display: Platform name with appropriate styling
  - Include: Tooltip with platform details
  - Verify: Accessible with ARIA labels

### SeriesCard Updates
- [ ] **Update SeriesCard component** - Display platform info
  - Modify: `src/components/dashboard/SeriesCard.tsx` 
  - Add: Platform badge display
  - Add: Platform indicator in progress section
  - Verify: Doesn't break existing layout

### Dashboard Integration
- [ ] **Test dashboard with unified state** - Integration tests
  - Create: `tests/integration/dashboard-unified-state.test.ts` 
  - Test: Dashboard displays unified progress
  - Test: Platform badge visible on series cards
  - Test: Resume button shows correct platform
  - Test: Platform dropdown works correctly
  - Verify: 12+ tests passing

### Conflict Resolution Integration
- [ ] **Integrate conflict resolver** - Handle simultaneous updates
  - Verify: unifiedStateService uses conflictResolver from Story 4-3
  - Verify: Last-write-wins strategy with timestamp comparison
  - Verify: Tie-breaking by chapter number
  - Test: Conflict resolution in integration tests

---

## Verification Commands

```bash
# Run component tests
npm run test -- tests/unit/extension/content.test.ts
npm run test -- tests/unit/ResumeButton.test.tsx

# Run integration tests
npm run test -- tests/integration/dashboard-unified-state.test.ts

# Run all tests
npm run test

# Check coverage
npm run test -- --coverage
```

---

## Notes Section

**Implementation Notes**:
- Ensure platform badge styling matches brand colors
- Test platform dropdown on mobile devices
- Verify resume navigation works with platform selection

**Questions & Clarifications**:
- Should platform selection be remembered across sessions?
- What should happen if selected platform has no progress?

**Time Estimates**:
- Phase 3 (Core Implementation): ~4 hours

---

## References

- **Spec**: `product/features/unified-reading-state-across-platforms/spec.md` 
- **Story 5-1**: Resume Button reference
- **Story 4-4**: Platform Adapter reference
- **Story 4-3**: Conflict Resolver reference
