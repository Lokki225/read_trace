import {
  calculateScrollPosition,
  handleScroll,
  detectPageInfo,
  sendProgressUpdate,
  setupMutationObserver,
  initialize,
  cleanup,
  getState,
} from '../../../src/extension/content';

jest.mock('../../../src/extension/adapters/index', () => ({
  detectAdapter: jest.fn(),
}));

import { detectAdapter } from '../../../src/extension/adapters/index';

const mockDetectAdapter = detectAdapter as jest.MockedFunction<typeof detectAdapter>;

function makeMockAdapter(overrides: {
  name?: string;
  matches?: (url: string) => boolean;
  extractSeriesTitle?: (doc: Document) => string | null;
  extractChapterNumber?: (url: string, doc: Document) => number | null;
}) {
  return {
    name: overrides.name ?? 'TestAdapter',
    matches: overrides.matches ?? (() => true),
    extractSeriesTitle: overrides.extractSeriesTitle ?? (() => 'Test Series'),
    extractChapterNumber: overrides.extractChapterNumber ?? (() => 5),
  };
}

describe('calculateScrollPosition', () => {
  beforeEach(() => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 500,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    });
  });

  it('should return 0 when at top of page', () => {
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    });
    expect(calculateScrollPosition()).toBe(0);
  });

  it('should return 100 when at bottom of page', () => {
    Object.defineProperty(window, 'scrollY', {
      value: 1500,
      writable: true,
      configurable: true,
    });
    expect(calculateScrollPosition()).toBe(100);
  });

  it('should return 50 when halfway down', () => {
    Object.defineProperty(window, 'scrollY', {
      value: 750,
      writable: true,
      configurable: true,
    });
    expect(calculateScrollPosition()).toBe(50);
  });

  it('should return 0 when document height is 0', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 500,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 500,
      writable: true,
      configurable: true,
    });
    expect(calculateScrollPosition()).toBe(0);
  });

  it('should clamp to 100 when scroll exceeds document height', () => {
    Object.defineProperty(window, 'scrollY', {
      value: 9999,
      writable: true,
      configurable: true,
    });
    expect(calculateScrollPosition()).toBe(100);
  });

  it('should clamp to 0 when scroll is negative', () => {
    Object.defineProperty(window, 'scrollY', {
      value: -100,
      writable: true,
      configurable: true,
    });
    expect(calculateScrollPosition()).toBe(0);
  });
});

describe('sendProgressUpdate', () => {
  const progressPayload = {
    seriesTitle: 'One Piece',
    chapterNumber: 1050,
    scrollPosition: 75,
    timestamp: Date.now(),
    url: 'https://mangadex.org/chapter/abc123/1',
  };

  afterEach(() => {
    delete (global as any).chrome;
  });

  it('should return error when chrome runtime is not available', async () => {
    delete (global as any).chrome;
    const result = await sendProgressUpdate(progressPayload);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Chrome runtime not available');
  });

  it('should call chrome.runtime.sendMessage with correct message', async () => {
    const mockSendMessage = jest.fn((msg, callback) => {
      callback({ success: true });
    });
    (global as any).chrome = {
      runtime: {
        sendMessage: mockSendMessage,
        lastError: undefined,
      },
    };

    const result = await sendProgressUpdate(progressPayload);

    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PROGRESS_UPDATE',
        payload: progressPayload,
      }),
      expect.any(Function)
    );
    expect(result.success).toBe(true);
  });

  it('should handle chrome.runtime.lastError', async () => {
    const mockSendMessage = jest.fn((msg, callback) => {
      (global as any).chrome.runtime.lastError = { message: 'Extension context invalidated' };
      callback(undefined);
    });
    (global as any).chrome = {
      runtime: {
        sendMessage: mockSendMessage,
        lastError: undefined,
      },
    };

    const result = await sendProgressUpdate(progressPayload);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Extension context invalidated');
  });

  it('should handle sendMessage throwing an exception', async () => {
    (global as any).chrome = {
      runtime: {
        sendMessage: jest.fn(() => {
          throw new Error('Connection refused');
        }),
        lastError: undefined,
      },
    };

    const result = await sendProgressUpdate(progressPayload);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Connection refused');
  });

  it('should return success true when callback receives no response', async () => {
    const mockSendMessage = jest.fn((msg, callback) => {
      callback(undefined);
    });
    (global as any).chrome = {
      runtime: {
        sendMessage: mockSendMessage,
        lastError: undefined,
      },
    };

    const result = await sendProgressUpdate(progressPayload);
    expect(result.success).toBe(true);
  });
});

