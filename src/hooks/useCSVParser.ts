'use client';

import { useState, useCallback } from 'react';
import { parseCSVFile } from '@/backend/services/import/importService';
import type { RawImportEntry } from '@/model/schemas/import';

interface UseCSVParserResult {
  parse: (file: File) => Promise<void>;
  entries: RawImportEntry[];
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useCSVParser(): UseCSVParserResult {
  const [entries, setEntries] = useState<RawImportEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parse = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setEntries([]);

    try {
      const parsed = await parseCSVFile(file);
      if (parsed.length === 0) {
        setError('No data found in CSV. Please check the file format.');
      } else {
        setEntries(parsed);
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to parse CSV file.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setEntries([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return { parse, entries, isLoading, error, reset };
}
