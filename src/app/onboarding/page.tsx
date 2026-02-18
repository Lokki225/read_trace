'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InstallationGuide } from '@/components/extension/InstallationGuide';
import { useExtensionStatus } from '@/hooks/useExtensionStatus';

type OnboardingStep = 'welcome' | 'extension' | 'complete';

function StepIndicator({ current }: { current: OnboardingStep }) {
  const steps: { key: OnboardingStep; label: string }[] = [
    { key: 'welcome', label: 'Welcome' },
    { key: 'extension', label: 'Extension' },
    { key: 'complete', label: 'Complete' },
  ];
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <nav aria-label="Onboarding progress" className="mb-8">
      <ol className="flex items-center justify-center gap-4">
        {steps.map((step, index) => (
          <li key={step.key} className="flex items-center gap-2">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index < currentIndex
                  ? 'bg-green-500 text-white'
                  : index === currentIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
              aria-current={index === currentIndex ? 'step' : undefined}
            >
              {index < currentIndex ? '✓' : index + 1}
            </span>
            <span
              className={`text-sm font-medium ${
                index === currentIndex
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span className="text-gray-300 dark:text-gray-600 ml-2" aria-hidden="true">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { status } = useExtensionStatus();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');

  const handleExtensionComplete = () => {
    setCurrentStep('complete');
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  const handleSkipExtension = async () => {
    try {
      await fetch('/api/extension/skip', { method: 'POST' });
    } catch {
      // Non-blocking — proceed regardless
    }
    setCurrentStep('complete');
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <StepIndicator current={currentStep} />

        {currentStep === 'welcome' && (
          <div className="text-center space-y-6" data-testid="welcome-step">
            <div className="text-6xl" aria-hidden="true">📚</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Welcome to ReadTrace!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Track your manga reading progress automatically across all your favourite sites.
            </p>
            <button
              onClick={() => setCurrentStep('extension')}
              data-testid="get-started-btn"
              className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Get Started
            </button>
          </div>
        )}

        {currentStep === 'extension' && (
          <div data-testid="extension-step">
            <InstallationGuide onComplete={handleExtensionComplete} />

            {!status?.installed && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleSkipExtension}
                  data-testid="skip-extension-btn"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
                >
                  Skip for now
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="text-center space-y-4" data-testid="complete-step">
            <div className="text-6xl" aria-hidden="true">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              All Set!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting you to your dashboard...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
