'use client';

import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { ImportResult } from '@/model/schemas/import';

interface ImportConfirmationProps {
  selectedCount: number;
  isSubmitting: boolean;
  result: ImportResult | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportConfirmation({
  selectedCount,
  isSubmitting,
  result,
  onConfirm,
  onCancel,
}: ImportConfirmationProps) {
  if (result) {
    return (
      <div data-testid="import-result" className="space-y-4">
        {result.success ? (
          <div className="rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 p-6 text-center">
            <CheckCircle
              className="mx-auto h-12 w-12 text-green-500 mb-3"
              aria-hidden="true"
            />
            <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-1">
              Import Complete!
            </h3>
            <p className="text-green-700 dark:text-green-400 text-sm">
              {result.importedCount} series imported successfully.
              {result.skippedCount > 0 && ` ${result.skippedCount} skipped.`}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 p-6 text-center">
            <XCircle
              className="mx-auto h-12 w-12 text-red-500 mb-3"
              aria-hidden="true"
            />
            <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-1">
              Import Failed
            </h3>
            <p className="text-red-700 dark:text-red-400 text-sm">
              {result.errors[0] ?? 'An unexpected error occurred.'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="import-confirmation">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        You are about to import{' '}
        <strong className="text-gray-900 dark:text-gray-100">{selectedCount} series</strong>{' '}
        into your ReadTrace library. This action cannot be undone.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onConfirm}
          disabled={isSubmitting || selectedCount === 0}
          data-testid="confirm-import-btn"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Importing...
            </>
          ) : (
            `Import ${selectedCount} Series`
          )}
        </button>

        <button
          onClick={onCancel}
          disabled={isSubmitting}
          data-testid="cancel-import-btn"
          className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
