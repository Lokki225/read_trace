import { fetchUserSeriesGrouped } from '../../src/backend/services/dashboard/seriesQueryService';
import { SeriesStatus } from '../../src/model/schemas/dashboard';

jest.mock('../../src/lib/supabase', () => ({
  createServerClient: jest.fn(),
}));

const { createServerClient } = require('../../src/lib/supabase');

const makeMockRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'series-1',
  user_id: 'user-123',
  title: 'Test Series',
  normalized_title: 'test series',
  platform: 'mangadex',
  source_url: null,
  import_id: null,
  status: 'reading',
  current_chapter: 1,
  total_chapters: null,
  cover_url: null,
  last_read_at: '2026-02-18T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

const buildMockChain = (data: unknown[], error: unknown = null) => {
  const limitMock = jest.fn().mockResolvedValue({ data, error });
  const orderMock = jest.fn().mockReturnValue({ limit: limitMock });
  const eqMock = jest.fn().mockReturnValue({ order: orderMock });
  const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
  const fromMock = jest.fn().mockReturnValue({ select: selectMock });

  createServerClient.mockResolvedValue({ from: fromMock });

  return { fromMock, selectMock, eqMock, orderMock, limitMock };
};

describe('fetchUserSeriesGrouped', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches and groups series for authenticated user', async () => {
    const mockData = [
      makeMockRow({ id: '1', status: 'reading' }),
      makeMockRow({ id: '2', status: 'completed' }),
      makeMockRow({ id: '3', status: 'reading' }),
    ];
    buildMockChain(mockData);

    const result = await fetchUserSeriesGrouped('user-123');

    expect(result.reading).toHaveLength(2);
    expect(result.completed).toHaveLength(1);
    expect(result.on_hold).toHaveLength(0);
    expect(result.plan_to_read).toHaveLength(0);
  });

  it('returns empty groups when user has no series', async () => {
    buildMockChain([]);

    const result = await fetchUserSeriesGrouped('user-123');

    expect(result.reading).toEqual([]);
    expect(result.completed).toEqual([]);
    expect(result.on_hold).toEqual([]);
    expect(result.plan_to_read).toEqual([]);
  });

  it('throws on Supabase error', async () => {
    buildMockChain(null as any, { message: 'Connection failed' });

    await expect(fetchUserSeriesGrouped('user-123')).rejects.toThrow('Connection failed');
  });

  it('filters by the correct user_id', async () => {
    const { eqMock } = buildMockChain([]);

    await fetchUserSeriesGrouped('user-456');

    expect(eqMock).toHaveBeenCalledWith('user_id', 'user-456');
  });

  it('applies limit of 100', async () => {
    const { limitMock } = buildMockChain([]);

    await fetchUserSeriesGrouped('user-123');

    expect(limitMock).toHaveBeenCalledWith(100);
  });

  it('handles 100 series without errors', async () => {
    const statuses = [SeriesStatus.READING, SeriesStatus.COMPLETED, SeriesStatus.ON_HOLD, SeriesStatus.PLAN_TO_READ];
    const mockData = Array.from({ length: 100 }, (_, i) =>
      makeMockRow({ id: String(i), status: statuses[i % 4] })
    );
    buildMockChain(mockData);

    const result = await fetchUserSeriesGrouped('user-123');
    const total =
      result.reading.length +
      result.completed.length +
      result.on_hold.length +
      result.plan_to_read.length;

    expect(total).toBe(100);
  });

  it('groups all four statuses correctly', async () => {
    const mockData = [
      makeMockRow({ id: '1', status: 'reading' }),
      makeMockRow({ id: '2', status: 'completed' }),
      makeMockRow({ id: '3', status: 'on_hold' }),
      makeMockRow({ id: '4', status: 'plan_to_read' }),
    ];
    buildMockChain(mockData);

    const result = await fetchUserSeriesGrouped('user-123');

    expect(result.reading).toHaveLength(1);
    expect(result.completed).toHaveLength(1);
    expect(result.on_hold).toHaveLength(1);
    expect(result.plan_to_read).toHaveLength(1);
  });
});
