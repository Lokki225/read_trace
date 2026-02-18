import { DashboardData, SeriesStatus, TabConfig, UserSeries } from '@/model/schemas/dashboard';

export function groupSeriesByStatus(series: UserSeries[]): DashboardData {
  const result: DashboardData = {
    reading: [],
    completed: [],
    on_hold: [],
    plan_to_read: [],
  };

  for (const item of series) {
    switch (item.status) {
      case SeriesStatus.READING:
        result.reading.push(item);
        break;
      case SeriesStatus.COMPLETED:
        result.completed.push(item);
        break;
      case SeriesStatus.ON_HOLD:
        result.on_hold.push(item);
        break;
      case SeriesStatus.PLAN_TO_READ:
        result.plan_to_read.push(item);
        break;
    }
  }

  return result;
}

export function getTabLabel(status: SeriesStatus): string {
  const labels: Record<SeriesStatus, string> = {
    [SeriesStatus.READING]: 'Reading',
    [SeriesStatus.COMPLETED]: 'Completed',
    [SeriesStatus.ON_HOLD]: 'On Hold',
    [SeriesStatus.PLAN_TO_READ]: 'Plan to Read',
  };
  return labels[status];
}

export function getTabConfigs(): TabConfig[] {
  return [
    {
      id: 'tab-reading',
      label: 'Reading',
      status: SeriesStatus.READING,
      ariaLabel: 'Reading series',
      panelId: 'panel-reading',
    },
    {
      id: 'tab-completed',
      label: 'Completed',
      status: SeriesStatus.COMPLETED,
      ariaLabel: 'Completed series',
      panelId: 'panel-completed',
    },
    {
      id: 'tab-on-hold',
      label: 'On Hold',
      status: SeriesStatus.ON_HOLD,
      ariaLabel: 'Series on hold',
      panelId: 'panel-on-hold',
    },
    {
      id: 'tab-plan-to-read',
      label: 'Plan to Read',
      status: SeriesStatus.PLAN_TO_READ,
      ariaLabel: 'Series planned to read',
      panelId: 'panel-plan-to-read',
    },
  ];
}

export function getSeriesForStatus(
  data: DashboardData,
  status: SeriesStatus
): UserSeries[] {
  const map: Record<SeriesStatus, UserSeries[]> = {
    [SeriesStatus.READING]: data.reading,
    [SeriesStatus.COMPLETED]: data.completed,
    [SeriesStatus.ON_HOLD]: data.on_hold,
    [SeriesStatus.PLAN_TO_READ]: data.plan_to_read,
  };
  return map[status];
}
