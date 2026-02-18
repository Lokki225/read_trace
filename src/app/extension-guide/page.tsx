'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InstallationGuide } from '@/components/extension/InstallationGuide';

export default function ExtensionGuidePage() {
  const router = useRouter();
  const [skipping, setSkipping] = useState(false);

  const handleComplete = () => {
    router.push('/dashboard');
  };

  const handleSkip = async () => {
    if (
      !confirm(
        'Are you sure you want to skip extension installation? You can install it later from settings.'
      )
    ) {
      return;
    }

    setSkipping(true);

    try {
      await fetch('/api/extension/skip', { method: 'POST' });
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to skip installation:', error);
      setSkipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <InstallationGuide onComplete={handleComplete} />

        <div className="mt-8 text-center">
          <button
            onClick={handleSkip}
            disabled={skipping}
            data-testid="skip-installation-btn"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
          >
            {skipping ? 'Skipping...' : 'Skip for now'}
          </button>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            You can install the extension later from your account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
