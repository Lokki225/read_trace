import {
  groupSeriesByStatus,
  getTabLabel,
  getTabConfigs,
  getSeriesForStatus,
} from '../../src/backend/services/dashboard/dashboardDomain';
import { SeriesStatus, UserSeries } from '../../src/model/schemas/dashboard';

const makeSeries = (overrides: Partial<UserSeries> = {}): UserSeries => ({
  id: 'series-1',
  user_id: 'user-123',
  title: 'Test Series',
  normalized_title: 'test series',
  platform: 'mangadex',
  source_url: null,
  import_id: null,
  status: SeriesStatus.READING,
  current_chapter: 1,
  total_chapters: null,
  cover_url: null,
  last_read_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('groupSeriesByStatus', () => {
  it('groups series into correct status buckets', () => {
    const series = [
      makeSeries({ id: '1', status: SeriesStatus.READING }),
      makeSeries({ id: '2', status: SeriesStatus.COMPLETED }),
      makeSeries({ id: '3', status: SeriesStatus.ON_HOLD }),
      makeSeries({ id: '4', status: SeriesStatus.PLAN_TO_READ }),
      makeSeries({ id: '5', status: SeriesStatus.READING }),
    ];
    const result = groupSeriesByStatus(series);
    expect(result.reading).toHaveLength(2);
    expect(result.completed).toHaveLength(1);
    expect(result.on_hold).toHaveLength(1);
    expect(result.plan_to_read).toHaveLength(1);
  });

  it('returns empty arrays for statuses with no series', () => {
    const series = [makeSeries({ status: SeriesStatus.READING })];
    const result = groupSeriesByStatus(series);
    expect(result.completed).toEqual([]);
    expect(result.on_hold).toEqual([]);
    expect(result.plan_to_read).toEqual([]);
  });

  it('handles empty input array', () => {
    const result = groupSeriesByStatus([]);
    expect(result.reading).toEqual([]);
    expect(result.completed).toEqual([]);
    expect(result.on_hold).toEqual([]);
    expect(result.plan_to_read).toEqual([]);
  });

  it('preserves series data when grouping', () => {
    const s = makeSeries({ id: 'abc', title: 'Naruto', status: SeriesStatus.COMPLETED });
    const result = groupSeriesByStatus([s]);
    expect(result.completed[0]).toEqual(s);
  });

  it('handles 100 series in under 10ms', () => {
    const statuses = Object.values(SeriesStatus);
    const series = Array.from({ length: 100 }, (_, i) =>
      makeSeries({ id: String(i), status: statuses[i % 4] as SeriesStatus })
    );
    const start = performance.now();
    groupSeriesByStatus(series);
    expect(performance.now() - start).toBeLessThan(10);
  });

  it('total count matches input length', () => {
    const statuses = Object.values(SeriesStatus);
    const series = Array.from({ length: 20 }, (_, i) =>
      makeSeries({ id: String(i), status: statuses[i % 4] as SeriesStatus })
    );
    const result = groupSeriesByStatus(series);
    const total =
      result.reading.length +
      result.completed.length +
      result.on_hold.length +
      result.plan_to_read.length;
    expect(total).toBe(20);
  });
});

describe('getTabLabel', () => {
  it('returns correct label for Reading', () => {
    expect(getTabLabel(SeriesStatus.READING)).toBe('Reading');
  });

  it('returns correct label for Completed', () => {
    expect(getTabLabel(SeriesStatus.COMPLETED)).toBe('Completed');
  });

  it('returns correct label for On Hold', () => {
    expect(getTabLabel(SeriesStatus.ON_HOLD)).toBe('On Hold');
  });

  it('returns correct label for Plan to Read', () => {
    expect(getTabLabel(SeriesStatus.PLAN_TO_READ)).toBe('Plan to Read');
  });
});

describe('getTabConfigs', () => {
  it('returns exactly 4 tab configs', () => {
    expect(getTabConfigs()).toHaveLength(4);
  });

  it('returns tabs in correct order: Reading, Completed, On Hold, Plan to Read', () => {
    const configs = getTabConfigs();
    expect(configs[0].status).toBe(SeriesStatus.READING);
    expect(configs[1].status).toBe(SeriesStatus.COMPLETED);
    expect(configs[2].status).toBe(SeriesStatus.ON_HOLD);
    expect(configs[3].status).toBe(SeriesStatus.PLAN_TO_READ);
  });

  it('each config has all required fields', () => {
    getTabConfigs().forEach((config) => {
      expect(config.id).toBeDefined();
      expect(config.label).toBeDefined();
      expect(config.status).toBeDefined();
      expect(config.ariaLabel).toBeDefined();
      expect(config.panelId).toBeDefined();
    });
  });

  it('labels match getTabLabel output', () => {
    getTabConfigs().forEach((config) => {
      expect(config.label).toBe(getTabLabel(config.status));
    });
  });
});

describe('getSeriesForStatus', () => {
  const readingSeries = makeSeries({ id: '1', status: SeriesStatus.READING });
  const completedSeries = makeSeries({ id: '2', status: SeriesStatus.COMPLETED });
  const data = {
    reading: [readingSeries],
    completed: [completedSeries],
    on_hold: [],
    plan_to_read: [],
  };

  it('returns reading series for READING status', () => {
    expect(getSeriesForStatus(data, SeriesStatus.READING)).toEqual([readingSeries]);
  });

  it('returns completed series for COMPLETED status', () => {
    expect(getSeriesForStatus(data, SeriesStatus.COMPLETED)).toEqual([completedSeries]);
  });

  it('returns empty array for ON_HOLD when none exist', () => {
    expect(getSeriesForStatus(data, SeriesStatus.ON_HOLD)).toEqual([]);
  });

  it('returns empty array for PLAN_TO_READ when none exist', () => {
    expect(getSeriesForStatus(data, SeriesStatus.PLAN_TO_READ)).toEqual([]);
  });
});
