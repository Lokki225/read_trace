# Implementation Tasks - Phase 1: Architecture & Setup

> **Purpose**: Break down feature implementation into granular, trackable tasks for AI agents and developers.
> **Status Legend**: `[ ]` Pending | `[~]` In Progress | `[x]` Done
> **Tech Stack**: TypeScript, Chrome Extension Manifest V3, Jest

---

## Pre-Implementation Checklist

### Product Requirements Validation
- [ ] **Read spec.md** - Understand feature requirements and user flows
  - File: `product/features/browser-extension-content-script/spec.md`
  - Verify: All goals, non-goals, and constraints are clear
  
- [ ] **Read acceptance-criteria.md** - Understand success criteria
  - File: `product/features/browser-extension-content-script/acceptance-criteria.md`
  - Verify: All requirements have clear testable behaviors
  
- [ ] **Read test-scenarios.md** - Understand testing requirements
  - File: `product/features/browser-extension-content-script/test-scenarios.md`
  - Verify: Test scenarios cover all acceptance criteria
  
- [ ] **Read risks.md** - Understand potential issues
  - File: `product/features/browser-extension-content-script/risks.md`
  - Verify: Mitigation strategies are documented

- [ ] **Check FEATURE_STATUS.json** - Verify feature is in SPECIFIED state
  - File: `product/FEATURE_STATUS.json`
  - Verify: Feature state = "SPECIFIED" before coding

---

## Phase 1: Architecture & Setup

### Extension Directory Structure

- [ ] **Create extension directory structure**
  - Create: `extension/` directory at project root
  - Create: `extension/icons/` for extension icons (16x16, 48x48, 128x128 PNG)
  - Create: `extension/manifest.json` (Manifest V3 configuration)
  - Create: `src/extension/` for TypeScript source files
  - Create: `src/extension/adapters/` for platform-specific adapters
  - Verify: Folder structure follows extension best practices

### Manifest V3 Configuration

- [ ] **Create extension/manifest.json**
  - Include: `manifest_version: 3`
  - Include: `name`, `version`, `description`, `icons`
  - Include: `content_scripts` array with MangaDex URL patterns
  - Include: `host_permissions` for DOM access on supported sites
  - Include: `permissions` array with `runtime`, `storage`, `scripting`
  - Include: `background.service_worker` path
  - Verify: Valid Manifest V3 format, no deprecated fields

### TypeScript Type Definitions

- [ ] **Create src/extension/types.ts**
  - Define: `ProgressUpdate` interface with required fields
  - Define: `PlatformAdapter` interface for site-specific adapters
  - Define: `ExtensionMessage` type for message passing
  - Define: `DOMElements` interface for extracted page data
  - Include: JSDoc comments for all types
  - Verify: All types exported and properly documented

- [ ] **Create src/extension/adapters/index.ts**
  - Define: `PlatformAdapter` interface (if not in types.ts)
  - Define: `AdapterRegistry` class with adapter management
  - Include: `getAdapter(url: string): PlatformAdapter | null` method
  - Include: `registerAdapter(pattern: RegExp, adapter: PlatformAdapter)` method
  - Verify: Type-safe adapter registration and retrieval

### Utility Libraries

- [ ] **Create src/extension/utils.ts**
  - Implement: `debounce(fn, delay)` function for scroll event debouncing
  - Implement: `getScrollPercentage()` function to calculate scroll position
  - Implement: `validateProgressUpdate(data)` function for data validation
  - Implement: `logDebug(message)` and `logError(message)` for logging
  - Verify: Pure functions, well-tested, no side effects

- [ ] **Create src/extension/config.ts**
  - Define: `DEBOUNCE_DELAY = 500` (milliseconds)
  - Define: `SCROLL_THRESHOLD = 100` (pixels from bottom to trigger load)
  - Define: `MAX_RETRIES = 3` for message delivery
  - Define: `RETRY_DELAY = 1000` (milliseconds)
  - Verify: All configuration values documented

### Adapter Foundation

- [ ] **Create src/extension/adapters/mangadex.ts**
  - Define: `MangaDexAdapter` class implementing `PlatformAdapter`
  - Include: `extractSeriesTitle(dom: Document): string | null` method
  - Include: `extractChapterNumber(url: string): number | null` method
  - Include: `getScrollPercentage(): number` method
  - Include: DOM selector constants for MangaDex structure
  - Verify: All methods return correct types, handle missing data gracefully

---

## Task Dependencies Legend

**Blocking Dependencies**: Tasks that must complete before others can start
- ✅ Manifest configuration → Content script implementation
- ✅ Type definitions → All other implementation tasks
- ✅ Adapter interface → Adapter implementations

**Parallel Tasks**: Can be done simultaneously
- 🔄 Type definitions + Utility functions
- 🔄 Manifest creation + Adapter foundation

---

## Verification Commands (Copy-Paste Ready)

```bash
# Verify TypeScript compilation
npx tsc --noEmit

# Check manifest validity
npm run validate:manifest

# Run linter
npm run lint

# Format code
npm run format
```

---

## Notes Section

**Implementation Notes**:
- Manifest V3 is required for Chrome Web Store submission
- Content scripts run in isolated context, cannot access page variables directly
- Message passing uses chrome.runtime.sendMessage for security

**Questions & Clarifications**:
- [To be updated during implementation]

**Time Estimates**:
- Phase 1 (Setup): ~2-3 hours

---

## References

- **Spec**: `product/features/browser-extension-content-script/spec.md`
- **Acceptance Criteria**: `product/features/browser-extension-content-script/acceptance-criteria.md`
- **Test Scenarios**: `product/features/browser-extension-content-script/test-scenarios.md`
- **Risks**: `product/features/browser-extension-content-script/risks.md`
- **Chrome Extension Docs**: https://developer.chrome.com/docs/extensions/mv3/
