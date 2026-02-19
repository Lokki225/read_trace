'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
  isValidScrollPosition,
  clampScrollPosition,
  percentageToPixels,
  getScrollableHeight,
  isPositionStillValid,
} from '@/lib/scrollValidation';

export type ScrollRestorationStatus =
  | 'idle'
  | 'loading'
  | 'restoring'
  | 'restored'
  | 'fallback'
  | 'error';

export interface ScrollRestorationState {
  status: ScrollRestorationStatus;
  scrollPosition: number | null;
  error: string | null;
  isHighlighting: boolean;
}

const RESTORATION_TIMEOUT_MS = 1000;
const HIGHLIGHT_DURATION_MS = 1500;
const PAGE_READY_POLL_INTERVAL_MS = 50;
const PAGE_READY_MAX_WAIT_MS = 3000;

function waitForPageReady(): Promise<void> {
  return new Promise((resolve) => {
    if (
      typeof document === 'undefined' ||
      document.readyState === 'complete'
    ) {
      resolve();
      return;
    }

    let elapsed = 0;
    const poll = setInterval(() => {
      elapsed += PAGE_READY_POLL_INTERVAL_MS;
      if (document.readyState === 'complete' || elapsed >= PAGE_READY_MAX_WAIT_MS) {
        clearInterval(poll);
        resolve();
      }
    }, PAGE_READY_POLL_INTERVAL_MS);
  });
}

function scrollToPercentage(percentage: number): void {
  const scrollableHeight = getScrollableHeight();
  const targetPixels = percentageToPixels(percentage, scrollableHeight);

  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: targetPixels,
      behavior: 'smooth',
    });
  }
}

export function useScrollRestoration(seriesId: string | null) {
  const [state, setState] = useState<ScrollRestorationState>({
    status: 'idle',
    scrollPosition: null,
    error: null,
    isHighlighting: false,
  });

  const restorationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const clearTimers = useCallback(() => {
    if (restorationTimeoutRef.current !== null) {
      clearTimeout(restorationTimeoutRef.current);
      restorationTimeoutRef.current = null;
    }
    if (highlightTimeoutRef.current !== null) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
  }, []);

  const triggerHighlight = useCallback(() => {
    if (!isMountedRef.current) return;
    setState((prev) => ({ ...prev, isHighlighting: true }));
    highlightTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, isHighlighting: false }));
      }
    }, HIGHLIGHT_DURATION_MS);
  }, []);

  const restoreScroll = useCallback(async () => {
    if (!seriesId) return;

    setState({
      status: 'loading',
      scrollPosition: null,
      error: null,
      isHighlighting: false,
    });

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    let timedOut = false;
    restorationTimeoutRef.current = setTimeout(() => {
      timedOut = true;
      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          status: 'fallback',
          error: 'Scroll restoration timed out',
        }));
      }
    }, RESTORATION_TIMEOUT_MS);

    try {
      const { data, error } = await (supabase as any)
        .from('reading_progress')
        .select('scroll_position')
        .eq('series_id', seriesId)
        .maybeSingle();

      if (timedOut || !isMountedRef.current) return;

      if (error) {
        clearTimers();
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: error.message,
        }));
        return;
      }

      const rawPosition: number | null = data?.scroll_position ?? null;

      await waitForPageReady();

      if (timedOut || !isMountedRef.current) return;

      clearTimers();

      const scrollableHeight = getScrollableHeight();

      if (
        rawPosition !== null &&
        isValidScrollPosition(rawPosition) &&
        isPositionStillValid(rawPosition, scrollableHeight)
      ) {
        const clamped = clampScrollPosition(rawPosition);

        setState((prev) => ({
          ...prev,
          status: 'restoring',
          scrollPosition: clamped,
        }));

        scrollToPercentage(clamped);

        setState((prev) => ({
          ...prev,
          status: 'restored',
        }));

        triggerHighlight();
      } else {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setState((prev) => ({
          ...prev,
          status: 'fallback',
          scrollPosition: 0,
        }));
      }
    } catch (err) {
      if (timedOut || !isMountedRef.current) return;
      clearTimers();
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, [seriesId, clearTimers, triggerHighlight]);

  useEffect(() => {
    isMountedRef.current = true;
    if (seriesId) {
      restoreScroll();
    }
    return () => {
      isMountedRef.current = false;
      clearTimers();
    };
  }, [seriesId, restoreScroll, clearTimers]);

  return state;
}
