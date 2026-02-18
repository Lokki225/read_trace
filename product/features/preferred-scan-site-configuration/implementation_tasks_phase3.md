# Implementation Tasks: Preferred Scan Site Configuration - Phase 3

## Phase 3: Core Implementation

### React Components Implementation
- [ ] **Create PreferredSitesForm component** - Main form UI
  - Create: `src/components/settings/PreferredSitesForm.tsx`
  - Verify: Displays platform checkboxes
  - Verify: Implements drag-and-drop reordering
  
- [ ] **Create onboarding step** - Integration with onboarding flow
  - Create: `src/components/onboarding/PreferredSitesStep.tsx`
  - Verify: Allows skip with defaults
  
- [ ] **Create settings page** - User preference management
  - File: `src/app/settings/page.tsx`
  - Verify: Includes PreferredSitesForm

### Extension Integration
- [ ] **Update extension background script** - Fetch preferences
  - File: `extension/background.ts`
  - Verify: Fetches preferences on startup
  - Verify: Stores in chrome.storage.local
  
- [ ] **Update resume logic** - Use preferences for navigation
  - File: `extension/content.ts`
  - Verify: Checks preferred sites in order
  - Verify: Falls back to any available site
