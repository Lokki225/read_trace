export enum BrowserType {
  CHROME = 'chrome',
  FIREFOX = 'firefox',
  SAFARI = 'safari',
  UNKNOWN = 'unknown',
}

export interface BrowserInfo {
  type: BrowserType;
  version?: string;
  isSupported: boolean;
}

export function extractVersion(userAgent: string, regex: RegExp): string | undefined {
  const match = userAgent.match(regex);
  return match ? match[1] : undefined;
}

export function detectBrowser(userAgent: string): BrowserInfo {
  if (!userAgent) {
    return { type: BrowserType.UNKNOWN, isSupported: false };
  }

  // Edge must be checked before Chrome because Edge UA contains "Chrome"
  if (userAgent.includes('Edg/') || userAgent.includes('Edge/')) {
    return { type: BrowserType.UNKNOWN, isSupported: false };
  }

  if (userAgent.includes('Chrome/')) {
    return {
      type: BrowserType.CHROME,
      version: extractVersion(userAgent, /Chrome\/([\d.]+)/),
      isSupported: true,
    };
  }

  if (userAgent.includes('Firefox/')) {
    return {
      type: BrowserType.FIREFOX,
      version: extractVersion(userAgent, /Firefox\/([\d.]+)/),
      isSupported: true,
    };
  }

  // Safari must be checked after Chrome/Firefox since their UAs include "Safari"
  if (userAgent.includes('Safari/') && userAgent.includes('Version/')) {
    return {
      type: BrowserType.SAFARI,
      version: extractVersion(userAgent, /Version\/([\d.]+)/),
      isSupported: true,
    };
  }

  return { type: BrowserType.UNKNOWN, isSupported: false };
}

export function isMobileBrowser(userAgent: string): boolean {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

export function getBrowserDisplayName(type: BrowserType): string {
  const names: Record<BrowserType, string> = {
    [BrowserType.CHROME]: 'Chrome',
    [BrowserType.FIREFOX]: 'Firefox',
    [BrowserType.SAFARI]: 'Safari',
    [BrowserType.UNKNOWN]: 'Unknown',
  };
  return names[type];
}
