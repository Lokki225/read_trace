# Implementation Tasks - Phase 4: UI Layer

**Feature**: Browser Extension Installation Guide  
**Phase**: UI Layer (Frontend Components)  
**Dependencies**: Phase 1 (Domain), Phase 2 (Detection), Phase 3 (Database)  
**Estimated Duration**: 2 days

## Phase Overview

Phase 4 implements the user interface components for the extension installation guide, including step-by-step instructions, extension detection UI, and onboarding integration.

## Phase Completion Criteria

- [ ] Installation guide components implemented
- [ ] Browser-specific instructions displayed
- [ ] Extension detection UI integrated
- [ ] Skip functionality implemented
- [ ] E2E tests passing (>90% coverage)
- [ ] Accessibility requirements met

---

## Task 4.1: Create Installation Guide Layout Component

**File**: `src/components/extension/InstallationGuide.tsx`

**Description**: Main layout component for extension installation guide.

**Acceptance Criteria**:
- Display guide header and introduction
- Show browser-specific content
- Handle browser selection
- Show progress/completion status

**Implementation Details**:
```typescript
// src/components/extension/InstallationGuide.tsx

'use client';

import { useState, useEffect } from 'react';
import { getBrowserName } from '@/lib/extension/detector';
import { useExtensionStatus } from '@/hooks/useExtensionStatus';

type BrowserType = 'chrome' | 'firefox' | 'safari';

export function InstallationGuide() {
  const [selectedBrowser, setSelectedBrowser] = useState<BrowserType | null>(null);
  const { status, loading, recheckStatus } = useExtensionStatus(10000); // Check every 10s
  
  useEffect(() => {
    // Auto-detect browser on mount
    const detectedBrowser = getBrowserName().toLowerCase() as BrowserType;
    if (['chrome', 'firefox', 'safari'].includes(detectedBrowser)) {
      setSelectedBrowser(detectedBrowser);
    }
  }, []);
  
  if (loading && !status) {
    return <div className="loading">Checking extension status...</div>;
  }
  
  if (status?.installed) {
    return (
      <div className="extension-installed">
        <div className="success-icon">✓</div>
        <h2>Extension Installed!</h2>
        <p>
          The ReadTrace extension is installed and ready to track your reading progress.
        </p>
        <p className="browser-info">
          Browser: {status.browser} | Version: {status.version}
        </p>
      </div>
    );
  }
  
  return (
    <div className="installation-guide">
      <header className="guide-header">
        <h1>Install ReadTrace Browser Extension</h1>
        <p>
          The browser extension automatically tracks your reading progress as you read manga online.
        </p>
      </header>
      
      <BrowserSelector
        selected={selectedBrowser}
        onSelect={setSelectedBrowser}
      />
      
      {selectedBrowser && (
        <BrowserInstructions
          browser={selectedBrowser}
          onVerify={recheckStatus}
        />
      )}
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- InstallationGuide.test.tsx
```

**Dependencies**: None

**Estimated Time**: 2 hours

---

## Task 4.2: Create Browser Selector Component

**File**: `src/components/extension/BrowserSelector.tsx`

**Description**: Component for selecting browser type.

**Acceptance Criteria**:
- Display Chrome, Firefox, Safari options
- Show browser logos
- Highlight selected browser
- Support keyboard navigation

**Implementation Details**:
```typescript
// src/components/extension/BrowserSelector.tsx

'use client';

interface BrowserSelectorProps {
  selected: string | null;
  onSelect: (browser: 'chrome' | 'firefox' | 'safari') => void;
}

export function BrowserSelector({ selected, onSelect }: BrowserSelectorProps) {
  const browsers = [
    { id: 'chrome' as const, name: 'Chrome', logo: '🌐' },
    { id: 'firefox' as const, name: 'Firefox', logo: '🦊' },
    { id: 'safari' as const, name: 'Safari', logo: '🧭' }
  ];
  
  return (
    <div className="browser-selector">
      <h2>Select Your Browser</h2>
      <div className="browser-options" role="radiogroup" aria-label="Select browser">
        {browsers.map((browser) => (
          <button
            key={browser.id}
            className={`browser-option ${selected === browser.id ? 'selected' : ''}`}
            onClick={() => onSelect(browser.id)}
            role="radio"
            aria-checked={selected === browser.id}
          >
            <div className="browser-logo">{browser.logo}</div>
            <div className="browser-name">{browser.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- BrowserSelector.test.tsx
```

