# Story 2.4: Browser Extension Installation Guide

Status: ready-for-dev

## Story

As a new user,
I want clear instructions for installing the ReadTrace browser extension,
So that I can start automatically tracking my reading progress.

## Acceptance Criteria

1. **Given** I have completed account setup
   **When** I view the onboarding flow
   **Then** I see step-by-step instructions for installing the extension
   **And** instructions include Chrome, Firefox, and Safari options
   **And** I can click a direct link to the extension store
   **And** after installation, the extension communicates with my account
   **And** the onboarding confirms successful extension connection

## Tasks / Subtasks

- [ ] Create onboarding flow component (AC: 1)
  - [ ] Design multi-step onboarding wizard
  - [ ] Add browser detection to show relevant instructions
  - [ ] Create progress indicator for onboarding steps
  - [ ] Add skip option for users who already have extension
- [ ] Design extension installation instructions (AC: 1)
  - [ ] Create step-by-step guide for Chrome installation
  - [ ] Create step-by-step guide for Firefox installation
  - [ ] Create step-by-step guide for Safari installation (if supported)
  - [ ] Add visual aids (screenshots, icons) for each step
- [ ] Implement extension store links (AC: 1)
  - [ ] Add direct link to Chrome Web Store
  - [ ] Add direct link to Firefox Add-ons
  - [ ] Add direct link to Safari Extensions (if available)
  - [ ] Handle browser detection for auto-selecting correct link
- [ ] Add extension connection verification (AC: 1)
  - [ ] Implement extension health check endpoint
  - [ ] Poll for extension connection status
  - [ ] Display success message when extension connects
  - [ ] Show troubleshooting tips if connection fails
- [ ] Create onboarding completion flow (AC: 1)
  - [ ] Mark onboarding as complete in user profile
  - [ ] Redirect to dashboard after successful setup
  - [ ] Add option to replay onboarding from settings
  - [ ] Track onboarding completion analytics

## Dev Notes

### Technical Requirements

**Onboarding Flow:** Multi-step wizard pattern
- Step 1: Welcome screen
- Step 2: Extension installation instructions
- Step 3: Extension connection verification
- Step 4: Optional preferences setup
- Step 5: Completion and dashboard redirect

**Browser Detection:** Client-side browser detection
- Detect Chrome, Firefox, Safari, Edge
- Show browser-specific instructions
- Provide fallback for unsupported browsers
- Use User-Agent parsing or `navigator.userAgent`

**Extension Communication:** Message passing protocol
- Extension sends "connected" message to web app
- Web app listens for extension messages
- Verify extension ID for security
- Store extension connection state in authStore

**UI Components:** shadcn/ui + Tailwind CSS
- Stepper component for progress indication
- Card components for instruction steps
- Button components for CTA (Call to Action)
- Alert components for warnings/success messages

### Architecture Compliance

**BMAD Layer Boundaries:**
- **Frontend**: `src/app/onboarding/page.tsx` + `src/components/onboarding/`
- **Backend**: `backend/services/onboarding/onboardingService.ts` (track completion)
- **API**: Supabase Client SDK for profile updates
- **Model**: `model/schemas/onboarding.ts` (onboarding state interfaces)
- **Database**: `user_profiles.onboarding_completed` field

**Communication Flow:**
```
Onboarding Page (src/app/)
  → Browser Detection (client-side)
  → Extension Store Links (external)
  → Extension Installation (user action)
  → Extension Sends Message (postMessage API)
  → onboardingService.markComplete (backend/services/)
  → Update user_profiles (Supabase)
```

**Forbidden Patterns:**
- Do NOT require extension for account creation
- Do NOT block users who skip extension installation
- Do NOT expose sensitive data in extension messages
- Do NOT skip browser compatibility checks

### Library/Framework Requirements

**Required Dependencies:**
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "react-use": "^17.4.0"
}
```

**Browser Detection Library (Optional):**
```json
{
  "ua-parser-js": "^1.0.37"
}
```

**Extension Store URLs:**
- Chrome: `https://chrome.google.com/webstore/detail/[extension-id]`
- Firefox: `https://addons.mozilla.org/firefox/addon/[extension-name]/`
- Edge: `https://microsoftedge.microsoft.com/addons/detail/[extension-id]`
- Safari: Apple App Store (requires Safari 14+ and macOS 10.14+)

**Browser Detection Pattern:**
```typescript
const detectBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('chrome') && !userAgent.includes('edge')) return 'chrome';
  if (userAgent.includes('firefox')) return 'firefox';
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
  if (userAgent.includes('edge')) return 'edge';
  return 'unknown';
};
```

### File Structure Requirements

**New Files to Create:**
```
src/
├── app/
│   └── onboarding/
│       ├── page.tsx                  # Main onboarding page
│       └── layout.tsx                # Onboarding-specific layout
├── components/
│   └── onboarding/
│       ├── OnboardingWizard.tsx      # Multi-step wizard component
│       ├── WelcomeStep.tsx           # Step 1: Welcome
│       ├── ExtensionInstallStep.tsx  # Step 2: Installation guide
│       ├── ConnectionVerifyStep.tsx  # Step 3: Connection check
│       ├── PreferencesStep.tsx       # Step 4: Optional preferences
│       ├── CompletionStep.tsx        # Step 5: Success message
│       └── BrowserInstructions.tsx   # Browser-specific guides
├── hooks/
│   ├── useBrowserDetection.ts        # Browser detection hook
│   └── useExtensionConnection.ts     # Extension connection monitoring
backend/
├── services/
│   └── onboarding/
│       └── onboardingService.ts      # Onboarding business logic
model/
├── schemas/
│   └── onboarding.ts                 # Onboarding state interfaces
└── types/
    └── browser.ts                    # Browser type definitions
tests/
├── unit/
│   └── browserDetection.test.ts
├── integration/
│   └── onboarding.integration.test.ts
└── __mocks__/
    └── extensionMessages.ts
```

