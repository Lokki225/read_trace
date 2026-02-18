'use client';

import type { ImportJob } from '@/model/schemas/import';

interface ImportSummaryProps {
  job: ImportJob;
}

export function ImportSummary({ job }: ImportSummaryProps) {
  const selectedCount = job.entries.filter((e) => e.selected && e.status !== 'error').length;
  const duplicateCount = job.entries.filter((e) => e.isDuplicate).length;
  const errorCount = job.entries.filter((e) => e.status === 'error').length;

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      data-testid="import-summary"
      aria-label="Import summary"
    >
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {job.totalItems}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Found</p>
      </div>
      <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3 text-center">
        <p className="text-2xl font-bold text-green-700 dark:text-green-400">
          {selectedCount}
        </p>
        <p className="text-xs text-green-600 dark:text-green-500 mt-1">Selected to Import</p>
      </div>
      <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-3 text-center">
        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
          {duplicateCount}
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Duplicates</p>
      </div>
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-center">
        <p className="text-2xl font-bold text-red-700 dark:text-red-400">
          {errorCount}
        </p>
        <p className="text-xs text-red-600 dark:text-red-500 mt-1">Invalid (skipped)</p>
      </div>
    </div>
  );
}
