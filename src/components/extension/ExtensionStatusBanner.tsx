'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useExtensionStatus } from '@/hooks/useExtensionStatus';

const DISMISSED_KEY = 'extension-banner-dismissed';

export function ExtensionStatusBanner() {
  const { status, loading } = useExtensionStatus();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDismissed = localStorage.getItem(DISMISSED_KEY);
    setDismissed(isDismissed === 'true');
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  };

  if (!mounted || loading || dismissed || status?.installed) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800"
      role="alert"
      aria-live="polite"
      data-testid="extension-status-banner"
    >
      <div className="flex items-center gap-3">
        <span className="text-blue-600 dark:text-blue-400 text-lg" aria-hidden="true">
          🧩
        </span>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Install the ReadTrace browser extension to automatically track your reading progress.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/extension-guide"
          className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          data-testid="install-extension-link"
        >
          Install Extension
        </Link>
        <button
          onClick={handleDismiss}
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Dismiss extension installation banner"
          data-testid="dismiss-banner-btn"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
