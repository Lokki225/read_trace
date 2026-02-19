import {
  detectAdapter,
  detectAdapterV2,
  registerAdapter,
  registerAdapterV2,
  getRegisteredAdapters,
  getRegisteredAdaptersV2,
  mangadexAdapter,
  webtoonAdapter,
} from '../../../../src/extension/adapters/index';
import { PlatformAdapter } from '../../../../src/extension/types';
import { PlatformAdapterV2, SeriesInfo, ChapterInfo, ProgressInfo } from '../../../../src/extension/adapters/types';

describe('Adapter Registry (V1)', () => {
  describe('detectAdapter()', () => {
    it('should detect MangaDex adapter for chapter URL', () => {
      const adapter = detectAdapter('https://mangadex.org/chapter/abc123/1');
      expect(adapter).not.toBeNull();
      expect(adapter!.name).toBe('MangaDex');
    });

    it('should detect MangaDex adapter for title URL', () => {
      const adapter = detectAdapter('https://mangadex.org/title/abc123');
      expect(adapter).not.toBeNull();
      expect(adapter!.name).toBe('MangaDex');
    });

    it('should detect Webtoon adapter for viewer URL', () => {
      const adapter = detectAdapter(
        'https://www.webtoons.com/en/romance/my-series/viewer?title_no=123&episode_no=5'
      );
      expect(adapter).not.toBeNull();
      expect(adapter!.name).toBe('Webtoon');
    });

    it('should return null for unsupported URL', () => {
      const adapter = detectAdapter('https://example.com/manga/chapter/1');
      expect(adapter).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(detectAdapter('')).toBeNull();
    });

    it('should return null for random URL', () => {
      expect(detectAdapter('https://google.com')).toBeNull();
    });
  });

  describe('getRegisteredAdapters()', () => {
    it('should return a copy of the registry (not reference)', () => {
      const r1 = getRegisteredAdapters();
      const r2 = getRegisteredAdapters();
      expect(r1).not.toBe(r2);
    });

    it('should include MangaDex adapter', () => {
      const adapters = getRegisteredAdapters();
      expect(adapters.some(a => a.name === 'MangaDex')).toBe(true);
    });

    it('should include Webtoon adapter', () => {
      const adapters = getRegisteredAdapters();
      expect(adapters.some(a => a.name === 'Webtoon')).toBe(true);
    });

    it('should have at least 2 adapters', () => {
      expect(getRegisteredAdapters().length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('registerAdapter()', () => {
    it('should add a new adapter to the registry', () => {
      const before = getRegisteredAdapters().length;
      const mockAdapter: PlatformAdapter = {
        name: 'TestPlatform',
        matches: (url: string) => url.includes('testplatform.com'),
        extractSeriesTitle: () => null,
        extractChapterNumber: () => null,
      };
      registerAdapter(mockAdapter);
      expect(getRegisteredAdapters().length).toBe(before + 1);
      expect(getRegisteredAdapters().some(a => a.name === 'TestPlatform')).toBe(true);
    });

    it('should detect newly registered adapter', () => {
      const adapter = detectAdapter('https://testplatform.com/chapter/1');
      expect(adapter).not.toBeNull();
      expect(adapter!.name).toBe('TestPlatform');
    });
  });
});

describe('Adapter Registry (V2)', () => {
  describe('detectAdapterV2()', () => {
    it('should detect MangaDex V2 adapter for chapter URL', () => {
      const adapter = detectAdapterV2('https://mangadex.org/chapter/abc123/1');
      expect(adapter).not.toBeNull();
      expect(adapter!.name).toBe('MangaDex');
    });

    it('should detect Webtoon V2 adapter for viewer URL', () => {
      const adapter = detectAdapterV2(
        'https://www.webtoons.com/en/romance/my-series/viewer?title_no=123&episode_no=5'
      );
      expect(adapter).not.toBeNull();
      expect(adapter!.name).toBe('Webtoon');
    });

    it('should return null for unsupported URL', () => {
      expect(detectAdapterV2('https://example.com/manga')).toBeNull();
    });
  });

  describe('getRegisteredAdaptersV2()', () => {
    it('should return a copy of the V2 registry', () => {
      const r1 = getRegisteredAdaptersV2();
      const r2 = getRegisteredAdaptersV2();
      expect(r1).not.toBe(r2);
    });

    it('should include MangaDex V2 adapter', () => {
      const adapters = getRegisteredAdaptersV2();
      expect(adapters.some(a => a.name === 'MangaDex')).toBe(true);
    });

    it('should include Webtoon V2 adapter', () => {
      const adapters = getRegisteredAdaptersV2();
      expect(adapters.some(a => a.name === 'Webtoon')).toBe(true);
    });
  });

  describe('registerAdapterV2()', () => {
    it('should add a new V2 adapter to the registry', () => {
      const before = getRegisteredAdaptersV2().length;
      const mockAdapterV2: PlatformAdapterV2 = {
        name: 'MockV2Platform',
        urlPattern: /mockv2platform\.com/,
        validatePage: () => false,
        detectSeries: async (): Promise<SeriesInfo | null> => null,
        detectChapter: async (): Promise<ChapterInfo | null> => null,
        detectProgress: async (): Promise<ProgressInfo> => ({
          scrollPosition: 0,
          pageNumber: null,
          totalPages: null,
          percentComplete: 0,
        }),
      };
      registerAdapterV2(mockAdapterV2);
      expect(getRegisteredAdaptersV2().length).toBe(before + 1);
      expect(getRegisteredAdaptersV2().some(a => a.name === 'MockV2Platform')).toBe(true);
    });
  });
});

describe('PlatformAdapterV2 interface contract', () => {
  it('MangaDex adapter has required V2 interface properties', () => {
    const adapter = detectAdapterV2('https://mangadex.org/chapter/abc/1');
    expect(adapter).not.toBeNull();
    expect(typeof adapter!.name).toBe('string');
    expect(adapter!.urlPattern).toBeInstanceOf(RegExp);
    expect(typeof adapter!.validatePage).toBe('function');
    expect(typeof adapter!.detectSeries).toBe('function');
    expect(typeof adapter!.detectChapter).toBe('function');
    expect(typeof adapter!.detectProgress).toBe('function');
  });

  it('Webtoon adapter has required V2 interface properties', () => {
    const adapter = detectAdapterV2(
      'https://www.webtoons.com/en/romance/series/viewer?title_no=1&episode_no=1'
    );
    expect(adapter).not.toBeNull();
    expect(typeof adapter!.name).toBe('string');
    expect(adapter!.urlPattern).toBeInstanceOf(RegExp);
    expect(typeof adapter!.validatePage).toBe('function');
    expect(typeof adapter!.detectSeries).toBe('function');
    expect(typeof adapter!.detectChapter).toBe('function');
    expect(typeof adapter!.detectProgress).toBe('function');
  });

  it('each adapter urlPattern matches its own URLs', () => {
    const adapters = getRegisteredAdaptersV2();
    const mangadex = adapters.find(a => a.name === 'MangaDex')!;
    const webtoon = adapters.find(a => a.name === 'Webtoon')!;

    expect(mangadex.urlPattern.test('https://mangadex.org/chapter/abc/1')).toBe(true);
    expect(mangadex.urlPattern.test('https://www.webtoons.com/en/x/y/viewer')).toBe(false);

    expect(webtoon.urlPattern.test('https://www.webtoons.com/en/romance/series/viewer?episode_no=1')).toBe(true);
    expect(webtoon.urlPattern.test('https://mangadex.org/chapter/abc/1')).toBe(false);
  });
});

describe('V1 adapter interface contract', () => {
  it('mangadexAdapter has required V1 interface properties', () => {
    expect(typeof mangadexAdapter.name).toBe('string');
    expect(typeof mangadexAdapter.matches).toBe('function');
    expect(typeof mangadexAdapter.extractSeriesTitle).toBe('function');
    expect(typeof mangadexAdapter.extractChapterNumber).toBe('function');
  });

  it('webtoonAdapter has required V1 interface properties', () => {
    expect(typeof webtoonAdapter.name).toBe('string');
    expect(typeof webtoonAdapter.matches).toBe('function');
    expect(typeof webtoonAdapter.extractSeriesTitle).toBe('function');
    expect(typeof webtoonAdapter.extractChapterNumber).toBe('function');
  });
});
