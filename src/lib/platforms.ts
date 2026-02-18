import { Platform } from '@/types/preferences';

export const SUPPORTED_PLATFORMS: Platform[] = [
  {
    id: 'mangadex',
    name: 'MangaDex',
    url: 'https://mangadex.org',
  },
  {
    id: 'manganelo',
    name: 'MangaNelo',
    url: 'https://manganelo.com',
  },
  {
    id: 'mangakakalot',
    name: 'MangaKakalot',
    url: 'https://mangakakalot.com',
  },
];

export const DEFAULT_PREFERRED_SITES = ['mangadex'];

export function getPlatformById(id: string): Platform | undefined {
  return SUPPORTED_PLATFORMS.find((p) => p.id === id);
}

export function getPlatformName(id: string): string {
  return getPlatformById(id)?.name || id;
}

export function validatePreferences(preferences: string[]): boolean {
  if (!Array.isArray(preferences)) return false;
  if (preferences.length === 0) return false;
  return preferences.every((id) => SUPPORTED_PLATFORMS.some((p) => p.id === id));
}

export function normalizePreferences(preferences: string[]): string[] {
  const valid = preferences.filter((id) =>
    SUPPORTED_PLATFORMS.some((p) => p.id === id)
  );
  return valid.length > 0 ? valid : DEFAULT_PREFERRED_SITES;
}
