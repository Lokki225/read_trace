import { DashboardData, SeriesStatus, UserSeries } from '@/model/schemas/dashboard';

const BASE: Omit<UserSeries, 'id' | 'title' | 'platform' | 'status' | 'genres' | 'progress_percentage' | 'current_chapter' | 'total_chapters' | 'cover_url' | 'last_read_at'> = {
  user_id: 'dev-user',
  normalized_title: '',
  source_url: null,
  import_id: null,
  resume_url: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-02-18T00:00:00Z',
};

const s = (
  id: string,
  title: string,
  platform: string,
  status: SeriesStatus,
  genres: string[],
  progress_percentage: number,
  current_chapter: number,
  total_chapters: number | null,
  cover_url: string | null,
  last_read_at: string | null
): UserSeries => ({
  ...BASE,
  id,
  title,
  normalized_title: title.toLowerCase(),
  platform,
  status,
  genres,
  progress_percentage,
  current_chapter,
  total_chapters,
  cover_url,
  last_read_at,
});

export const DEV_DASHBOARD_DATA: DashboardData = {
  reading: [
    s(
      'dev-1',
      'One Piece',
      'MangaDex',
      SeriesStatus.READING,
      ['action', 'adventure', 'comedy'],
      78,
      1110,
      null,
      'https://uploads.mangadex.org/covers/a1c7c817-4e59-43b7-9365-09675a149a6f/c4e4a3d2-a1c7-4e59-43b7-9365-09675a149a6f.jpg',
      '2026-02-17T20:00:00Z'
    ),
    s(
      'dev-2',
      'Jujutsu Kaisen',
      'MangaDex',
      SeriesStatus.READING,
      ['action', 'supernatural', 'school'],
      62,
      248,
      null,
      'https://uploads.mangadex.org/covers/c52b2ce3-7f95-469c-96b0-479524fb7a1a/c52b2ce3-7f95-469c-96b0-479524fb7a1a.jpg',
      '2026-02-18T10:00:00Z'
    ),
    s(
      'dev-3',
      'Chainsaw Man',
      'MangaDex',
      SeriesStatus.READING,
      ['action', 'horror', 'supernatural'],
      45,
      155,
      null,
      null,
      '2026-02-16T14:00:00Z'
    ),
    s(
      'dev-4',
      'Spy x Family',
      'MangaDex',
      SeriesStatus.READING,
      ['action', 'comedy', 'slice of life'],
      55,
      95,
      null,
      null,
      '2026-02-15T09:00:00Z'
    ),
    s(
      'dev-5',
      'Solo Leveling',
      'MangaPlus',
      SeriesStatus.READING,
      ['action', 'fantasy', 'isekai'],
      88,
      179,
      179,
      null,
      '2026-02-18T08:00:00Z'
    ),
    s(
      'dev-6',
      'Blue Lock',
      'MangaDex',
      SeriesStatus.READING,
      ['sports', 'action'],
      33,
      230,
      null,
      null,
      '2026-02-14T18:00:00Z'
    ),
  ],

  completed: [
    s(
      'dev-7',
      'Attack on Titan',
      'MangaDex',
      SeriesStatus.COMPLETED,
      ['action', 'drama', 'military'],
      100,
      139,
      139,
      null,
      '2026-01-20T12:00:00Z'
    ),
    s(
      'dev-8',
      'Fullmetal Alchemist',
      'MangaDex',
      SeriesStatus.COMPLETED,
      ['action', 'adventure', 'fantasy'],
      100,
      108,
      108,
      null,
      '2026-01-10T15:00:00Z'
    ),
    s(
      'dev-9',
      'Death Note',
      'MangaDex',
      SeriesStatus.COMPLETED,
      ['mystery', 'thriller', 'supernatural'],
      100,
      108,
      108,
      null,
      '2025-12-28T11:00:00Z'
    ),
    s(
      'dev-10',
      'Vinland Saga',
      'MangaDex',
      SeriesStatus.COMPLETED,
      ['action', 'historical', 'drama'],
      100,
      193,
      193,
      null,
      '2026-02-01T09:00:00Z'
    ),
  ],

  on_hold: [
    s(
      'dev-11',
      'Berserk',
      'MangaDex',
      SeriesStatus.ON_HOLD,
      ['action', 'dark fantasy', 'horror'],
      41,
      374,
      null,
      null,
      '2025-11-15T10:00:00Z'
    ),
    s(
      'dev-12',
      'Vagabond',
      'MangaDex',
      SeriesStatus.ON_HOLD,
      ['action', 'historical', 'drama'],
      72,
      327,
      null,
      null,
      '2025-10-05T14:00:00Z'
    ),
    s(
      'dev-13',
      'Oyasumi Punpun',
      'MangaDex',
      SeriesStatus.ON_HOLD,
      ['drama', 'slice of life', 'psychological'],
      30,
      47,
      147,
      null,
      '2025-09-20T16:00:00Z'
    ),
  ],

  plan_to_read: [
    s(
      'dev-14',
      'Dungeon Meshi',
      'MangaDex',
      SeriesStatus.PLAN_TO_READ,
      ['adventure', 'fantasy', 'comedy'],
      0,
      0,
      97,
      null,
      null
    ),
    s(
      'dev-15',
      'Frieren: Beyond Journey\'s End',
      'MangaDex',
      SeriesStatus.PLAN_TO_READ,
      ['adventure', 'fantasy', 'slice of life'],
      0,
      0,
      null,
      null,
      null
    ),
    s(
      'dev-16',
      'Oshi no Ko',
      'MangaDex',
      SeriesStatus.PLAN_TO_READ,
      ['drama', 'mystery', 'romance'],
      0,
      0,
      null,
      null,
      null
    ),
    s(
      'dev-17',
      'Kaiju No. 8',
      'MangaPlus',
      SeriesStatus.PLAN_TO_READ,
      ['action', 'sci-fi', 'supernatural'],
      0,
      0,
      null,
      null,
      null
    ),
  ],
};