**File Naming Conventions:**
- Components: PascalCase (`OnboardingWizard.tsx`)
- Hooks: camelCase with 'use' prefix (`useBrowserDetection.ts`)
- Services: camelCase (`onboardingService.ts`)
- Types: PascalCase (`BrowserType`, `OnboardingStep`)

### Testing Requirements

**Unit Tests Required:**
- Browser detection logic
- Extension connection state management
- Onboarding step navigation
- Completion state persistence

**Integration Tests Required:**
- Complete onboarding flow
- Extension connection verification
- Browser-specific instruction display
- Onboarding skip functionality
- Profile update after completion

**Test Files:**
```
tests/
├── unit/
│   ├── browserDetection.test.ts
│   ├── extensionConnection.test.ts
│   └── onboardingService.test.ts
├── integration/
│   └── onboarding-flow.integration.test.ts
└── __mocks__/
    └── extensionMessages.ts          # Mock extension messages
```

**Test Coverage Target:** 85% for onboarding components

**Critical Test Scenarios:**
- User sees correct browser instructions
- Extension store links open correctly
- Connection verification detects extension
- Onboarding can be skipped
- Completion state persists in profile
- User redirects to dashboard after completion
- Error handling for connection failures

### Previous Story Intelligence

**Story 2.1, 2.2, 2.3 Learnings:**
- User authentication flow established
- User profiles table has extensible schema
- Zustand authStore manages user session
- Toast notifications for user feedback
- Form validation patterns established
- Supabase client SDK integration working

**Key Patterns Established:**
- Multi-step forms with state management
- Client-side feature detection
- Profile field updates via Supabase
- Loading states with optimistic UI
- Error handling with user-friendly messages

**Files to Reference:**
- `src/store/authStore.ts` - Add extension connection state
- `database/migrations/002_create_profiles.sql` - Add onboarding_completed field
- `backend/services/auth/profileService.ts` - Profile update patterns

**Reusable Components:**
- Toast notification system
- Button and form components from shadcn/ui
- Loading states and progress indicators
- Error boundary patterns

### Latest Technical Information

**Browser Extension Installation Best Practices (2026):**
- Provide clear value proposition before installation
- Show screenshots of extension in action
- Explain permissions required and why
- Offer alternative workflow for users without extension
- Track installation funnel for optimization

**Extension Communication Patterns:**
- Use `window.postMessage` for cross-origin communication
- Verify message origin for security
- Implement timeout for connection attempts (30 seconds)
- Graceful fallback if extension not installed
- Polling vs event-based connection detection

**Extension Connection Verification:**
```typescript
// Web app listens for extension
useEffect(() => {
  const handleExtensionMessage = (event: MessageEvent) => {
    if (event.data.type === 'READTRACE_EXTENSION_CONNECTED') {
      setExtensionConnected(true);
      onboardingService.markExtensionConnected();
    }
  };
  window.addEventListener('message', handleExtensionMessage);
  return () => window.removeEventListener('message', handleExtensionMessage);
}, []);

// Extension sends message on load
window.postMessage({ type: 'READTRACE_EXTENSION_CONNECTED', version: '1.0.0' }, '*');
```

**Onboarding Completion Analytics:**
- Track completion rate (target: 80% per AC)
- Monitor drop-off at each step
- Measure time to complete onboarding
- Track browser distribution
- A/B test instruction variations

**Accessibility Considerations:**
- Keyboard navigation through steps
- Screen reader announcements for step changes
- ARIA labels for progress indicators
- Focus management between steps
- High contrast mode support

### Project Context Reference

**Product Layer:** `product/features/quick-onboarding/spec.md`
**Architecture:** `docs/contracts.md` - BMAD boundaries
**User Personas:**
- Alex (college student): Familiar with extensions, quick installation
- Sam (working professional): May need more guidance, wants efficiency
- Jordan (return reader): Appreciates clear, simple instructions

**Related Stories:**
- Story 2.1: User Registration (prerequisite - user must be authenticated)
- Story 4.1: Browser Extension Content Script (extension implementation)
- Story 4.2: Background Script (extension backend communication)

**Extension Installation Use Cases:**
- First-time setup during onboarding
- Re-installation after browser change
- Troubleshooting connection issues
- Optional skip for users wanting to explore first

**Success Metrics:**
- 80% onboarding completion rate (per AC)
- <2 minutes average onboarding time (per PRD)
- <5% support requests for installation issues
- 90%+ extension connection success rate

## Dev Agent Record

### Agent Model Used

<!-- Dev agent to fill in model name and version -->

### Debug Log References

<!-- Dev agent to add links to debug logs if needed -->

### Completion Notes List

<!-- Dev agent to document implementation notes and decisions -->

### File List

<!-- Dev agent to list all files created or modified -->
