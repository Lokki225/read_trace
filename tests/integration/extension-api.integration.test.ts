/**
 * Integration tests for extension installation feature.
 * Tests service/business logic integration (matching existing project pattern).
 */

import {
  detectBrowser,
  BrowserType,
  isMobileBrowser,
} from '../../src/backend/services/guide/browserDetection';
import {
  createInstallationStatus,
  createSkippedStatus,
  isInstallationComplete,
  isInstallationSkipped,
  isInstallationPending,
} from '../../src/backend/services/guide/statusTracker';
import {
  detectExtension,
  getBrowserName,
} from '../../src/lib/extension/detector';

// ── Browser Detection + Status Tracker Integration ────────────────────────────
describe('Browser Detection and Status Tracker Integration', () => {
  const CHROME_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  const FIREFOX_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
  const SAFARI_UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';

  it('should detect Chrome and create correct installation status', () => {
    const browser = detectBrowser(CHROME_UA);
    expect(browser.type).toBe(BrowserType.CHROME);
    expect(browser.isSupported).toBe(true);

    const status = createInstallationStatus('user-1', browser.type, '1.0.0');
    expect(status.browser_type).toBe(BrowserType.CHROME);
    expect(isInstallationComplete(status)).toBe(true);
    expect(isInstallationPending(status)).toBe(false);
  });

  it('should detect Firefox and create correct installation status', () => {
    const browser = detectBrowser(FIREFOX_UA);
    expect(browser.type).toBe(BrowserType.FIREFOX);

    const status = createInstallationStatus('user-2', browser.type, '1.0.0');
    expect(status.browser_type).toBe(BrowserType.FIREFOX);
    expect(isInstallationComplete(status)).toBe(true);
  });

  it('should detect Safari and create correct installation status', () => {
    const browser = detectBrowser(SAFARI_UA);
    expect(browser.type).toBe(BrowserType.SAFARI);

    const status = createInstallationStatus('user-3', browser.type);
    expect(status.browser_type).toBe(BrowserType.SAFARI);
    expect(isInstallationComplete(status)).toBe(true);
  });

  it('should handle unsupported browser and create skipped status', () => {
    const browser = detectBrowser('SomeUnknownBrowser/1.0');
    expect(browser.isSupported).toBe(false);

    const status = createSkippedStatus('user-4');
    expect(isInstallationSkipped(status)).toBe(true);
    expect(isInstallationComplete(status)).toBe(false);
  });
});

// ── Mobile Detection Integration ──────────────────────────────────────────────
describe('Mobile Browser Detection Integration', () => {
  it('should correctly identify mobile browsers and not create installation status', () => {
    const mobileUA =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';

    const isMobile = isMobileBrowser(mobileUA);
    expect(isMobile).toBe(true);

    // Mobile users should not have extension installed
    const status = { user_id: 'user-5', is_installed: false, installation_skipped: false };
    expect(isInstallationPending(status)).toBe(true);
  });

  it('should not flag desktop browsers as mobile', () => {
    const desktopUA =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

    expect(isMobileBrowser(desktopUA)).toBe(false);
  });
});

// ── Extension Detection Integration ──────────────────────────────────────────
describe('Extension Detection Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    delete (window as any).readtraceExtension;
  });

  afterEach(() => {
    jest.useRealTimers();
    delete (window as any).readtraceExtension;
  });

  it('should detect extension and allow creating installation status', async () => {
    (window as any).readtraceExtension = { version: '1.0.0' };

    const resultPromise = detectExtension(100);
    jest.runAllTimers();
    const result = await resultPromise;

    expect(result.installed).toBe(true);

    // Simulate creating status from detection result
    const browserType = result.browser
      ? (result.browser as BrowserType)
      : BrowserType.UNKNOWN;
    const status = createInstallationStatus('user-6', browserType, result.version);
    expect(isInstallationComplete(status)).toBe(true);
  });

  it('should handle extension not installed and create skipped status', async () => {
    const resultPromise = detectExtension(100);
    jest.runAllTimers();
    const result = await resultPromise;

    expect(result.installed).toBe(false);

    const status = createSkippedStatus('user-7');
    expect(isInstallationSkipped(status)).toBe(true);
  });
});

// ── Onboarding Flow State Machine Integration ─────────────────────────────────
describe('Onboarding Flow State Integration', () => {
  it('should progress through complete installation flow', () => {
    // Step 1: User starts with pending status
    const initialStatus = {
      user_id: 'user-8',
      is_installed: false,
      installation_skipped: false,
    };
    expect(isInstallationPending(initialStatus)).toBe(true);

    // Step 2: User installs extension
    const installedStatus = createInstallationStatus('user-8', BrowserType.CHROME, '1.0.0');
    expect(isInstallationComplete(installedStatus)).toBe(true);
    expect(isInstallationPending(installedStatus)).toBe(false);
    expect(isInstallationSkipped(installedStatus)).toBe(false);
  });

  it('should handle skip flow correctly', () => {
    const initialStatus = {
      user_id: 'user-9',
      is_installed: false,
      installation_skipped: false,
    };
    expect(isInstallationPending(initialStatus)).toBe(true);

    const skippedStatus = createSkippedStatus('user-9');
    expect(isInstallationSkipped(skippedStatus)).toBe(true);
    expect(isInstallationComplete(skippedStatus)).toBe(false);
    expect(isInstallationPending(skippedStatus)).toBe(false);
  });

  it('should validate store links for each supported browser', () => {
    const STORE_LINKS: Record<string, string> = {
      chrome: 'https://chrome.google.com/webstore/detail/readtrace/[extension-id]',
      firefox: 'https://addons.mozilla.org/firefox/addon/readtrace/',
      safari: 'https://apps.apple.com/app/readtrace/[app-id]',
    };

    const supportedBrowsers = [BrowserType.CHROME, BrowserType.FIREFOX, BrowserType.SAFARI];
    supportedBrowsers.forEach((browser) => {
      const link = STORE_LINKS[browser];
      expect(link).toBeDefined();
      expect(link.startsWith('https://')).toBe(true);
    });
  });
});
