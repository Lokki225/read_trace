'use client';

import React, { useState } from 'react';
import { CustomSite } from '@/types/preferences';

interface AddScanSiteFormProps {
  onSiteAdded?: (site: CustomSite) => void;
  existingSites?: CustomSite[];
}

export function AddScanSiteForm({
  onSiteAdded,
  existingSites = [],
}: AddScanSiteFormProps) {
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!siteName.trim()) {
      setError('Site name is required');
      return;
    }

    if (!siteUrl.trim()) {
      setError('Site URL is required');
      return;
    }

    if (!validateUrl(siteUrl)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    if (siteName.length > 100) {
      setError('Site name must be 100 characters or less');
      return;
    }

    // Check for duplicates
    const isDuplicate = existingSites.some(
      (site) => site.name.toLowerCase() === siteName.toLowerCase()
    );
    if (isDuplicate) {
      setError('A site with this name already exists');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/custom-sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: siteName.trim(),
          url: siteUrl.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add site');
      }

      const data = await response.json();
      setSuccess(true);
      setSiteName('');
      setSiteUrl('');
      onSiteAdded?.(data.data);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Add Custom Scan Site
      </h3>

      <p className="text-gray-600 mb-6">
        Add a new scanlation site to your preferences. You'll be able to
        include it in your preferred sites list.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          Site added successfully! You can now add it to your preferences.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="site-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Site Name
          </label>
          <input
            id="site-name"
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="e.g., MangaPlus, Webtoon"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            disabled={isLoading}
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            {siteName.length}/100 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="site-url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Site URL
          </label>
          <input
            id="site-url"
            type="url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be a valid URL starting with http:// or https://
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          {isLoading ? 'Adding Site...' : 'Add Site'}
        </button>
      </form>

      {existingSites.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Your Custom Sites ({existingSites.length})
          </h4>
          <div className="space-y-2">
            {existingSites.map((site) => (
              <div
                key={site.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded"
              >
                <p className="font-medium text-gray-900">{site.name}</p>
                <p className="text-sm text-gray-600">{site.url}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
