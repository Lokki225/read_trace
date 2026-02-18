import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardTabs } from '../../src/components/dashboard/DashboardTabs';
import { DashboardData, SeriesStatus, UserSeries } from '../../src/model/schemas/dashboard';

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

const emptyData: DashboardData = {
  reading: [],
  completed: [],
  on_hold: [],
  plan_to_read: [],
};

const richData: DashboardData = {
  reading: [makeSeries({ id: '1', title: 'Naruto', status: SeriesStatus.READING })],
  completed: [makeSeries({ id: '2', title: 'FMA', status: SeriesStatus.COMPLETED })],
  on_hold: [makeSeries({ id: '3', title: 'Bleach', status: SeriesStatus.ON_HOLD })],
  plan_to_read: [makeSeries({ id: '4', title: 'HxH', status: SeriesStatus.PLAN_TO_READ })],
};

describe('DashboardTabs rendering', () => {
  it('renders all four tab buttons', () => {
    render(<DashboardTabs data={emptyData} />);
    expect(screen.getByRole('tab', { name: 'Reading' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Completed' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'On Hold' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Plan to Read' })).toBeInTheDocument();
  });

  it('renders tablist container', () => {
    render(<DashboardTabs data={emptyData} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('tablist has accessible label', () => {
    render(<DashboardTabs data={emptyData} />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Series reading status');
  });

  it('Reading tab is active by default', () => {
    render(<DashboardTabs data={emptyData} />);
    expect(screen.getByRole('tab', { name: 'Reading' })).toHaveAttribute('aria-selected', 'true');
  });

  it('non-active tabs have aria-selected=false', () => {
    render(<DashboardTabs data={emptyData} />);
    expect(screen.getByRole('tab', { name: 'Completed' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'On Hold' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'Plan to Read' })).toHaveAttribute('aria-selected', 'false');
  });

  it('active tab has tabIndex=0, others have tabIndex=-1', () => {
    render(<DashboardTabs data={emptyData} />);
    expect(screen.getByRole('tab', { name: 'Reading' })).toHaveAttribute('tabIndex', '0');
    expect(screen.getByRole('tab', { name: 'Completed' })).toHaveAttribute('tabIndex', '-1');
  });

  it('renders tabpanel for active tab', () => {
    render(<DashboardTabs data={emptyData} />);
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });
});

describe('DashboardTabs tab switching', () => {
  it('clicking Completed tab makes it active', async () => {
    render(<DashboardTabs data={richData} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Completed' }));
    expect(screen.getByRole('tab', { name: 'Completed' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Reading' })).toHaveAttribute('aria-selected', 'false');
  });

  it('clicking Completed tab shows Completed series', async () => {
    render(<DashboardTabs data={richData} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Completed' }));
    expect(screen.getByText('FMA')).toBeInTheDocument();
    expect(screen.queryByText('Naruto')).not.toBeInTheDocument();
  });

  it('clicking On Hold tab shows On Hold series', async () => {
    render(<DashboardTabs data={richData} />);
    await userEvent.click(screen.getByRole('tab', { name: 'On Hold' }));
    expect(screen.getByText('Bleach')).toBeInTheDocument();
  });

  it('clicking Plan to Read tab shows Plan to Read series', async () => {
    render(<DashboardTabs data={richData} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Plan to Read' }));
    expect(screen.getByText('HxH')).toBeInTheDocument();
  });

  it('Reading tab shows Reading series by default', () => {
    render(<DashboardTabs data={richData} />);
    expect(screen.getByText('Naruto')).toBeInTheDocument();
  });
});

describe('DashboardTabs keyboard navigation', () => {
  it('ArrowRight moves focus to next tab', async () => {
    render(<DashboardTabs data={emptyData} />);
    const readingTab = screen.getByRole('tab', { name: 'Reading' });
    readingTab.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Completed' })).toHaveFocus();
  });

  it('ArrowLeft moves focus to previous tab', async () => {
    render(<DashboardTabs data={emptyData} />);
    const completedTab = screen.getByRole('tab', { name: 'Completed' });
    completedTab.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Reading' })).toHaveFocus();
  });

  it('ArrowRight wraps from last to first tab', async () => {
    render(<DashboardTabs data={emptyData} />);
    const planTab = screen.getByRole('tab', { name: 'Plan to Read' });
    planTab.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Reading' })).toHaveFocus();
  });

  it('ArrowLeft wraps from first to last tab', async () => {
    render(<DashboardTabs data={emptyData} />);
    const readingTab = screen.getByRole('tab', { name: 'Reading' });
    readingTab.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Plan to Read' })).toHaveFocus();
  });

  it('Enter activates the focused tab', async () => {
    render(<DashboardTabs data={richData} />);
    const completedTab = screen.getByRole('tab', { name: 'Completed' });
    completedTab.focus();
    await userEvent.keyboard('{Enter}');
    expect(completedTab).toHaveAttribute('aria-selected', 'true');
  });

  it('Space activates the focused tab', async () => {
    render(<DashboardTabs data={richData} />);
    const completedTab = screen.getByRole('tab', { name: 'Completed' });
    completedTab.focus();
    await userEvent.keyboard(' ');
    expect(completedTab).toHaveAttribute('aria-selected', 'true');
  });
});

describe('DashboardTabs ARIA attributes', () => {
  it('each tab has aria-controls pointing to its panel', () => {
    render(<DashboardTabs data={emptyData} />);
    expect(screen.getByRole('tab', { name: 'Reading' })).toHaveAttribute('aria-controls', 'panel-reading');
    expect(screen.getByRole('tab', { name: 'Completed' })).toHaveAttribute('aria-controls', 'panel-completed');
    expect(screen.getByRole('tab', { name: 'On Hold' })).toHaveAttribute('aria-controls', 'panel-on-hold');
    expect(screen.getByRole('tab', { name: 'Plan to Read' })).toHaveAttribute('aria-controls', 'panel-plan-to-read');
  });

  it('each tab has a unique id', () => {
    render(<DashboardTabs data={emptyData} />);
    expect(screen.getByRole('tab', { name: 'Reading' })).toHaveAttribute('id', 'tab-reading');
    expect(screen.getByRole('tab', { name: 'Completed' })).toHaveAttribute('id', 'tab-completed');
  });

  it('tabpanel has aria-labelledby pointing to active tab id', () => {
    render(<DashboardTabs data={emptyData} />);
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-reading');
  });
});
