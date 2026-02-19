import {
  extractSeriesTitle,
  extractChapterNumber,
  matchesMangaDex,
  mangadexAdapter,
} from '../../../../src/extension/adapters/mangadex';

function makeDocument(overrides: {
  title?: string;
  metaOgTitle?: string;
  metaNameTitle?: string;
  h1Text?: string;
  h2Text?: string;
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
    h1.className = 'title';
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

describe('matchesMangaDex', () => {
  it('should match MangaDex chapter URLs', () => {
    expect(
      matchesMangaDex('https://mangadex.org/chapter/abc123-def456/1')
    ).toBe(true);
  });

  it('should match MangaDex title URLs', () => {
    expect(
      matchesMangaDex('https://mangadex.org/title/abc123-def456')
    ).toBe(true);
  });

  it('should not match non-MangaDex URLs', () => {
    expect(matchesMangaDex('https://example.com/manga/chapter/1')).toBe(false);
  });

  it('should not match empty string', () => {
    expect(matchesMangaDex('')).toBe(false);
  });

  it('should not match partial MangaDex domain', () => {
    expect(matchesMangaDex('https://notmangadex.org/chapter/abc')).toBe(false);
  });
});

describe('extractSeriesTitle', () => {
  it('should extract title from og:title meta tag', () => {
    const doc = makeDocument({ metaOgTitle: 'One Piece - MangaDex' });
    const title = extractSeriesTitle(doc);
    expect(title).toBe('One Piece - MangaDex');
  });

  it('should extract title from meta name=title tag', () => {
    const doc = makeDocument({ metaNameTitle: 'Naruto' });
    const title = extractSeriesTitle(doc);
    expect(title).toBe('Naruto');
  });

  it('should extract title from h1 with title class', () => {
    const doc = makeDocument({ h1Text: 'Attack on Titan' });
    const title = extractSeriesTitle(doc);
    expect(title).toBe('Attack on Titan');
  });

  it('should extract title from h2 with title class', () => {
    const doc = makeDocument({ h2Text: 'Bleach' });
    const title = extractSeriesTitle(doc);
    expect(title).toBe('Bleach');
  });

  it('should extract first part of document title when dash-separated', () => {
    const doc = makeDocument({ title: 'Dragon Ball - Chapter 1 - MangaDex' });
    const title = extractSeriesTitle(doc);
    expect(title).toBe('Dragon Ball');
  });

  it('should return document title when no dash separator', () => {
    const doc = makeDocument({ title: 'My Hero Academia' });
    const title = extractSeriesTitle(doc);
    expect(title).toBe('My Hero Academia');
  });

  it('should return null when no title found', () => {
    const doc = document.implementation.createHTMLDocument('');
    const title = extractSeriesTitle(doc);
    expect(title).toBeNull();
  });

  it('should sanitize HTML tags from title', () => {
    const doc = makeDocument({ metaOgTitle: '<b>One Piece</b>' });
    const title = extractSeriesTitle(doc);
    expect(title).not.toContain('<b>');
    expect(title).toContain('One Piece');
  });

  it('should truncate very long titles to 200 characters', () => {
    const longTitle = 'A'.repeat(300);
    const doc = makeDocument({ metaOgTitle: longTitle });
    const title = extractSeriesTitle(doc);
    expect(title!.length).toBeLessThanOrEqual(200);
  });

  it('should prefer og:title over other selectors', () => {
    const doc = makeDocument({
      metaOgTitle: 'OG Title',
      metaNameTitle: 'Meta Title',
      h1Text: 'H1 Title',
    });
    const title = extractSeriesTitle(doc);
    expect(title).toBe('OG Title');
  });
});

describe('extractChapterNumber', () => {
  it('should extract chapter number from URL path', () => {
    const doc = makeDocument({ title: '' });
    const chapter = extractChapterNumber(
      'https://mangadex.org/chapter/abc123/5',
      doc
    );
    expect(chapter).toBe(5);
  });

  it('should extract decimal chapter number from URL', () => {
    const doc = makeDocument({ title: '' });
    const chapter = extractChapterNumber(
      'https://mangadex.org/chapter/abc123/5.5',
      doc
    );
    expect(chapter).toBe(5.5);
  });

  it('should extract chapter number from URL with "Chapter" text', () => {
    const doc = makeDocument({ title: '' });
    const chapter = extractChapterNumber(
      'https://mangadex.org/chapter/abc123/Chapter-10',
      doc
    );
    expect(chapter).toBe(10);
  });

  it('should extract chapter number from page title', () => {
    const doc = makeDocument({ title: 'One Piece - Chapter 1050 - MangaDex' });
    const chapter = extractChapterNumber(
      'https://mangadex.org/chapter/abc123',
      doc
    );
    expect(chapter).toBe(1050);
  });

  it('should extract chapter number from h1 heading', () => {
    const doc = makeDocument({ h1Text: 'Chapter 42' });
    const chapter = extractChapterNumber(
      'https://mangadex.org/chapter/abc123',
      doc
    );
    expect(chapter).toBe(42);
  });

  it('should extract chapter number with Ch. abbreviation', () => {
    const doc = makeDocument({ title: 'Naruto Ch. 700 - MangaDex' });
    const chapter = extractChapterNumber(
      'https://mangadex.org/chapter/abc123',
      doc
    );
    expect(chapter).toBe(700);
  });

  it('should return null when no chapter number found', () => {
    const doc = makeDocument({ title: 'MangaDex' });
    const chapter = extractChapterNumber(
      'https://mangadex.org/title/abc123',
      doc
    );
    expect(chapter).toBeNull();
  });

  it('should not return 0 as a valid chapter number', () => {
    const doc = makeDocument({ title: '' });
    const chapter = extractChapterNumber(
      'https://mangadex.org/chapter/abc123/0',
      doc
    );
    expect(chapter).toBeNull();
  });
});

describe('mangadexAdapter', () => {
  it('should have correct name', () => {
    expect(mangadexAdapter.name).toBe('MangaDex');
  });

  it('should match MangaDex URLs', () => {
    expect(
      mangadexAdapter.matches('https://mangadex.org/chapter/abc123/1')
    ).toBe(true);
  });

  it('should not match non-MangaDex URLs', () => {
    expect(mangadexAdapter.matches('https://example.com')).toBe(false);
  });

  it('should extract series title via adapter interface', () => {
    const doc = makeDocument({ metaOgTitle: 'Berserk' });
    expect(mangadexAdapter.extractSeriesTitle(doc)).toBe('Berserk');
  });

  it('should extract chapter number via adapter interface', () => {
    const doc = makeDocument({ title: 'Berserk - Chapter 363 - MangaDex' });
    expect(
      mangadexAdapter.extractChapterNumber(
        'https://mangadex.org/chapter/abc123',
        doc
      )
    ).toBe(363);
  });
});
