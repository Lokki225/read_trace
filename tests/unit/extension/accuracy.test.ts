import {
  recordDetectionAttempt,
  calculateAccuracy,
  getMetrics,
  getAllMetrics,
  generateReport,
  getDetectionAttempts,
  getFailedAttempts,
  resetMetrics,
  isAboveThreshold,
  logEdgeCase,
  DetectionAttempt,
} from '../../../src/extension/analytics/accuracyLogger';

import {
  extractSeriesTitle,
  extractChapterNumber,
  matchesMangaDex,
} from '../../../src/extension/adapters/mangadex';

import {
  extractWebtoonSeriesTitle,
  extractWebtoonEpisodeNumber,
  matchesWebtoon,
} from '../../../src/extension/adapters/webtoon';

function makeDocument(overrides: {
  title?: string;
  metaOgTitle?: string;
  metaNameTitle?: string;
  h1Text?: string;
  h2Text?: string;
  h1Class?: string;
}): Document {
  const doc = document.implementation.createHTMLDocument(overrides.title || '');
  if (overrides.metaOgTitle) {
    const meta = doc.createElement('meta');
    meta.setAttribute('property', 'og:title');
    meta.setAttribute('content', overrides.metaOgTitle);
    doc.head.appendChild(meta);
  }
  if (overrides.metaNameTitle) {
    const meta = doc.createElement('meta');
    meta.setAttribute('name', 'title');
    meta.setAttribute('content', overrides.metaNameTitle);
    doc.head.appendChild(meta);
  }
  if (overrides.h1Text) {
    const h1 = doc.createElement('h1');
    h1.className = overrides.h1Class ?? 'title';
    h1.textContent = overrides.h1Text;
    doc.body.appendChild(h1);
  }
  if (overrides.h2Text) {
    const h2 = doc.createElement('h2');
    h2.className = 'title';
    h2.textContent = overrides.h2Text;
    doc.body.appendChild(h2);
  }
  return doc;
}

function makeWebtoonDocument(overrides: {
  title?: string;
  metaOgTitle?: string;
  h1SubjText?: string;
  h1EpisodeText?: string;
}): Document {
  const doc = document.implementation.createHTMLDocument(overrides.title || '');
  if (overrides.metaOgTitle) {
    const meta = doc.createElement('meta');
    meta.setAttribute('property', 'og:title');
    meta.setAttribute('content', overrides.metaOgTitle);
    doc.head.appendChild(meta);
  }
  if (overrides.h1SubjText) {
    const h1 = doc.createElement('h1');
    h1.className = 'subj';
    h1.textContent = overrides.h1SubjText;
    doc.body.appendChild(h1);
  }
  if (overrides.h1EpisodeText) {
    const h1 = doc.createElement('h1');
    h1.className = 'subj_episode';
    h1.textContent = overrides.h1EpisodeText;
    doc.body.appendChild(h1);
  }
  return doc;
}

function makeAttempt(overrides: Partial<DetectionAttempt> = {}): DetectionAttempt {
  return {
    platform: 'MangaDex',
    url: 'https://mangadex.org/chapter/abc123/1',
    detected_title: 'One Piece',
    detected_chapter: 1,
    detected_scroll: 50,
    confidence: 95,
    success: true,
    timestamp: Date.now(),
    ...overrides,
  };
}

beforeEach(() => {
  resetMetrics();
});

// ─── Task 1: Accuracy Framework ───────────────────────────────────────────────

