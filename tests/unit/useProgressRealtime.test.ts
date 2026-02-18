import { renderHook, act, waitFor } from '@testing-library/react';
import { useProgressRealtime } from '@/hooks/useProgressRealtime';
import { useSeriesStore } from '@/store/seriesStore';
import * as supabaseSSR from '@supabase/ssr';

jest.mock('@supabase/ssr');
jest.mock('@/store/seriesStore');

describe('useProgressRealtime', () => {
  let mockChannel: any;
  let mockSubscribe: jest.Mock;
  let mockUnsubscribe: jest.Mock;
  let mockOn: jest.Mock;
  let mockUpdateSeriesProgress: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUnsubscribe = jest.fn();
    mockSubscribe = jest.fn().mockReturnValue({
      unsubscribe: mockUnsubscribe,
    });

    mockOn = jest.fn().mockReturnValue({
      subscribe: mockSubscribe,
    });

    mockChannel = {
      on: mockOn,
      unsubscribe: mockUnsubscribe,
    };

    const mockCreateBrowserClient = jest.fn().mockReturnValue({
      channel: jest.fn().mockReturnValue(mockChannel),
    });

    (supabaseSSR.createBrowserClient as jest.Mock).mockImplementation(
      mockCreateBrowserClient
    );

    mockUpdateSeriesProgress = jest.fn();
    (useSeriesStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          updateSeriesProgress: mockUpdateSeriesProgress,
        });
      }
      return mockUpdateSeriesProgress;
    });
  });

  it('should not subscribe if userId is null', () => {
    renderHook(() => useProgressRealtime(null));

    expect(mockOn).not.toHaveBeenCalled();
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it('should subscribe to reading_progress channel with correct filter', () => {
    renderHook(() => useProgressRealtime('user-123'));

    expect(mockOn).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: '*',
        schema: 'public',
        table: 'reading_progress',
        filter: 'user_id=eq.user-123',
      }),
      expect.any(Function)
    );
  });

  it('should unsubscribe on cleanup', () => {
    const { unmount } = renderHook(() => useProgressRealtime('user-123'));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should update series progress on INSERT event', () => {
    renderHook(() => useProgressRealtime('user-123'));

    const callback = mockOn.mock.calls[0][2];
    const payload = {
      eventType: 'INSERT',
      new: {
        series_id: 'series-1',
        current_chapter: 15,
        total_chapters: 50,
        progress_percentage: 30,
        last_read_at: '2026-02-18T15:00:00Z',
      },
    };

    act(() => {
      callback(payload);
    });

    expect(mockUpdateSeriesProgress).toHaveBeenCalledWith('series-1', {
      current_chapter: 15,
      total_chapters: 50,
      progress_percentage: 30,
      last_read_at: '2026-02-18T15:00:00Z',
    });
  });

  it('should update series progress on UPDATE event', () => {
    renderHook(() => useProgressRealtime('user-123'));

    const callback = mockOn.mock.calls[0][2];
    const payload = {
      eventType: 'UPDATE',
      new: {
        series_id: 'series-2',
        current_chapter: 25,
        total_chapters: 100,
        progress_percentage: 25,
        last_read_at: '2026-02-18T16:00:00Z',
      },
    };

    act(() => {
      callback(payload);
    });

    expect(mockUpdateSeriesProgress).toHaveBeenCalledWith('series-2', {
      current_chapter: 25,
      total_chapters: 100,
      progress_percentage: 25,
      last_read_at: '2026-02-18T16:00:00Z',
    });
  });

  it('should not update on DELETE event', () => {
    renderHook(() => useProgressRealtime('user-123'));

    const callback = mockOn.mock.calls[0][2];
    const payload = {
      eventType: 'DELETE',
      new: {
        series_id: 'series-1',
      },
    };

    act(() => {
      callback(payload);
    });

    expect(mockUpdateSeriesProgress).not.toHaveBeenCalled();
  });

  it('should handle null series_id gracefully', () => {
    renderHook(() => useProgressRealtime('user-123'));

    const callback = mockOn.mock.calls[0][2];
    const payload = {
      eventType: 'INSERT',
      new: {
        series_id: null,
        current_chapter: 15,
        total_chapters: 50,
        progress_percentage: 30,
        last_read_at: '2026-02-18T15:00:00Z',
      },
    };

    act(() => {
      callback(payload);
    });

    expect(mockUpdateSeriesProgress).not.toHaveBeenCalled();
  });

  it('should handle missing fields in payload', () => {
    renderHook(() => useProgressRealtime('user-123'));

    const callback = mockOn.mock.calls[0][2];
    const payload = {
      eventType: 'UPDATE',
      new: {
        series_id: 'series-1',
        current_chapter: 20,
      },
    };

    act(() => {
      callback(payload);
    });

    expect(mockUpdateSeriesProgress).toHaveBeenCalledWith('series-1', {
      current_chapter: 20,
      total_chapters: undefined,
      progress_percentage: undefined,
      last_read_at: undefined,
    });
  });

  it('should re-subscribe when userId changes', () => {
    const { rerender } = renderHook(
      ({ userId }) => useProgressRealtime(userId),
      { initialProps: { userId: 'user-123' } }
    );

    expect(mockOn).toHaveBeenCalledTimes(1);

    rerender({ userId: 'user-456' });

    expect(mockOn).toHaveBeenCalledTimes(2);
    expect(mockOn).toHaveBeenLastCalledWith(
      'postgres_changes',
      expect.objectContaining({
        filter: 'user_id=eq.user-456',
      }),
      expect.any(Function)
    );
  });
});
