'use client';

import Link from 'next/link';
import { SeriesStatus } from '@/model/schemas/dashboard';

interface EmptyStateProps {
  status: SeriesStatus;
}

const EMPTY_STATE_CONFIG: Record<
  SeriesStatus,
  { message: string; cta: string; href: string }
> = {
  [SeriesStatus.READING]: {
    message: 'No series being read yet. Start your reading journey!',
    cta: 'Import your reading history',
    href: '/onboarding/import',
  },
  [SeriesStatus.COMPLETED]: {
    message: 'No completed series yet. Keep reading!',
    cta: 'Browse your reading list',
    href: '/dashboard',
  },
  [SeriesStatus.ON_HOLD]: {
    message: "No series on hold. Good to know you're keeping up!",
    cta: 'View your reading list',
    href: '/dashboard',
  },
  [SeriesStatus.PLAN_TO_READ]: {
    message: 'No series planned yet. Add some to your reading list!',
    cta: 'Import series to plan',
    href: '/onboarding/import',
  },
};

export function EmptyState({ status }: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[status];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4" aria-hidden="true">
        📚
      </div>
      <p className="text-[#222222] text-lg font-medium mb-2">{config.message}</p>
      <Link
        href={config.href}
        className="mt-4 inline-block px-6 py-3 bg-[#FF7A45] text-white rounded-lg font-medium hover:bg-[#e86a35] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7A45] focus:ring-offset-2"
        aria-label={config.cta}
      >
        {config.cta}
      </Link>
    </div>
  );
}
