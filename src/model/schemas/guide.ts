import { BrowserType } from '../../backend/services/guide/browserDetection';

export interface InstallationStep {
  number: number;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface StoreLink {
  browser: BrowserType;
  storeName: string;
  url: string;
  icon?: string;
}

export interface TroubleshootingItem {
  problem: string;
  solution: string;
  relatedSteps?: number[];
}

export interface GuideContent {
  browser: BrowserType;
  title: string;
  description: string;
  steps: InstallationStep[];
  storeLink: StoreLink;
  troubleshooting: TroubleshootingItem[];
}

export interface InstallationStatus {
  user_id: string;
  is_installed: boolean;
  installed_at?: Date;
  browser_type?: BrowserType;
  extension_version?: string;
  installation_skipped?: boolean;
  installation_skipped_at?: Date;
}

export interface OnboardingState {
  currentStep: 'welcome' | 'extension' | 'complete';
  extensionInstalled: boolean;
  extensionSkipped: boolean;
  completedAt?: Date;
}
