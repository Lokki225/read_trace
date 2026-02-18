'use client';

import { useState } from 'react';
import { Clock, AlertCircle, Info } from 'lucide-react';
import type { BrowserHistoryItem } from '@/model/schemas/import';

interface BrowserHistoryImportProps {
  onHistoryProvided: (items: BrowserHistoryItem[]) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function BrowserHistoryImport({
  onHistoryProvided,
  isLoading,
  error,
}: BrowserHistoryImportProps) {
  const [permissionState, setPermissionState] = useState<
    'idle' | 'requesting' | 'granted' | 'denied'
  >('idle');

  async function requestHistoryAccess() {
    setPermissionState('requesting');

    if (typeof window === 'undefined') {
      setPermissionState('denied');
      return;
    }

    const extensionPresent =
      (window as any).readtraceExtension ||
      (window as any).__readtraceHistoryBridge;

    if (!extensionPresent) {
      setPermissionState('denied');
      return;
    }

    try {
      const response = await new Promise<{ items: BrowserHistoryItem[] } | null>(
        (resolve) => {
          const timeout = setTimeout(() => resolve(null), 10000);

          function handler(event: MessageEvent) {
            if (event.data?.type === 'READTRACE_HISTORY_RESPONSE') {
              clearTimeout(timeout);
              window.removeEventListener('message', handler);
              resolve(event.data.payload ?? null);
            }
          }

          window.addEventListener('message', handler);
          window.postMessage({ type: 'READTRACE_HISTORY_REQUEST' }, '*');
        }
      );

      if (response && Array.isArray(response.items)) {
        setPermissionState('granted');
        onHistoryProvided(response.items);
      } else {
        setPermissionState('denied');
      }
    } catch {
      setPermissionState('denied');
    }
  }

  return (
    <div className="space-y-4" data-testid="browser-history-import">
      <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">How browser history import works</p>
            <ul className="space-y-1 list-disc list-inside text-blue-700 dark:text-blue-400">
              <li>Requires the ReadTrace browser extension to be installed</li>
              <li>Only reads URLs from supported manga sites (MangaDex, etc.)</li>
              <li>Your full browsing history is never stored or transmitted</li>
              <li>You review and confirm all series before they are saved</li>
            </ul>
          </div>
        </div>
      </div>

      {permissionState === 'idle' && (
        <button
          onClick={requestHistoryAccess}
          disabled={isLoading}
          data-testid="request-history-btn"
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Clock className="h-4 w-4" aria-hidden="true" />
          Authorize Browser History Access
        </button>
      )}

      {permissionState === 'requesting' && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-center gap-3 py-4 text-gray-600 dark:text-gray-400"
        >
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          <span>Requesting history access from extension...</span>
        </div>
      )}

      {permissionState === 'granted' && (
        <div
          role="status"
          data-testid="history-granted"
          className="rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 p-4 text-center"
        >
          <p className="text-green-800 dark:text-green-300 font-medium">
            ✓ History access granted — parsing your manga URLs...
          </p>
        </div>
      )}

      {permissionState === 'denied' && (
        <div
          role="alert"
          data-testid="history-denied"
          className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-4"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" aria-hidden="true" />
            <div className="text-sm text-yellow-800 dark:text-yellow-300">
              <p className="font-semibold mb-1">Extension not detected</p>
              <p>
                Browser history import requires the ReadTrace extension. Please{' '}
                <a href="/extension-guide" className="underline hover:text-yellow-900">
                  install the extension
                </a>{' '}
                first, then try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" data-testid="history-error" className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 p-3">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
