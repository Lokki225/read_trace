import { ContentScriptState, ProgressUpdate, ProgressResponse } from './types';
import { detectAdapter } from './adapters/index';

const SCROLL_DEBOUNCE_MS = 500;
const PROGRESS_UPDATE_INTERVAL_MS = 5000;

let state: ContentScriptState = {
  isActive: false,
  seriesTitle: null,
  chapterNumber: null,
  scrollPosition: 0,
  platform: 'unknown',
  lastUpdateTime: 0,
};

let scrollDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let progressIntervalTimer: ReturnType<typeof setInterval> | null = null;
let mutationObserver: MutationObserver | null = null;

export function calculateScrollPosition(): number {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  if (docHeight <= 0) return 0;
  return Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
}

export function sendProgressUpdate(
  progressData: ProgressUpdate['payload']
): Promise<ProgressResponse> {
  return new Promise((resolve) => {
    if (
      typeof chrome === 'undefined' ||
      !chrome.runtime ||
      !chrome.runtime.sendMessage
    ) {
      resolve({ success: false, error: 'Chrome runtime not available' });
      return;
    }

    const message: ProgressUpdate = {
      type: 'PROGRESS_UPDATE',
      payload: progressData,
    };

    try {
      chrome.runtime.sendMessage(message, (response: ProgressResponse) => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message,
          });
          return;
        }
        resolve(response || { success: true });
      });
    } catch (err) {
      resolve({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  });
}

export function handleScroll(): void {
  if (scrollDebounceTimer !== null) {
    clearTimeout(scrollDebounceTimer);
  }

  scrollDebounceTimer = setTimeout(() => {
    state.scrollPosition = calculateScrollPosition();
    scrollDebounceTimer = null;
  }, SCROLL_DEBOUNCE_MS);
}

export function detectPageInfo(): void {
  const url = window.location.href;
  const adapter = detectAdapter(url);

  if (!adapter) {
    state.platform = 'unknown';
    return;
  }

  const title = adapter.extractSeriesTitle(document);
  const chapter = adapter.extractChapterNumber(url, document);

  if (title !== null) {
    state.seriesTitle = title;
  }
  if (chapter !== null) {
    state.chapterNumber = chapter;
  }
  
  state.platform = adapter.name;
}

async function sendCurrentProgress(): Promise<void> {
  if (!state.isActive || !state.seriesTitle || !state.chapterNumber) {
    return;
  }

  const now = Date.now();
  if (now - state.lastUpdateTime < PROGRESS_UPDATE_INTERVAL_MS) {
    return;
  }

  state.lastUpdateTime = now;

  await sendProgressUpdate({
    seriesTitle: state.seriesTitle,
    chapterNumber: state.chapterNumber,
    scrollPosition: state.scrollPosition,
    timestamp: now,
    url: window.location.href,
    platform: state.platform,
  });
}

export function setupMutationObserver(): void {
  if (mutationObserver) {
    mutationObserver.disconnect();
  }

  mutationObserver = new MutationObserver(() => {
    detectPageInfo();
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
  });
}

export function initialize(): void {
  const url = window.location.href;
  const adapter = detectAdapter(url);

  if (!adapter) {
    return;
  }

  state.isActive = true;

  detectPageInfo();

  window.addEventListener('scroll', handleScroll, { passive: true });

  setupMutationObserver();

  progressIntervalTimer = setInterval(sendCurrentProgress, PROGRESS_UPDATE_INTERVAL_MS);
}

export function cleanup(): void {
  state.isActive = false;

  window.removeEventListener('scroll', handleScroll);

  if (scrollDebounceTimer !== null) {
    clearTimeout(scrollDebounceTimer);
    scrollDebounceTimer = null;
  }

  if (progressIntervalTimer !== null) {
    clearInterval(progressIntervalTimer);
    progressIntervalTimer = null;
  }

  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
}

export function getState(): ContentScriptState {
  return { ...state };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  window.addEventListener('beforeunload', cleanup);
}