**Dependencies**: Task 4.1

**Estimated Time**: 1 hour

---

## Task 4.3: Create Browser Instructions Component

**File**: `src/components/extension/BrowserInstructions.tsx`

**Description**: Display step-by-step installation instructions for selected browser.

**Acceptance Criteria**:
- Show browser-specific steps
- Include store link
- Display screenshots
- Show verification button

**Implementation Details**:
```typescript
// src/components/extension/BrowserInstructions.tsx

'use client';

interface BrowserInstructionsProps {
  browser: 'chrome' | 'firefox' | 'safari';
  onVerify: () => void;
}

const STORE_LINKS = {
  chrome: 'https://chrome.google.com/webstore/detail/readtrace/[extension-id]',
  firefox: 'https://addons.mozilla.org/firefox/addon/readtrace/',
  safari: 'https://apps.apple.com/app/readtrace/[app-id]'
};

const INSTRUCTIONS = {
  chrome: [
    'Click the "Add to Chrome" button below',
    'Click "Add extension" in the popup dialog',
    'The extension icon will appear in your toolbar',
    'You\'re all set! The extension will automatically track your reading'
  ],
  firefox: [
    'Click the "Add to Firefox" button below',
    'Click "Add" in the permission dialog',
    'The extension icon will appear in your toolbar',
    'You\'re all set! The extension will automatically track your reading'
  ],
  safari: [
    'Click the "Get" button in the App Store',
    'Open Safari preferences and enable the extension',
    'Grant necessary permissions',
    'You\'re all set! The extension will automatically track your reading'
  ]
};

export function BrowserInstructions({ browser, onVerify }: BrowserInstructionsProps) {
  return (
    <div className="browser-instructions">
      <h2>Installation Steps for {browser.charAt(0).toUpperCase() + browser.slice(1)}</h2>
      
      <ol className="instruction-steps">
        {INSTRUCTIONS[browser].map((step, index) => (
          <li key={index} className="instruction-step">
            <span className="step-number">{index + 1}</span>
            <span className="step-text">{step}</span>
          </li>
        ))}
      </ol>
      
      <div className="actions">
        <a
          href={STORE_LINKS[browser]}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Open {browser.charAt(0).toUpperCase() + browser.slice(1)} Store
        </a>
      </div>
      
      <div className="verification-section">
        <p>After installing the extension, click the button below to verify:</p>
        <button onClick={onVerify} className="btn-verify">
          Verify Installation
        </button>
      </div>
      
      <div className="help-section">
        <h3>Need Help?</h3>
        <details>
          <summary>Extension not detected?</summary>
          <ul>
            <li>Make sure you clicked "Add" or "Install" in the browser dialog</li>
            <li>Check that the extension icon appears in your toolbar</li>
            <li>Try refreshing this page</li>
            <li>If issues persist, contact support</li>
          </ul>
        </details>
      </div>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- BrowserInstructions.test.tsx
```

**Dependencies**: Task 4.1

**Estimated Time**: 2 hours

---

## Task 4.4: Create Extension Status Banner Component

**File**: `src/components/extension/ExtensionStatusBanner.tsx`

**Description**: Banner to display extension status throughout the app.

**Acceptance Criteria**:
- Show installation status
- Dismissible banner
- Link to installation guide
- Don't show if already installed or dismissed

**Implementation Details**:
```typescript
// src/components/extension/ExtensionStatusBanner.tsx

'use client';

import { useState, useEffect } from 'react';
import { useExtensionStatus } from '@/hooks/useExtensionStatus';
import Link from 'next/link';

export function ExtensionStatusBanner() {
  const { status, loading } = useExtensionStatus();
  const [dismissed, setDismissed] = useState(false);
  
  useEffect(() => {
    const isDismissed = localStorage.getItem('extension-banner-dismissed');
    setDismissed(isDismissed === 'true');
  }, []);
  
  const handleDismiss = () => {
    localStorage.setItem('extension-banner-dismissed', 'true');
    setDismissed(true);
  };
  
  if (loading || dismissed || status?.installed) {
    return null;
  }
  
  return (
    <div className="extension-status-banner" role="alert">
      <div className="banner-content">
        <span className="banner-icon">ℹ️</span>
        <p>
          Install the browser extension to automatically track your reading progress.
        </p>
      </div>
      <div className="banner-actions">
        <Link href="/extension-guide" className="btn-install">
          Install Extension
        </Link>
        <button onClick={handleDismiss} className="btn-dismiss" aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- ExtensionStatusBanner.test.tsx
```