describe('calculateAccuracy', () => {
  it('returns 0 when total is 0', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('returns 100 when all detections succeed', () => {
    expect(calculateAccuracy(10, 10)).toBe(100);
  });

  it('returns 0 when no detections succeed', () => {
    expect(calculateAccuracy(0, 10)).toBe(0);
  });

  it('calculates partial accuracy correctly', () => {
    expect(calculateAccuracy(95, 100)).toBe(95);
  });

  it('rounds to one decimal place', () => {
    expect(calculateAccuracy(1, 3)).toBe(33.3);
  });

  it('returns 95 for 19 out of 20', () => {
    expect(calculateAccuracy(19, 20)).toBe(95);
  });
});

describe('recordDetectionAttempt', () => {
  it('records a successful attempt', () => {
    recordDetectionAttempt(makeAttempt({ success: true }));
    const metrics = getMetrics('MangaDex');
    expect(metrics).not.toBeNull();
    expect(metrics!.total_detections).toBe(1);
    expect(metrics!.successful_detections).toBe(1);
  });

  it('records a failed attempt with failure reason', () => {
    recordDetectionAttempt(makeAttempt({ success: false, failure_reason: 'no-title' }));
    const metrics = getMetrics('MangaDex');
    expect(metrics!.total_detections).toBe(1);
    expect(metrics!.successful_detections).toBe(0);
    expect(metrics!.common_failures).toContain('no-title');
  });

  it('accumulates multiple attempts', () => {
    recordDetectionAttempt(makeAttempt({ success: true }));
    recordDetectionAttempt(makeAttempt({ success: true }));
    recordDetectionAttempt(makeAttempt({ success: false, failure_reason: 'no-chapter' }));
    const metrics = getMetrics('MangaDex');
    expect(metrics!.total_detections).toBe(3);
    expect(metrics!.successful_detections).toBe(2);
  });

  it('tracks multiple platforms independently', () => {
    recordDetectionAttempt(makeAttempt({ platform: 'MangaDex', success: true }));
    recordDetectionAttempt(makeAttempt({ platform: 'Webtoon', success: false, failure_reason: 'no-episode' }));
    expect(getMetrics('MangaDex')!.total_detections).toBe(1);
    expect(getMetrics('Webtoon')!.total_detections).toBe(1);
    expect(getMetrics('MangaDex')!.successful_detections).toBe(1);
    expect(getMetrics('Webtoon')!.successful_detections).toBe(0);
  });

  it('updates accuracy_percentage after each attempt', () => {
    recordDetectionAttempt(makeAttempt({ success: true }));
    recordDetectionAttempt(makeAttempt({ success: false }));
    const metrics = getMetrics('MangaDex');
    expect(metrics!.accuracy_percentage).toBe(50);
  });

  it('updates last_updated timestamp', () => {
    const before = new Date();
    recordDetectionAttempt(makeAttempt());
    const metrics = getMetrics('MangaDex');
    expect(metrics!.last_updated.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('deduplicates common_failures', () => {
    recordDetectionAttempt(makeAttempt({ success: false, failure_reason: 'no-title' }));
    recordDetectionAttempt(makeAttempt({ success: false, failure_reason: 'no-title' }));
    const metrics = getMetrics('MangaDex');
    const count = metrics!.common_failures.filter((f) => f === 'no-title').length;
    expect(count).toBe(1);
  });
});

describe('getDetectionAttempts', () => {
  it('returns empty array initially', () => {
    expect(getDetectionAttempts()).toHaveLength(0);
  });

  it('returns all recorded attempts', () => {
    recordDetectionAttempt(makeAttempt({ success: true }));
    recordDetectionAttempt(makeAttempt({ success: false }));
    expect(getDetectionAttempts()).toHaveLength(2);
  });

  it('returns a copy not a reference', () => {
    recordDetectionAttempt(makeAttempt());
    const attempts = getDetectionAttempts();
    attempts.push(makeAttempt());
    expect(getDetectionAttempts()).toHaveLength(1);
  });
});

describe('getFailedAttempts', () => {
  it('returns only failed attempts', () => {
    recordDetectionAttempt(makeAttempt({ success: true }));
    recordDetectionAttempt(makeAttempt({ success: false, failure_reason: 'no-title' }));
    const failed = getFailedAttempts();
    expect(failed).toHaveLength(1);
    expect(failed[0].success).toBe(false);
  });

  it('filters by platform when provided', () => {
    recordDetectionAttempt(makeAttempt({ platform: 'MangaDex', success: false }));
    recordDetectionAttempt(makeAttempt({ platform: 'Webtoon', success: false }));
    const failed = getFailedAttempts('MangaDex');
    expect(failed).toHaveLength(1);
    expect(failed[0].platform).toBe('MangaDex');
  });

  it('returns empty array when no failures', () => {
    recordDetectionAttempt(makeAttempt({ success: true }));
    expect(getFailedAttempts()).toHaveLength(0);
  });
});

describe('generateReport', () => {
  it('generates report with correct totals', () => {
    recordDetectionAttempt(makeAttempt({ success: true }));
    recordDetectionAttempt(makeAttempt({ success: true }));
    recordDetectionAttempt(makeAttempt({ success: false }));
    const report = generateReport();
    expect(report.total_detections).toBe(3);
    expect(report.total_successes).toBe(2);
  });

  it('calculates overall accuracy at 95% for 19/20', () => {
    for (let i = 0; i < 19; i++) {
      recordDetectionAttempt(makeAttempt({ success: true }));
    }
    recordDetectionAttempt(makeAttempt({ success: false }));
    const report = generateReport();
    expect(report.overall_accuracy).toBe(95);
  });

  it('includes all platforms in report', () => {
    recordDetectionAttempt(makeAttempt({ platform: 'MangaDex', success: true }));
    recordDetectionAttempt(makeAttempt({ platform: 'Webtoon', success: true }));
    const report = generateReport();
    expect(report.platforms).toHaveLength(2);
    const names = report.platforms.map((p) => p.platform);
    expect(names).toContain('MangaDex');
    expect(names).toContain('Webtoon');
  });

  it('includes generated_at timestamp', () => {
    const before = new Date();
    const report = generateReport();
    expect(report.generated_at.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('returns 0 accuracy for empty metrics', () => {
    const report = generateReport();
    expect(report.overall_accuracy).toBe(0);
    expect(report.total_detections).toBe(0);
  });
});

describe('isAboveThreshold', () => {
  it('returns true when no data recorded', () => {
    expect(isAboveThreshold('MangaDex')).toBe(true);
  });

  it('returns true when accuracy is exactly 95%', () => {
    for (let i = 0; i < 19; i++) {
      recordDetectionAttempt(makeAttempt({ success: true }));
    }
    recordDetectionAttempt(makeAttempt({ success: false }));
    expect(isAboveThreshold('MangaDex')).toBe(true);
  });

  it('returns false when accuracy is below 95%', () => {
    for (let i = 0; i < 5; i++) {
      recordDetectionAttempt(makeAttempt({ success: true }));
    }
    for (let i = 0; i < 5; i++) {
      recordDetectionAttempt(makeAttempt({ success: false }));
    }
    expect(isAboveThreshold('MangaDex')).toBe(false);
  });
});

describe('getAllMetrics', () => {
  it('returns empty array when no metrics recorded', () => {
    expect(getAllMetrics()).toHaveLength(0);
  });

  it('returns metrics for all platforms', () => {
    recordDetectionAttempt(makeAttempt({ platform: 'MangaDex' }));
    recordDetectionAttempt(makeAttempt({ platform: 'Webtoon' }));
    recordDetectionAttempt(makeAttempt({ platform: 'MangaPlus' }));
    expect(getAllMetrics()).toHaveLength(3);
  });
});

describe('resetMetrics', () => {
  it('clears all metrics and attempts', () => {
    recordDetectionAttempt(makeAttempt());
    resetMetrics();
    expect(getDetectionAttempts()).toHaveLength(0);
    expect(getAllMetrics()).toHaveLength(0);
  });
});

describe('logEdgeCase', () => {
  it('does not throw for valid inputs', () => {
    expect(() =>
      logEdgeCase('MangaDex', 'https://mangadex.org/chapter/abc/1', 'multi-chapter', { extra: true })
    ).not.toThrow();
  });

  it('does not throw when details is undefined', () => {
    expect(() =>
      logEdgeCase('Webtoon', 'https://webtoons.com/en/test/viewer', 'dynamic-content')
    ).not.toThrow();
  });
});

// ─── Task 2: MangaDex Chapter Detection Accuracy ──────────────────────────────

describe('MangaDex chapter detection accuracy >= 95%', () => {
  const TEST_CASES = [
    { url: 'https://mangadex.org/chapter/abc123/1', doc: makeDocument({ metaOgTitle: 'One Piece' }), expectedTitle: 'One Piece', expectedChapter: 1 },
    { url: 'https://mangadex.org/chapter/abc123/5.5', doc: makeDocument({ title: 'Naruto - Chapter 5.5 - MangaDex' }), expectedTitle: 'Naruto', expectedChapter: 5.5 },
    { url: 'https://mangadex.org/chapter/abc123/1050', doc: makeDocument({ metaOgTitle: 'One Piece' }), expectedTitle: 'One Piece', expectedChapter: 1050 },
    { url: 'https://mangadex.org/chapter/abc123', doc: makeDocument({ title: 'Berserk - Chapter 363 - MangaDex' }), expectedTitle: 'Berserk', expectedChapter: 363 },
    { url: 'https://mangadex.org/chapter/abc123', doc: makeDocument({ title: 'Naruto Ch. 700 - MangaDex' }), expectedTitle: 'Naruto', expectedChapter: 700 },
    { url: 'https://mangadex.org/chapter/abc123/42', doc: makeDocument({ metaOgTitle: 'Attack on Titan' }), expectedTitle: 'Attack on Titan', expectedChapter: 42 },
    { url: 'https://mangadex.org/chapter/abc123/10', doc: makeDocument({ h1Text: 'Dragon Ball' }), expectedTitle: 'Dragon Ball', expectedChapter: 10 },
    { url: 'https://mangadex.org/chapter/abc123/Chapter-10', doc: makeDocument({ metaOgTitle: 'Test Series' }), expectedTitle: 'Test Series', expectedChapter: 10 },
    { url: 'https://mangadex.org/chapter/abc123/1', doc: makeDocument({ metaOgTitle: 'Fullmetal Alchemist' }), expectedTitle: 'Fullmetal Alchemist', expectedChapter: 1 },
    { url: 'https://mangadex.org/chapter/abc123/5', doc: makeDocument({ metaNameTitle: 'My Hero Academia' }), expectedTitle: 'My Hero Academia', expectedChapter: 5 },
    { url: 'https://mangadex.org/chapter/abc123/7', doc: makeDocument({ h2Text: 'Bleach' }), expectedTitle: 'Bleach', expectedChapter: 7 },
    { url: 'https://mangadex.org/chapter/abc123/999', doc: makeDocument({ title: 'Test Manga - Chapter 999 - MangaDex' }), expectedTitle: 'Test Manga', expectedChapter: 999 },
    { url: 'https://mangadex.org/chapter/abc123/1', doc: makeDocument({ title: 'Dragon Ball - Chapter 1 - MangaDex' }), expectedTitle: 'Dragon Ball', expectedChapter: 1 },
    { url: 'https://mangadex.org/chapter/abc123/1', doc: makeDocument({ metaOgTitle: 'OG Title', h1Text: 'H1 Title' }), expectedTitle: 'OG Title', expectedChapter: 1 },
    { url: 'https://mangadex.org/chapter/abc123/100', doc: makeDocument({ metaOgTitle: 'Demon Slayer' }), expectedTitle: 'Demon Slayer', expectedChapter: 100 },
    { url: 'https://mangadex.org/chapter/abc123/0.5', doc: makeDocument({ metaOgTitle: 'Test Series' }), expectedTitle: 'Test Series', expectedChapter: 0.5 },
    { url: 'https://mangadex.org/chapter/abc123-def/25', doc: makeDocument({ metaOgTitle: 'Vinland Saga' }), expectedTitle: 'Vinland Saga', expectedChapter: 25 },
    { url: 'https://mangadex.org/chapter/abc123/2.5', doc: makeDocument({ metaOgTitle: 'Chainsaw Man' }), expectedTitle: 'Chainsaw Man', expectedChapter: 2.5 },
    { url: 'https://mangadex.org/chapter/abc123/50', doc: makeDocument({ metaOgTitle: 'Jujutsu Kaisen' }), expectedTitle: 'Jujutsu Kaisen', expectedChapter: 50 },
    { url: 'https://mangadex.org/chapter/abc123/200', doc: makeDocument({ metaOgTitle: 'Fairy Tail' }), expectedTitle: 'Fairy Tail', expectedChapter: 200 },
  ];

  it('achieves >= 95% accuracy across 20 MangaDex test cases', () => {
    let successes = 0;
    for (const tc of TEST_CASES) {
      const detectedTitle = extractSeriesTitle(tc.doc);
      const detectedChapter = extractChapterNumber(tc.url, tc.doc);
      const titleOk = detectedTitle === tc.expectedTitle;
      const chapterOk = detectedChapter === tc.expectedChapter;
      const success = titleOk && chapterOk;
      if (success) successes++;
      recordDetectionAttempt({
        platform: 'MangaDex',
        url: tc.url,
        detected_title: detectedTitle,
        detected_chapter: detectedChapter,
        detected_scroll: 0,
        confidence: success ? 95 : 0,
        success,
        failure_reason: !success ? `title=${titleOk}, chapter=${chapterOk}` : undefined,
        timestamp: Date.now(),
      });
    }
    expect(calculateAccuracy(successes, TEST_CASES.length)).toBeGreaterThanOrEqual(95);
  });

  it('matches MangaDex chapter URLs', () => {
    expect(matchesMangaDex('https://mangadex.org/chapter/abc123/1')).toBe(true);
    expect(matchesMangaDex('https://mangadex.org/title/abc123')).toBe(true);
    expect(matchesMangaDex('https://example.com/chapter/1')).toBe(false);
  });
});

// ─── Task 2: Webtoon Chapter Detection Accuracy ───────────────────────────────

describe('Webtoon episode detection accuracy >= 95%', () => {
  const WEBTOON_TEST_CASES = [
    { url: 'https://www.webtoons.com/en/fantasy/tower-of-god/viewer?title_no=95&episode_no=550', doc: makeWebtoonDocument({ h1SubjText: 'Tower of God' }), expectedTitle: 'Tower of God', expectedEpisode: 550 },
    { url: 'https://www.webtoons.com/en/fantasy/tower-of-god/viewer', doc: makeWebtoonDocument({ title: 'Tower of God - Ep. 100 - Webtoon', h1SubjText: 'Tower of God' }), expectedTitle: 'Tower of God', expectedEpisode: 100 },
    { url: 'https://www.webtoons.com/en/fantasy/tower-of-god/viewer', doc: makeWebtoonDocument({ h1SubjText: 'Tower of God', h1EpisodeText: 'Ep. 42 - The Test' }), expectedTitle: 'Tower of God', expectedEpisode: 42 },
    { url: 'https://www.webtoons.com/en/fantasy/tower-of-god/viewer?episode_no=1', doc: makeWebtoonDocument({ metaOgTitle: 'Lore Olympus' }), expectedTitle: 'Lore Olympus', expectedEpisode: 1 },
    { url: 'https://www.webtoons.com/en/romance/test/viewer?episode_no=1', doc: makeWebtoonDocument({ h1SubjText: 'Test Series' }), expectedTitle: 'Test Series', expectedEpisode: 1 },
    { url: 'https://www.webtoons.com/en/romance/test/viewer?episode_no=200', doc: makeWebtoonDocument({ h1SubjText: 'Test Series' }), expectedTitle: 'Test Series', expectedEpisode: 200 },
    { url: 'https://www.webtoons.com/en/fantasy/test/viewer', doc: makeWebtoonDocument({ title: 'Test Series #55 - Webtoon', h1SubjText: 'Test Series' }), expectedTitle: 'Test Series', expectedEpisode: 55 },
    { url: 'https://www.webtoons.com/en/fantasy/test/viewer?episode_no=10', doc: makeWebtoonDocument({ h1SubjText: 'Unordinary' }), expectedTitle: 'Unordinary', expectedEpisode: 10 },
    { url: 'https://www.webtoons.com/en/fantasy/test/viewer?episode_no=999', doc: makeWebtoonDocument({ h1SubjText: 'Long Running Series' }), expectedTitle: 'Long Running Series', expectedEpisode: 999 },
    { url: 'https://www.webtoons.com/en/fantasy/test/viewer', doc: makeWebtoonDocument({ title: 'Test [Ep. 77] - Webtoon', h1SubjText: 'Test' }), expectedTitle: 'Test', expectedEpisode: 77 },
    { url: 'https://www.webtoons.com/en/fantasy/test/viewer?episode_no=5', doc: makeWebtoonDocument({ metaOgTitle: 'My Series Title' }), expectedTitle: 'My Series Title', expectedEpisode: 5 },
    { url: 'https://www.webtoons.com/en/fantasy/test/viewer', doc: makeWebtoonDocument({ h1SubjText: 'Series Name', h1EpisodeText: 'Ep. 300 - Chapter Title' }), expectedTitle: 'Series Name', expectedEpisode: 300 },
    { url: 'https://www.webtoons.com/en/drama/test/viewer?episode_no=50', doc: makeWebtoonDocument({ h1SubjText: 'Drama Series' }), expectedTitle: 'Drama Series', expectedEpisode: 50 },
    { url: 'https://www.webtoons.com/en/drama/test/viewer?episode_no=125', doc: makeWebtoonDocument({ h1SubjText: 'Another Series' }), expectedTitle: 'Another Series', expectedEpisode: 125 },
    { url: 'https://www.webtoons.com/en/action/test/viewer?episode_no=75', doc: makeWebtoonDocument({ h1SubjText: 'Action Series' }), expectedTitle: 'Action Series', expectedEpisode: 75 },
    { url: 'https://www.webtoons.com/en/action/test/viewer?episode_no=400', doc: makeWebtoonDocument({ h1SubjText: 'Epic Series' }), expectedTitle: 'Epic Series', expectedEpisode: 400 },
    { url: 'https://www.webtoons.com/en/comedy/test/viewer?episode_no=15', doc: makeWebtoonDocument({ h1SubjText: 'Comedy Series' }), expectedTitle: 'Comedy Series', expectedEpisode: 15 },
    { url: 'https://www.webtoons.com/en/romance/test/viewer?episode_no=88', doc: makeWebtoonDocument({ h1SubjText: 'Romance Series' }), expectedTitle: 'Romance Series', expectedEpisode: 88 },
    { url: 'https://www.webtoons.com/en/thriller/test/viewer?episode_no=33', doc: makeWebtoonDocument({ h1SubjText: 'Thriller Series' }), expectedTitle: 'Thriller Series', expectedEpisode: 33 },
    { url: 'https://www.webtoons.com/en/fantasy/test/viewer?episode_no=250', doc: makeWebtoonDocument({ h1SubjText: 'Fantasy Series' }), expectedTitle: 'Fantasy Series', expectedEpisode: 250 },
  ];

  it('achieves >= 95% accuracy across 20 Webtoon test cases', () => {
    let successes = 0;
    for (const tc of WEBTOON_TEST_CASES) {
      const detectedTitle = extractWebtoonSeriesTitle(tc.doc);
      const detectedEpisode = extractWebtoonEpisodeNumber(tc.url, tc.doc);
      const titleOk = detectedTitle === tc.expectedTitle;
      const episodeOk = detectedEpisode === tc.expectedEpisode;
      const success = titleOk && episodeOk;
      if (success) successes++;
      recordDetectionAttempt({
        platform: 'Webtoon',
        url: tc.url,
        detected_title: detectedTitle,
        detected_chapter: detectedEpisode,
        detected_scroll: 0,
        confidence: success ? 95 : 0,
        success,
        failure_reason: !success ? `title=${titleOk}, episode=${episodeOk}` : undefined,
        timestamp: Date.now(),
      });
    }
    expect(calculateAccuracy(successes, WEBTOON_TEST_CASES.length)).toBeGreaterThanOrEqual(95);
  });

  it('matches Webtoon viewer URLs', () => {
    expect(matchesWebtoon('https://www.webtoons.com/en/fantasy/tower-of-god/viewer?episode_no=1')).toBe(true);
    expect(matchesWebtoon('https://example.com/chapter/1')).toBe(false);
  });
});
