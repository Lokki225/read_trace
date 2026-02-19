import { log, warn, error as logError } from './logger';

export interface RealtimeProgressUpdate {
  series_id: string;
  user_id: string;
  current_chapter?: number;
  progress_percentage?: number;
  last_read_at?: string;
  updated_at?: string;
}

export interface ExtensionRealtimeState {
  isConnected: boolean;
  lastUpdate: RealtimeProgressUpdate | null;
  lastUpdateTime: number | null;
}

export type RealtimeUpdateHandler = (update: RealtimeProgressUpdate) => void;

let realtimeState: ExtensionRealtimeState = {
  isConnected: false,
  lastUpdate: null,
  lastUpdateTime: null,
};

const updateHandlers: RealtimeUpdateHandler[] = [];

export function getRealtimeState(): ExtensionRealtimeState {
  return { ...realtimeState };
}

export function onRealtimeUpdate(handler: RealtimeUpdateHandler): () => void {
  updateHandlers.push(handler);
  return () => {
    const index = updateHandlers.indexOf(handler);
    if (index !== -1) {
      updateHandlers.splice(index, 1);
    }
  };
}

export function handleIncomingUpdate(update: RealtimeProgressUpdate): void {
  if (!update.series_id || !update.user_id) {
    warn('extension:realtime:invalid-update', { update });
    return;
  }

  realtimeState = {
    isConnected: true,
    lastUpdate: update,
    lastUpdateTime: Date.now(),
  };

  log('extension:realtime:update-received', {
    series_id: update.series_id,
    current_chapter: update.current_chapter,
  });

  for (const handler of updateHandlers) {
    try {
      handler(update);
    } catch (err) {
      logError('extension:realtime:handler-error', err);
    }
  }
}

export function notifyExtensionOfUpdate(update: RealtimeProgressUpdate): void {
  if (
    typeof chrome !== 'undefined' &&
    chrome.runtime &&
    chrome.runtime.sendMessage
  ) {
    chrome.runtime.sendMessage(
      { type: 'REALTIME_PROGRESS_UPDATE', payload: update },
      (response) => {
        if (chrome.runtime.lastError) {
          warn('extension:realtime:send-error', { error: chrome.runtime.lastError.message });
          return;
        }
        log('extension:realtime:notified', { response });
      }
    );
  }
}

export function setConnected(connected: boolean): void {
  realtimeState = { ...realtimeState, isConnected: connected };
  log('extension:realtime:connection-changed', { isConnected: connected });
}

export function clearHandlers(): void {
  updateHandlers.length = 0;
}

export function resetState(): void {
  realtimeState = {
    isConnected: false,
    lastUpdate: null,
    lastUpdateTime: null,
  };
  clearHandlers();
}
