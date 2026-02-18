# Acceptance Criteria: Preferred Scan Site Configuration

## Overview

**Feature**: Preferred Scan Site Configuration  
**Feature ID**: 3-6  
**Story**: 3-6  
**Last Updated**: 2026-02-18  

## Acceptance Criteria

### AC-1: Select from supported platforms

```gherkin
Given a PreferredSitesForm
When user views platform options
Then all supported platforms display (MangaDex, others)
And user can select/deselect platforms
```

**Rationale**: Users need to choose their preferred sites.  
**Test Scenarios**: Test-scenarios.md - Unit Test Suite 1.1  

---

### AC-2: Reorder preferences

```gherkin
Given selected platforms
When user drags to reorder
Then preferences reorder correctly
And order persists on save
```

**Rationale**: Users want to prioritize sites.  
**Test Scenarios**: Test-scenarios.md - Unit Test Suite 1.2  

---

### AC-3: Save to Supabase

```gherkin
Given configured preferences
When user clicks Save
Then preferences save to user_profiles.preferred_sites
And save completes within 500ms
```

**Rationale**: Preferences must persist.  
**Test Scenarios**: Test-scenarios.md - Integration Test Suite 1.1  

---

### AC-4: Extension uses preferences

```gherkin
Given saved preferences
When extension detects reading
Then extension prioritizes preferred sites
And resume button uses preferred site
```

**Rationale**: Preferences should affect extension behavior.  
**Test Scenarios**: Test-scenarios.md - Integration Test Suite 1.2  

---

### AC-5: Update preferences anytime

```gherkin
Given existing preferences
When user updates preferences
Then changes save immediately
And no page reload required
```

**Rationale**: Users should be able to change preferences.  
**Test Scenarios**: Test-scenarios.md - Unit Test Suite 2.1  

---

### AC-6: Display in settings/onboarding

```gherkin
Given the settings or onboarding page
When user views preferences
Then PreferredSitesForm displays
And preferences are editable
```

**Rationale**: Preferences should be accessible.  
**Test Scenarios**: Test-scenarios.md - Integration Test Suite 1.3  

---

### AC-7: Default preferences if skipped

```gherkin
Given onboarding flow
When user skips preference configuration
Then default preferences set (MangaDex first)
And user can change later
```

**Rationale**: Users should have sensible defaults.  
**Test Scenarios**: Test-scenarios.md - Unit Test Suite 2.2  

---

### AC-8: Resume uses preferred site

```gherkin
Given configured preferences
When user clicks Resume
Then navigates to preferred site if available
And falls back to any available site
```

**Rationale**: Preferences should improve resume functionality.  
**Test Scenarios**: Test-scenarios.md - Integration Test Suite 1.4  

---

## Functional Requirements

- [ ] **PreferredSitesForm**: Configure preferences
  - Acceptance: Renders all platforms
  - Priority: CRITICAL

- [ ] **Drag-and-Drop**: Reorder preferences
  - Acceptance: Reorders correctly
  - Priority: HIGH

- [ ] **Save API**: Persist preferences
  - Acceptance: Saves to Supabase
  - Priority: CRITICAL

- [ ] **Extension Integration**: Use preferences
  - Acceptance: Extension respects order
  - Priority: HIGH

## Non-Functional Requirements

### Performance

- [ ] **Save Time**: < 500ms
- [ ] **Form Load**: < 200ms
- [ ] **Extension Sync**: < 1s

### Usability

- [ ] **Mobile Responsive**: Works on all devices
- [ ] **Drag-Friendly**: Easy to reorder
- [ ] **Clear Feedback**: Save confirmation

## Quality Gates

- [ ] **Unit Tests**: 80%+ coverage
- [ ] **Integration Tests**: 70%+ coverage
- [ ] **Code Review**: Approved
- [ ] **Performance**: Meets targets

---

**Document Status**: DRAFT  
**Last Reviewed**: 2026-02-18
