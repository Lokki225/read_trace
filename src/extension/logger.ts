export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  event: string;
  details?: unknown;
}

const MAX_LOG_ENTRIES = 200;

let debugMode = false;
const logHistory: LogEntry[] = [];

export function setDebugMode(enabled: boolean): void {
  debugMode = enabled;
}

export function isDebugMode(): boolean {
  return debugMode;
}

function addEntry(level: LogLevel, event: string, details?: unknown): void {
  const entry: LogEntry = {
    timestamp: Date.now(),
    level,
    event,
    details,
  };

  logHistory.push(entry);

  if (logHistory.length > MAX_LOG_ENTRIES) {
    logHistory.splice(0, logHistory.length - MAX_LOG_ENTRIES);
  }
}

export function log(event: string, details?: unknown): void {
  addEntry('info', event, details);
  if (debugMode) {
    console.log(`[ReadTrace] ${event}`, details ?? '');
  }
}

export function debug(message: string, details?: unknown): void {
  addEntry('debug', message, details);
  if (debugMode) {
    console.debug(`[ReadTrace:debug] ${message}`, details ?? '');
  }
}

export function warn(message: string, details?: unknown): void {
  addEntry('warn', message, details);
  console.warn(`[ReadTrace:warn] ${message}`, details ?? '');
}

export function error(message: string, err?: unknown): void {
  const details = err instanceof Error ? { message: err.message, stack: err.stack } : err;
  addEntry('error', message, details);
  console.error(`[ReadTrace:error] ${message}`, details ?? '');
}

export function getLogs(): LogEntry[] {
  return [...logHistory];
}

export function clearLogs(): void {
  logHistory.splice(0, logHistory.length);
}
