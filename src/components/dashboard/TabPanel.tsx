import { SeriesStatus, UserSeries } from '@/model/schemas/dashboard';
import { EmptyState } from './EmptyState';
import { SeriesGrid } from './SeriesGrid';

interface TabPanelProps {
  series: UserSeries[];
  tabId: string;
  labelId: string;
  status: SeriesStatus;
}

export function TabPanel({ series, tabId, labelId, status }: TabPanelProps) {
  return (
    <div role="tabpanel" id={tabId} aria-labelledby={labelId} className="mt-6">
      {series.length === 0 ? (
        <EmptyState status={status} />
      ) : (
        <SeriesGrid series={series} />
      )}
    </div>
  );
}
