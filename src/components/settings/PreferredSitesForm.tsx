'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { SUPPORTED_PLATFORMS } from '@/lib/platforms';
import { usePreferredSites } from '@/hooks/usePreferredSites';
import { CustomSite, Platform } from '@/types/preferences';

interface PreferredSitesFormProps {
  initialPreferences?: string[];
  onSaveComplete?: () => void;
}

export function PreferredSitesForm({
  initialPreferences,
  onSaveComplete,
}: PreferredSitesFormProps) {
  const { preferences, isSaving, error, updatePreferences } =
    usePreferredSites(initialPreferences);
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [customSites, setCustomSites] = useState<CustomSite[]>([]);
  const [loadingCustomSites, setLoadingCustomSites] = useState(true);

  // Fetch custom sites on mount
  useEffect(() => {
    const fetchCustomSites = async () => {
      try {
        const response = await fetch('/api/user/custom-sites');
        if (response.ok) {
          const data = await response.json();
          setCustomSites(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch custom sites:', err);
      } finally {
        setLoadingCustomSites(false);
      }
    };

    fetchCustomSites();
  }, []);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (dropIndex: number) => {
      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        return;
      }

      const newPreferences = [...localPreferences];
      const [draggedItem] = newPreferences.splice(draggedIndex, 1);
      newPreferences.splice(dropIndex, 0, draggedItem);
      setLocalPreferences(newPreferences);
      setDraggedIndex(null);
    },
    [draggedIndex, localPreferences]
  );

  const handleTogglePlatform = useCallback(
    (platformId: string) => {
      setLocalPreferences((prev) => {
        if (prev.includes(platformId)) {
          return prev.filter((id) => id !== platformId);
        } else {
          return [...prev, platformId];
        }
      });
    },
    []
  );

  const handleSave = async () => {
    try {
      setSaveSuccess(false);
      await updatePreferences(localPreferences);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onSaveComplete?.();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleReset = useCallback(() => {
    setLocalPreferences(preferences);
    setSaveSuccess(false);
  }, [preferences]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Preferred Scan Sites
      </h2>

      <p className="text-gray-600 mb-6">
        Drag to reorder your preferred sites. The extension will prioritize
        these sites when detecting your reading.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">
          Preferences saved successfully!
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Selected Sites (in order)
        </h3>

        {localPreferences.length === 0 ? (
          <p className="text-gray-500 italic">No sites selected</p>
        ) : (
          <div className="space-y-2">
            {localPreferences.map((siteId, index) => {
              const platform = SUPPORTED_PLATFORMS.find(
                (p) => p.id === siteId
              );
              if (!platform) return null;

              return (
                <div
                  key={siteId}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className={`p-4 bg-gray-50 border-2 border-gray-200 rounded cursor-move transition-all ${
                    draggedIndex === index ? 'opacity-50 bg-gray-100' : ''
                  } hover:border-orange-400`}
                  data-testid={`platform-${siteId}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">
                        {platform.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePlatform(siteId)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                      aria-label={`Remove ${platform.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Available Sites
        </h3>

        {loadingCustomSites ? (
          <p className="text-gray-500 italic">Loading custom sites...</p>
        ) : (
          <div className="space-y-2">
            {/* Built-in platforms */}
            {SUPPORTED_PLATFORMS.map((platform) => (
              <label
                key={platform.id}
                className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={localPreferences.includes(platform.id)}
                  onChange={() => handleTogglePlatform(platform.id)}
                  className="w-4 h-4 text-orange-500 rounded"
                  aria-label={`Select ${platform.name}`}
                />
                <span className="ml-3 font-medium text-gray-900">
                  {platform.name}
                </span>
                <span className="ml-auto text-sm text-gray-500">
                  {platform.url}
                </span>
              </label>
            ))}

            {/* Custom sites */}
            {customSites.length > 0 && (
              <>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Your Custom Sites
                  </p>
                </div>
                {customSites.map((site) => (
                  <label
                    key={site.id}
                    className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100"
                  >
                    <input
                      type="checkbox"
                      checked={localPreferences.includes(site.id)}
                      onChange={() => handleTogglePlatform(site.id)}
                      className="w-4 h-4 text-orange-500 rounded"
                      aria-label={`Select ${site.name}`}
                    />
                    <span className="ml-3 font-medium text-gray-900">
                      {site.name}
                    </span>
                    <span className="ml-auto text-sm text-gray-500">
                      {site.url}
                    </span>
                  </label>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
        <button
          onClick={handleReset}
          disabled={isSaving}
          className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
