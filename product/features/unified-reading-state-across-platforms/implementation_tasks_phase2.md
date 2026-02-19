# Implementation Tasks - Phase 2: Database & Backend Integration

> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done

---

## Phase 2: Database & Backend Integration

### Supabase Database Schema
- [ ] **Apply migration**
  - Command: `supabase db push` 
  - Verify: Migration applied successfully to local database
  - Verify: New platform column exists in reading_progress table
  
- [ ] **Create database indexes** - Performance optimization
  - Verify: Index on (series_id, updated_at) created
  - Verify: Index on (user_id, series_id) for user queries
  - Test: Query performance improved

### Backend Service Implementation
- [ ] **Implement unifiedStateService** - Core business logic
  - Create: `src/backend/services/dashboard/unifiedStateService.ts` 
  - Implement: getUnifiedProgress(series_id, user_id) function
  - Implement: Helper functions for timestamp comparison and tie-breaking
  - Verify: Handles null/undefined values gracefully
  - Verify: Returns alternatives array with all platforms
  
- [ ] **Test unifiedStateService** - Unit tests
  - Create: `tests/unit/unifiedStateService.test.ts` 
  - Test: Single platform progress
  - Test: Multiple platforms - select most recent
  - Test: Identical timestamps - tie-break by chapter
  - Test: No progress available
  - Test: Include alternatives in response
  - Verify: 12+ tests passing

### Platform Preference Service
- [ ] **Implement platformPreference utility** - Resume URL selection
  - Create: `src/lib/platformPreference.ts` 
  - Implement: selectResumeUrl(series_id, platforms, preferences) function
  - Implement: Preference loading from user_profiles
  - Implement: Fallback logic when preferred platform unavailable
  - Verify: Handles manual override parameter
  
- [ ] **Test platformPreference** - Unit tests
  - Create: `tests/unit/platformPreference.test.ts` 
  - Test: Preferred platform available
  - Test: Preferred platform not available - fallback
  - Test: Manual override
  - Test: No preference set
  - Test: Multiple preferred platforms
  - Verify: 10+ tests passing

### seriesQueryService Integration
- [ ] **Update seriesQueryService** - Use unified state
  - Modify: `src/backend/services/dashboard/seriesQueryService.ts` 
  - Call: unifiedStateService.getUnifiedProgress() for each series
  - Include: platform in returned UserSeries data
  - Include: alternatives array in response
  - Verify: Backward compatible with existing queries
  
- [ ] **Test seriesQueryService integration** - Integration tests
  - Create: `tests/integration/unified-state.integration.test.ts` 
  - Test: Full flow: read on Site A → read on Site B → check progress
  - Test: Dashboard reflects unified state
  - Test: Platform preference resolution
  - Test: Conflict scenarios
  - Verify: 12+ tests passing

---

## Verification Commands

```bash
# Apply database migration
supabase db push

# Run backend service tests
npm run test -- tests/unit/unifiedStateService.test.ts
npm run test -- tests/unit/platformPreference.test.ts

# Run integration tests
npm run test -- tests/integration/unified-state.integration.test.ts

# Check test coverage
npm run test -- --coverage
```

---

## Notes Section

**Implementation Notes**:
- Ensure unifiedStateService queries are optimized with indexes
- Consider caching unified state results for 5-10 seconds
- Test with 100+ series to verify performance

**Questions & Clarifications**:
- Should preferences be stored in user_profiles or separate table?
- What is the cache TTL for unified state?

**Time Estimates**:
- Phase 2 (Database & Backend): ~3 hours

---

## References

- **Spec**: `product/features/unified-reading-state-across-platforms/spec.md` 
- **Test Scenarios**: `product/features/unified-reading-state-across-platforms/test-scenarios.md` 
- **Story 4-3**: Conflict resolver reference
- **Story 4-4**: Platform adapter reference
