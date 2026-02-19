# Platform Adapter Development Guide

This guide explains how to add support for new manga/comic reading platforms to ReadTrace.

## Overview

ReadTrace uses a **Strategy Pattern** with a **Registry** to support multiple platforms. Each platform has an adapter that knows how to extract reading data (series title, chapter number, reading progress) from that platform's DOM structure.

## Architecture

```
src/extension/adapters/
  types.ts          ← PlatformAdapterV2 interface + SeriesInfo/ChapterInfo/ProgressInfo types
  index.ts          ← Registry: detectAdapter(), registerAdapter(), detectAdapterV2(), registerAdapterV2()
  mangadex.ts       ← MangaDex implementation (V1 + V2)
  webtoon.ts        ← Webtoon implementation (V1 + V2)
  [platform].ts     ← Your new adapter goes here
```

## Adapter Interface

Every adapter must implement `PlatformAdapterV2` from `src/extension/adapters/types.ts`:

```typescript
interface PlatformAdapterV2 {
  name: string;                                    // Human-readable platform name
  urlPattern: RegExp;                              // Matches URLs this adapter handles
  validatePage(): boolean;                         // Returns true if current page is supported
  detectSeries(): Promise<SeriesInfo | null>;      // Extract series information
  detectChapter(): Promise<ChapterInfo | null>;    // Extract chapter information
  detectProgress(): Promise<ProgressInfo>;         // Extract reading progress
}
```

### Return Types

```typescript
interface SeriesInfo {
  title: string;      // Series title (sanitized, max 200 chars)
  platform: string;   // Platform name (same as adapter.name)
  url: string;        // Current page URL
}

interface ChapterInfo {
  number: number;       // Chapter/episode number (> 0)
  title: string | null; // Chapter title if available
  url: string;          // Current page URL
}

interface ProgressInfo {
  scrollPosition: number;    // 0–100 scroll percentage
  pageNumber: number | null; // Current page number (null if not applicable)
  totalPages: number | null; // Total pages (null if not applicable)
  percentComplete: number;   // 0–100 overall completion percentage
}
```

## Step-by-Step: Adding a New Platform

### Step 1: Analyze the Platform's DOM

Before writing code, inspect the target site's HTML structure:

1. Open the platform in Chrome DevTools
2. Navigate to a chapter/episode reader page
3. Identify elements for:
   - **Series title**: Look for `<meta property="og:title">`, `<h1>`, or platform-specific elements
   - **Chapter/episode number**: Check the URL, page title, or DOM elements
   - **Reading progress**: Count images, check scroll position, or find page indicators

### Step 2: Create the Adapter File

Create `src/extension/adapters/[platform].ts`:

