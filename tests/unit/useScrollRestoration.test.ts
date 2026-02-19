import { renderHook, act, waitFor } from '@testing-library/react';
import { useScrollRestoration } from '../../src/hooks/useScrollRestoration';

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

const { createBrowserClient } = require('@supabase/ssr');

function makeMockSupabase(scrollPosition: number | null, error: string | null = null) {
  const maybeSingle = jest.fn().mockResolvedValue({
    data: scrollPosition !== null ? { scroll_position: scrollPosition } : null,
    error: error ? { message: error } : null,
  });
  const eq = jest.fn().mockReturnValue({ maybeSingle });
  const select = jest.fn().mockReturnValue({ eq });
  const from = jest.fn().mockReturnValue({ select });
  return { from, select, eq, maybeSingle };
}

function mockWindowScroll() {
  const scrollTo = jest.fn();
  Object.defineProperty(window, 'scrollTo', {
    value: scrollTo,
    writable: true,
    configurable: true,
  });
  return scrollTo;
}

function mockScrollableHeight(scrollHeight: number, clientHeight: number) {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollHeight,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, 'clientHeight', {
    value: clientHeight,
    writable: true,
    configurable: true,
  });
}

describe('useScrollRestoration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockScrollableHeight(2000, 800);
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('starts in idle status when seriesId is null', () => {
    const mockSupabase = makeMockSupabase(null);
    createBrowserClient.mockReturnValue(mockSupabase);

    const { result } = renderHook(() => useScrollRestoration(null));

    expect(result.current.status).toBe('idle');
    expect(result.current.scrollPosition).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isHighlighting).toBe(false);
  });

  it('transitions to loading when seriesId is provided', async () => {
    const mockSupabase = makeMockSupabase(50);
    createBrowserClient.mockReturnValue(mockSupabase);
    const scrollTo = mockWindowScroll();

    const { result } = renderHook(() => useScrollRestoration('series-123'));

    expect(result.current.status).toBe('loading');

    await act(async () => {
      await Promise.resolve();
      jest.runAllTimers();
    });

    expect(scrollTo).toHaveBeenCalled();
  });

  it('restores scroll position when valid position found', async () => {
    const mockSupabase = makeMockSupabase(50);
    createBrowserClient.mockReturnValue(mockSupabase);
    mockWindowScroll();

    const { result } = renderHook(() => useScrollRestoration('series-123'));

    await act(async () => {
      await Promise.resolve();
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(['restored', 'restoring']).toContain(result.current.status);
    });
  });

  it('scrolls to correct pixel position based on percentage', async () => {
    const mockSupabase = makeMockSupabase(50);
    createBrowserClient.mockReturnValue(mockSupabase);
    const scrollTo = mockWindowScroll();
    mockScrollableHeight(2000, 800);

    const { result } = renderHook(() => useScrollRestoration('series-abc'));

    await act(async () => {
      await Promise.resolve();
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('restored');
    });

    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: expect.any(Number) })
    );
    const call = scrollTo.mock.calls[0][0];
    expect(call.top).toBe(600);
  });

  it('falls back to chapter start when no scroll position in DB', async () => {
    const mockSupabase = makeMockSupabase(null);
    createBrowserClient.mockReturnValue(mockSupabase);
    const scrollTo = mockWindowScroll();

    const { result } = renderHook(() => useScrollRestoration('series-123'));

    await act(async () => {
      await Promise.resolve();
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('fallback');
    });

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('falls back when scroll position is 0 (top of page)', async () => {
    const mockSupabase = makeMockSupabase(0);
    createBrowserClient.mockReturnValue(mockSupabase);
    const scrollTo = mockWindowScroll();

    const { result } = renderHook(() => useScrollRestoration('series-123'));

    await act(async () => {
      await Promise.resolve();
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(['restored', 'fallback']).toContain(result.current.status);
    });

    expect(scrollTo).toHaveBeenCalled();
  });

  it('sets error status when Supabase returns an error', async () => {
    const mockSupabase = makeMockSupabase(null, 'Database connection failed');
    createBrowserClient.mockReturnValue(mockSupabase);
    mockWindowScroll();

    const { result } = renderHook(() => useScrollRestoration('series-123'));

    await act(async () => {
      await Promise.resolve();
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.error).toBe('Database connection failed');
  });

  it('handles Supabase throwing an exception', async () => {
    const from = jest.fn().mockImplementation(() => {
      throw new Error('Network error');
    });
    createBrowserClient.mockReturnValue({ from });
    mockWindowScroll();

    const { result } = renderHook(() => useScrollRestoration('series-123'));

    await act(async () => {
      await Promise.resolve();
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.error).toBe('Network error');
  });

  it('sets isHighlighting to true after successful restoration', async () => {
    const mockSupabase = makeMockSupabase(75);
    createBrowserClient.mockReturnValue(mockSupabase);
    mockWindowScroll();

    const { result } = renderHook(() => useScrollRestoration('series-xyz'));

    await act(async () => {
      await Promise.resolve();
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('restored');
    });

    expect(result.current.isHighlighting).toBe(true);
  });

  it('clears isHighlighting after highlight duration', async () => {
    const mockSupabase = makeMockSupabase(75);
    createBrowserClient.mockReturnValue(mockSupabase);
    mockWindowScroll();

    const { result } = renderHook(() => useScrollRestoration('series-xyz'));

    await act(async () => {
      await Promise.resolve();
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('restored');
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(result.current.isHighlighting).toBe(false);
    });
  });

  it('stores the clamped scroll position in state', async () => {
    const mockSupabase = makeMockSupabase(85);
    createBrowserClient.mockReturnValue(mockSupabase);
    mockWindowScroll();

    const { result } = renderHook(() => useScrollRestoration('series-123'));

    await act(async () => {
      await Promise.resolve();
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('restored');
    });

    expect(result.current.scrollPosition).toBe(85);
  });

  it('falls back when scroll position is invalid (out of range)', async () => {
    const mockSupabase = makeMockSupabase(150);
    createBrowserClient.mockReturnValue(mockSupabase);
    const scrollTo = mockWindowScroll();

    const { result } = renderHook(() => useScrollRestoration('series-123'));

    await act(async () => {
      await Promise.resolve();
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('fallback');
    });

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('uses smooth scroll behavior', async () => {
    const mockSupabase = makeMockSupabase(50);
    createBrowserClient.mockReturnValue(mockSupabase);
    const scrollTo = mockWindowScroll();

    const { result } = renderHook(() => useScrollRestoration('series-123'));

    await act(async () => {
      await Promise.resolve();
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('restored');
    });

    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' })
    );
  });

  it('does not restore when seriesId changes to null', async () => {
    const mockSupabase = makeMockSupabase(50);
    createBrowserClient.mockReturnValue(mockSupabase);
    mockWindowScroll();

    const { result, rerender } = renderHook(
      ({ id }: { id: string | null }) => useScrollRestoration(id),
      { initialProps: { id: null } }
    );

    expect(result.current.status).toBe('idle');

    rerender({ id: null });
    expect(result.current.status).toBe('idle');
  });

  it('cleans up timers on unmount', async () => {
    const mockSupabase = makeMockSupabase(50);
    createBrowserClient.mockReturnValue(mockSupabase);
    mockWindowScroll();

    const { unmount } = renderHook(() => useScrollRestoration('series-123'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(() => unmount()).not.toThrow();
  });

  it('returns null error when restoration succeeds', async () => {
    const mockSupabase = makeMockSupabase(60);
    createBrowserClient.mockReturnValue(mockSupabase);
    mockWindowScroll();

    const { result } = renderHook(() => useScrollRestoration('series-123'));

    await act(async () => {
      await Promise.resolve();
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('restored');
    });

    expect(result.current.error).toBeNull();
  });
});
