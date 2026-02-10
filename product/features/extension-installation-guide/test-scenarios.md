# Test Scenarios: Browser Extension Installation Guide

## Overview

**Feature**: Browser Extension Installation Guide  
**Feature ID**: extension-installation-guide  
**Story**: 2-4  
**Last Updated**: 2026-02-10  

This document outlines comprehensive test scenarios for the extension installation guide.

## Test Strategy

### Testing Pyramid

- **Unit Tests**: 60% - Guide logic, browser detection, state management
- **Integration Tests**: 30% - Extension detection, API calls
- **End-to-End Tests**: 10% - Complete installation flow

### Test Coverage Goals

- Unit Tests: 80%+ code coverage
- Integration Tests: 75%+ feature coverage
- End-to-End Tests: Critical user flows only

## Unit Tests

### Test Suite 1: Browser Detection

**File**: `src/__tests__/extension/browser-detection.test.ts`

#### Test Case 1.1: Detect Browser Type

```typescript
describe('Browser Detection', () => {
  it('should detect Chrome browser', () => {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    expect(detectBrowser(userAgent)).toBe('chrome');
  });

  it('should detect Firefox browser', () => {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
    expect(detectBrowser(userAgent)).toBe('firefox');
  });

  it('should detect Safari browser', () => {
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';
    expect(detectBrowser(userAgent)).toBe('safari');
  });
});
```

**Purpose**: Verify browser detection accuracy  
**Preconditions**: User agent strings available  
**Expected Result**: Correct browser identified  

### Test Suite 2: Extension Detection

**File**: `src/__tests__/extension/detection.test.ts`

#### Test Case 2.1: Detect Installed Extension

```typescript
describe('Extension Detection', () => {
  it('should detect installed extension', async () => {
    // Mock extension presence
    window.readtraceExtension = { version: '1.0.0' };
    
    const isInstalled = await detectExtension();
    expect(isInstalled).toBe(true);
  });

  it('should return false when extension not installed', async () => {
    delete window.readtraceExtension;
    
    const isInstalled = await detectExtension();
    expect(isInstalled).toBe(false);
  });
});
```

**Purpose**: Verify extension detection works correctly  
**Preconditions**: Extension detection logic available  
**Expected Result**: Extension presence correctly identified  

## Integration Tests

### Test Suite 1: Installation Guide Display

**File**: `tests/integration/guide-display.integration.test.ts`

#### Test Case 1.1: Display Guide After Signup

```typescript
describe('Installation Guide Display', () => {
  it('should display guide after account creation', async () => {
    // Complete signup
    const response = await completeSignup({
      email: 'test@example.com',
      password: 'SecurePass123'
    });
    
    expect(response.redirectUrl).toContain('/install-extension');
  });

  it('should allow skipping guide', async () => {
    const response = await skipInstallationGuide();
    expect(response.redirectUrl).toContain('/dashboard');
  });
});
```

**Purpose**: Verify guide displays at correct time  
**Preconditions**: Signup flow complete, database available  
**Expected Result**: Guide displays or can be skipped  

### Test Suite 2: Store Links

**File**: `tests/integration/store-links.integration.test.ts`

#### Test Case 2.1: Verify Store Links

```typescript
describe('Store Links', () => {
  it('should provide valid Chrome Web Store link', async () => {
    const link = getStoreLink('chrome');
    expect(link).toContain('chrome.google.com/webstore');
    
    // Verify link is accessible
    const response = await fetch(link, { method: 'HEAD' });
    expect(response.status).toBeLessThan(400);
  });

  it('should provide valid Firefox Add-ons link', async () => {
    const link = getStoreLink('firefox');
    expect(link).toContain('addons.mozilla.org');
    
    const response = await fetch(link, { method: 'HEAD' });
    expect(response.status).toBeLessThan(400);
  });
});
```

**Purpose**: Verify store links are valid and accessible  
**Preconditions**: Network access available  
**Expected Result**: All store links functional  

## End-to-End Tests

### Test Suite 1: Complete Installation Flow

**File**: `tests/e2e/installation-flow.e2e.test.ts`

#### Test Case 1.1: Chrome Installation Flow

```typescript
describe('Chrome Installation Flow', () => {
  it('should guide user through Chrome installation', async () => {
    // Navigate to guide
    await page.goto('http://localhost:3000/install-extension');
    
    // Select Chrome
    await page.click('[data-testid="browser-chrome"]');
    
    // Verify instructions display
    const instructions = await page.$('[data-testid="chrome-instructions"]');
    expect(instructions).toBeTruthy();
    
    // Verify store link present
    const storeLink = await page.$('[data-testid="chrome-store-link"]');
    expect(storeLink).toBeTruthy();
  });
});
```

**Purpose**: Verify complete Chrome installation flow  
**Preconditions**: App running, user authenticated  
**Expected Result**: User guided through installation  

#### Test Case 1.2: Firefox Installation Flow

```typescript
describe('Firefox Installation Flow', () => {
  it('should guide user through Firefox installation', async () => {
    await page.goto('http://localhost:3000/install-extension');
    
    await page.click('[data-testid="browser-firefox"]');
    
    const instructions = await page.$('[data-testid="firefox-instructions"]');
    expect(instructions).toBeTruthy();
    
    const storeLink = await page.$('[data-testid="firefox-store-link"]');
    expect(storeLink).toBeTruthy();
  });
});
```

**Purpose**: Verify complete Firefox installation flow  
**Preconditions**: App running, user authenticated  
**Expected Result**: User guided through installation  

## Manual Testing Scenarios

### Scenario 1: View Installation Guide

**Steps**:
1. Complete account signup
2. View installation guide
3. Verify guide displays correctly
4. Verify browser selection options visible

**Expected Result**: Guide displays with clear instructions

### Scenario 2: Select Browser and View Instructions

**Steps**:
1. Navigate to installation guide
2. Select Chrome browser
3. Verify Chrome-specific instructions display
4. Verify screenshots/videos present
5. Verify store link present

**Expected Result**: Browser-specific instructions display correctly

### Scenario 3: Extension Detection

**Steps**:
1. View installation guide without extension
2. Verify "not installed" message
3. Install extension
4. Refresh page
5. Verify "installed" success message

**Expected Result**: Extension detection works correctly

### Scenario 4: Skip Installation

**Steps**:
1. View installation guide
2. Click "Skip for now"
3. Verify redirect to dashboard
4. Verify guide accessible from settings

**Expected Result**: User can skip and access guide later

## Test Data

### Browser User Agents

```typescript
export const chromeUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

export const firefoxUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';

export const safariUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';
```

## Performance Testing

### Guide Performance

- **Guide load**: <500ms
- **Browser detection**: <100ms
- **Store link load**: <2 seconds
- **Extension detection**: <1 second

### Accessibility Testing

- **Keyboard navigation**: All buttons accessible
- **Screen reader**: Instructions readable
- **Color contrast**: 4.5:1 ratio
- **Mobile responsive**: Works on all screen sizes

---

**Document Status**: APPROVED  
**Last Reviewed**: 2026-02-10  
**Next Review**: 2026-03-10
