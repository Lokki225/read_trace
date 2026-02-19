# Implementation Tasks - Phase 2: Queue System & Offline Support

> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done
> **Tech Stack**: TypeScript, Chrome Extension APIs, Jest

---

## Phase 2: Queue System & Offline Support

### Offline Queue Implementation

- [ ] **Implement queue persistence to localStorage**
  - Add: `save()` method to persist queue to localStorage
  - Add: `load()` method to restore queue from localStorage
  - Add: Error handling for quota exceeded
  - Add: Cleanup of old entries if quota exceeded
  - Verify: Queue persists across extension reloads

- [ ] **Implement queue processing logic**
  - Add: `processAll()` method to sync all queued updates
  - Add: Batch processing for efficiency
  - Add: Error handling for failed syncs
  - Add: Retry logic with exponential backoff
  - Verify: All queued updates processed correctly

### Connection Detection

- [ ] **Implement online/offline detection**
  - Add: `window.addEventListener('online', ...)` handler
  - Add: `window.addEventListener('offline', ...)` handler
  - Add: Initial connection state detection
  - Add: Logging of connection changes
  - Verify: Connection changes detected reliably

- [ ] **Implement reconnection sync**
  - Add: `onOnline()` method to handle reconnection
  - Add: Queue processing on reconnection
  - Add: Retry logic for failed syncs
  - Add: User notification of sync status
  - Verify: Queued updates synced on reconnection

### Deduplication Logic

- [ ] **Implement duplicate detection**
  - Add: Deduplication based on series_id + chapter
  - Add: Timestamp-based comparison for latest update
  - Add: Efficient lookup structure (Map or object)
  - Verify: Duplicates detected correctly

- [ ] **Implement deduplication strategy**
  - Add: Keep latest update, discard old
  - Add: Merge scroll positions if same chapter
  - Add: Handle rapid fire updates
  - Verify: Only latest update sent for each series+chapter

### Message Handling

- [ ] **Implement message listener**
  - Add: `chrome.runtime.onMessage.addListener()` handler
  - Add: Message validation and type checking
  - Add: Response handling
  - Add: Error handling for invalid messages
  - Verify: Messages received and processed correctly

- [ ] **Implement progress update handling**
  - Add: Validation of progress data
  - Add: Deduplication of updates
  - Add: Queue or sync decision logic
  - Add: Logging of all updates
  - Verify: Updates handled correctly

### API Integration

- [ ] **Implement API sync with timeout**
  - Add: 5-second timeout for API calls
  - Add: Error handling for timeouts
  - Add: Retry logic for failed requests
  - Add: Response validation
  - Verify: API calls complete within timeout

- [ ] **Implement authentication**
  - Add: Authentication header injection
  - Add: Token refresh logic if needed
  - Add: Error handling for auth failures
  - Verify: Authenticated requests work correctly

---

## Verification Commands

```bash
# Run unit tests for queue
npm test -- tests/unit/extension/queue/syncQueue.test.ts

# Run unit tests for deduplicator
npm test -- tests/unit/extension/queue/deduplicator.test.ts

# Run integration tests
npm test -- tests/integration/background-offline.integration.test.ts

# Check for memory leaks
npm run test:memory

# Lint extension code
npm run lint -- src/extension/
```

---

## Notes Section

**Implementation Notes**:
- localStorage quota typically 5-10MB, implement cleanup if exceeded
- Exponential backoff: 1s, 2s, 4s, 8s, 16s max
- Deduplication window: last 5 minutes of updates
- Connection detection uses native browser events

**Time Estimates**:
- Phase 2 (Queue & Offline): ~4-5 hours

---

## References

- **Offline-First Architecture**: https://offlinefirst.org/
- **localStorage API**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **Online/Offline Events**: https://developer.mozilla.org/en-US/docs/Web/API/Window/online_event
