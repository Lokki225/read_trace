export interface ProgressUpdate {
  type: 'PROGRESS_UPDATE';
  payload: {
    seriesTitle: string;
    chapterNumber: number;
    scrollPosition: number;
    timestamp: number;
    url: string;
  };
}

export interface ProgressResponse {
  success: boolean;
  error?: string;
}

export interface BackgroundProgressUpdate {
  series_id: string;
  chapter: number;
  scroll_position: number;
  timestamp: number;
  url: string;
}

export interface QueuedUpdate extends BackgroundProgressUpdate {
  id: string;
  retries: number;
  lastRetry?: number;
}

export interface SyncResponse {
  success: boolean;
  synced_at?: string;
  next_sync_in?: number;
  error?: string;
}

export interface BackgroundMessage {
  type: 'PROGRESS_UPDATE';
  payload: BackgroundProgressUpdate;
}

export interface BackgroundMessageResponse {
  success: boolean;
  queued: boolean;
  error?: string;
}

export interface PlatformAdapter {
  name: string;
  matches: (url: string) => boolean;
  extractSeriesTitle: (document: Document) => string | null;
  extractChapterNumber: (url: string, document: Document) => number | null;
}

export interface ContentScriptState {
  isActive: boolean;
  seriesTitle: string | null;
  chapterNumber: number | null;
  scrollPosition: number;
  lastUpdateTime: number;
}
