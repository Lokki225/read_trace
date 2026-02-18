import { SeriesStatus, UserSeries } from '@/model/schemas/dashboard';
import { EmptyState } from './EmptyState';

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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {series.map((item) => (
            <div
              key={item.id}
              data-testid="series-card"
              className="rounded-lg bg-[#FFEDE3] p-4 border border-[#FFD5BE]"
            >
              <h3 className="text-[#222222] font-medium text-sm truncate">
                {item.title}
              </h3>
              <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-[#FF7A45] text-white">
                {item.platform}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
