'use client';

import React, { useState } from 'react';
import { PreferredSitesForm } from '@/components/settings/PreferredSitesForm';
import { DEFAULT_PREFERRED_SITES } from '@/lib/platforms';

interface PreferredSitesStepProps {
  onComplete: (preferences: string[]) => void;
  onSkip: () => void;
}

export function PreferredSitesStep({
  onComplete,
  onSkip,
}: PreferredSitesStepProps) {
  const [showForm, setShowForm] = useState(false);

  const handleSkip = () => {
    onSkip();
  };

  const handleFormComplete = () => {
    onComplete(DEFAULT_PREFERRED_SITES);
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Configure Your Preferred Scan Sites
        </h2>

        <p className="text-gray-600 mb-6">
          Tell us which scanlation sites you prefer to read from. The ReadTrace
          extension will prioritize these sites when tracking your reading.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <p className="text-blue-900 text-sm">
            <strong>Tip:</strong> You can change these preferences anytime in
            your settings.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded transition-colors"
          >
            Configure Sites
          </button>
          <button
            onClick={handleSkip}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 px-4 rounded transition-colors"
          >
            Skip for Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PreferredSitesForm
        initialPreferences={DEFAULT_PREFERRED_SITES}
        onSaveComplete={handleFormComplete}
      />
    </div>
  );
}
