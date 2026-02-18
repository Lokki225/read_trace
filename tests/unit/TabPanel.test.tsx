import { render, screen } from '@testing-library/react';
import { TabPanel } from '../../src/components/dashboard/TabPanel';
import { SeriesStatus, UserSeries } from '../../src/model/schemas/dashboard';

jest.mock('next/link', () => {
  const MockLink = ({ children, href, 'aria-label': ariaLabel }: { children: React.ReactNode; href: string; 'aria-label'?: string }) => (
    <a href={href} aria-label={ariaLabel}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const makeSeries = (overrides: Partial<UserSeries> = {}): UserSeries => ({
  id: 'series-1',
  user_id: 'user-123',
  title: 'Test Series',
  normalized_title: 'test series',
  platform: 'mangadex',
  source_url: null,
  import_id: null,
  status: SeriesStatus.READING,
  current_chapter: 1,
  total_chapters: null,
  cover_url: null,
  last_read_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('TabPanel', () => {
  it('renders series titles', () => {
    const series = [
      makeSeries({ id: '1', title: 'Naruto' }),
      makeSeries({ id: '2', title: 'Bleach' }),
    ];
    render(
      <TabPanel
        series={series}
        tabId="panel-reading"
        labelId="tab-reading"
        status={SeriesStatus.READING}
      />
    );
    expect(screen.getByText('Naruto')).toBeInTheDocument();
    expect(screen.getByText('Bleach')).toBeInTheDocument();
  });

  it('has role="tabpanel"', () => {
    render(
      <TabPanel
        series={[]}
        tabId="panel-reading"
        labelId="tab-reading"
        status={SeriesStatus.READING}
      />
    );
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('has correct aria-labelledby', () => {
    render(
      <TabPanel
        series={[]}
        tabId="panel-reading"
        labelId="tab-reading"
        status={SeriesStatus.READING}
      />
    );
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'tab-reading');
  });

  it('has correct id', () => {
    render(
      <TabPanel
        series={[]}
        tabId="panel-reading"
        labelId="tab-reading"
        status={SeriesStatus.READING}
      />
    );
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'panel-reading');
  });

  it('shows EmptyState when series array is empty', () => {
    render(
      <TabPanel
        series={[]}
        tabId="panel-reading"
        labelId="tab-reading"
        status={SeriesStatus.READING}
      />
    );
    expect(
      screen.getByText('No series being read yet. Start your reading journey!')
    ).toBeInTheDocument();
  });

  it('renders series-card data-testid for each series', () => {
    const series = [
      makeSeries({ id: '1', title: 'Naruto' }),
      makeSeries({ id: '2', title: 'One Piece' }),
      makeSeries({ id: '3', title: 'Bleach' }),
    ];
    render(
      <TabPanel
        series={series}
        tabId="panel-reading"
        labelId="tab-reading"
        status={SeriesStatus.READING}
      />
    );
    expect(screen.getAllByTestId('series-card')).toHaveLength(3);
  });

  it('renders platform badge for each series', () => {
    const series = [makeSeries({ id: '1', title: 'Naruto', platform: 'mangadex' })];
    render(
      <TabPanel
        series={series}
        tabId="panel-reading"
        labelId="tab-reading"
        status={SeriesStatus.READING}
      />
    );
    expect(screen.getByText('mangadex')).toBeInTheDocument();
  });
});
