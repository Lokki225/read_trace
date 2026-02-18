'use client';

import { useRef, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface ImportUploadProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

const ACCEPTED_TYPES = '.csv,text/csv';
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function ImportUpload({ onFileSelected, isLoading, error }: ImportUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function validateAndSelect(file: File) {
    setLocalError(null);
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setLocalError('Only CSV files are accepted.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setLocalError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }
    onFileSelected(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSelect(file);
  }

  const displayError = error ?? localError;

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file. Click or drag and drop."
        data-testid="csv-upload-zone"
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          dragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? inputRef.current?.click() : undefined}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="sr-only"
          onChange={handleFileChange}
          aria-hidden="true"
          data-testid="csv-file-input"
        />
        <Upload
          className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 mb-3"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isLoading ? 'Parsing file...' : 'Drop your CSV file here, or click to browse'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          CSV files up to {MAX_SIZE_MB}MB
        </p>
      </div>

      {displayError && (
        <div
          role="alert"
          data-testid="upload-error"
          className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 p-3"
        >
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-red-700 dark:text-red-400">{displayError}</p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-gray-500" aria-hidden="true" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Expected CSV format
          </span>
        </div>
        <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
          {`Series Title,Chapter Number,URL,Platform,Last Read Date\n"One Piece",1087,https://mangadex.org/...,MangaDex,2026-01-15`}
        </pre>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Only <strong>Series Title</strong> is required. All other columns are optional.
        </p>
      </div>
    </div>
  );
}
