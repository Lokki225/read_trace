export interface SeriesInfo {
  title: string;
  platform: string;
  url: string;
}

export interface ChapterInfo {
  number: number;
  title: string | null;
  url: string;
}

export interface ProgressInfo {
  scrollPosition: number;
  pageNumber: number | null;
  totalPages: number | null;
  percentComplete: number;
}

export interface PlatformAdapterV2 {
  name: string;
  urlPattern: RegExp;
  validatePage(): boolean;
  detectSeries(): Promise<SeriesInfo | null>;
  detectChapter(): Promise<ChapterInfo | null>;
  detectProgress(): Promise<ProgressInfo>;
}

export type AdapterFactory = () => PlatformAdapterV2;
