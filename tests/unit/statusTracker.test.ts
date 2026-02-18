import {
  createInstallationStatus,
  createSkippedStatus,
  updateInstallationStatus,
  isInstallationComplete,
  isInstallationSkipped,
  isInstallationPending,
} from '../../src/backend/services/guide/statusTracker';
import { BrowserType } from '../../src/backend/services/guide/browserDetection';

describe('createInstallationStatus', () => {
  it('should create a status with is_installed true', () => {
    const status = createInstallationStatus('user-123', BrowserType.CHROME, '1.0.0');
    expect(status.is_installed).toBe(true);
    expect(status.user_id).toBe('user-123');
    expect(status.browser_type).toBe(BrowserType.CHROME);
    expect(status.extension_version).toBe('1.0.0');
    expect(status.installation_skipped).toBe(false);
  });

  it('should set installed_at to current date', () => {
    const before = new Date();
    const status = createInstallationStatus('user-123', BrowserType.FIREFOX);
    const after = new Date();
    expect(status.installed_at).toBeDefined();
    expect(status.installed_at!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(status.installed_at!.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should work without extension version', () => {
    const status = createInstallationStatus('user-456', BrowserType.SAFARI);
    expect(status.extension_version).toBeUndefined();
    expect(status.is_installed).toBe(true);
  });
});

describe('createSkippedStatus', () => {
  it('should create a status with installation_skipped true', () => {
    const status = createSkippedStatus('user-789');
    expect(status.is_installed).toBe(false);
    expect(status.installation_skipped).toBe(true);
    expect(status.user_id).toBe('user-789');
  });

  it('should set installation_skipped_at to current date', () => {
    const before = new Date();
    const status = createSkippedStatus('user-789');
    const after = new Date();
    expect(status.installation_skipped_at).toBeDefined();
    expect(status.installation_skipped_at!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(status.installation_skipped_at!.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});

describe('updateInstallationStatus', () => {
  it('should update extension version while preserving other fields', () => {
    const original = createInstallationStatus('user-123', BrowserType.CHROME, '1.0.0');
    const updated = updateInstallationStatus(original, '1.1.0');
    expect(updated.extension_version).toBe('1.1.0');
    expect(updated.user_id).toBe('user-123');
    expect(updated.browser_type).toBe(BrowserType.CHROME);
    expect(updated.is_installed).toBe(true);
  });
});

describe('isInstallationComplete', () => {
  it('should return true when extension is installed', () => {
    const status = createInstallationStatus('user-123', BrowserType.CHROME);
    expect(isInstallationComplete(status)).toBe(true);
  });

  it('should return false when extension is not installed', () => {
    const status = createSkippedStatus('user-123');
    expect(isInstallationComplete(status)).toBe(false);
  });
});

describe('isInstallationSkipped', () => {
  it('should return true when installation was skipped', () => {
    const status = createSkippedStatus('user-123');
    expect(isInstallationSkipped(status)).toBe(true);
  });

  it('should return false when extension is installed', () => {
    const status = createInstallationStatus('user-123', BrowserType.CHROME);
    expect(isInstallationSkipped(status)).toBe(false);
  });
});

describe('isInstallationPending', () => {
  it('should return true when neither installed nor skipped', () => {
    const status = {
      user_id: 'user-123',
      is_installed: false,
      installation_skipped: false,
    };
    expect(isInstallationPending(status)).toBe(true);
  });

  it('should return false when installed', () => {
    const status = createInstallationStatus('user-123', BrowserType.CHROME);
    expect(isInstallationPending(status)).toBe(false);
  });

  it('should return false when skipped', () => {
    const status = createSkippedStatus('user-123');
    expect(isInstallationPending(status)).toBe(false);
  });
});
