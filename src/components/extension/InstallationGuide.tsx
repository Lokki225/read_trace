'use client';

import { useState, useEffect } from 'react';
import { getBrowserName } from '@/lib/extension/detector';
import { useExtensionStatus } from '@/hooks/useExtensionStatus';
import { BrowserSelector } from './BrowserSelector';
import { BrowserInstructions } from './BrowserInstructions';

type BrowserType = 'chrome' | 'firefox' | 'safari';

interface InstallationGuideProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

function MobileNotice() {
  return (
    <div
      className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-6 text-center"
      role="alert"
      data-testid="mobile-notice"
    >
      <p className="text-2xl mb-3" aria-hidden="true">📱</p>
      <h2 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-2">
        Desktop Required
      </h2>
      <p className="text-yellow-700 dark:text-yellow-400 text-sm">
        Browser extensions are not available on mobile devices. Please visit ReadTrace on a
        desktop browser (Chrome, Firefox, or Safari) to install the extension.
      </p>
    </div>
  );
}

function SuccessState({ browser, version }: { browser?: string; version?: string }) {
  return (
    <div
      className="rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 p-8 text-center"
      role="status"
      data-testid="extension-installed-success"
    >
      <div
        className="w-16 h-16 rounded-full bg-green-500 text-white text-3xl flex items-center justify-center mx-auto mb-4"
        aria-hidden="true"
      >
        ✓
      </div>
      <h2 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">
        Extension Installed!
      </h2>
      <p className="text-green-700 dark:text-green-400 mb-2">
        The ReadTrace extension is installed and ready to track your reading progress.
      </p>
      {(browser || version) && (
        <p className="text-sm text-green-600 dark:text-green-500">
          {browser && <span>Browser: {browser}</span>}
          {browser && version && <span> · </span>}
          {version && <span>Version: {version}</span>}
        </p>
      )}
    </div>
  );
}

export function InstallationGuide({ onComplete, onSkip }: InstallationGuideProps) {
  const [selectedBrowser, setSelectedBrowser] = useState<BrowserType | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { status, loading, recheckStatus } = useExtensionStatus(10000);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const ua = navigator.userAgent;
    const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    setIsMobile(mobile);

    if (!mobile) {
      const name = getBrowserName().toLowerCase() as BrowserType;
      if (['chrome', 'firefox', 'safari'].includes(name)) {
        setSelectedBrowser(name);
      }
    }
  }, []);

  useEffect(() => {
    if (status?.installed && onComplete) {
      onComplete();
    }
  }, [status?.installed, onComplete]);

  if (loading && !status) {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-label="Checking extension status"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Checking extension status...
        </span>
      </div>
    );
  }

  if (isMobile) {
    return <MobileNotice />;
  }

  if (status?.installed) {
    return <SuccessState browser={status.browser} version={status.version} />;
  }

  return (
    <div className="installation-guide space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Install ReadTrace Browser Extension
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          The browser extension automatically tracks your reading progress as you read manga
          online. It takes less than 2 minutes to set up.
        </p>
      </header>

      <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
        <h2 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
          Why install the extension?
        </h2>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>Automatically tracks pages read on supported manga sites</li>
          <li>Syncs progress across all your devices in real-time</li>
          <li>No manual updates needed — it just works</li>
        </ul>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm uppercase tracking-wide">
          Required Permissions
        </h2>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5" aria-hidden="true">✓</span>
            <span>
              <strong>Read page content</strong> — to detect which manga chapter you are reading
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5" aria-hidden="true">✓</span>
            <span>
              <strong>Communicate with ReadTrace</strong> — to sync your progress securely
            </span>
          </li>
        </ul>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
          We never collect personal data or browsing history.{' '}
          <a href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
            Privacy Policy
          </a>
        </p>
      </div>

      <BrowserSelector selected={selectedBrowser} onSelect={setSelectedBrowser} />

      {selectedBrowser && (
        <BrowserInstructions browser={selectedBrowser} onVerify={recheckStatus} />
      )}
    </div>
  );
}
