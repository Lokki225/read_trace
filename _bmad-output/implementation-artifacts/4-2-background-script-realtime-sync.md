# Story 4.2: Background Script & Real-Time Progress Synchronization

Status: ready-for-dev

## Story

As a developer,
I want to create a background script that syncs progress to the backend,
So that reading state is saved across devices.

## Acceptance Criteria

1. **Given** the content script detects reading progress
   **When** progress changes occur
   **Then** the background script captures the update

2. **Given** progress data is available
   **When** the background script processes it
   **Then** it sends progress to the backend API within 5 seconds

3. **Given** the user is offline
   **When** progress updates occur
   **Then** it handles offline scenarios by queuing updates locally

4. **Given** the connection is restored
   **When** the user comes back online
   **Then** it syncs queued updates when connection is restored

5. **Given** multiple updates occur rapidly
   **When** sending to the backend
   **Then** it prevents duplicate submissions

6. **Given** sync events occur
   **When** the extension runs
   **Then** it logs all sync events for debugging

## Tasks / Subtasks

- [x] Task 1: Create background service worker (AC: #1, #2)
  - [x] Create src/extension/background.ts
  - [x] Implement message listener for content script updates
  - [x] Create API client for backend communication
  - [x] Implement 5-second sync timeout

- [x] Task 2: Implement offline queue system (AC: #3, #4)
  - [x] Create src/extension/queue/syncQueue.ts
  - [x] Implement localStorage-based queue persistence
  - [x] Create queue processing logic
  - [x] Implement connection detection and retry logic

- [x] Task 3: Add deduplication logic (AC: #5)
  - [x] Create src/extension/queue/deduplicator.ts
  - [x] Implement duplicate detection based on series+chapter+timestamp
  - [x] Create deduplication strategy (keep latest, discard old)
  - [x] Test with rapid fire updates

- [x] Task 4: Implement logging and debugging (AC: #6)
  - [x] Create src/extension/logger.ts
  - [x] Log all sync events with timestamps
  - [x] Implement debug mode for verbose logging
  - [x] Create log retrieval API for debugging

- [x] Task 5: Add comprehensive testing (AC: #1-6)
  - [x] Create tests/unit/extension/background.test.ts
  - [x] Create tests/unit/extension/queue/syncQueue.test.ts
  - [x] Create tests/unit/extension/queue/deduplicator.test.ts
  - [x] Test offline scenarios and reconnection

## Dev Notes

### Architecture Patterns
- **Background Service Worker**: Manifest V3 persistent background script
- **Message Passing**: chrome.runtime.onMessage for content→background communication
- **Queue System**: localStorage-based persistent queue with retry logic
- **API Integration**: Fetch API with authentication headers
- **Connection Detection**: Online/offline events with retry backoff

### Source Tree Components
- `src/extension/background.ts` - Service worker entry point
- `src/extension/queue/syncQueue.ts` - Queue management
- `src/extension/queue/deduplicator.ts` - Duplicate prevention
- `src/extension/logger.ts` - Debug logging
- `src/extension/api.ts` - Backend API client
- `src/extension/types.ts` - Shared types

### Testing Standards
- Unit tests for queue operations (add, process, clear)
- Integration tests for offline/online transitions
- Mock API responses for testing
- Minimum 80% coverage for background script
- Test edge cases: network failures, rapid updates, storage limits

### Project Structure Notes

**Background Script Responsibilities:**
- Listen for messages from content scripts
- Validate progress data before sending
- Manage offline queue with localStorage
- Handle API authentication and retries
- Log all sync events for debugging
- Detect online/offline status changes

**API Endpoint Expected:**
- POST `/api/progress/sync` - Sync reading progress
- Request body: `{ series_id, chapter, scroll_position, timestamp }`
- Response: `{ success, synced_at, next_sync_in }`

### References

- [Epic 4 Specification: Cross-Platform Reading Progress Tracking](../planning-artifacts/epics.md#epic-4)
- [Architecture: Backend API Design](../planning-artifacts/architecture.md#api-design)
- [Chrome Extension Background Scripts](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [Offline-First Architecture Pattern](../docs/ai-memory/decisions.md)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

- processQueue() early-return bug: was returning before removeExhausted() when queue empty — fixed by restructuring to always call removeExhausted()
- syncQueue load() test: clear() wipes localStorage so load() found nothing — fixed by using jest.resetModules() and fresh require
- background.test.ts mock isolation: nested jest.resetModules() in beforeEach broke shared mock references — fixed by using single top-level jest.mock() + direct imports

### Completion Notes List

- AC-1 ✅: background.ts registers chrome.runtime.onMessage listener, validates payload before processing
- AC-2 ✅: api.ts uses AbortController with 5000ms timeout; syncProgress() returns within 5s or queues for retry
- AC-3 ✅: syncQueue.ts persists to localStorage key 'readtrace_sync_queue'; add() auto-saves; overflow capped at 100 items
- AC-4 ✅: onOnline() triggers processQueue() which syncs all queued items; failed items retry with incrementRetry()
- AC-5 ✅: deduplicator.ts uses Map keyed by series_id::chapter; isDuplicate() returns true for same-or-older timestamps; only latest kept
- AC-6 ✅: logger.ts logs all sync events with timestamps, level, event name, details; debug mode toggle; getLogs() for retrieval
- POST /api/progress/sync route created with auth guard, input validation, Supabase upsert to reading_progress table
- chrome.d.ts extended with onMessage.addListener declaration
- src/extension/types.ts extended with BackgroundProgressUpdate, QueuedUpdate, SyncResponse, BackgroundMessage, BackgroundMessageResponse

### File List

- [x] src/extension/background.ts (NEW)
- [x] src/extension/queue/syncQueue.ts (NEW)
- [x] src/extension/queue/deduplicator.ts (NEW)
- [x] src/extension/logger.ts (NEW)
- [x] src/extension/api.ts (NEW)
- [x] src/extension/types.ts (MODIFIED — added 5 new interfaces)
- [x] src/extension/chrome.d.ts (MODIFIED — added onMessage declaration)
- [x] src/app/api/progress/sync/route.ts (NEW)
- [x] tests/unit/extension/background.test.ts (NEW — 14 tests)
- [x] tests/unit/extension/logger.test.ts (NEW — 14 tests)
- [x] tests/unit/extension/queue/syncQueue.test.ts (NEW — 22 tests)
- [x] tests/unit/extension/queue/deduplicator.test.ts (NEW — 19 tests)
- [x] tests/integration/background-offline.integration.test.ts (NEW — 9 tests)
- [x] tests/integration/background-api.integration.test.ts (NEW — 8 tests)

### Change Log

- 2026-02-18: Story 4-2 implemented. 6 new source files, 2 modified, 6 new test files. +87 tests (873→960). 0 regressions. All 6 AC satisfied.
