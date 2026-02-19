export interface ProgressData {
  seriesTitle: string;
  chapterNumber: number;
  scrollPosition: number;
  timestamp: number;
  url: string;
  platform: string;
}

export interface SyncMessage {
  type: 'PROGRESS_UPDATE' | 'PING' | 'PONG';
  payload?: ProgressData;
}

export interface SyncResponse {
  success: boolean;
  error?: string;
}
