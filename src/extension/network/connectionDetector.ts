import { log, warn } from '../logger';

export type ConnectionStatus = 'online' | 'offline';

export interface ConnectionState {
  status: ConnectionStatus;
  lastChanged: number;
  changeCount: number;
}

export type ConnectionChangeHandler = (status: ConnectionStatus) => void;

const DEBOUNCE_MS = 500;

let state: ConnectionState = {
  status: 'online',
  lastChanged: 0,
  changeCount: 0,
};

const handlers: ConnectionChangeHandler[] = [];
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let isListening = false;

export function getConnectionState(): ConnectionState {
  return { ...state };
}

export function isOnline(): boolean {
  return state.status === 'online';
}

export function onConnectionChange(handler: ConnectionChangeHandler): () => void {
  handlers.push(handler);
  return () => {
    const idx = handlers.indexOf(handler);
    if (idx >= 0) {
      handlers.splice(idx, 1);
    }
  };
}

function notifyHandlers(status: ConnectionStatus): void {
  for (const handler of handlers) {
    try {
      handler(status);
    } catch (err) {
      warn('connectionDetector:handler-error', err);
    }
  }
}

function applyStatusChange(status: ConnectionStatus): void {
  if (state.status === status) return;

  state = {
    status,
    lastChanged: Date.now(),
    changeCount: state.changeCount + 1,
  };

  log('connectionDetector:status-changed', { status, changeCount: state.changeCount });
  notifyHandlers(status);
}

function handleOnline(): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    applyStatusChange('online');
  }, DEBOUNCE_MS);
}

function handleOffline(): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    applyStatusChange('offline');
  }, DEBOUNCE_MS);
}

export function initialize(): void {
  if (isListening) return;

  const initialOnline =
    typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true;

  state = {
    status: initialOnline ? 'online' : 'offline',
    lastChanged: Date.now(),
    changeCount: 0,
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    isListening = true;
    log('connectionDetector:initialized', { initialStatus: state.status });
  } else if (typeof self !== 'undefined') {
    (self as Window & typeof globalThis).addEventListener('online', handleOnline);
    (self as Window & typeof globalThis).addEventListener('offline', handleOffline);
    isListening = true;
    log('connectionDetector:initialized', { initialStatus: state.status, context: 'worker' });
  }
}

export function destroy(): void {
  if (!isListening) return;

  if (typeof window !== 'undefined') {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  } else if (typeof self !== 'undefined') {
    (self as Window & typeof globalThis).removeEventListener('online', handleOnline);
    (self as Window & typeof globalThis).removeEventListener('offline', handleOffline);
  }

  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  handlers.splice(0, handlers.length);
  isListening = false;
  log('connectionDetector:destroyed');
}

export function resetState(): void {
  state = {
    status: 'online',
    lastChanged: 0,
    changeCount: 0,
  };
  handlers.splice(0, handlers.length);
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  isListening = false;
}

export function forceStatus(status: ConnectionStatus): void {
  applyStatusChange(status);
}

export function getDebounceMs(): number {
  return DEBOUNCE_MS;
}
