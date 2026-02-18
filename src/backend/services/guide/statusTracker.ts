import { BrowserType } from './browserDetection';
import { InstallationStatus } from '../../../model/schemas/guide';

export function createInstallationStatus(
  userId: string,
  browserType: BrowserType,
  extensionVersion?: string
): InstallationStatus {
  return {
    user_id: userId,
    is_installed: true,
    installed_at: new Date(),
    browser_type: browserType,
    extension_version: extensionVersion,
    installation_skipped: false,
  };
}

export function createSkippedStatus(userId: string): InstallationStatus {
  return {
    user_id: userId,
    is_installed: false,
    installation_skipped: true,
    installation_skipped_at: new Date(),
  };
}

export function updateInstallationStatus(
  status: InstallationStatus,
  extensionVersion: string
): InstallationStatus {
  return {
    ...status,
    extension_version: extensionVersion,
  };
}

export function isInstallationComplete(status: InstallationStatus): boolean {
  return status.is_installed === true;
}

export function isInstallationSkipped(status: InstallationStatus): boolean {
  return status.installation_skipped === true;
}

export function isInstallationPending(status: InstallationStatus): boolean {
  return !status.is_installed && !status.installation_skipped;
}
