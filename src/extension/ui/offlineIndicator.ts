import { ConnectionStatus } from '../network/connectionDetector';
import { StorageStats } from '../storage/offlineStorage';
import { log } from '../logger';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface OfflineIndicatorState {
  connectionStatus: ConnectionStatus;
  syncStatus: SyncStatus;
  pendingCount: number;
  lastSyncedAt: number | null;
  syncError: string | null;
}

let indicatorState: OfflineIndicatorState = {
  connectionStatus: 'online',
  syncStatus: 'idle',
  pendingCount: 0,
  lastSyncedAt: null,
  syncError: null,
};

export type IndicatorChangeHandler = (state: OfflineIndicatorState) => void;

const changeHandlers: IndicatorChangeHandler[] = [];

function notifyHandlers(): void {
  const snapshot = getIndicatorState();
  for (const handler of changeHandlers) {
    try {
      handler(snapshot);
    } catch {
      // ignore handler errors
    }
  }
}

export function getIndicatorState(): OfflineIndicatorState {
  return { ...indicatorState };
}

export function onIndicatorChange(handler: IndicatorChangeHandler): () => void {
  changeHandlers.push(handler);
  return () => {
    const idx = changeHandlers.indexOf(handler);
    if (idx >= 0) changeHandlers.splice(idx, 1);
  };
}

export function setConnectionStatus(status: ConnectionStatus): void {
  if (indicatorState.connectionStatus === status) return;
  indicatorState = { ...indicatorState, connectionStatus: status };
  log('offlineIndicator:connection-changed', { status });
  notifyHandlers();
}

export function setSyncStatus(status: SyncStatus, error?: string): void {
  indicatorState = {
    ...indicatorState,
    syncStatus: status,
    syncError: error ?? null,
    lastSyncedAt: status === 'success' ? Date.now() : indicatorState.lastSyncedAt,
  };
  log('offlineIndicator:sync-status', { status, error });
  notifyHandlers();
}

export function setPendingCount(count: number): void {
  if (indicatorState.pendingCount === count) return;
  indicatorState = { ...indicatorState, pendingCount: count };
  notifyHandlers();
}

export function updateFromStats(stats: StorageStats): void {
  setPendingCount(stats.count);
}

export function getBadgeText(state: OfflineIndicatorState): string {
  if (state.connectionStatus === 'offline') {
    return state.pendingCount > 0 ? `${state.pendingCount}` : 'OFF';
  }
  if (state.syncStatus === 'syncing') return '...';
  if (state.syncStatus === 'error') return '!';
  return '';
}

export function getStatusMessage(state: OfflineIndicatorState): string {
  if (state.connectionStatus === 'offline') {
    if (state.pendingCount > 0) {
      return `Offline — ${state.pendingCount} update${state.pendingCount !== 1 ? 's' : ''} pending sync`;
    }
    return 'Offline — reading progress saved locally';
  }
  if (state.syncStatus === 'syncing') {
    return `Syncing ${state.pendingCount} update${state.pendingCount !== 1 ? 's' : ''}…`;
  }
  if (state.syncStatus === 'success') {
    return 'All progress synced';
  }
  if (state.syncStatus === 'error') {
    return `Sync failed: ${state.syncError ?? 'unknown error'}`;
  }
  return 'Online';
}

export function notifySyncComplete(syncedCount: number): void {
  setSyncStatus('success');
  log('offlineIndicator:sync-complete', { syncedCount });
}

export function notifySyncError(error: string): void {
  setSyncStatus('error', error);
  log('offlineIndicator:sync-error', { error });
}

export function notifySyncStarted(pendingCount: number): void {
  setPendingCount(pendingCount);
  setSyncStatus('syncing');
  log('offlineIndicator:sync-started', { pendingCount });
}

export function resetIndicatorState(): void {
  indicatorState = {
    connectionStatus: 'online',
    syncStatus: 'idle',
    pendingCount: 0,
    lastSyncedAt: null,
    syncError: null,
  };
  changeHandlers.splice(0, changeHandlers.length);
}
