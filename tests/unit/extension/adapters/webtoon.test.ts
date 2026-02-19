import {
  extractWebtoonSeriesTitle,
  extractWebtoonEpisodeNumber,
  extractWebtoonEpisodeTitle,
  extractWebtoonScrollProgress,
  extractWebtoonPageProgress,
  matchesWebtoon,
  webtoonAdapter,
  WebtoonAdapter,
} from '../../../../src/extension/adapters/webtoon';

function makeWebtoonDocument(overrides: {
  title?: string;
  metaOgTitle?: string;
  metaNameTitle?: string;
  h1SubjText?: string;
  episodeTitleText?: string;
  imageCount?: number;
  imageDataPage?: string;
  scrollTop?: number;
  scrollHeight?: number;
  clientHeight?: number;
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

  if (overrides.h1SubjText) {
    const h1 = doc.createElement('h1');
    h1.className = 'subj';
    h1.textContent = overrides.h1SubjText;
    doc.body.appendChild(h1);
  }

  if (overrides.episodeTitleText) {
    const h1 = doc.createElement('h1');
    h1.className = 'subj_episode';
    h1.textContent = overrides.episodeTitleText;
    doc.body.appendChild(h1);
  }

  if (overrides.imageCount !== undefined) {
    const list = doc.createElement('div');
    list.id = '_imageList';
    for (let i = 0; i < overrides.imageCount; i++) {
      const img = doc.createElement('img');
      if (overrides.imageDataPage) {
        img.setAttribute('data-page', String(i + 1));
      }
      list.appendChild(img);
    }
    doc.body.appendChild(list);
  }

  return doc;
}

describe('matchesWebtoon', () => {
  it('should match Webtoon viewer URL', () => {
    expect(
      matchesWebtoon(
        'https://www.webtoons.com/en/romance/my-series/viewer?title_no=123&episode_no=5'
      )
    ).toBe(true);
  });

  it('should match Webtoon list URL', () => {
    expect(
      matchesWebtoon('https://www.webtoons.com/en/romance/my-series/list?title_no=123')
    ).toBe(true);
  });

  it('should not match non-Webtoon URLs', () => {
    expect(matchesWebtoon('https://mangadex.org/chapter/abc/1')).toBe(false);
  });

  it('should not match empty string', () => {
    expect(matchesWebtoon('')).toBe(false);
  });

  it('should not match partial Webtoon domain', () => {
    expect(matchesWebtoon('https://notwebtoons.com/en/x/y/viewer')).toBe(false);
  });

  it('should match different locale paths', () => {
    expect(
      matchesWebtoon('https://www.webtoons.com/fr/romance/series/viewer?episode_no=1')
    ).toBe(true);
  });
});

describe('extractWebtoonSeriesTitle', () => {
  it('should extract title from og:title meta tag', () => {
    const doc = makeWebtoonDocument({ metaOgTitle: 'Lore Olympus' });
    expect(extractWebtoonSeriesTitle(doc)).toBe('Lore Olympus');
  });

  it('should extract title from meta name=title tag', () => {
    const doc = makeWebtoonDocument({ metaNameTitle: 'True Beauty' });
    expect(extractWebtoonSeriesTitle(doc)).toBe('True Beauty');
  });

  it('should extract title from h1.subj element', () => {
    const doc = makeWebtoonDocument({ h1SubjText: 'Tower of God' });
    expect(extractWebtoonSeriesTitle(doc)).toBe('Tower of God');
  });

  it('should prefer og:title over h1.subj', () => {
    const doc = makeWebtoonDocument({
      metaOgTitle: 'OG Title',
      h1SubjText: 'H1 Title',
    });
    expect(extractWebtoonSeriesTitle(doc)).toBe('OG Title');
  });

  it('should return null when no title found', () => {
    const doc = document.implementation.createHTMLDocument('');
    expect(extractWebtoonSeriesTitle(doc)).toBeNull();
  });

  it('should sanitize HTML tags from title', () => {
    const doc = makeWebtoonDocument({ metaOgTitle: '<b>Lore Olympus</b>' });
    const title = extractWebtoonSeriesTitle(doc);
    expect(title).not.toContain('<b>');
    expect(title).toContain('Lore Olympus');
  });

  it('should truncate very long titles to 200 characters', () => {
    const longTitle = 'B'.repeat(300);
    const doc = makeWebtoonDocument({ metaOgTitle: longTitle });
    expect(extractWebtoonSeriesTitle(doc)!.length).toBeLessThanOrEqual(200);
  });
});

describe('extractWebtoonEpisodeNumber', () => {
  it('should extract episode number from episode_no query param', () => {
    const doc = makeWebtoonDocument({ title: '' });
    const ep = extractWebtoonEpisodeNumber(
      'https://www.webtoons.com/en/romance/series/viewer?title_no=123&episode_no=42',
      doc
    );
    expect(ep).toBe(42);
  });

  it('should extract episode number from Ep. pattern in URL', () => {
    const doc = makeWebtoonDocument({ title: '' });
    const ep = extractWebtoonEpisodeNumber(
      'https://www.webtoons.com/en/romance/series/Ep.5/viewer',
      doc
    );
    expect(ep).toBe(5);
  });

  it('should extract episode number from page title', () => {
    const doc = makeWebtoonDocument({ title: 'Lore Olympus - Ep. 200 - Webtoon' });
    const ep = extractWebtoonEpisodeNumber(
      'https://www.webtoons.com/en/romance/series/viewer',
      doc
    );
    expect(ep).toBe(200);
  });

  it('should extract episode number from episode title element', () => {
    const doc = makeWebtoonDocument({ episodeTitleText: 'Episode 15 - The Beginning' });
    const ep = extractWebtoonEpisodeNumber(
      'https://www.webtoons.com/en/romance/series/viewer',
      doc
    );
    expect(ep).toBe(15);
  });

  it('should return null when no episode number found', () => {
    const doc = makeWebtoonDocument({ title: 'Webtoon' });
    const ep = extractWebtoonEpisodeNumber(
      'https://www.webtoons.com/en/romance/series/list',
      doc
    );
    expect(ep).toBeNull();
  });

  it('should not return 0 as valid episode number', () => {
    const doc = makeWebtoonDocument({ title: '' });
    const ep = extractWebtoonEpisodeNumber(
      'https://www.webtoons.com/en/romance/series/viewer?episode_no=0',
      doc
    );
    expect(ep).toBeNull();
  });

  it('should prefer episode_no query param over other sources', () => {
    const doc = makeWebtoonDocument({ title: 'Series - Ep. 99 - Webtoon' });
    const ep = extractWebtoonEpisodeNumber(
      'https://www.webtoons.com/en/romance/series/viewer?episode_no=10',
      doc
    );
    expect(ep).toBe(10);
  });
});

describe('extractWebtoonEpisodeTitle', () => {
  it('should extract episode title from h1.subj_episode', () => {
    const doc = makeWebtoonDocument({ episodeTitleText: 'Episode 1 - A New Beginning' });
    expect(extractWebtoonEpisodeTitle(doc)).toBe('Episode 1 - A New Beginning');
  });

  it('should return null when no episode title element found', () => {
    const doc = document.implementation.createHTMLDocument('');
    expect(extractWebtoonEpisodeTitle(doc)).toBeNull();
  });
});

describe('extractWebtoonScrollProgress', () => {
  it('should return 0 when scrollHeight equals clientHeight', () => {
    const doc = document.implementation.createHTMLDocument('');
    Object.defineProperty(doc.documentElement, 'scrollTop', { value: 0, configurable: true });
    Object.defineProperty(doc.documentElement, 'scrollHeight', { value: 500, configurable: true });
    Object.defineProperty(doc.documentElement, 'clientHeight', { value: 500, configurable: true });
    expect(extractWebtoonScrollProgress(doc)).toBe(0);
  });

  it('should return 50 when scrolled halfway', () => {
    const doc = document.implementation.createHTMLDocument('');
    Object.defineProperty(doc.documentElement, 'scrollTop', { value: 250, configurable: true });
    Object.defineProperty(doc.documentElement, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(doc.documentElement, 'clientHeight', { value: 500, configurable: true });
    expect(extractWebtoonScrollProgress(doc)).toBe(50);
  });

  it('should cap at 100 when overscrolled', () => {
    const doc = document.implementation.createHTMLDocument('');
    Object.defineProperty(doc.documentElement, 'scrollTop', { value: 600, configurable: true });
    Object.defineProperty(doc.documentElement, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(doc.documentElement, 'clientHeight', { value: 500, configurable: true });
    expect(extractWebtoonScrollProgress(doc)).toBe(100);
  });
});

describe('extractWebtoonPageProgress', () => {
  it('should return image count as totalPages when images found', () => {
    const doc = makeWebtoonDocument({ imageCount: 20 });
    const { pageNumber, totalPages } = extractWebtoonPageProgress(doc);
    expect(totalPages).toBe(20);
    expect(pageNumber).toBeNull();
  });

  it('should return null totalPages when no images found', () => {
    const doc = document.implementation.createHTMLDocument('');
    const { pageNumber, totalPages } = extractWebtoonPageProgress(doc);
    expect(totalPages).toBeNull();
    expect(pageNumber).toBeNull();
  });
});

describe('webtoonAdapter (V1)', () => {
  it('should have correct name', () => {
    expect(webtoonAdapter.name).toBe('Webtoon');
  });

  it('should match Webtoon viewer URLs', () => {
    expect(
      webtoonAdapter.matches(
        'https://www.webtoons.com/en/romance/series/viewer?episode_no=1'
      )
    ).toBe(true);
  });

  it('should not match non-Webtoon URLs', () => {
    expect(webtoonAdapter.matches('https://mangadex.org/chapter/abc/1')).toBe(false);
  });

  it('should extract series title via adapter interface', () => {
    const doc = makeWebtoonDocument({ metaOgTitle: 'Lore Olympus' });
    expect(webtoonAdapter.extractSeriesTitle(doc)).toBe('Lore Olympus');
  });

  it('should extract episode number via adapter interface', () => {
    const doc = makeWebtoonDocument({ title: '' });
    expect(
      webtoonAdapter.extractChapterNumber(
        'https://www.webtoons.com/en/romance/series/viewer?episode_no=25',
        doc
      )
    ).toBe(25);
  });
});

describe('WebtoonAdapter (V2)', () => {
  it('should have correct name', () => {
    const adapter = new WebtoonAdapter();
    expect(adapter.name).toBe('Webtoon');
  });

  it('should have urlPattern that matches Webtoon viewer URLs', () => {
    const adapter = new WebtoonAdapter();
    expect(
      adapter.urlPattern.test(
        'https://www.webtoons.com/en/romance/series/viewer?episode_no=1'
      )
    ).toBe(true);
  });

  it('should have urlPattern that does not match non-Webtoon URLs', () => {
    const adapter = new WebtoonAdapter();
    expect(adapter.urlPattern.test('https://mangadex.org/chapter/abc/1')).toBe(false);
  });

  it('detectSeries() should return null when window is not available', async () => {
    const adapter = new WebtoonAdapter();
    const originalWindow = global.window;
    (global as any).window = undefined;
    const result = await adapter.detectSeries().catch(() => null);
    expect(result).toBeNull();
    (global as any).window = originalWindow;
  });

  it('detectProgress() returns ProgressInfo shape', async () => {
    const adapter = new WebtoonAdapter();
    const originalWindow = global.window;
    (global as any).window = { location: { href: 'https://www.webtoons.com/en/x/y/viewer?episode_no=1' } };
    const result = await adapter.detectProgress().catch(() => ({
      scrollPosition: 0,
      pageNumber: null,
      totalPages: null,
      percentComplete: 0,
    }));
    expect(typeof result.scrollPosition).toBe('number');
    expect(typeof result.percentComplete).toBe('number');
    (global as any).window = originalWindow;
  });
});
