'use client';

import { memo, useState } from 'react';
import { ResumeButtonProps } from '@/types/resume';
import { navigateToResume } from '@/lib/resume';

function ResumeButtonInner({ seriesId, seriesTitle, resumeUrl, onNavigate }: ResumeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

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
      if (onNavigate) {
        onNavigate(resumeUrl);
      } else {
        navigateToResume(resumeUrl);
      }
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      data-testid={`resume-button-${seriesId}`}
      type="button"
      disabled={isLoading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={isLoading ? `Resuming ${seriesTitle}…` : `Resume reading ${seriesTitle}`}
      aria-busy={isLoading}
      className={[
        'w-full mt-2 py-2 px-3 rounded text-white text-sm font-semibold',
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
        <span>▶ Resume</span>
      )}
    </button>
  );
}

export const ResumeButton = memo(ResumeButtonInner);