```typescript
import { PlatformAdapter } from '../types';
import { PlatformAdapterV2, SeriesInfo, ChapterInfo, ProgressInfo } from './types';

// URL pattern that matches all supported pages on this platform
const PLATFORM_URL_PATTERN = /^https:\/\/www\.example\.com\/(reader|chapter)\//;

// Selectors for extracting series title (ordered by preference)
const SERIES_TITLE_SELECTORS = [
  'meta[property="og:title"]',
  'h1.series-title',
  // Add platform-specific selectors here
];

// Patterns for extracting chapter/episode number
const CHAPTER_NUMBER_PATTERNS = [
  /chapter[_-](\d+)/i,
  /ep(?:isode)?[_-]?(\d+)/i,
  // Add platform-specific patterns here
];

export function extractPlatformSeriesTitle(doc: Document): string | null {
  for (const selector of SERIES_TITLE_SELECTORS) {
    const el = doc.querySelector(selector);
    if (el) {
      const content = el.getAttribute('content') || el.textContent || null;
      if (content && content.trim()) {
        return sanitizeTitle(content.trim());
      }
    }
  }
  return null;
}

export function extractPlatformChapterNumber(url: string, doc: Document): number | null {
  for (const pattern of CHAPTER_NUMBER_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0) return num;
    }
  }
  // Fall back to page title
  const pageTitle = doc.title || '';
  for (const pattern of CHAPTER_NUMBER_PATTERNS) {
    const match = pageTitle.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return null;
}

function sanitizeTitle(title: string): string {
  return title
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'&]/g, '')
    .trim()
    .substring(0, 200);
}

export function matchesPlatform(url: string): boolean {
  return PLATFORM_URL_PATTERN.test(url);
}

// V1 adapter (backward compatible)
export const platformAdapter: PlatformAdapter = {
  name: 'PlatformName',
  matches: matchesPlatform,
  extractSeriesTitle: extractPlatformSeriesTitle,
  extractChapterNumber: extractPlatformChapterNumber,
};

// V2 adapter (full interface)
export class PlatformNameAdapter implements PlatformAdapterV2 {
  name = 'PlatformName';
  urlPattern = PLATFORM_URL_PATTERN;

  validatePage(): boolean {
    return matchesPlatform(window.location.href);
  }

  async detectSeries(): Promise<SeriesInfo | null> {
    const title = extractPlatformSeriesTitle(document);
    if (!title) return null;
    return { title, platform: 'PlatformName', url: window.location.href };
  }

  async detectChapter(): Promise<ChapterInfo | null> {
    const number = extractPlatformChapterNumber(window.location.href, document);
    if (number === null) return null;
    return { number, title: null, url: window.location.href };
  }

  async detectProgress(): Promise<ProgressInfo> {
    const scrollEl = document.documentElement || document.body;
    const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
    const scrollPosition = scrollHeight > 0
      ? Math.min(100, Math.round((scrollEl.scrollTop / scrollHeight) * 100))
      : 0;
    return {
      scrollPosition,
      pageNumber: null,
      totalPages: null,
      percentComplete: scrollPosition,
    };
  }
}
```

### Step 3: Register the Adapter

In `src/extension/adapters/index.ts`, add your adapter to both registries:

```typescript
import { platformAdapter, PlatformNameAdapter } from './[platform]';

// Add to V1 registry
const ADAPTER_REGISTRY: PlatformAdapter[] = [
  mangadexAdapter,
  webtoonAdapter,
  platformAdapter,  // ← Add here
];

// Add to V2 registry
const ADAPTER_V2_REGISTRY: PlatformAdapterV2[] = [
  new MangaDexAdapter(),
  new WebtoonAdapter(),
  new PlatformNameAdapter(),  // ← Add here
];

// Add to exports
export { mangadexAdapter, webtoonAdapter, platformAdapter, PlatformNameAdapter };
```

### Step 4: Write Tests

Create `tests/unit/extension/adapters/[platform].test.ts`:

```typescript
import {
  extractPlatformSeriesTitle,
  extractPlatformChapterNumber,
  matchesPlatform,
  platformAdapter,
  PlatformNameAdapter,
} from '../../../../src/extension/adapters/[platform]';

// Helper to build mock DOM
function makeDocument(overrides: { title?: string; metaOgTitle?: string }): Document {
  const doc = document.implementation.createHTMLDocument(overrides.title || '');
  if (overrides.metaOgTitle) {
    const meta = doc.createElement('meta');
    meta.setAttribute('property', 'og:title');
    meta.setAttribute('content', overrides.metaOgTitle);
    doc.head.appendChild(meta);
  }
  return doc;
}

describe('matchesPlatform', () => {
  it('should match supported URLs', () => {
    expect(matchesPlatform('https://www.example.com/reader/chapter-1')).toBe(true);
  });
  it('should not match other platforms', () => {
    expect(matchesPlatform('https://mangadex.org/chapter/abc/1')).toBe(false);
  });
});

describe('extractPlatformSeriesTitle', () => {
  it('should extract title from og:title', () => {
    const doc = makeDocument({ metaOgTitle: 'My Series' });
    expect(extractPlatformSeriesTitle(doc)).toBe('My Series');
  });
  it('should return null when no title found', () => {
    const doc = document.implementation.createHTMLDocument('');
    expect(extractPlatformSeriesTitle(doc)).toBeNull();
  });
});

// Add more tests for chapter extraction, progress, edge cases...
```

