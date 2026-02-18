import { renderHook, act } from '@testing-library/react';
import { useSeriesStore } from '@/store/seriesStore';
import { UserSeries, SeriesStatus } from '@/model/schemas/dashboard';

describe('Progress Realtime Integration', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useSeriesStore());
    act(() => {
      result.current.setSeries([]);
    });
  });

  it('should update series progress when updateSeriesProgress is called', () => {
    const { result } = renderHook(() => useSeriesStore());

    const mockSeries: UserSeries = {
      id: 'series-1',
      user_id: 'user-1',
      title: 'Test Series',
      normalized_title: 'test-series',
      platform: 'MangaDex',
      source_url: 'https://example.com',
      import_id: null,
      status: SeriesStatus.READING,
      current_chapter: 10,
      total_chapters: 50,
      cover_url: null,
      genres: ['Action'],
      progress_percentage: 20,
      last_read_at: '2026-02-18T10:00:00Z',
      created_at: '2026-02-01T00:00:00Z',
      updated_at: '2026-02-18T10:00:00Z',
    };

    act(() => {
      result.current.setSeries([mockSeries]);
    });

    expect(result.current.series[0].current_chapter).toBe(10);
    expect(result.current.series[0].progress_percentage).toBe(20);

    act(() => {
      result.current.updateSeriesProgress('series-1', {
        current_chapter: 15,
        progress_percentage: 30,
        last_read_at: '2026-02-18T15:00:00Z',
      });
    });

    expect(result.current.series[0].current_chapter).toBe(15);
    expect(result.current.series[0].progress_percentage).toBe(30);
    expect(result.current.series[0].last_read_at).toBe('2026-02-18T15:00:00Z');
  });

  it('should handle multiple series progress updates independently', () => {
    const { result } = renderHook(() => useSeriesStore());

    const series1: UserSeries = {
      id: 'series-1',
      user_id: 'user-1',
      title: 'Series 1',
      normalized_title: 'series-1',
      platform: 'MangaDex',
      source_url: 'https://example.com/1',
      import_id: null,
      status: SeriesStatus.READING,
      current_chapter: 10,
      total_chapters: 50,
      cover_url: null,
      genres: [],
      progress_percentage: 20,
      last_read_at: '2026-02-18T10:00:00Z',
      created_at: '2026-02-01T00:00:00Z',
      updated_at: '2026-02-18T10:00:00Z',
    };

    const series2: UserSeries = {
      id: 'series-2',
      user_id: 'user-1',
      title: 'Series 2',
      normalized_title: 'series-2',
      platform: 'Webtoon',
      source_url: 'https://example.com/2',
      import_id: null,
      status: SeriesStatus.READING,
      current_chapter: 5,
      total_chapters: 100,
      cover_url: null,
      genres: [],
      progress_percentage: 5,
      last_read_at: '2026-02-17T10:00:00Z',
      created_at: '2026-02-01T00:00:00Z',
      updated_at: '2026-02-17T10:00:00Z',
    };

    act(() => {
      result.current.setSeries([series1, series2]);
    });

    act(() => {
      result.current.updateSeriesProgress('series-1', {
        current_chapter: 25,
        progress_percentage: 50,
      });
    });

    expect(result.current.series[0].current_chapter).toBe(25);
    expect(result.current.series[0].progress_percentage).toBe(50);
    expect(result.current.series[1].current_chapter).toBe(5);
    expect(result.current.series[1].progress_percentage).toBe(5);
  });

  it('should not update series with non-matching ID', () => {
    const { result } = renderHook(() => useSeriesStore());

    const mockSeries: UserSeries = {
      id: 'series-1',
      user_id: 'user-1',
      title: 'Test Series',
      normalized_title: 'test-series',
      platform: 'MangaDex',
      source_url: 'https://example.com',
      import_id: null,
      status: SeriesStatus.READING,
      current_chapter: 10,
      total_chapters: 50,
      cover_url: null,
      genres: [],
      progress_percentage: 20,
      last_read_at: '2026-02-18T10:00:00Z',
      created_at: '2026-02-01T00:00:00Z',
      updated_at: '2026-02-18T10:00:00Z',
    };

    act(() => {
      result.current.setSeries([mockSeries]);
    });

    act(() => {
      result.current.updateSeriesProgress('non-existent-id', {
        current_chapter: 50,
        progress_percentage: 100,
      });
    });

    expect(result.current.series[0].current_chapter).toBe(10);
    expect(result.current.series[0].progress_percentage).toBe(20);
  });

  it('should preserve other series properties during progress update', () => {
    const { result } = renderHook(() => useSeriesStore());

    const mockSeries: UserSeries = {
      id: 'series-1',
      user_id: 'user-1',
      title: 'Test Series',
      normalized_title: 'test-series',
      platform: 'MangaDex',
      source_url: 'https://example.com',
      import_id: null,
      status: SeriesStatus.READING,
      current_chapter: 10,
      total_chapters: 50,
      cover_url: 'https://example.com/cover.jpg',
      genres: ['Action', 'Adventure'],
      progress_percentage: 20,
      last_read_at: '2026-02-18T10:00:00Z',
      created_at: '2026-02-01T00:00:00Z',
      updated_at: '2026-02-18T10:00:00Z',
    };

    act(() => {
      result.current.setSeries([mockSeries]);
    });

    act(() => {
      result.current.updateSeriesProgress('series-1', {
        current_chapter: 15,
        progress_percentage: 30,
      });
    });

    const updated = result.current.series[0];
    expect(updated.title).toBe('Test Series');
    expect(updated.platform).toBe('MangaDex');
    expect(updated.cover_url).toBe('https://example.com/cover.jpg');
    expect(updated.genres).toEqual(['Action', 'Adventure']);
    expect(updated.status).toBe(SeriesStatus.READING);
  });

  it('should handle rapid successive progress updates', () => {
    const { result } = renderHook(() => useSeriesStore());

    const mockSeries: UserSeries = {
      id: 'series-1',
      user_id: 'user-1',
      title: 'Test Series',
      normalized_title: 'test-series',
      platform: 'MangaDex',
      source_url: 'https://example.com',
      import_id: null,
      status: SeriesStatus.READING,
      current_chapter: 10,
      total_chapters: 50,
      cover_url: null,
      genres: [],
      progress_percentage: 20,
      last_read_at: '2026-02-18T10:00:00Z',
      created_at: '2026-02-01T00:00:00Z',
      updated_at: '2026-02-18T10:00:00Z',
    };

    act(() => {
      result.current.setSeries([mockSeries]);
    });

    act(() => {
      result.current.updateSeriesProgress('series-1', {
        current_chapter: 15,
        progress_percentage: 30,
      });
      result.current.updateSeriesProgress('series-1', {
        current_chapter: 20,
        progress_percentage: 40,
      });
      result.current.updateSeriesProgress('series-1', {
        current_chapter: 25,
        progress_percentage: 50,
      });
    });

    expect(result.current.series[0].current_chapter).toBe(25);
    expect(result.current.series[0].progress_percentage).toBe(50);
  });
});
