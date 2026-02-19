# Implementation Tasks: Phase 2 - Database & Backend Integration

> **Purpose**: Implement update logging and storage integration
> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done

---

## Phase 2: Database & Backend Integration

### Update Logging Service
- [ ] **Create updateLogger service** - Persistent update history
  - Create: `src/extension/updates/updateLogger.ts` 
  - Implement: logUpdateCheck(version, status, timestamp)
  - Implement: logUpdateError(version, error)
  - Implement: getUpdateLogs(limit?, filter?)
  - Implement: cleanupOldLogs() - Remove logs > 30 days
  - Verify: Uses chrome.storage.local for persistence
  - Verify: Handles storage quota gracefully

- [ ] **Create update log types** - Type-safe logging
  - Create: `src/extension/updates/types/logs.ts` 
  - Include: UpdateLogEntry, UpdateLogFilter, LogStatus enum
  - Verify: All log fields documented

### Chrome Storage Integration
- [ ] **Create storage wrapper** - Abstraction for chrome.storage.local
  - Create: `src/extension/updates/lib/storage.ts` 
  - Implement: getItem(key), setItem(key, value), removeItem(key)
  - Implement: getAllItems(), clearAll()
  - Verify: Error handling for quota exceeded
  - Verify: Graceful degradation if storage unavailable

- [ ] **Create update state persistence** - Store update metadata
  - Create: `src/extension/updates/lib/updateState.ts` 
  - Implement: saveUpdateState(state), loadUpdateState()
  - Implement: getLastCheckTime(), setLastCheckTime()
  - Verify: State survives extension restart

### Manifest Configuration
- [ ] **Update manifest.json** - Configure auto-update
  - File: `extension/manifest.json` 
  - Add: "update_url" field pointing to Chrome Web Store
  - Verify: Manifest V3 compliant
  - Verify: Valid JSON syntax

### Background Script Integration
- [ ] **Prepare background.ts for update checks** - Integration point
  - File: `src/extension/background.ts` 
  - Add: Import statements for update services (not implemented yet)
  - Add: Comments for where update check will be scheduled
  - Verify: No breaking changes to existing functionality

---

## Verification Commands

```bash
# Test storage integration
npm run test -- --testPathPattern=storage

# Test logger functionality
npm run test -- --testPathPattern=updateLogger

# Verify manifest.json syntax
npm run build

# Check chrome.storage mocks
npm run test -- --testPathPattern=extension/updates
```

---

## Notes Section

**Implementation Notes**:
- Storage quota: 10MB for extensions, warn at 4MB usage
- 30-day retention: Use timestamp comparison, not file age
- Error handling: Never throw from storage operations, log and continue
- State persistence: Use JSON serialization for UpdateState

**Questions & Clarifications**:
- Confirm update_url format (should be Chrome Web Store URL)
- Confirm log retention policy (30 days seems reasonable)
- Confirm storage quota warning threshold

**Blockers**:
- None identified at this stage

---

## References

- **Chrome Storage API**: `https://developer.chrome.com/docs/extensions/reference/storage/`
- **Manifest V3 Guide**: `https://developer.chrome.com/docs/extensions/mv3/manifest/`
- **Previous Story 4-1**: Content Script patterns for extension integration
