# Implementation Tasks: Phase 3 - Core Implementation

> **Purpose**: Implement update services and UI
> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done

---

## Phase 3: Core Implementation

### Update Service Implementation
- [ ] **Create updateService** - Version checking and update detection
  - Create: `src/extension/updates/updateService.ts` 
  - Implement: checkForUpdates(options?) - Main update check function
  - Implement: getCurrentVersion() - Parse from manifest.json
  - Implement: getLatestVersion() - Fetch from Chrome Web Store
  - Implement: isUpdateAvailable(current, latest) - Version comparison
  - Implement: getCachedResult(), setCachedResult() - 24h caching
  - Verify: Handles network timeouts (5s max)
  - Verify: Deduplicates simultaneous checks
  - Verify: Comprehensive error handling

- [ ] **Create version comparison logic** - Semantic versioning
  - File: `src/extension/updates/lib/versionCompare.ts` 
  - Implement: compareVersions(v1, v2) - Returns -1, 0, or 1
  - Implement: parseVersion(versionString) - Returns {major, minor, patch}
  - Implement: isValidVersion(version) - Validates format
  - Verify: Handles pre-release versions (1.0.0-beta)
  - Verify: Handles edge cases (missing patch, etc.)

### Update Notification System
- [ ] **Create updateNotifier** - Non-blocking notifications
  - Create: `src/extension/updates/updateNotifier.ts` 
  - Implement: notifyUpdateAvailable(updateInfo) - Show notification
  - Implement: onNotificationClicked(handler) - Handle user click
  - Implement: onNotificationDismissed(handler) - Handle dismissal
  - Verify: Uses chrome.notifications API
  - Verify: Non-blocking (doesn't interrupt user)
  - Verify: Includes version and release notes

- [ ] **Create notification templates** - Notification content
  - Create: `src/extension/updates/lib/notificationContent.ts` 
  - Implement: buildNotificationTitle(version)
  - Implement: buildNotificationMessage(releaseNotes)
  - Verify: Clear, concise messaging
  - Verify: Includes actionable information

### Update Installation
- [ ] **Create updateInstaller** - Chrome API integration
  - Create: `src/extension/updates/updateInstaller.ts` 
  - Implement: requestUpdateInstallation() - Call chrome.runtime.requestUpdateCheck()
  - Implement: onUpdateReady(handler) - Listen for update completion
  - Implement: handleInstallationError(error) - Error handling
  - Verify: Uses native Chrome update mechanism
  - Verify: Graceful error handling
  - Verify: Logs all installation attempts

### Update Lifecycle Management
- [ ] **Create updateLifecycle** - Handle update events
  - Create: `src/extension/updates/updateLifecycle.ts` 
  - Implement: initialize() - Set up event listeners
  - Implement: onInstalled(details) - Handle chrome.runtime.onInstalled
  - Implement: saveStateBeforeUpdate() - Preserve user state
  - Implement: restoreStateAfterUpdate() - Restore user state
  - Verify: Detects update vs install vs enable events
  - Verify: State preservation works correctly
  - Verify: Proper cleanup on destroy

### Extension Settings Page
- [ ] **Create settings HTML** - Settings page UI
  - Create: `extension/popup/settings.html` 
  - Include: "Check for Updates" button
  - Include: Current version display
  - Include: Last check time display
  - Include: Update history section
  - Verify: Responsive design
  - Verify: Accessible form controls

- [ ] **Create settings JavaScript** - Settings page logic
  - Create: `extension/popup/settings.js` 
  - Implement: Manual update check button handler
  - Implement: Display current version
  - Implement: Display last check time
  - Implement: Display update history
  - Verify: Calls updateService.checkForUpdates()
  - Verify: Updates UI with results
  - Verify: Handles errors gracefully

### Background Script Integration
- [ ] **Integrate update checks into background.ts** - Schedule checks
  - File: `src/extension/background.ts` 
  - Implement: Schedule daily update checks
  - Implement: Check on extension startup
  - Implement: Handle check results
  - Implement: Trigger notifications on update available
  - Verify: Doesn't interfere with existing functionality
  - Verify: Proper error handling

---

## Verification Commands

```bash
# Test update service
npm run test -- --testPathPattern=updateService

# Test version comparison
npm run test -- --testPathPattern=versionCompare

# Test notifier
npm run test -- --testPathPattern=updateNotifier

# Test installer
npm run test -- --testPathPattern=updateInstaller

# Test lifecycle
npm run test -- --testPathPattern=updateLifecycle

# Build extension
npm run build

# Check manifest validity
npm run lint extension/manifest.json
```

---

## Notes Section

**Implementation Notes**:
- Update checks should be non-blocking background operations
- Notifications should use chrome.notifications API (not alert dialogs)
- State preservation: Serialize extension state before update, restore after
- Settings page: Keep UI simple and focused on update status
- Background script: Use alarms API for scheduling (not setTimeout)

**Critical Decisions**:
- Use chrome.runtime.requestUpdateCheck() for installation (native mechanism)
- Cache update check results for 24 hours to avoid excessive checks
- 5-second timeout for update checks (configurable)
- Non-blocking notifications (user can dismiss)

**Potential Issues**:
- Chrome API mocking complexity in tests (mitigated by comprehensive mocks)
- State loss during update (mitigated by serialization)
- Silent update failures (mitigated by error logging)

**Questions & Clarifications**:
- Confirm notification icon/image requirements
- Confirm release notes source (hardcoded vs fetched)
- Confirm update check frequency (daily seems reasonable)

---

## References

- **Chrome Notifications API**: `https://developer.chrome.com/docs/extensions/reference/notifications/`
- **Chrome Runtime API**: `https://developer.chrome.com/docs/extensions/reference/runtime/`
- **Chrome Alarms API**: `https://developer.chrome.com/docs/extensions/reference/alarms/`
- **Story 4-1**: Content Script patterns for extension integration
- **Story 2-4**: Extension Installation Guide for notification patterns
