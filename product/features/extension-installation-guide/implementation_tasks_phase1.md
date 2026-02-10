# Implementation Tasks - Phase 1: Domain Layer

**Feature**: Browser Extension Installation Guide  
**Phase**: Domain Layer (Business Logic & Validation)  
**Dependencies**: None  
**Estimated Duration**: 1 day

## Phase Overview

Phase 1 establishes the foundational business logic for the extension installation guide. This phase focuses on browser detection, guide content organization, and validation logic.

## Phase Completion Criteria

- [ ] Browser detection logic implemented
- [ ] Guide content structure defined
- [ ] Installation status tracking logic
- [ ] Unit tests passing (>85% coverage)
- [ ] No dependencies on UI or database

---

## Task 1.1: Implement Browser Detection Logic

**File**: `backend/services/guide/browserDetection.ts`

**Description**: Create functions for detecting browser type from user agent.

**Acceptance Criteria**:
- Detect Chrome, Firefox, Safari browsers
- Return browser type and version
- Handle unknown browsers gracefully
- Clear error messages

**Implementation Details**:
```typescript
// backend/services/guide/browserDetection.ts

export enum BrowserType {
  CHROME = 'chrome',
  FIREFOX = 'firefox',
  SAFARI = 'safari',
  UNKNOWN = 'unknown'
}

export interface BrowserInfo {
  type: BrowserType;
  version?: string;
  isSupported: boolean;
}

export function detectBrowser(userAgent: string): BrowserInfo {
  if (userAgent.includes('Chrome')) {
    return {
      type: BrowserType.CHROME,
      version: extractVersion(userAgent, /Chrome\/([\d.]+)/),
      isSupported: true
    };
  }
  
  if (userAgent.includes('Firefox')) {
    return {
      type: BrowserType.FIREFOX,
      version: extractVersion(userAgent, /Firefox\/([\d.]+)/),
      isSupported: true
    };
  }
  
  if (userAgent.includes('Safari')) {
    return {
      type: BrowserType.SAFARI,
      version: extractVersion(userAgent, /Version\/([\d.]+)/),
      isSupported: true
    };
  }
  
  return {
    type: BrowserType.UNKNOWN,
    isSupported: false
  };
}

function extractVersion(userAgent: string, regex: RegExp): string | undefined {
  const match = userAgent.match(regex);
  return match ? match[1] : undefined;
}
```

**Verification**:
```bash
npm run test -- browserDetection.test.ts
```

**Dependencies**: None

**Estimated Time**: 1 hour

---

## Task 1.2: Define Guide Content Structure

**File**: `model/schemas/guide.ts`

**Description**: Create TypeScript interfaces for guide content organization.

**Acceptance Criteria**:
- GuideContent interface with browser-specific instructions
- InstallationStep interface for step-by-step guidance
- StoreLink interface for extension store URLs
- Troubleshooting interface for common issues

**Implementation Details**:
```typescript
// model/schemas/guide.ts

export interface InstallationStep {
  number: number;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface StoreLink {
  browser: BrowserType;
  storeName: string;
  url: string;
  icon?: string;
}

export interface GuideContent {
  browser: BrowserType;
  title: string;
  description: string;
  steps: InstallationStep[];
  storeLink: StoreLink;
  troubleshooting: TroubleshootingItem[];
}

export interface TroubleshootingItem {
  problem: string;
  solution: string;
  relatedSteps?: number[];
}
```

**Verification**:
```bash
npm run type-check
```

**Dependencies**: None

**Estimated Time**: 1 hour

---

## Task 1.3: Implement Installation Status Tracking

**File**: `backend/services/guide/statusTracker.ts`

**Description**: Create functions for tracking extension installation status.

**Acceptance Criteria**:
- Track installation status per user
- Track installation timestamp
- Track browser type used
- Support status queries

**Implementation Details**:
```typescript
// backend/services/guide/statusTracker.ts

export interface InstallationStatus {
  user_id: string;
  is_installed: boolean;
  installed_at?: Date;
  browser_type?: BrowserType;
  extension_version?: string;
}

export function createInstallationStatus(
  userId: string,
  browserType: BrowserType
): InstallationStatus {
  return {
    user_id: userId,
    is_installed: true,
    installed_at: new Date(),
    browser_type: browserType
  };
}

export function updateInstallationStatus(
  status: InstallationStatus,
  extensionVersion: string
): InstallationStatus {
  return {
    ...status,
    extension_version: extensionVersion
  };
}
```

**Verification**:
```bash
npm run test -- statusTracker.test.ts
```

**Dependencies**: None

**Estimated Time**: 1 hour

---

## Phase 1 Completion Checklist

- [ ] Browser detection logic implemented
- [ ] Guide content structure defined
- [ ] Installation status tracking implemented
- [ ] All unit tests passing (>85% coverage)
- [ ] No external dependencies in this phase
- [ ] Code review approved
- [ ] Ready for Phase 2

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]
