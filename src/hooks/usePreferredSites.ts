'use client';

import { useState, useCallback, useEffect } from 'react';
import { UserPreferences, SavePreferencesRequest } from '@/types/preferences';
import { DEFAULT_PREFERRED_SITES, normalizePreferences } from '@/lib/platforms';

interface UsePreferredSitesReturn {
  preferences: string[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  updatePreferences: (sites: string[]) => Promise<void>;
  resetToDefaults: () => void;
}

export function usePreferredSites(
  initialPreferences?: string[]
): UsePreferredSitesReturn {
  const [preferences, setPreferences] = useState<string[]>(
    initialPreferences || DEFAULT_PREFERRED_SITES
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPreferences) {
      setPreferences(normalizePreferences(initialPreferences));
    }
  }, [initialPreferences]);

  const updatePreferences = useCallback(
    async (sites: string[]) => {
      setIsSaving(true);
      setError(null);

      try {
        const normalized = normalizePreferences(sites);
        const request: SavePreferencesRequest = {
          preferred_sites: normalized,
        };

        const response = await fetch('/api/user/preferences/sites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Failed to save preferences'
          );
        }

        const data = await response.json();
        setPreferences(data.data.preferred_sites);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const resetToDefaults = useCallback(() => {
    setPreferences(DEFAULT_PREFERRED_SITES);
    setError(null);
  }, []);

  return {
    preferences,
    isLoading,
    isSaving,
    error,
    updatePreferences,
    resetToDefaults,
  };
}
