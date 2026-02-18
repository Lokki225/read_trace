import { UserSeries } from '@/model/schemas/dashboard';
import { SeriesCard } from './SeriesCard';
import { DashboardSkeleton } from './DashboardSkeleton';

interface SeriesGridProps {
  series: UserSeries[];
  isLoading?: boolean;
  className?: string;
  onCardClick?: (series: UserSeries) => void;
}

export function SeriesGrid({
  series,
  isLoading = false,
  className = '',
  onCardClick,
}: SeriesGridProps) {
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div
      data-testid="series-grid"
      className={[
        'grid gap-4',
        'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        className,
      ].join(' ')}
    >
      {series.map((item, index) => (
        <SeriesCard
          key={item.id}
          series={item}
          index={index}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}