describe('handleScroll', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 500,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'scrollY', {
      value: 750,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce scroll updates', () => {
    handleScroll();
    handleScroll();
    handleScroll();

    jest.advanceTimersByTime(600);

    const state = getState();
    expect(state.scrollPosition).toBe(50);
  });

  it('should update scroll position after debounce period', () => {
    handleScroll();
    jest.advanceTimersByTime(600);

    const state = getState();
    expect(state.scrollPosition).toBe(50);
  });
});

describe('detectPageInfo', () => {
  beforeEach(() => {
    mockDetectAdapter.mockReset();
    Object.defineProperty(window, 'location', {
      value: { href: 'https://mangadex.org/chapter/abc123/1' },
      writable: true,
      configurable: true,
    });
  });

  it('should do nothing when no adapter matches', () => {
    mockDetectAdapter.mockReturnValue(null);
    expect(() => detectPageInfo()).not.toThrow();
  });

  it('should extract series title and chapter when adapter matches', () => {
    mockDetectAdapter.mockReturnValue(
      makeMockAdapter({
        extractSeriesTitle: () => 'One Piece',
        extractChapterNumber: () => 1050,
      })
    );

    detectPageInfo();

    const state = getState();
    expect(state.seriesTitle).toBe('One Piece');
    expect(state.chapterNumber).toBe(1050);
  });

  it('should not overwrite existing title if adapter returns null', () => {
    mockDetectAdapter.mockReturnValue(
      makeMockAdapter({
        extractSeriesTitle: () => 'One Piece',
        extractChapterNumber: () => 1050,
      })
    );
    detectPageInfo();

    mockDetectAdapter.mockReturnValue(
      makeMockAdapter({
        extractSeriesTitle: () => null,
        extractChapterNumber: () => null,
      })
    );
    detectPageInfo();

    const state = getState();
    expect(state.seriesTitle).toBe('One Piece');
    expect(state.chapterNumber).toBe(1050);
  });
});

describe('setupMutationObserver', () => {
  it('should not throw when called', () => {
    expect(() => setupMutationObserver()).not.toThrow();
  });

  it('should be callable multiple times without error', () => {
    expect(() => {
      setupMutationObserver();
      setupMutationObserver();
    }).not.toThrow();
  });
});

describe('initialize and cleanup', () => {
  beforeEach(() => {
    mockDetectAdapter.mockReset();
    Object.defineProperty(window, 'location', {
      value: { href: 'https://mangadex.org/chapter/abc123/1' },
      writable: true,
      configurable: true,
    });
  });

  it('should not activate when no adapter matches', () => {
    mockDetectAdapter.mockReturnValue(null);
    cleanup();
    initialize();

    const state = getState();
    expect(state.isActive).toBe(false);
  });

  it('should activate when adapter matches', () => {
    mockDetectAdapter.mockReturnValue(
      makeMockAdapter({
        extractSeriesTitle: () => 'Naruto',
        extractChapterNumber: () => 700,
      })
    );

    initialize();

    const state = getState();
    expect(state.isActive).toBe(true);
  });

  it('should deactivate on cleanup', () => {
    mockDetectAdapter.mockReturnValue(
      makeMockAdapter({
        extractSeriesTitle: () => 'Naruto',
        extractChapterNumber: () => 700,
      })
    );

    initialize();
    cleanup();

    const state = getState();
    expect(state.isActive).toBe(false);
  });
});

describe('getState', () => {
  it('should return a copy of state (not reference)', () => {
    const state1 = getState();
    const state2 = getState();
    expect(state1).not.toBe(state2);
    expect(state1).toEqual(state2);
  });
});
