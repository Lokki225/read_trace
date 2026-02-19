import { PlatformAdapter } from '../types';
import { PlatformAdapterV2 } from './types';
import { mangadexAdapter, MangaDexAdapter } from './mangadex';
import { webtoonAdapter, WebtoonAdapter } from './webtoon';

const ADAPTER_REGISTRY: PlatformAdapter[] = [mangadexAdapter, webtoonAdapter];

const ADAPTER_V2_REGISTRY: PlatformAdapterV2[] = [
  new MangaDexAdapter(),
  new WebtoonAdapter(),
];

export function detectAdapter(url: string): PlatformAdapter | null {
  for (const adapter of ADAPTER_REGISTRY) {
    if (adapter.matches(url)) {
      return adapter;
    }
  }
  return null;
}

export function detectAdapterV2(url: string): PlatformAdapterV2 | null {
  for (const adapter of ADAPTER_V2_REGISTRY) {
    if (adapter.urlPattern.test(url)) {
      return adapter;
    }
  }
  return null;
}

export function registerAdapter(adapter: PlatformAdapter): void {
  ADAPTER_REGISTRY.push(adapter);
}

export function registerAdapterV2(adapter: PlatformAdapterV2): void {
  ADAPTER_V2_REGISTRY.push(adapter);
}

export function getRegisteredAdapters(): PlatformAdapter[] {
  return [...ADAPTER_REGISTRY];
}

export function getRegisteredAdaptersV2(): PlatformAdapterV2[] {
  return [...ADAPTER_V2_REGISTRY];
}

export { mangadexAdapter, webtoonAdapter, MangaDexAdapter, WebtoonAdapter };
