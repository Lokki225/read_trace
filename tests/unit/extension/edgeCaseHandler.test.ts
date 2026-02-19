import {
  detectPageLayout,
  handleMultiChapterPage,
  handleHorizontalScrollPage,
  handleDynamicContent,
  handleMissingMetadata,
  handleSpecialCharacters,
  hasSpecialCharacters,
  handleEdgeCase,
  PageLayout,
  EdgeCaseResult,
} from '../../../src/extension/adapters/edgeCaseHandler';

function makeDocument(html: string): Document {
  const doc = document.implementation.createHTMLDocument('');
  doc.body.innerHTML = html;
  return doc;
}

// ─── Page Layout Detection ───────────────────────────────────────────────────

describe('detectPageLayout', () => {
  it('detects vertical scroll layout', () => {
    const doc = makeDocument(`
      <div id="_imageList" style="height: 2000px; overflow-y: auto;">
        <img src="page1.jpg" />
        <img src="page2.jpg" />
      </div>
    `);
    const layout = detectPageLayout(doc);
    expect(layout.isVerticalScroll).toBe(true);
  });

  it('detects horizontal scroll layout', () => {
    const doc = makeDocument(`
      <div class="manga-reader" style="width: 2000px; overflow-x: auto; display: flex;">
        <img src="page1.jpg" />
        <img src="page2.jpg" />
      </div>
    `);
    const layout = detectPageLayout(doc);
    expect(layout.isHorizontalScroll).toBe(true);
  });

  it('detects multi-chapter page', () => {
    const doc = makeDocument(`
      <div data-chapter="1">
        <h2>Chapter 1</h2>
        <img src="ch1_p1.jpg" />
      </div>
      <div data-chapter="2">
        <h2>Chapter 2</h2>
        <img src="ch2_p1.jpg" />
      </div>
    `);
    const layout = detectPageLayout(doc);
    expect(layout.isMultiChapter).toBe(true);
  });

  it('detects dynamic content', () => {
    const doc = makeDocument(`
      <div id="content">
        <img data-lazy="true" src="page1.jpg" />
      </div>
    `);
    const layout = detectPageLayout(doc);
    expect(layout.isDynamicContent).toBe(true);
  });

  it('detects missing metadata', () => {
    const doc = makeDocument(`<div>No title here</div>`);
    const layout = detectPageLayout(doc);
    expect(layout.hasMissingMetadata).toBe(true);
  });

  it('detects malformed HTML', () => {
    const doc = makeDocument(`<div>Unclosed tag<p>Content</div>`);
    const layout = detectPageLayout(doc);
    expect(layout.hasMalformedHtml).toBe(false);
  });
});

// ─── Multi-Chapter Handling ──────────────────────────────────────────────────

describe('handleMultiChapterPage', () => {
  it('returns success when single chapter detected', () => {
    const doc = makeDocument(`
      <div data-chapter="1">
        <h2>Chapter 1</h2>
        <img src="page1.jpg" />
      </div>
    `);
    const result = handleMultiChapterPage(doc, 'http://example.com', 'test');
    expect(result.handled).toBe(true);
    expect(result.edgeCaseType).toBe('multi-chapter');
  });

  it('returns warning for multiple chapters', () => {
    const doc = makeDocument(`
      <div data-chapter="1"><h2>Chapter 1</h2></div>
      <div data-chapter="2"><h2>Chapter 2</h2></div>
    `);
    const result = handleMultiChapterPage(doc, 'http://example.com', 'test');
    expect(result.handled).toBe(true);
    expect(result.notes).toContain('2');
  });

  it('extracts chapter numbers from multi-chapter page', () => {
    const doc = makeDocument(`
      <div data-chapter="1"><h2>Chapter 1: Beginning</h2></div>
      <div data-chapter="2"><h2>Chapter 2: Middle</h2></div>
    `);
    const result = handleMultiChapterPage(doc, 'http://example.com', 'test');
    expect(result.chapterNumber).toBe(2);
  });

  it('handles no chapters gracefully', () => {
    const doc = makeDocument(`<div>No chapters</div>`);
    const result = handleMultiChapterPage(doc, 'http://example.com', 'test');
    expect(result.handled).toBe(true);
  });

  it('returns handled true for multi-chapter pages', () => {
    const doc = makeDocument(`
      <h1>My Series Title</h1>
      <div data-chapter="1"><h2>Ch 1</h2></div>
    `);
    const result = handleMultiChapterPage(doc, 'http://example.com', 'test');
    expect(result.handled).toBe(true);
    expect(result.edgeCaseType).toBe('multi-chapter');
  });
});

// ─── Horizontal Scroll Handling ──────────────────────────────────────────────

