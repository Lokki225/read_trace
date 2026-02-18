import { DashboardData, SeriesStatus, UserSeries } from '../../src/model/schemas/dashboard';

export const makeDashboardSeries = (overrides: Partial<UserSeries> = {}): UserSeries => ({
  id: `series-${Math.random().toString(36).slice(2, 9)}`,
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
  genres: [],
  progress_percentage: 0,
  last_read_at: '2026-02-18T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

export const mockDashboardData: DashboardData = {
  reading: [
    makeDashboardSeries({ id: 'series-1', title: 'Naruto', status: SeriesStatus.READING }),
    makeDashboardSeries({ id: 'series-2', title: 'One Piece', status: SeriesStatus.READING }),
  ],
  completed: [
    makeDashboardSeries({
      id: 'series-3',
      title: 'Fullmetal Alchemist',
      status: SeriesStatus.COMPLETED,
    }),
  ],
  on_hold: [
    makeDashboardSeries({ id: 'series-4', title: 'Bleach', status: SeriesStatus.ON_HOLD }),
  ],
  plan_to_read: [
    makeDashboardSeries({
      id: 'series-5',
      title: 'Hunter x Hunter',
      status: SeriesStatus.PLAN_TO_READ,
    }),
  ],
};

export const mockEmptyDashboardData: DashboardData = {
  reading: [],
  completed: [],
  on_hold: [],
  plan_to_read: [],
};
