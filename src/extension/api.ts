import { BackgroundProgressUpdate, SyncResponse } from './types';
import { log, warn, error as logError } from './logger';

const SYNC_TIMEOUT_MS = 5000;
const API_BASE_URL = 'http://localhost:3000';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

export async function syncProgress(update: BackgroundProgressUpdate, userId?: string): Promise<SyncResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

  const url = `${API_BASE_URL}/api/progress/sync`;

  log('api:sync:start', { series_id: update.series_id, chapter: update.chapter });

  try {
    const body: Record<string, any> = {
      series_id: update.series_id,
      chapter: update.chapter,
      scroll_position: update.scroll_position,
      timestamp: update.timestamp,
      seriesTitle: update.seriesTitle,
    };
    
    if (userId) {
      body.user_id = userId;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const statusCode = response.status;
      if (statusCode >= 400 && statusCode < 500) {
        warn('api:sync:client-error', { status: statusCode, series_id: update.series_id });
        return { success: false, error: `Client error: ${statusCode}` };
      }
      warn('api:sync:server-error', { status: statusCode, series_id: update.series_id });
      return { success: false, error: `Server error: ${statusCode}` };
    }

    const data = (await response.json()) as SyncResponse;
    log('api:sync:success', { series_id: update.series_id, synced_at: data.synced_at });
    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof Error && err.name === 'AbortError') {
      warn('api:sync:timeout', { series_id: update.series_id });
      return { success: false, error: 'API sync timeout - queuing for retry' };
    }

    logError('api:sync:error', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
