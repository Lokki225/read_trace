'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { ImportUpload } from '@/components/import/ImportUpload';
import { BrowserHistoryImport } from '@/components/import/BrowserHistoryImport';
import { ImportPreview } from '@/components/import/ImportPreview';
import { ImportSummary } from '@/components/import/ImportSummary';
import { ImportConfirmation } from '@/components/import/ImportConfirmation';
import { buildImportJob, updateEntrySelection, removeEntry, getSelectedEntries } from '@/backend/services/import/importService';
import { validateImportData } from '@/backend/services/import/csvValidator';
import { useCSVParser } from '@/hooks/useCSVParser';
import type { ImportJob, ImportResult, BrowserHistoryItem } from '@/model/schemas/import';

type ImportSource = 'csv' | 'browser_history';
type Step = 'select-source' | 'upload' | 'preview' | 'confirm' | 'done';

export default function ImportPage() {
  const router = useRouter();
  const { parse: parseCSV, isLoading: csvLoading, error: csvError, reset: resetCSV } = useCSVParser();

  const [step, setStep] = useState<Step>('select-source');
  const [source, setSource] = useState<ImportSource>('csv');
  const [job, setJob] = useState<ImportJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelected = useCallback(async (file: File) => {
    setUploadError(null);
    await parseCSV(file);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/import/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error ?? 'Upload failed.');
        return;
      }

      const newJob: ImportJob = {
        importId: data.importId,
        userId: '',
        sourceType: 'csv',
        status: 'pending',
        totalItems: data.totalItems,
        importedItems: 0,
        skippedItems: data.skippedItems,
        errorItems: data.errorItems,
        createdAt: new Date().toISOString(),
        entries: data.entries,
      };
      setJob(newJob);
      setStep('preview');
    } catch {
      setUploadError('Network error. Please try again.');
    }
  }, [parseCSV]);

  const handleHistoryProvided = useCallback(async (items: BrowserHistoryItem[]) => {
    try {
      const res = await fetch('/api/import/browser-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyItems: items }),
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error ?? 'History import failed.');
        return;
      }

      if (data.totalItems === 0) {
        setUploadError('No supported manga series found in your browser history.');
        return;
      }

      const newJob: ImportJob = {
        importId: data.importId,
        userId: '',
        sourceType: 'browser_history',
        status: 'pending',
        totalItems: data.totalItems,
        importedItems: 0,
        skippedItems: data.skippedItems,
        errorItems: data.errorItems,
        createdAt: new Date().toISOString(),
        entries: data.entries,
      };
      setJob(newJob);
      setStep('preview');
    } catch {
      setUploadError('Network error. Please try again.');
    }
  }, []);

  const handleToggleSelect = useCallback((id: string, selected: boolean) => {
    setJob((prev) => prev ? updateEntrySelection(prev, id, selected) : prev);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setJob((prev) => prev ? removeEntry(prev, id) : prev);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!job) return;
    setIsSubmitting(true);

    const selected = getSelectedEntries(job);

    try {
      const res = await fetch('/api/import/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: selected, importId: job.importId }),
      });
      const data = await res.json();

      const importResult: ImportResult = {
        success: res.ok && data.success,
        importId: job.importId,
        importedCount: data.importedCount ?? 0,
        skippedCount: data.skippedCount ?? 0,
        errorCount: data.errorCount ?? 0,
        errors: data.errors ?? [],
      };

      setResult(importResult);
      setStep('done');
    } catch {
      setResult({
        success: false,
        importId: job.importId,
        importedCount: 0,
        skippedCount: 0,
        errorCount: 0,
        errors: ['Network error. Please try again.'],
      });
      setStep('done');
    } finally {
      setIsSubmitting(false);
    }
  }, [job]);

  const selectedCount = job?.entries.filter((e) => e.selected && e.status !== 'error').length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Import Reading History
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Import your existing reading data from a CSV spreadsheet or browser history.
          </p>
        </header>

        {step === 'select-source' && (
          <div className="space-y-4" data-testid="source-selection">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Choose import source
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => { setSource('csv'); setStep('upload'); }}
                data-testid="select-csv-btn"
                className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-left"
              >
                <FileSpreadsheet className="h-10 w-10 text-blue-500" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">CSV / Spreadsheet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Upload a CSV file with your series list
                  </p>
                </div>
              </button>

              <button
                onClick={() => { setSource('browser_history'); setStep('upload'); }}
                data-testid="select-history-btn"
                className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-left"
              >
                <Clock className="h-10 w-10 text-purple-500" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Browser History</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Import from your manga browsing history (requires extension)
                  </p>
                </div>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => router.push('/onboarding')}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
                data-testid="skip-import-btn"
              >
                Skip import for now
              </button>
            </div>
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-6" data-testid="upload-step">
            <button
              onClick={() => { setStep('select-source'); setUploadError(null); resetCSV(); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>

            {source === 'csv' ? (
              <ImportUpload
                onFileSelected={handleFileSelected}
                isLoading={csvLoading}
                error={uploadError ?? csvError}
              />
            ) : (
              <BrowserHistoryImport
                onHistoryProvided={handleHistoryProvided}
                error={uploadError}
              />
            )}
          </div>
        )}

        {step === 'preview' && job && (
          <div className="space-y-6" data-testid="preview-step">
            <ImportSummary job={job} />
            <ImportPreview
              entries={job.entries}
              onToggleSelect={handleToggleSelect}
              onRemove={handleRemove}
            />
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => { setStep('upload'); setJob(null); }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Start over
              </button>
              <button
                onClick={() => setStep('confirm')}
                disabled={selectedCount === 0}
                data-testid="proceed-to-confirm-btn"
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && job && (
          <div className="space-y-6" data-testid="confirm-step">
            <ImportConfirmation
              selectedCount={selectedCount}
              isSubmitting={isSubmitting}
              result={null}
              onConfirm={handleConfirm}
              onCancel={() => setStep('preview')}
            />
          </div>
        )}

        {step === 'done' && (
          <div className="space-y-6" data-testid="done-step">
            <ImportConfirmation
              selectedCount={selectedCount}
              isSubmitting={false}
              result={result}
              onConfirm={() => {}}
              onCancel={() => {}}
            />
            <div className="text-center">
              <button
                onClick={() => router.push('/dashboard')}
                data-testid="go-to-dashboard-btn"
                className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