### Step 5: Update the Extension Manifest

If the new platform requires content script injection, update `extension/manifest.json`:

```json
{
  "content_scripts": [
    {
      "matches": [
        "https://mangadex.org/chapter/*",
        "https://www.webtoons.com/*/viewer*",
        "https://www.example.com/reader/*"  // ← Add new platform URL pattern
      ],
      "js": ["content.js"]
    }
  ],
  "host_permissions": [
    "https://mangadex.org/*",
    "https://www.webtoons.com/*",
    "https://www.example.com/*"  // ← Add host permission
  ]
}
```

## Common Patterns

### Extracting Titles

Always try multiple strategies in order of reliability:

1. `<meta property="og:title">` — most reliable, standardized
2. `<meta name="title">` — common fallback
3. Platform-specific heading elements (`h1.series-title`, etc.)
4. `document.title` — last resort, often includes extra text

Always sanitize titles:
- Strip HTML tags
- Remove special characters (`<`, `>`, `"`, `'`, `&`)
- Trim whitespace
- Truncate to 200 characters

### Extracting Chapter/Episode Numbers

Try sources in order of reliability:

1. URL query parameters (e.g., `?episode_no=42`)
2. URL path segments (e.g., `/chapter/42/`)
3. Page title patterns (e.g., `Chapter 42`)
4. DOM heading elements

Always validate: `!isNaN(num) && num > 0`

### Extracting Progress

**Scroll-based** (vertical scrollers like Webtoon):
```typescript
const scrollHeight = doc.documentElement.scrollHeight - doc.documentElement.clientHeight;
const percent = scrollHeight > 0
  ? Math.min(100, Math.round((doc.documentElement.scrollTop / scrollHeight) * 100))
  : 0;
```

**Page-based** (page-by-page readers like MangaDex):
```typescript
const images = doc.querySelectorAll('#_imageList img');
const totalPages = images.length;
const currentPage = parseInt(images[0]?.getAttribute('data-page') || '1', 10);
```

## Quirks and Workarounds

### MangaDex
- Uses UUID-based URLs: `/chapter/[uuid]/[page]`
- Chapter number is in the URL path after the UUID
- Series title is in `og:title` as `"Series Name - MangaDex"`

### Webtoon
- Episode number is in `?episode_no=N` query parameter
- Uses vertical infinite scroll (no page numbers)
- Images are in `#_imageList` container
- Different locale paths: `/en/`, `/fr/`, `/ko/`, etc.

## Testing Against Real Sites

For integration testing with real site HTML, save page snapshots:

```
tests/fixtures/
  mangadex-chapter-page.html
  webtoon-viewer-page.html
  [platform]-reader-page.html
```

Load them in tests with `document.implementation.createHTMLDocument()` or jsdom.

## Checklist for New Adapters

- [ ] `urlPattern` RegExp matches all supported page types
- [ ] `validatePage()` checks `window.location.href`
- [ ] `detectSeries()` returns `null` gracefully when title not found
- [ ] `detectChapter()` returns `null` gracefully when chapter not found
- [ ] `detectProgress()` always returns a valid `ProgressInfo` (never throws)
- [ ] Title sanitization applied (strip HTML, truncate to 200 chars)
- [ ] Chapter number validated (`> 0`, not `NaN`)
- [ ] V1 `PlatformAdapter` exported for backward compatibility
- [ ] V2 `PlatformAdapterV2` class exported
- [ ] Both adapters registered in `src/extension/adapters/index.ts`
- [ ] Unit tests cover: URL matching, title extraction, chapter extraction, progress, edge cases
- [ ] `extension/manifest.json` updated with new URL patterns and host permissions
- [ ] Platform-specific quirks documented in this guide
