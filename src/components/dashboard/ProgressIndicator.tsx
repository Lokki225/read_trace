'use client';

import { memo } from 'react';
import { formatProgressPercentage } from '@/lib/progress';
import { formatLastRead, formatChapterDisplay } from '@/lib/dateFormat';

export interface ProgressIndicatorProps {
  current_chapter: number | null;
  total_chapters: number | null;
  progress_percentage: number;
  last_read_at: string | null;
}

function ProgressIndicatorInner({
  current_chapter,
  total_chapters,
  progress_percentage,
  last_read_at,
}: ProgressIndicatorProps) {
  const percentage = Math.min(100, Math.max(0, progress_percentage));
  const percentageStr = formatProgressPercentage(percentage);
  const chapterDisplay = formatChapterDisplay(current_chapter, total_chapters);
  const lastReadDisplay = formatLastRead(last_read_at);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress: ${percentageStr}, ${chapterDisplay}`}
          className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-[#FF7A45] transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-right">
          {percentageStr}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{chapterDisplay}</span>
        <span>Last read: {lastReadDisplay}</span>
      </div>
    </div>
  );
}

export const ProgressIndicator = memo(ProgressIndicatorInner);
ProgressIndicator.displayName = 'ProgressIndicator';
