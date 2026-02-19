'use client';

import { memo, useState } from 'react';
import { ResumeButtonProps } from '@/types/resume';
import { navigateToResume } from '@/lib/resume';
import { getPlatformDisplayName } from '@/lib/platformPreference';
import { UnifiedProgress } from '@/model/schemas/unifiedState';

interface ResumeButtonWithPlatformProps extends ResumeButtonProps {
  unifiedProgress?: UnifiedProgress | null;
}

function ResumeButtonInner({ seriesId, seriesTitle, resumeUrl, onNavigate, unifiedProgress }: ResumeButtonWithPlatformProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  if (!resumeUrl) {
    return (
      <p
        className="text-xs text-[#6C757D] text-center mt-1"
        aria-label={`No reading progress for ${seriesTitle}. Start reading to track progress.`}
      >
        <span aria-hidden="true">📖 </span>
        <span>Start reading to track progress</span>
      </p>
    );
  }

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const urlToNavigate = selectedPlatform && unifiedProgress
        ? unifiedProgress.alternatives.find(alt => alt.platform === selectedPlatform)?.resume_url || resumeUrl
        : resumeUrl;

      if (onNavigate) {
        onNavigate(urlToNavigate);
      } else {
        navigateToResume(urlToNavigate);
      }
      setShowDropdown(false);
      setSelectedPlatform(null);
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (showDropdown && selectedPlatform) {
        handleClick();
      } else if (unifiedProgress && unifiedProgress.alternatives.length > 0) {
        setShowDropdown(!showDropdown);
      } else {
        handleClick();
      }
    }
  };

  const hasAlternatives = unifiedProgress && unifiedProgress.alternatives.length > 0;
  const currentPlatformDisplay = unifiedProgress ? getPlatformDisplayName(unifiedProgress.platform) : 'Unknown';

  return (
    <div className="relative w-full mt-2">
      <button
        data-testid={`resume-button-${seriesId}`}
        type="button"
        disabled={isLoading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={isLoading ? `Resuming ${seriesTitle}…` : `Resume reading ${seriesTitle}`}
        aria-busy={isLoading}
        aria-haspopup={hasAlternatives ? 'listbox' : undefined}
        aria-expanded={showDropdown}
        className={[
          'w-full bg-[#e06030] py-2 px-3 rounded text-white text-sm font-semibold',
          'min-h-[44px] flex items-center justify-center gap-2',
          'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#FF7A45] focus:ring-offset-2',
          isLoading
            ? 'bg-[#e06030] cursor-not-allowed opacity-80'
            : 'bg-[#FF7A45] hover:bg-[#e06030] cursor-pointer',
        ].join(' ')}
      >
        {isLoading ? (
          <>
            <svg
              data-testid="resume-spinner"
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Resuming…</span>
          </>
        ) : (
          <>
            <span>▶ Resume</span>
            {unifiedProgress && (
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                {currentPlatformDisplay}
              </span>
            )}
            {hasAlternatives && (
              <span className="text-xs ml-auto" aria-hidden="true">
                {showDropdown ? '▲' : '▼'}
              </span>
            )}
          </>
        )}
      </button>

      {showDropdown && hasAlternatives && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#ddd] rounded shadow-lg z-10"
        >
          {unifiedProgress!.alternatives.map((alt) => (
            <button
              key={alt.platform}
              type="button"
              role="option"
              aria-selected={selectedPlatform === alt.platform}
              onClick={() => {
                setSelectedPlatform(alt.platform);
                handleClick();
              }}
              className={[
                'w-full text-left px-3 py-2 text-sm transition-colors',
                selectedPlatform === alt.platform
                  ? 'bg-[#FF7A45] text-white'
                  : 'text-[#333] hover:bg-[#f5f5f5]',
              ].join(' ')}
            >
              {getPlatformDisplayName(alt.platform)}
              <span className="text-xs ml-2 opacity-70">Ch. {alt.current_chapter}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const ResumeButton = memo(ResumeButtonInner);
