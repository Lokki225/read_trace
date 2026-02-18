import type { Platform } from '../../../model/schemas/import';

export const PLATFORM_PATTERNS: Record<string, RegExp> = {
  MangaDex: /mangadex\.org\/title\/[^\/\s]+/,
};

const PLATFORM_DOMAIN_PATTERNS: Record<Platform, RegExp> = {
  MangaDex: /mangadex\.org/,
  Other: /^$/,
};

export function detectPlatform(url: string): Platform {
  if (!url) return 'Other';
  try {
    new URL(url);
  } catch {
    return 'Other';
  }

  for (const [platform, pattern] of Object.entries(PLATFORM_DOMAIN_PATTERNS)) {
    if (platform === 'Other') continue;
    if (pattern.test(url)) return platform as Platform;
  }

  return 'Other';
}

const MANGADEX_TITLE_PATTERN = /mangadex\.org\/title\/[^\/\s]+(?:\/([^\/\s?#]+))?/;

export function extractSeriesFromUrl(
  url: string
): { title: string; platform: Platform } | null {
  if (!url) return null;

  try {
    new URL(url);
  } catch {
    return null;
  }

  const mangadexMatch = url.match(MANGADEX_TITLE_PATTERN);
  if (mangadexMatch) {
    const slug = mangadexMatch[1];
    return {
      title: slug ?? mangadexMatch[0].split('/title/')[1]?.split('/')[0] ?? 'unknown',
      platform: 'MangaDex',
    };
  }

  return null;
}
