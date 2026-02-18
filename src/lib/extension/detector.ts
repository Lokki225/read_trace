export interface ExtensionDetectionResult {
  installed: boolean;
  version?: string;
  browser?: 'chrome' | 'firefox' | 'safari';
}

function detectBrowserType(): 'chrome' | 'firefox' | 'safari' | 'unknown' {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;

  if (ua.includes('Edg/') || ua.includes('Edge/')) return 'unknown';
  if (ua.includes('Chrome/')) return 'chrome';
  if (ua.includes('Firefox/')) return 'firefox';
  if (ua.includes('Safari/') && ua.includes('Version/')) return 'safari';
  return 'unknown';
}

export function getBrowserName(): string {
  const browser = detectBrowserType();
  if (browser === 'unknown') return 'Unknown';
  return browser.charAt(0).toUpperCase() + browser.slice(1);
}

export async function detectExtension(
  timeout: number = 5000
): Promise<ExtensionDetectionResult> {
  // Fast path: check for injected global flag set by the extension
  if (typeof window !== 'undefined' && (window as any).readtraceExtension) {
    const ext = (window as any).readtraceExtension;
    return {
      installed: true,
      version: ext.version,
      browser: detectBrowserType() as 'chrome' | 'firefox' | 'safari',
    };
  }

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      window.removeEventListener('message', handler);
      resolve({ installed: false });
    }, timeout);

    function handler(event: MessageEvent) {
      if (event.data?.type === 'READTRACE_EXTENSION_PING_RESPONSE') {
        clearTimeout(timeoutId);
        window.removeEventListener('message', handler);
        const browser = detectBrowserType();
        resolve({
          installed: true,
          version: event.data.version,
          browser: browser === 'unknown' ? undefined : (browser as 'chrome' | 'firefox' | 'safari'),
        });
      }
    }

    window.addEventListener('message', handler);

    // Send ping to extension
    window.postMessage({ type: 'READTRACE_EXTENSION_PING' }, '*');
  });
}
