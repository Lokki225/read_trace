"use strict";
(() => {
  // src/extension/adapters/mangadex.ts
  var MANGADEX_URL_PATTERN = /^https:\/\/mangadex\.org\/(chapter|title)\/([a-f0-9-]+)/;
  var MANGADEX_URL_PATTERNS = {
    chapter: /^https:\/\/mangadex\.org\/chapter\/([a-f0-9-]+)/,
    title: /^https:\/\/mangadex\.org\/title\/([a-f0-9-]+)/
  };
  var CHAPTER_NUMBER_PATTERNS = [
    /\/chapter\/[a-f0-9-]+\/(\d+(?:\.\d+)?)/,
    /[Cc]hapter[-\s]+(\d+(?:\.\d+)?)/,
    /[Cc]h\.?[-\s]*(\d+(?:\.\d+)?)/
  ];
  var SERIES_TITLE_SELECTORS = [
    'meta[property="og:title"]',
    'meta[name="title"]',
    'h1[class*="title"]',
    'h2[class*="title"]',
    ".manga-title",
    '[data-testid="series-title"]'
  ];
  var PAGE_IMAGE_SELECTORS = [
    'img[class*="page"]',
    "img[data-page]",
    ".reader-image",
    '[class*="reader"] img'
  ];
  function extractSeriesTitle(document2) {
    for (const selector of SERIES_TITLE_SELECTORS) {
      const element = document2.querySelector(selector);
      if (element) {
        const content = element.getAttribute("content") || element.textContent || null;
        if (content) {
          return sanitizeTitle(content.trim());
        }
      }
    }
    if (document2.title) {
      const titleParts = document2.title.split(" - ");
      if (titleParts.length > 1) {
        return sanitizeTitle(titleParts[0].trim());
      }
      return sanitizeTitle(document2.title.trim());
    }
    return null;
  }
  function extractChapterNumber(url, document2) {
    for (const pattern of CHAPTER_NUMBER_PATTERNS) {
      const match = url.match(pattern);
      if (match) {
        const num = parseFloat(match[1]);
        if (!isNaN(num) && num > 0) {
          return num;
        }
      }
    }
    const pageTitle = document2.title || "";
    for (const pattern of CHAPTER_NUMBER_PATTERNS) {
      const match = pageTitle.match(pattern);
      if (match) {
        const num = parseFloat(match[1]);
        if (!isNaN(num) && num > 0) {
          return num;
        }
      }
    }
    const headings = document2.querySelectorAll("h1, h2, h3");
    for (const heading of headings) {
      const text = heading.textContent || "";
      for (const pattern of CHAPTER_NUMBER_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
          const num = parseFloat(match[1]);
          if (!isNaN(num) && num > 0) {
            return num;
          }
        }
      }
    }
    return null;
  }
  function extractChapterTitle(document2) {
    const titleEl = document2.querySelector('h1, h2, [class*="chapter-title"]');
    if (titleEl && titleEl.textContent) {
      return titleEl.textContent.trim() || null;
    }
    return null;
  }
  function extractScrollProgress(doc) {
    const scrollEl = doc.documentElement || doc.body;
    const scrollTop = scrollEl.scrollTop;
    const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
    if (scrollHeight <= 0) return 0;
    return Math.min(100, Math.round(scrollTop / scrollHeight * 100));
  }
  function extractPageProgress(doc) {
    for (const selector of PAGE_IMAGE_SELECTORS) {
      const images = doc.querySelectorAll(selector);
      if (images.length > 0) {
        const pageAttr = images[0].getAttribute("data-page");
        if (pageAttr) {
          return { pageNumber: parseInt(pageAttr, 10), totalPages: images.length };
        }
        return { pageNumber: 1, totalPages: images.length };
      }
    }
    return { pageNumber: null, totalPages: null };
  }
  function sanitizeTitle(title) {
    return title.replace(/<[^>]*>/g, "").replace(/[<>"'&]/g, "").trim().substring(0, 200);
  }
  function matchesMangaDex(url) {
    return MANGADEX_URL_PATTERNS.chapter.test(url) || MANGADEX_URL_PATTERNS.title.test(url);
  }
  var mangadexAdapter = {
    name: "MangaDex",
    matches: matchesMangaDex,
    extractSeriesTitle,
    extractChapterNumber
  };
  var MangaDexAdapter = class {
    constructor() {
      this.name = "MangaDex";
      this.urlPattern = MANGADEX_URL_PATTERN;
    }
    validatePage() {
      return matchesMangaDex(window.location.href);
    }
    async detectSeries() {
      const title = extractSeriesTitle(document);
      if (!title) return null;
      return {
        title,
        platform: "MangaDex",
        url: window.location.href
      };
    }
    async detectChapter() {
      const number = extractChapterNumber(window.location.href, document);
      if (number === null) return null;
      return {
        number,
        title: extractChapterTitle(document),
        url: window.location.href
      };
    }
    async detectProgress() {
      const scrollPosition = extractScrollProgress(document);
      const { pageNumber, totalPages } = extractPageProgress(document);
      return {
        scrollPosition,
        pageNumber,
        totalPages,
        percentComplete: scrollPosition
      };
    }
  };

  // src/extension/adapters/webtoon.ts
  var WEBTOON_URL_PATTERN = /^https:\/\/(?:www\.|m\.)?webtoons\.com\/[a-z]{2}\/.+\/viewer/;
  var WEBTOON_URL_PATTERNS = {
    viewer: /^https:\/\/(?:www\.|m\.)?webtoons\.com\/[a-z]{2}\/.+\/viewer/,
    episode: /^https:\/\/(?:www\.|m\.)?webtoons\.com\/[a-z]{2}\/.+\/list/
  };
  var EPISODE_NUMBER_PATTERNS = [
    /[Ee]p(?:isode)?\.?\s*(\d+)/,
    /#(\d+)/,
    /episode_no=(\d+)/,
    /\[Ep\.\s*(\d+)\]/
  ];
  var SERIES_TITLE_SELECTORS2 = [
    ".subj_info a.subj",
    ".subj_info .subj",
    ".info .subj",
    'a.subj[href*="list"]',
    'meta[property="og:title"]',
    'meta[name="title"]',
    "h1.subj",
    'h1[class*="title"]',
    '[class*="series-title"]',
    "h1"
  ];
  var EPISODE_TITLE_SELECTORS = [
    "h1.subj_episode",
    '[class*="episode-title"]',
    ".episode_title",
    "h2"
  ];
  var WEBTOON_IMAGE_SELECTORS = [
    "#_imageList img",
    ".viewer_img img",
    '[class*="viewer"] img',
    'img[class*="episode"]'
  ];
  function extractWebtoonSeriesTitle(doc) {
    for (const selector of SERIES_TITLE_SELECTORS2) {
      const el = doc.querySelector(selector);
      if (el) {
        const content = el.getAttribute("content") || el.textContent || null;
        if (content && content.trim()) {
          return sanitizeWebtoonTitle(content.trim());
        }
      }
    }
    return null;
  }
  function extractWebtoonEpisodeNumber(url, doc) {
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    const episodeNo = urlParams.get("episode_no");
    if (episodeNo) {
      const num = parseInt(episodeNo, 10);
      if (!isNaN(num) && num > 0) return num;
    }
    for (const pattern of EPISODE_NUMBER_PATTERNS) {
      const match = url.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > 0) return num;
      }
    }
    const pageTitle = doc.title || "";
    for (const pattern of EPISODE_NUMBER_PATTERNS) {
      const match = pageTitle.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > 0) return num;
      }
    }
    for (const selector of EPISODE_TITLE_SELECTORS) {
      const el = doc.querySelector(selector);
      if (el && el.textContent) {
        for (const pattern of EPISODE_NUMBER_PATTERNS) {
          const match = el.textContent.match(pattern);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > 0) return num;
          }
        }
      }
    }
    return null;
  }
  function extractWebtoonEpisodeTitle(doc) {
    for (const selector of EPISODE_TITLE_SELECTORS) {
      const el = doc.querySelector(selector);
      if (el && el.textContent && el.textContent.trim()) {
        return el.textContent.trim();
      }
    }
    return null;
  }
  function extractWebtoonScrollProgress(doc) {
    const scrollEl = doc.documentElement || doc.body;
    const scrollTop = scrollEl.scrollTop;
    const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
    if (scrollHeight <= 0) return 0;
    return Math.min(100, Math.round(scrollTop / scrollHeight * 100));
  }
  function extractWebtoonPageProgress(doc) {
    for (const selector of WEBTOON_IMAGE_SELECTORS) {
      const images = doc.querySelectorAll(selector);
      if (images.length > 0) {
        return { pageNumber: null, totalPages: images.length };
      }
    }
    return { pageNumber: null, totalPages: null };
  }
  function matchesWebtoon(url) {
    return WEBTOON_URL_PATTERNS.viewer.test(url) || WEBTOON_URL_PATTERNS.episode.test(url);
  }
  function sanitizeWebtoonTitle(title) {
    return title.replace(/<[^>]*>/g, "").replace(/[<>"'&]/g, "").trim().substring(0, 200);
  }
  var webtoonAdapter = {
    name: "Webtoon",
    matches: matchesWebtoon,
    extractSeriesTitle: extractWebtoonSeriesTitle,
    extractChapterNumber: extractWebtoonEpisodeNumber
  };
  var WebtoonAdapter = class {
    constructor() {
      this.name = "Webtoon";
      this.urlPattern = WEBTOON_URL_PATTERN;
    }
    validatePage() {
      return matchesWebtoon(window.location.href);
    }
    async detectSeries() {
      const title = extractWebtoonSeriesTitle(document);
      if (!title) return null;
      return {
        title,
        platform: "Webtoon",
        url: window.location.href
      };
    }
    async detectChapter() {
      const number = extractWebtoonEpisodeNumber(window.location.href, document);
      if (number === null) return null;
      return {
        number,
        title: extractWebtoonEpisodeTitle(document),
        url: window.location.href
      };
    }
    async detectProgress() {
      const scrollPosition = extractWebtoonScrollProgress(document);
      const { pageNumber, totalPages } = extractWebtoonPageProgress(document);
      const percentComplete = totalPages ? Math.round((pageNumber ?? 0) / totalPages * 100) : scrollPosition;
      return {
        scrollPosition,
        pageNumber,
        totalPages,
        percentComplete
      };
    }
  };

  // src/extension/adapters/index.ts
  var ADAPTER_REGISTRY = [mangadexAdapter, webtoonAdapter];
  var ADAPTER_V2_REGISTRY = [
    new MangaDexAdapter(),
    new WebtoonAdapter()
  ];
  function detectAdapter(url) {
    for (const adapter of ADAPTER_REGISTRY) {
      if (adapter.matches(url)) {
        return adapter;
      }
    }
    return null;
  }

  // src/extension/content.ts
  var SCROLL_DEBOUNCE_MS = 500;
  var PROGRESS_UPDATE_INTERVAL_MS = 5e3;
  var state = {
    isActive: false,
    seriesTitle: null,
    chapterNumber: null,
    scrollPosition: 0,
    lastUpdateTime: 0
  };
  var scrollDebounceTimer = null;
  var progressIntervalTimer = null;
  var mutationObserver = null;
  function calculateScrollPosition() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (docHeight <= 0) return 0;
    return Math.min(100, Math.max(0, scrollTop / docHeight * 100));
  }
  function sendProgressUpdate(progressData) {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.sendMessage) {
        resolve({ success: false, error: "Chrome runtime not available" });
        return;
      }
      const message = {
        type: "PROGRESS_UPDATE",
        payload: progressData
      };
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            resolve({
              success: false,
              error: chrome.runtime.lastError.message
            });
            return;
          }
          resolve(response || { success: true });
        });
      } catch (err) {
        resolve({
          success: false,
          error: err instanceof Error ? err.message : "Unknown error"
        });
      }
    });
  }
  function handleScroll() {
    if (scrollDebounceTimer !== null) {
      clearTimeout(scrollDebounceTimer);
    }
    scrollDebounceTimer = setTimeout(() => {
      state.scrollPosition = calculateScrollPosition();
      scrollDebounceTimer = null;
    }, SCROLL_DEBOUNCE_MS);
  }
  function detectPageInfo() {
    const url = window.location.href;
    const adapter = detectAdapter(url);
    if (!adapter) {
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
  }
  async function sendCurrentProgress() {
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
      url: window.location.href
    });
  }
  function setupMutationObserver() {
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
      characterData: false
    });
  }
  function initialize() {
    const url = window.location.href;
    const adapter = detectAdapter(url);
    if (!adapter) {
      return;
    }
    state.isActive = true;
    detectPageInfo();
    window.addEventListener("scroll", handleScroll, { passive: true });
    setupMutationObserver();
    progressIntervalTimer = setInterval(sendCurrentProgress, PROGRESS_UPDATE_INTERVAL_MS);
  }
  function cleanup() {
    state.isActive = false;
    window.removeEventListener("scroll", handleScroll);
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
  function getState() {
    return { ...state };
  }
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initialize);
    } else {
      initialize();
    }
    window.addEventListener("beforeunload", cleanup);
  }
})();
