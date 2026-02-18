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

- [ ] Task 1: Create background service worker (AC: #1, #2)
  - [ ] Create src/extension/background.ts
  - [ ] Implement message listener for content script updates
  - [ ] Create API client for backend communication
  - [ ] Implement 5-second sync timeout

- [ ] Task 2: Implement offline queue system (AC: #3, #4)
  - [ ] Create src/extension/queue/syncQueue.ts
  - [ ] Implement localStorage-based queue persistence
  - [ ] Create queue processing logic
  - [ ] Implement connection detection and retry logic

- [ ] Task 3: Add deduplication logic (AC: #5)
  - [ ] Create src/extension/queue/deduplicator.ts
  - [ ] Implement duplicate detection based on series+chapter+timestamp
  - [ ] Create deduplication strategy (keep latest, discard old)
  - [ ] Test with rapid fire updates

- [ ] Task 4: Implement logging and debugging (AC: #6)
  - [ ] Create src/extension/logger.ts
  - [ ] Log all sync events with timestamps
  - [ ] Implement debug mode for verbose logging
  - [ ] Create log retrieval API for debugging

- [ ] Task 5: Add comprehensive testing (AC: #1-6)
  - [ ] Create tests/unit/extension/background.test.ts
  - [ ] Create tests/unit/extension/queue/syncQueue.test.ts
  - [ ] Create tests/unit/extension/queue/deduplicator.test.ts
  - [ ] Test offline scenarios and reconnection

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

Claude 3.5 Sonnet

### Debug Log References

### Completion Notes List

### File List

- [ ] src/extension/background.ts
- [ ] src/extension/queue/syncQueue.ts
- [ ] src/extension/queue/deduplicator.ts
- [ ] src/extension/logger.ts
- [ ] src/extension/api.ts
- [ ] tests/unit/extension/background.test.ts
- [ ] tests/unit/extension/queue/syncQueue.test.ts
- [ ] tests/unit/extension/queue/deduplicator.test.ts

### Change Log

[To be updated during implementation]