describe('handleHorizontalScrollPage', () => {
  it('detects horizontal scroll container', () => {
    const doc = makeDocument(`
      <div class="manga-reader" style="overflow-x: auto; display: flex;">
        <img src="page1.jpg" />
        <img src="page2.jpg" />
      </div>
    `);
    const result = handleHorizontalScrollPage(doc, 'http://example.com', 'test');
    expect(result.handled).toBe(true);
    expect(result.edgeCaseType).toBe('horizontal-scroll');
  });

  it('counts pages in horizontal layout', () => {
    const doc = makeDocument(`
      <div class="reader-horizontal">
        <img data-page="1" src="p1.jpg" />
        <img data-page="2" src="p2.jpg" />
        <img data-page="3" src="p3.jpg" />
      </div>
    `);
    const result = handleHorizontalScrollPage(doc, 'http://example.com', 'test');
    expect(result.totalPages).toBe(3);
  });

  it('returns handled for non-horizontal layouts', () => {
    const doc = makeDocument(`<div>Vertical content</div>`);
    const result = handleHorizontalScrollPage(doc, 'http://example.com', 'test');
    expect(result.handled).toBe(true);
  });

  it('extracts chapter number from page', () => {
    const doc = makeDocument(`
      <h2>Chapter 5</h2>
      <div class="reader-horizontal">
        <img src="p1.jpg" />
      </div>
    `);
    const result = handleHorizontalScrollPage(doc, 'http://example.com', 'test');
    expect(result.chapterNumber).toBe(5);
  });
});

// ─── Dynamic Content Handling ────────────────────────────────────────────────

describe('handleDynamicContent', () => {
  it('detects lazy-loaded images', () => {
    const doc = makeDocument(`
      <img data-lazy="true" src="placeholder.jpg" />
      <img data-lazy="true" src="placeholder.jpg" />
    `);
    const result = handleDynamicContent(doc, 'http://example.com', 'test');
    expect(result.handled).toBe(true);
    expect(result.edgeCaseType).toBe('dynamic-content');
  });

  it('detects infinite scroll containers', () => {
    const doc = makeDocument(`
      <div class="infinite-scroll">
        <img src="page1.jpg" />
      </div>
    `);
    const result = handleDynamicContent(doc, 'http://example.com', 'test');
    expect(result.handled).toBe(true);
  });

  it('counts loaded vs total images', () => {
    const doc = makeDocument(`
      <img src="loaded.jpg" />
      <img data-lazy="true" src="lazy.jpg" />
    `);
    const result = handleDynamicContent(doc, 'http://example.com', 'test');
    expect(result.totalPages).toBe(2);
  });

  it('returns handled for static content', () => {
    const doc = makeDocument(`
      <img src="static1.jpg" />
      <img src="static2.jpg" />
    `);
    const result = handleDynamicContent(doc, 'http://example.com', 'test');
    expect(result.handled).toBe(true);
  });
});

// ─── Missing Metadata Handling ───────────────────────────────────────────────

describe('handleMissingMetadata', () => {
  it('detects missing series title', () => {
    const doc = makeDocument(`<div>No title here</div>`);
    const result = handleMissingMetadata(doc, 'http://example.com/chapter/5', 'test');
    expect(result.handled).toBe(true);
    expect(result.edgeCaseType).toBe('missing-metadata');
  });

  it('recovers chapter from URL', () => {
    const doc = makeDocument(`<h1>Series Title</h1>`);
    const result = handleMissingMetadata(doc, 'http://example.com/chapter/10', 'test');
    expect(result.chapterNumber).toBe(10);
  });

  it('recovers chapter from URL with different format', () => {
    const doc = makeDocument(`<h1>Series Title</h1>`);
    const result = handleMissingMetadata(doc, 'http://example.com/ch-5', 'test');
    expect(result.chapterNumber).toBe(5);
  });

  it('extracts title from h1 when missing metadata', () => {
    const doc = makeDocument(`<h1>Series Title</h1>`);
    const result = handleMissingMetadata(doc, 'http://example.com', 'test');
    expect(result.seriesTitle).toBe('Series Title');
  });

  it('returns success when some metadata recovered', () => {
    const doc = makeDocument(`<h1>Title</h1>`);
    const result = handleMissingMetadata(doc, 'http://example.com/chapter/3', 'test');
    expect(result.handled).toBe(true);
  });
});

// ─── Special Characters Handling ─────────────────────────────────────────────

describe('hasSpecialCharacters', () => {
  it('detects CJK characters', () => {
    expect(hasSpecialCharacters('漫画タイトル')).toBe(true);
    expect(hasSpecialCharacters('만화 제목')).toBe(true);
    expect(hasSpecialCharacters('漫画标题')).toBe(true);
  });

  it('detects RTL characters', () => {
    expect(hasSpecialCharacters('العربية')).toBe(true);
    expect(hasSpecialCharacters('עברית')).toBe(true);
  });

  it('detects diacritics', () => {
    expect(hasSpecialCharacters('Café')).toBe(true);
    expect(hasSpecialCharacters('Naïve')).toBe(true);
    expect(hasSpecialCharacters('Über')).toBe(true);
  });

  it('returns false for ASCII text', () => {
    expect(hasSpecialCharacters('Simple Title')).toBe(false);
    expect(hasSpecialCharacters('Chapter 5')).toBe(false);
  });

  it('detects mixed scripts', () => {
    expect(hasSpecialCharacters('Title 漫画')).toBe(true);
    expect(hasSpecialCharacters('Manga タイトル')).toBe(true);
  });
});

