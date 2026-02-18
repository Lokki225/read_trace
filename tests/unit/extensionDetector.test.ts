import { detectExtension, getBrowserName, ExtensionDetectionResult } from '../../src/lib/extension/detector';

describe('getBrowserName', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it('should return Chrome for Chrome user agent', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      writable: true,
      configurable: true,
    });
    expect(getBrowserName()).toBe('Chrome');
  });

  it('should return Firefox for Firefox user agent', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      },
      writable: true,
      configurable: true,
    });
    expect(getBrowserName()).toBe('Firefox');
  });

  it('should return Safari for Safari user agent', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      },
      writable: true,
      configurable: true,
    });
    expect(getBrowserName()).toBe('Safari');
  });
});

describe('detectExtension', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    // Clean up window.readtraceExtension
    delete (window as any).readtraceExtension;
  });

  it('should detect extension via window.readtraceExtension flag', async () => {
    (window as any).readtraceExtension = { version: '1.0.0' };

    const resultPromise = detectExtension(100);
    jest.runAllTimers();
    const result = await resultPromise;

    expect(result.installed).toBe(true);
  });

  it('should return not installed when extension is absent and timeout elapses', async () => {
    delete (window as any).readtraceExtension;

    const resultPromise = detectExtension(100);
    jest.runAllTimers();
    const result = await resultPromise;

    expect(result.installed).toBe(false);
  });

  it('should resolve with installed=true when extension message is received', async () => {
    delete (window as any).readtraceExtension;

    const resultPromise = detectExtension(5000);

    // Simulate extension sending ping response
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'READTRACE_EXTENSION_PING_RESPONSE', version: '1.2.0' },
      })
    );

    const result = await resultPromise;
    expect(result.installed).toBe(true);
    expect(result.version).toBe('1.2.0');
  });
});
