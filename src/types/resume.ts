export interface ResumeButtonProps {
  seriesId: string;
  seriesTitle: string;
  resumeUrl: string | null;
  onNavigate?: (url: string) => void;
}

export type ResumePlatform = 'mangadex' | 'webtoon' | 'unknown';

export interface ResumeUrlData {
  platform: ResumePlatform;
  seriesId: string;
  chapterNumber: number;
  pageNumber?: number;
}

export interface ResumeNavigationResult {
  success: boolean;
  url: string | null;
  error?: string;
}