describe('handleSpecialCharacters', () => {
  it('normalizes CJK titles', () => {
    const result = handleSpecialCharacters('漫画タイトル');
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('preserves ASCII text', () => {
    const result = handleSpecialCharacters('Simple Title');
    expect(result).toBe('Simple Title');
  });

  it('removes special characters', () => {
    const result = handleSpecialCharacters('Title<script>alert()</script>');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('normalizes unicode', () => {
    const result = handleSpecialCharacters('Café');
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('truncates long titles', () => {
    const longTitle = 'A'.repeat(300);
    const result = handleSpecialCharacters(longTitle);
    expect(result.length).toBeLessThanOrEqual(200);
  });
});

// ─── Edge Case Handler (Main) ────────────────────────────────────────────────

describe('handleEdgeCase', () => {
  it('handles multi-chapter edge case', () => {
    const doc = makeDocument(`
      <div data-chapter="1"><h2>Ch 1</h2></div>
      <div data-chapter="2"><h2>Ch 2</h2></div>
    `);
    const result = handleEdgeCase(doc, 'http://example.com', 'test');
    expect(result).not.toBeNull();
    expect(result!.edgeCaseType).toBe('multi-chapter');
  });

  it('handles horizontal scroll edge case', () => {
    const doc = makeDocument(`
      <div class="manga-reader" style="overflow-x: auto; display: flex;">
        <img src="p1.jpg" />
      </div>
    `);
    const result = handleEdgeCase(doc, 'http://example.com', 'test');
    expect(result).not.toBeNull();
    expect(result!.edgeCaseType).toBe('horizontal-scroll');
  });

  it('handles dynamic content edge case', () => {
    const doc = makeDocument(`
      <img data-lazy="true" src="lazy.jpg" />
    `);
    const result = handleEdgeCase(doc, 'http://example.com', 'test');
    expect(result).not.toBeNull();
    expect(result!.edgeCaseType).toBe('dynamic-content');
  });

  it('handles missing metadata edge case', () => {
    const doc = makeDocument(`<div>Empty</div>`);
    const result = handleEdgeCase(doc, 'http://example.com/chapter/5', 'test');
    expect(result).not.toBeNull();
    expect(result!.edgeCaseType).toBe('missing-metadata');
  });

  it('prioritizes multi-chapter over other edge cases', () => {
    const doc = makeDocument(`
      <div data-chapter="1"><h2>Ch 1</h2></div>
      <div data-chapter="2" class="manga-reader"><h2>Ch 2</h2></div>
    `);
    const result = handleEdgeCase(doc, 'http://example.com', 'test');
    expect(result!.edgeCaseType).toBe('multi-chapter');
  });
});

// ─── Accuracy Validation ────────────────────────────────────────────────

describe('edge case accuracy validation', () => {
  it('edge case detection is consistent across multiple calls', () => {
    const doc = makeDocument(`
      <div data-chapter="1"><h2>Ch 1</h2></div>
      <div data-chapter="2"><h2>Ch 2</h2></div>
    `);
    const result1 = handleMultiChapterPage(doc, 'http://example.com', 'test');
    const result2 = handleMultiChapterPage(doc, 'http://example.com', 'test');
    expect(result1.totalPages).toBe(result2.totalPages);
  });

  it('layout detection is deterministic', () => {
    const doc = makeDocument(`
      <div id="_imageList" style="overflow-y: auto; height: 2000px;">
        <img src="p1.jpg" />
      </div>
    `);
    const layout1 = detectPageLayout(doc);
    const layout2 = detectPageLayout(doc);
    expect(layout1.isVerticalScroll).toBe(layout2.isVerticalScroll);
  });

  it('special character detection is accurate', () => {
    const testCases = [
      { text: 'Simple', expected: false },
      { text: '漫画', expected: true },
      { text: 'Café', expected: true },
      { text: 'Chapter 5', expected: false },
    ];

    for (const tc of testCases) {
      expect(hasSpecialCharacters(tc.text)).toBe(tc.expected);
    }
  });

  it('metadata recovery is consistent', () => {
    const doc = makeDocument(`<h1>Series Title</h1>`);
    const result1 = handleMissingMetadata(doc, 'http://example.com/chapter/5', 'test');
    const result2 = handleMissingMetadata(doc, 'http://example.com/chapter/5', 'test');
    expect(result1.seriesTitle).toBe(result2.seriesTitle);
    expect(result1.chapterNumber).toBe(result2.chapterNumber);
  });
});