**Dependencies**: Phase 2 (useExtensionStatus hook)

**Estimated Time**: 1 hour

---

## Task 4.5: Create Extension Guide Page

**File**: `src/app/extension-guide/page.tsx`

**Description**: Dedicated page for extension installation guide.

**Acceptance Criteria**:
- Display InstallationGuide component
- Handle skip functionality
- Redirect on completion
- Protected route

**Implementation Details**:
```typescript
// src/app/extension-guide/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InstallationGuide } from '@/components/extension/InstallationGuide';

export default function ExtensionGuidePage() {
  const router = useRouter();
  const [skipping, setSkipping] = useState(false);
  
  const handleSkip = async () => {
    if (!confirm('Are you sure you want to skip extension installation? You can install it later from settings.')) {
      return;
    }
    
    setSkipping(true);
    
    try {
      await fetch('/api/extension/skip', {
        method: 'POST'
      });
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to skip installation:', error);
      setSkipping(false);
    }
  };
  
  return (
    <div className="extension-guide-page">
      <InstallationGuide />
      
      <div className="skip-section">
        <button
          onClick={handleSkip}
          disabled={skipping}
          className="btn-skip"
        >
          {skipping ? 'Skipping...' : 'Skip for Now'}
        </button>
        <p className="skip-note">
          You can install the extension later from your settings.
        </p>
      </div>
    </div>
  );
}
```

**Verification**:
```bash
npm run dev
# Navigate to http://localhost:3000/extension-guide
```

**Dependencies**: All previous tasks

**Estimated Time**: 1 hour

---

## Task 4.6: Integrate into Onboarding Flow

**File**: `src/app/onboarding/page.tsx` (update)

**Description**: Add extension installation step to onboarding.

**Acceptance Criteria**:
- Show extension guide after registration
- Allow skip to continue onboarding
- Track completion status
- Redirect appropriately

**Implementation Details**:
```typescript
// src/app/onboarding/page.tsx (updated)

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InstallationGuide } from '@/components/extension/InstallationGuide';
import { useExtensionStatus } from '@/hooks/useExtensionStatus';

export default function OnboardingPage() {
  const router = useRouter();
  const { status } = useExtensionStatus();
  const [currentStep, setCurrentStep] = useState<'welcome' | 'extension' | 'complete'>('welcome');
  
  const handleContinue = () => {
    if (currentStep === 'welcome') {
      setCurrentStep('extension');
    } else if (currentStep === 'extension') {
      setCurrentStep('complete');
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  };
  
  const handleSkipExtension = async () => {
    await fetch('/api/extension/skip', { method: 'POST' });
    setCurrentStep('complete');
    setTimeout(() => router.push('/dashboard'), 2000);
  };
  
  return (
    <div className="onboarding-page">
      {currentStep === 'welcome' && (
        <div className="welcome-step">
          <h1>Welcome to ReadTrace!</h1>
          <p>Let's get you set up.</p>
          <button onClick={handleContinue} className="btn-primary">
            Get Started
          </button>
        </div>
      )}
      
      {currentStep === 'extension' && (
        <div className="extension-step">
          <InstallationGuide />
          {status?.installed ? (
            <button onClick={handleContinue} className="btn-primary">
              Continue to Dashboard
            </button>
          ) : (
            <button onClick={handleSkipExtension} className="btn-secondary">
              Skip for Now
            </button>
          )}
        </div>
      )}
      
      {currentStep === 'complete' && (
        <div className="complete-step">
          <h2>All Set!</h2>
          <p>Redirecting to your dashboard...</p>
        </div>
      )}
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- e2e/onboarding.e2e.test.ts
```

**Dependencies**: All previous tasks

**Estimated Time**: 2 hours

---

## Phase 4 Completion Checklist

- [ ] Installation guide layout component implemented
- [ ] Browser selector component implemented
- [ ] Browser instructions component implemented
- [ ] Extension status banner implemented
- [ ] Extension guide page created
- [ ] Onboarding flow updated
- [ ] All E2E tests passing (>90% coverage)
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Mobile responsive design verified
- [ ] Browser compatibility tested (Chrome, Firefox, Safari)
- [ ] Code review approved
- [ ] Ready for production

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]
