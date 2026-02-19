# Story 5.3: Unified Reading State Across Platforms

Status: ready-for-dev

## Story

As a user,
I want my reading state to be unified across different scanlation sites,
So that I can resume from any platform.

## Acceptance Criteria

1. **Given** I read the same series on different sites
   **When** I check my reading progress
   **Then** ReadTrace shows the most recent position across all sites

2. **Given** I read on Site A then Site B
   **When** I check my reading progress
   **Then** the progress reflects Site B (most recent)

3. **Given** I am viewing the dashboard
   **When** I look at a series card
   **Then** the dashboard shows the correct current position

4. **Given** I click resume on a series
   **When** I am navigated to a reading site
   **Then** resume navigates to the most appropriate site based on preferences

5. **Given** I want to override site preference
   **When** I interact with the resume button
   **Then** users can override site preference if needed

## Tasks / Subtasks

- [ ] Task 1: Add platform tracking to reading_progress (AC: #1, #2)
  - [ ] Subtask 1.1: Update database/migrations to add platform VARCHAR to reading_progress
  - [ ] Subtask 1.2: Update src/model/schemas/extension.ts with platform: string
  - [ ] Subtask 1.3: Update reading_progress Row/Insert/Update types in src/lib/supabase.ts

- [ ] Task 2: Update extension to track platform (AC: #1, #2)
  - [ ] Subtask 2.1: Modify src/extension/content.ts to detect platform
  - [ ] Subtask 2.2: Use adapter registry to identify current platform
  - [ ] Subtask 2.3: Include platform in progress updates
  - [ ] Subtask 2.4: Test with MangaDex and Webtoon adapters

- [ ] Task 3: Create unified state resolver (AC: #1, #2, #3)
  - [ ] Subtask 3.1: Create src/backend/services/dashboard/unifiedStateService.ts
  - [ ] Subtask 3.2: Implement getUnifiedProgress(series_id) function
  - [ ] Subtask 3.3: Query all reading_progress entries for series across platforms
  - [ ] Subtask 3.4: Select entry with most recent updated_at timestamp
  - [ ] Subtask 3.5: Return unified progress with platform info

- [ ] Task 4: Update seriesQueryService to use unified state (AC: #3)
  - [ ] Subtask 4.1: Modify src/backend/services/dashboard/seriesQueryService.ts
  - [ ] Subtask 4.2: Use unifiedStateService.getUnifiedProgress() for each series
  - [ ] Subtask 4.3: Include platform in returned UserSeries data
  - [ ] Subtask 4.4: Ensure backward compatibility with existing queries

- [ ] Task 5: Implement platform preference resolution (AC: #4, #5)
  - [ ] Subtask 5.1: Create src/lib/platformPreference.ts
  - [ ] Subtask 5.2: Load user's preferred platforms from user_profiles
  - [ ] Subtask 5.3: Implement selectResumeUrl(series_id, platforms) function
  - [ ] Subtask 5.4: Prioritize resume_url from preferred platform if available
  - [ ] Subtask 5.5: Fallback to most recent platform if preferred not available
  - [ ] Subtask 5.6: Allow manual override (pass preferred_platform param)

- [ ] Task 6: Update ResumeButton for platform awareness (AC: #4, #5)
  - [ ] Subtask 6.1: Modify src/components/dashboard/ResumeButton.tsx
  - [ ] Subtask 6.2: Show platform indicator (badge with site name)
  - [ ] Subtask 6.3: Add dropdown to select alternative platforms if available
  - [ ] Subtask 6.4: Pass selected platform to resume navigation

- [ ] Task 7: Add conflict resolution for simultaneous updates (AC: #1, #2)
  - [ ] Subtask 7.1: Use existing conflictResolver from Story 4.3
  - [ ] Subtask 7.2: When multiple platforms have updates at same time, use last-write-wins
  - [ ] Subtask 7.3: Log conflict resolution for debugging

- [ ] Task 8: Add tests for unified state (AC: all)
  - [ ] Subtask 8.1: Create tests/unit/unifiedStateService.test.ts (12+ tests)
  - [ ] Subtask 8.2: Test multi-platform progress selection
  - [ ] Subtask 8.3: Test timestamp-based resolution
  - [ ] Subtask 8.4: Create tests/unit/platformPreference.test.ts (10+ tests)
  - [ ] Subtask 8.5: Test preference resolution and fallback
  - [ ] Subtask 8.6: Test manual override

- [ ] Task 9: Add integration tests (AC: all)
  - [ ] Subtask 9.1: Create tests/integration/unified-state.integration.test.ts
  - [ ] Subtask 9.2: Test full flow: read on Site A → read on Site B → check progress
  - [ ] Subtask 9.3: Test platform preference resolution
  - [ ] Subtask 9.4: Test conflict scenarios

## Dev Notes

### Architecture & Patterns

- **Query Pattern**: unifiedStateService queries reading_progress table with platform filtering
- **Conflict Resolution**: Use existing conflictResolver (Story 4.3) for simultaneous updates
- **Preference Resolution**: platformPreference.ts selects best resume URL based on user preferences
- **Data Flow**: seriesQueryService → unifiedStateService → ResumeButton → platformPreference

### Technical Requirements

- **Database**: Add platform VARCHAR column to reading_progress table
- **Schema**: Update ProgressData with platform: string field
- **Service**: Create unifiedStateService with getUnifiedProgress(series_id) function
- **Preference**: Create platformPreference.ts with selectResumeUrl() function
- **Component**: Update ResumeButton to show platform indicator and allow selection
- **Conflict Resolution**: Use last-write-wins strategy with timestamp comparison

### File Structure Requirements

```
src/
  backend/services/dashboard/
    unifiedStateService.ts    (new)
    seriesQueryService.ts     (modify - use unifiedStateService)
  lib/
    platformPreference.ts     (new)
  components/dashboard/
    ResumeButton.tsx          (modify - add platform indicator)
  model/schemas/
    extension.ts              (modify - add platform)
  lib/
    supabase.ts               (modify - reading_progress type)
database/
  migrations/
    014_add_platform_to_reading_progress.sql (new)
tests/
  unit/
    unifiedStateService.test.ts (new)
    platformPreference.test.ts (new)
  integration/
    unified-state.integration.test.ts (new)
```

### Testing Requirements

- **Unit Tests**: unifiedStateService (12+ tests)
  - Multi-platform progress selection
  - Timestamp-based resolution
  - Edge cases (single platform, no progress)
  - Conflict handling

- **Unit Tests**: platformPreference (10+ tests)
  - Preference resolution
  - Fallback behavior
  - Manual override
  - Edge cases (no preferred platform available)

- **Integration Tests**: Full unified state flow (12+ tests)
  - Read on Site A → read on Site B → check progress
  - Platform preference resolution
  - Conflict scenarios
  - Dashboard display

- **Coverage Target**: 90%+ for unified state logic

### Previous Story Intelligence

**Story 4.3 (Realtime Subscriptions)** established:
- conflictResolver with last-write-wins strategy
- Timestamp-based conflict resolution
- reading_progress table structure

**Story 4.4 (Platform Adapters)** established:
- Platform detection via adapters (MangaDex, Webtoon, etc.)
- Adapter registry for extensibility
- Site-specific DOM selectors

**Story 5.1 (Resume Button)** established:
- Resume navigation and button component
- resume_url field in UserSeries
- Platform-aware navigation

### Architecture Compliance

**BMAD Boundaries**:
- Backend: unifiedStateService (data aggregation)
- Lib: platformPreference (utility logic)
- Component: ResumeButton (UI presentation)
- Database: reading_progress table (data persistence)

**Forbidden Patterns**:
- ❌ API layer querying database directly (use backend services)
- ❌ Component business logic (extract to services/lib)
- ❌ Duplicate conflict resolution (reuse conflictResolver)

### Performance Considerations

- **Query Optimization**: Index reading_progress by (series_id, updated_at) for fast lookup
- **Caching**: Consider caching unified state for 5-10 seconds (user rarely switches platforms)
- **Lazy Loading**: Load platform options only when dropdown is opened
- **Batch Queries**: If multiple series, batch query unified state

### References

- [Epic 5 Overview](../planning-artifacts/epics.md#epic-5-one-click-resume--navigation)
- [Story 4.3 Conflict Resolution](./4-3-supabase-real-time-subscriptions-for-cross-device-sync.md)
- [Story 4.4 Platform Adapters](./4-4-platform-adapter-architecture-for-mangadx-and-additional-sites.md)
- [Story 5.1 Resume Button](./5-1-resume-button-on-series-cards.md)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet

### Completion Notes List

- [ ] Database migration created for platform column
- [ ] Extension content.ts updated to track platform
- [ ] unifiedStateService created with multi-platform resolution
- [ ] seriesQueryService updated to use unified state
- [ ] platformPreference utility created with preference resolution
- [ ] ResumeButton updated with platform indicator and selection
- [ ] All unit tests passing (22+ tests)
- [ ] All integration tests passing (12+ tests)
- [ ] Code review checklist completed
- [ ] Confidence score ≥90% achieved

### File List

- [ ] database/migrations/014_add_platform_to_reading_progress.sql
- [ ] src/extension/content.ts (modified)
- [ ] src/backend/services/dashboard/unifiedStateService.ts
- [ ] src/backend/services/dashboard/seriesQueryService.ts (modified)
- [ ] src/lib/platformPreference.ts
- [ ] src/components/dashboard/ResumeButton.tsx (modified)
- [ ] src/model/schemas/extension.ts (modified)
- [ ] src/lib/supabase.ts (modified)
- [ ] tests/unit/unifiedStateService.test.ts
- [ ] tests/unit/platformPreference.test.ts
- [ ] tests/integration/unified-state.integration.test.ts

### Change Log

- Initial story creation with comprehensive context
