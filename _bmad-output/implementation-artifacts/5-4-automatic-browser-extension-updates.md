# Story 5.4: Automatic Browser Extension Updates

Status: ready-for-dev

## Story

As a user,
I want the browser extension to update automatically,
So that I always have the latest features and bug fixes.

## Acceptance Criteria

1. **Given** a new version of the extension is released
   **When** the browser checks for updates
   **Then** the extension updates automatically

2. **Given** an extension update is available
   **When** the update is being installed
   **Then** users are notified of the update

3. **Given** an extension update is in progress
   **When** the user is using the browser
   **Then** no user action is required

4. **Given** an extension update is being installed
   **When** the update completes
   **Then** the extension continues working during updates

5. **Given** an extension update occurs
   **When** the update is complete
   **Then** update history is logged

6. **Given** I want to check for updates manually
   **When** I access the extension settings
   **Then** users can manually check for updates if needed

## Tasks / Subtasks

- [ ] Task 1: Configure manifest.json for auto-updates (AC: #1, #3)
  - [ ] Subtask 1.1: Update extension/manifest.json with update_url
  - [ ] Subtask 1.2: Set update check frequency (daily or on startup)
  - [ ] Subtask 1.3: Ensure manifest.json is valid Manifest V3

- [ ] Task 2: Create update check service (AC: #1, #5, #6)
  - [ ] Subtask 2.1: Create src/extension/updates/updateService.ts
  - [ ] Subtask 2.2: Implement checkForUpdates() function
  - [ ] Subtask 2.3: Compare current version with latest version
  - [ ] Subtask 2.4: Log update checks and results
  - [ ] Subtask 2.5: Handle network errors gracefully

- [ ] Task 3: Create update notification system (AC: #2, #3)
  - [ ] Subtask 3.1: Create src/extension/updates/updateNotifier.ts
  - [ ] Subtask 3.2: Implement notifyUpdateAvailable() function
  - [ ] Subtask 3.3: Show non-blocking notification to user
  - [ ] Subtask 3.4: Include update details (version, features, fixes)
  - [ ] Subtask 3.5: Allow user to dismiss or install now

- [ ] Task 4: Implement update installation (AC: #1, #3, #4)
  - [ ] Subtask 4.1: Create src/extension/updates/updateInstaller.ts
  - [ ] Subtask 4.2: Use chrome.runtime.requestUpdateCheck() API
  - [ ] Subtask 4.3: Handle update installation gracefully
  - [ ] Subtask 4.4: Preserve user state during update
  - [ ] Subtask 4.5: Restart extension after update

- [ ] Task 5: Create update history logging (AC: #5)
  - [ ] Subtask 5.1: Create src/extension/updates/updateLogger.ts
  - [ ] Subtask 5.2: Log all update checks with timestamp
  - [ ] Subtask 5.3: Log successful updates with version info
  - [ ] Subtask 5.4: Log failed updates with error details
  - [ ] Subtask 5.5: Store logs in chrome.storage.local for retrieval

- [ ] Task 6: Create extension settings page (AC: #6)
  - [ ] Subtask 6.1: Create extension/popup/settings.html
  - [ ] Subtask 6.2: Create extension/popup/settings.js
  - [ ] Subtask 6.3: Add "Check for Updates" button
  - [ ] Subtask 6.4: Display update history
  - [ ] Subtask 6.5: Show current version and last check time

- [ ] Task 7: Handle update lifecycle events (AC: #3, #4)
  - [ ] Subtask 7.1: Create src/extension/updates/updateLifecycle.ts
  - [ ] Subtask 7.2: Listen to chrome.runtime.onInstalled event
  - [ ] Subtask 7.3: Handle update event (version changed)
  - [ ] Subtask 7.4: Preserve state and reinitialize after update
  - [ ] Subtask 7.5: Clear old cached data if needed

- [ ] Task 8: Add tests for update system (AC: all)
  - [ ] Subtask 8.1: Create tests/unit/extension/updates/updateService.test.ts (10+ tests)
  - [ ] Subtask 8.2: Test version comparison logic
  - [ ] Subtask 8.3: Test update check flow
  - [ ] Subtask 8.4: Create tests/unit/extension/updates/updateNotifier.test.ts (8+ tests)
  - [ ] Subtask 8.5: Test notification display
  - [ ] Subtask 8.6: Create tests/unit/extension/updates/updateLogger.test.ts (8+ tests)
  - [ ] Subtask 8.7: Test logging functionality

- [ ] Task 9: Add integration tests (AC: all)
  - [ ] Subtask 9.1: Create tests/integration/extension-updates.integration.test.ts
  - [ ] Subtask 9.2: Test full update flow: check → notify → install
  - [ ] Subtask 9.3: Test state preservation during update
  - [ ] Subtask 9.4: Test manual update check

## Dev Notes

### Architecture & Patterns

- **Update Service**: Centralized updateService.ts handles version checking
- **Notification**: Non-blocking notification system (no modal dialogs)
- **Logging**: All update events logged to chrome.storage.local
- **Lifecycle**: chrome.runtime.onInstalled event handler for update detection
- **State Preservation**: Use chrome.storage.local to preserve user state

### Technical Requirements

- **Manifest**: Configure update_url in manifest.json (Manifest V3)
- **API**: Use chrome.runtime.requestUpdateCheck() for update installation
- **Storage**: Use chrome.storage.local for update history and state
- **Notification**: Use chrome.notifications API for non-blocking alerts
- **Version**: Parse version from manifest.json (semantic versioning)
- **Frequency**: Check for updates daily or on extension startup

### File Structure Requirements

```
extension/
  manifest.json                 (modify - add update_url)
  popup/
    settings.html              (new)
    settings.js                (new)
src/
  extension/
    updates/
      updateService.ts         (new)
      updateNotifier.ts        (new)
      updateInstaller.ts       (new)
      updateLogger.ts          (new)
      updateLifecycle.ts       (new)
    background.ts              (modify - add update check)
tests/
  unit/extension/updates/
    updateService.test.ts      (new)
    updateNotifier.test.ts     (new)
    updateLogger.test.ts       (new)
  integration/
    extension-updates.integration.test.ts (new)
```

### Testing Requirements

- **Unit Tests**: updateService (10+ tests)
  - Version comparison (semver)
  - Update check flow
  - Network error handling
  - Caching behavior

- **Unit Tests**: updateNotifier (8+ tests)
  - Notification display
  - User interaction (dismiss, install)
  - Notification content

- **Unit Tests**: updateLogger (8+ tests)
  - Log writing
  - Log retrieval
  - Log formatting

- **Integration Tests**: Full update flow (10+ tests)
  - Check → notify → install flow
  - State preservation
  - Manual update check
  - Error scenarios

- **Coverage Target**: 85%+ for update system (lower than normal due to chrome API mocking complexity)

### Previous Story Intelligence

**Story 2.4 (Extension Installation Guide)** established:
- Extension detection and verification
- Installation status tracking
- User notification patterns

**Story 4.1 (Content Script)** established:
- Extension initialization and cleanup
- Message passing patterns
- State management

### Architecture Compliance

**BMAD Boundaries**:
- Extension: updateService, updateNotifier, updateInstaller (extension-specific logic)
- Lib: updateLogger (utility logging)
- Storage: chrome.storage.local (persistent state)

**Forbidden Patterns**:
- ❌ Blocking UI during updates (use non-blocking notifications)
- ❌ Losing user state during update (preserve in chrome.storage)
- ❌ Forcing immediate restart (allow graceful update)

### Performance Considerations

- **Check Frequency**: Daily checks (configurable, not on every page load)
- **Network**: Timeout after 5 seconds if update check fails
- **Storage**: Keep update history for 30 days only (cleanup old entries)
- **Background**: Update checks run in background script (non-blocking)
- **Caching**: Cache update check result for 24 hours

### Browser Compatibility

- **Chrome**: Full support via chrome.runtime.requestUpdateCheck()
- **Firefox**: Use WebExtensions API (similar but different)
- **Safari**: Use App Store auto-update (out of scope for this story)

### References

- [Epic 5 Overview](../planning-artifacts/epics.md#epic-5-one-click-resume--navigation)
- [Story 2.4 Extension Installation](./2-4-browser-extension-installation-guide.md)
- [Story 4.1 Content Script](./4-1-browser-extension-content-script-for-dom-monitoring.md)
- [Chrome Extension Update Documentation](https://developer.chrome.com/docs/extensions/reference/runtime/#method-requestUpdateCheck)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet

### Completion Notes List

- [ ] Manifest.json configured with update_url
- [ ] updateService created with version checking
- [ ] updateNotifier created with notification system
- [ ] updateInstaller created with chrome API integration
- [ ] updateLogger created with history tracking
- [ ] Extension settings page created with manual check
- [ ] updateLifecycle handler created for update events
- [ ] All unit tests passing (26+ tests)
- [ ] All integration tests passing (10+ tests)
- [ ] Code review checklist completed
- [ ] Confidence score ≥85% achieved (chrome API mocking complexity)

### File List

- [ ] extension/manifest.json (modified)
- [ ] extension/popup/settings.html
- [ ] extension/popup/settings.js
- [ ] src/extension/updates/updateService.ts
- [ ] src/extension/updates/updateNotifier.ts
- [ ] src/extension/updates/updateInstaller.ts
- [ ] src/extension/updates/updateLogger.ts
- [ ] src/extension/updates/updateLifecycle.ts
- [ ] src/extension/background.ts (modified)
- [ ] tests/unit/extension/updates/updateService.test.ts
- [ ] tests/unit/extension/updates/updateNotifier.test.ts
- [ ] tests/unit/extension/updates/updateLogger.test.ts
- [ ] tests/integration/extension-updates.integration.test.ts

### Change Log

- Initial story creation with comprehensive context
