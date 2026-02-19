# Story 4.5: Local Storage for Offline Functionality

Status: done

## Story

As a user,
I want my reading progress to be saved locally,
So that ReadTrace works even when I'm offline.

## Acceptance Criteria

1. **Given** I am reading on a supported site
   **When** my internet connection is lost
   **Then** progress is saved to browser local storage

2. **Given** the extension is in offline mode
   **When** I continue reading
   **Then** the extension continues to track my reading

3. **Given** I have offline progress data
   **When** my connection is restored
   **Then** when connection is restored, local data syncs to Supabase

4. **Given** I read offline
   **When** I check my progress
   **Then** no data is lost during offline periods

5. **Given** offline data exists
   **When** sync completes
   **Then** users are notified of sync status

6. **Given** data is synced successfully
   **When** sync completes
   **Then** local storage is cleared after successful sync

## Tasks / Subtasks

- [x] Task 1: Create offline storage system (AC: #1, #2)
  - [x] Create src/extension/storage/offlineStorage.ts
  - [x] Implement localStorage-based progress storage
  - [x] Create storage schema for offline data
  - [x] Implement storage quota management

- [x] Task 2: Implement offline detection (AC: #1, #2)
  - [x] Create src/extension/network/connectionDetector.ts
  - [x] Implement online/offline event listeners
  - [x] Create connection status tracking
  - [x] Implement debouncing for connection changes

- [x] Task 3: Create sync on reconnection (AC: #3, #4)
  - [x] Update src/extension/queue/syncQueue.ts for offline mode
  - [x] Implement automatic sync when connection restored
  - [x] Create retry logic with exponential backoff
  - [x] Handle partial sync failures

- [x] Task 4: Implement user notifications (AC: #5)
  - [x] Create src/extension/ui/offlineIndicator.ts
  - [x] Implement offline badge in extension popup
  - [x] Create sync status notifications
  - [x] Implement progress indicators for sync

- [x] Task 5: Add comprehensive testing (AC: #1-6)
  - [x] Create tests/unit/extension/storage/offlineStorage.test.ts
  - [x] Create tests/unit/extension/network/connectionDetector.test.ts
  - [x] Create tests/integration/offline.integration.test.ts
  - [x] Test offline→online transitions with data loss prevention

## Dev Notes

### Architecture Patterns
- **Offline-First**: Local storage as primary, sync when possible
- **Storage Abstraction**: Abstracted storage layer for flexibility
- **Connection Detection**: Native online/offline events with debouncing
- **Queue-Based Sync**: Leverage existing sync queue for offline data
- **User Feedback**: Clear indication of offline status and sync progress

### Source Tree Components
- `src/extension/storage/offlineStorage.ts` - Offline data storage
- `src/extension/network/connectionDetector.ts` - Connection detection
- `src/extension/queue/syncQueue.ts` - Enhanced for offline mode
- `src/extension/ui/offlineIndicator.ts` - UI components
- `tests/unit/extension/storage/` - Storage tests
- `tests/integration/offline.integration.test.ts` - Integration tests

### Testing Standards
- Unit tests for storage operations (add, retrieve, clear)
- Connection state transition tests
- Offline→online sync scenario tests
- Data integrity verification tests
- Minimum 80% coverage for offline logic
- Test storage quota limits and cleanup

### Project Structure Notes

**Offline Storage Schema:**
```typescript
interface OfflineProgress {
  id: string;
  series_id: string;
  chapter: number;
  scroll_position: number;
  timestamp: number;
  synced: boolean;
}
```

**Storage Limits:**
- localStorage limit: ~5-10MB per domain
- Implement cleanup for old offline data
- Warn user if approaching quota
- Prioritize recent data for retention

**Connection Detection:**
- Use `navigator.onLine` for initial state
- Listen to `online` and `offline` events
- Debounce rapid changes (500ms)
- Implement periodic connectivity checks

**Sync Strategy:**
- Batch offline updates for efficiency
- Retry failed syncs with exponential backoff
- Clear storage only after confirmed sync
- Preserve data if sync fails

### References

- [Epic 4 Specification: Cross-Platform Reading Progress Tracking](../planning-artifacts/epics.md#epic-4)
- [Architecture: Offline-First Design](../planning-artifacts/architecture.md#offline-first)
- [Web Storage API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Offline-First Patterns](../docs/ai-memory/decisions.md#offline-first)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet

### Debug Log References

No debug issues encountered.

### Completion Notes List

- **offlineStorage.ts**: Implements `OfflineProgress` schema, `saveProgress` (upsert by series_id+chapter), `getUnsynced`, `getAll`, `markSynced`, `removeSynced`, `clear`, `getStats`. Quota management: warns at 4MB, trims oldest synced entries when exceeding MAX_OFFLINE_ENTRIES (200).
- **connectionDetector.ts**: Uses native `online`/`offline` events with 500ms debounce. Module-level state + handler registry with splice-based unsubscribe. `forceStatus` for testing. `initialize`/`destroy` for lifecycle. Guards both `window` and `self` (worker context).
- **offlineIndicator.ts**: Pure state machine for UI feedback — `ConnectionStatus`, `SyncStatus`, `pendingCount`, `lastSyncedAt`, `syncError`. `getBadgeText` and `getStatusMessage` pure functions for rendering. Handler registry with unsubscribe pattern.
- **syncQueue.ts (modified)**: Added `getBackoffDelay` (exponential: 1s→30s cap), `isReadyForRetry` (checks lastRetry + delay), `getRetryReady`, `addFromOffline` (merges by series_id+chapter, keeps newer timestamp).
- **Test counts**: offlineStorage.test.ts (26 tests), connectionDetector.test.ts (21 tests), offline.integration.test.ts (33 tests) = 80 new tests total.
- **All 6 ACs satisfied**: AC1 (save to localStorage on offline), AC2 (continue tracking), AC3 (sync on reconnect via queue), AC4 (no data loss — only clear after markSynced+removeSynced), AC5 (indicator state + notifications), AC6 (removeSynced clears after confirmed sync).

### File List

- [x] src/extension/storage/offlineStorage.ts (new)
- [x] src/extension/network/connectionDetector.ts (new)
- [x] src/extension/ui/offlineIndicator.ts (new)
- [x] src/extension/queue/syncQueue.ts (modified — added getBackoffDelay, isReadyForRetry, getRetryReady, addFromOffline)
- [x] tests/unit/extension/storage/offlineStorage.test.ts (new — 26 tests)
- [x] tests/unit/extension/network/connectionDetector.test.ts (new — 21 tests)
- [x] tests/integration/offline.integration.test.ts (new — 33 tests)

### Change Log

- 2026-02-18: Story 4-5 implemented. 4 new source files (3 new, 1 modified), 3 new test files. 80 new tests. 906+80=986 tests passing, 0 regressions. All 6 acceptance criteria satisfied.
