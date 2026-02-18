export enum SeriesStatus {
  READING = 'reading',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  PLAN_TO_READ = 'plan_to_read',
}

export interface UserSeries {
  id: string;
  user_id: string;
  title: string;
  normalized_title: string;
  platform: string;
  source_url: string | null;
  import_id: string | null;
  status: SeriesStatus;
  current_chapter: number;
  total_chapters: number | null;
  cover_url: string | null;
  last_read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  reading: UserSeries[];
  completed: UserSeries[];
  on_hold: UserSeries[];
  plan_to_read: UserSeries[];
}

export interface TabConfig {
  id: string;
  label: string;
  status: SeriesStatus;
  ariaLabel: string;
  panelId: string;
}

export type DashboardError = {
  message: string;
  code?: string;
};
