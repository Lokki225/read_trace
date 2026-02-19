import {
  log,
  debug,
  warn,
  error,
  getLogs,
  clearLogs,
  setDebugMode,
  isDebugMode,
} from '../../../src/extension/logger';

describe('logger', () => {
  beforeEach(() => {
    clearLogs();
    setDebugMode(false);
  });

  describe('log()', () => {
    it('should add an info entry to log history', () => {
      log('test:event', { key: 'value' });
      const logs = getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('info');
      expect(logs[0].event).toBe('test:event');
      expect(logs[0].details).toEqual({ key: 'value' });
    });

    it('should include a timestamp', () => {
      const before = Date.now();
      log('test:event');
      const after = Date.now();
      const logs = getLogs();
      expect(logs[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(logs[0].timestamp).toBeLessThanOrEqual(after);
    });

    it('should log without details', () => {
      log('test:no-details');
      const logs = getLogs();
      expect(logs[0].event).toBe('test:no-details');
      expect(logs[0].details).toBeUndefined();
    });
  });

  describe('debug()', () => {
    it('should add a debug entry to log history', () => {
      debug('debug message');
      const logs = getLogs();
      expect(logs[0].level).toBe('debug');
      expect(logs[0].event).toBe('debug message');
    });
  });

  describe('warn()', () => {
    it('should add a warn entry to log history', () => {
      warn('warning message');
      const logs = getLogs();
      expect(logs[0].level).toBe('warn');
      expect(logs[0].event).toBe('warning message');
    });
  });

  describe('error()', () => {
    it('should add an error entry to log history', () => {
      error('error message', new Error('test error'));
      const logs = getLogs();
      expect(logs[0].level).toBe('error');
      expect(logs[0].event).toBe('error message');
    });

    it('should extract message and stack from Error objects', () => {
      const err = new Error('something failed');
      error('error event', err);
      const logs = getLogs();
      const details = logs[0].details as { message: string; stack?: string };
      expect(details.message).toBe('something failed');
    });

    it('should handle non-Error details', () => {
      error('error event', 'plain string error');
      const logs = getLogs();
      expect(logs[0].details).toBe('plain string error');
    });
  });

  describe('getLogs()', () => {
    it('should return a copy of the log history', () => {
      log('event1');
      log('event2');
      const logs = getLogs();
      expect(logs).toHaveLength(2);
    });

    it('should return a new array each call (not reference)', () => {
      log('event1');
      const logs1 = getLogs();
      const logs2 = getLogs();
      expect(logs1).not.toBe(logs2);
    });
  });

  describe('clearLogs()', () => {
    it('should remove all log entries', () => {
      log('event1');
      log('event2');
      clearLogs();
      expect(getLogs()).toHaveLength(0);
    });
  });

  describe('setDebugMode() / isDebugMode()', () => {
    it('should default to false', () => {
      expect(isDebugMode()).toBe(false);
    });

    it('should enable debug mode', () => {
      setDebugMode(true);
      expect(isDebugMode()).toBe(true);
    });

    it('should disable debug mode', () => {
      setDebugMode(true);
      setDebugMode(false);
      expect(isDebugMode()).toBe(false);
    });
  });

  describe('max log entries', () => {
    it('should cap log history at 200 entries', () => {
      for (let i = 0; i < 250; i++) {
        log(`event:${i}`);
      }
      const logs = getLogs();
      expect(logs.length).toBe(200);
      expect(logs[logs.length - 1].event).toBe('event:249');
    });
  });
});
