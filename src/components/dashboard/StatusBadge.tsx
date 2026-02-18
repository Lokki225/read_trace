import { SeriesStatus } from '@/model/schemas/dashboard';

interface StatusBadgeProps {
  status: SeriesStatus;
  className?: string;
}

const STATUS_CONFIG: Record<SeriesStatus, { label: string; colorClass: string }> = {
  [SeriesStatus.READING]: { label: 'Reading', colorClass: 'bg-orange-500' },
  [SeriesStatus.COMPLETED]: { label: 'Completed', colorClass: 'bg-green-500' },
  [SeriesStatus.ON_HOLD]: { label: 'On Hold', colorClass: 'bg-yellow-500' },
  [SeriesStatus.PLAN_TO_READ]: { label: 'Plan to Read', colorClass: 'bg-gray-500' },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      data-testid="status-badge"
      aria-label={`Status: ${config.label}`}
      className={[
        'inline-block px-2 py-0.5 rounded-full text-white text-xs font-medium',
        config.colorClass,
        className,
      ].join(' ')}
    >
      {config.label}
    </span>
  );
}
