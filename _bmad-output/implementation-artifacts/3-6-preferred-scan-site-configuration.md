# Story 3.6: Preferred Scan Site Configuration

Status: ready-for-dev

## Story

As a user,
I want to set my preferred scanlation sites,
So that ReadTrace prioritizes those sites when tracking my reading.

## Acceptance Criteria

1. User can select from supported platforms (MangaDex, others)
2. User can reorder their preferences (drag-and-drop or priority list)
3. Preferences are saved to Supabase user_profiles
4. Browser extension uses these preferences for detection
5. User can update preferences at any time
6. Preferences display in settings or onboarding flow
7. Default preferences are set if user skips configuration
8. Preferences affect resume button behavior (resume to preferred site)

## Tasks / Subtasks

- [ ] Task 1: Create PreferredSitesForm component (AC: 1, 2, 6)
  - [ ] Subtask 1.1: Build PreferredSitesForm.tsx with platform selection
  - [ ] Subtask 1.2: Implement drag-and-drop reordering (react-beautiful-dnd or native)
  - [ ] Subtask 1.3: Display supported platforms with checkboxes
  - [ ] Subtask 1.4: Show current preference order
- [ ] Task 2: Implement save and persistence (AC: 3, 5)
  - [ ] Subtask 2.1: Create saveSitePreferences API endpoint
  - [ ] Subtask 2.2: Update user_profiles.preferred_sites (JSON array)
  - [ ] Subtask 2.3: Add optimistic update to UI
  - [ ] Subtask 2.4: Handle save errors with toast notification
- [ ] Task 3: Integrate with extension and resume logic (AC: 4, 8)
  - [ ] Subtask 3.1: Fetch preferences in extension background script
  - [ ] Subtask 3.2: Use preferences for site detection priority
  - [ ] Subtask 3.3: Resume button uses preferred site for navigation
  - [ ] Subtask 3.4: Fallback to any available site if preferred unavailable
- [ ] Task 4: Handle defaults and onboarding (AC: 7)
  - [ ] Subtask 4.1: Set default preferences (MangaDex first)
  - [ ] Subtask 4.2: Add PreferredSitesForm to onboarding flow
  - [ ] Subtask 4.3: Allow skip with default preferences
  - [ ] Subtask 4.4: Create settings page for preference updates
- [ ] Task 5: Write comprehensive tests (AC: all)
  - [ ] Subtask 5.1: Unit test preference reordering
  - [ ] Subtask 5.2: Integration test save and persistence
  - [ ] Subtask 5.3: Integration test extension preference usage
  - [ ] Subtask 5.4: E2E test full preference flow
  - [ ] Subtask 5.5: Test default preference handling

## Dev Notes

### Architecture & Patterns

- **Data Shape** (user_profiles table):
  ```typescript
  interface UserProfile {
    id: string
    user_id: string
    username: string
    preferred_sites: string[] // ['mangadex', 'other-site']
    preferred_sites_updated_at: string // ISO 8601
    // ... other fields
  }
  ```

- **Supported Platforms**:
  ```typescript
  const SUPPORTED_PLATFORMS = [
    { id: 'mangadex', name: 'MangaDex', url: 'https://mangadex.org' },
    { id: 'other-site', name: 'Other Site', url: 'https://...' }
  ]
  ```

- **API Endpoint**:
  - `POST /api/user/preferences/sites`
  - Request: `{ preferred_sites: string[] }`
  - Response: `{ data: UserProfile, error: null }`

- **Extension Integration**:
  - Background script fetches preferences on startup
  - Store in extension storage: `chrome.storage.local.set({ preferredSites: [...] })`
  - Content script checks preferred sites in order when detecting reading
  - Resume button uses first available preferred site

- **Resume Logic**:
  - Get user's preferred_sites array
  - For each preferred site, check if series available on that site
  - Navigate to first available preferred site
  - Fallback: navigate to any available site if none preferred available

- **Drag-and-Drop**:
  - Use `react-beautiful-dnd` or native HTML5 drag-and-drop
  - Reorder updates local state immediately (optimistic)
  - Save to server on drop
  - Handle reorder errors gracefully

### Project Structure Notes

- **New Files**:
  - `src/components/settings/PreferredSitesForm.tsx` - Preference form
  - `src/components/onboarding/PreferredSitesStep.tsx` - Onboarding step
  - `src/app/api/user/preferences/sites/route.ts` - Save preferences API
  - `src/lib/platforms.ts` - Platform definitions and utilities
  - `src/hooks/usePreferredSites.ts` - Custom hook for preferences
  - `tests/unit/PreferredSitesForm.test.tsx` - Form tests
  - `tests/integration/sitePreferences.integration.test.ts` - Integration tests

- **Modified Files**:
  - `src/lib/supabase.ts` - Add preferred_sites to Database type
  - `src/app/settings/page.tsx` - Add preferences section
  - `src/app/onboarding/page.tsx` - Add PreferredSitesStep
  - `extension/background.ts` - Fetch and use preferences
  - `extension/content.ts` - Use preferences for site detection
  - `database/migrations/010_add_preferred_sites.sql` - Add column to user_profiles

- **Database Migration**:
  ```sql
  ALTER TABLE user_profiles
  ADD COLUMN preferred_sites TEXT[] DEFAULT ARRAY['mangadex'],
  ADD COLUMN preferred_sites_updated_at TIMESTAMP DEFAULT NOW();
  ```

### Testing Standards Summary

- **Unit Tests**: Reordering logic, platform selection, form validation
- **Integration Tests**: Save/load preferences, API endpoint, extension integration
- **E2E Tests**: Full preference flow (select, reorder, save, use in resume)
- **Coverage Target**: 80%+ for preference logic
- **Test Patterns**: React Testing Library with drag-and-drop simulation

### References

- [Story 3.6 Requirements](../../planning-artifacts/epics.md#story-36-preferred-scan-site-configuration)
- [Architecture: API Patterns](../../planning-artifacts/architecture.md#api-naming-conventions)
- [Architecture: State Management](../../planning-artifacts/architecture.md#state-management-patterns)
- [Epic 5: Resume Logic](../../planning-artifacts/epics.md#epic-5-one-click-resume--navigation)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (via Cascade)

### Debug Log References

None yet - story created fresh

### Completion Notes List

- Story file created with comprehensive context
- Data shape and API endpoint defined
- Extension integration strategy documented
- Resume logic with preferences outlined
- Drag-and-drop approach specified
- Database migration included

### File List

To be populated during implementation:
- src/components/settings/PreferredSitesForm.tsx
- src/components/onboarding/PreferredSitesStep.tsx
- src/app/api/user/preferences/sites/route.ts
- src/lib/platforms.ts
- src/hooks/usePreferredSites.ts
- tests/unit/PreferredSitesForm.test.tsx
- tests/integration/sitePreferences.integration.test.ts
- database/migrations/010_add_preferred_sites.sql
