'use client';

import { Trash2, AlertCircle } from 'lucide-react';
import type { ImportPreviewEntry } from '@/model/schemas/import';

interface ImportPreviewProps {
  entries: ImportPreviewEntry[];
  onToggleSelect: (id: string, selected: boolean) => void;
  onRemove: (id: string) => void;
}

export function ImportPreview({ entries, onToggleSelect, onRemove }: ImportPreviewProps) {
  const valid = entries.filter((e) => e.status !== 'error');
  const errors = entries.filter((e) => e.status === 'error');

  if (entries.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
        No entries to preview.
      </p>
    );
  }

  return (
    <div className="space-y-4" data-testid="import-preview">
      {valid.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Series to import ({valid.filter((e) => e.selected).length} selected of {valid.length})
          </h3>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm" aria-label="Import preview table">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="w-10 px-3 py-2 text-left">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                    Series Title
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                    Chapter
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                    Platform
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                  <th className="w-10 px-3 py-2">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {valid.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`${
                      entry.selected
                        ? 'bg-white dark:bg-gray-900'
                        : 'bg-gray-50 dark:bg-gray-800 opacity-60'
                    }`}
                    data-testid={`preview-row-${entry.id}`}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={entry.selected}
                        onChange={(e) => onToggleSelect(entry.id, e.target.checked)}
                        aria-label={`Select ${entry.title}`}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">
                      {entry.title}
                      {entry.isDuplicate && (
                        <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400 font-normal">
                          (duplicate)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                      {entry.chapter ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                      {entry.platform}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.isDuplicate
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}
                      >
                        {entry.isDuplicate ? 'Duplicate' : 'New'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => onRemove(entry.id)}
                        aria-label={`Remove ${entry.title}`}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            Invalid entries ({errors.length}) — will be skipped
          </h3>
          <ul className="space-y-1" aria-label="Invalid entries">
            {errors.map((entry) => (
              <li
                key={entry.id}
                className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded px-3 py-2"
              >
                <span className="font-medium">{entry.title || '(empty title)'}</span>
                {entry.errorMessage && (
                  <span className="ml-2 text-red-500">— {entry.errorMessage}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
