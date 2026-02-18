import {
  detectBrowser,
  BrowserType,
  extractVersion,
  isMobileBrowser,
} from '../../src/backend/services/guide/browserDetection';

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
const FIREFOX_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
const SAFARI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';
const EDGE_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59';
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';

describe('detectBrowser', () => {
  it('should detect Chrome browser', () => {
    const result = detectBrowser(CHROME_UA);
    expect(result.type).toBe(BrowserType.CHROME);
    expect(result.isSupported).toBe(true);
  });

  it('should detect Firefox browser', () => {
    const result = detectBrowser(FIREFOX_UA);
    expect(result.type).toBe(BrowserType.FIREFOX);
    expect(result.isSupported).toBe(true);
  });

  it('should detect Safari browser', () => {
    const result = detectBrowser(SAFARI_UA);
    expect(result.type).toBe(BrowserType.SAFARI);
    expect(result.isSupported).toBe(true);
  });

  it('should detect Edge browser as UNKNOWN (not supported)', () => {
    const result = detectBrowser(EDGE_UA);
    expect(result.type).toBe(BrowserType.UNKNOWN);
    expect(result.isSupported).toBe(false);
  });

  it('should return UNKNOWN for unrecognized user agents', () => {
    const result = detectBrowser('SomeUnknownBrowser/1.0');
    expect(result.type).toBe(BrowserType.UNKNOWN);
    expect(result.isSupported).toBe(false);
  });

  it('should return UNKNOWN for empty user agent', () => {
    const result = detectBrowser('');
    expect(result.type).toBe(BrowserType.UNKNOWN);
    expect(result.isSupported).toBe(false);
  });

  it('should extract Chrome version', () => {
    const result = detectBrowser(CHROME_UA);
    expect(result.version).toBe('91.0.4472.124');
  });

  it('should extract Firefox version', () => {
    const result = detectBrowser(FIREFOX_UA);
    expect(result.version).toBe('89.0');
  });

  it('should extract Safari version', () => {
    const result = detectBrowser(SAFARI_UA);
    expect(result.version).toBe('14.1.1');
  });
});

describe('extractVersion', () => {
  it('should extract version from Chrome UA', () => {
    const version = extractVersion(CHROME_UA, /Chrome\/([\d.]+)/);
    expect(version).toBe('91.0.4472.124');
  });

  it('should return undefined when pattern does not match', () => {
    const version = extractVersion('no version here', /Chrome\/([\d.]+)/);
    expect(version).toBeUndefined();
  });
});

describe('isMobileBrowser', () => {
  it('should return true for mobile user agents', () => {
    expect(isMobileBrowser(MOBILE_UA)).toBe(true);
  });

  it('should return false for desktop Chrome', () => {
    expect(isMobileBrowser(CHROME_UA)).toBe(false);
  });

  it('should return false for desktop Firefox', () => {
    expect(isMobileBrowser(FIREFOX_UA)).toBe(false);
  });

  it('should return false for desktop Safari', () => {
    expect(isMobileBrowser(SAFARI_UA)).toBe(false);
  });
});
