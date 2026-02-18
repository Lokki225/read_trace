import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { useSeriesStore } from '@/store/seriesStore';
import { SeriesStatus } from '@/model/schemas/dashboard';

jest.mock('@/store/seriesStore');

const mockUseSeriesStore = useSeriesStore as jest.MockedFunction<
  typeof useSeriesStore
>;

describe('FilterPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSeriesStore.mockReturnValue({
      series: [],
      searchQuery: '',
      filters: { platforms: [], statuses: [] },
      setSeries: jest.fn(),
      setSearchQuery: jest.fn(),
      setFilters: jest.fn(),
      resetFilters: jest.fn(),
      getFilteredSeries: jest.fn(() => []),
    } as any);
  });

  it('should render filter button', () => {
    render(<FilterPanel />);
    expect(screen.getByLabelText(/toggle filters/i)).toBeInTheDocument();
  });

  it('should display "Filters" text on button', () => {
    render(<FilterPanel />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('should toggle filter panel on button click', async () => {
    const user = userEvent.setup();
    render(<FilterPanel />);
    const button = screen.getByLabelText(/toggle filters/i);

    expect(screen.queryByText('Platform')).not.toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText('Platform')).toBeInTheDocument();

    await user.click(button);
    expect(screen.queryByText('Platform')).not.toBeInTheDocument();
  });

  it('should render all platform options when open', async () => {
    const user = userEvent.setup();
    render(<FilterPanel />);
    const button = screen.getByLabelText(/toggle filters/i);

    await user.click(button);

    expect(screen.getByLabelText(/filter by mangadex/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by other/i)).toBeInTheDocument();
  });

  it('should render all status options when open', async () => {
    const user = userEvent.setup();
    render(<FilterPanel />);
    const button = screen.getByLabelText(/toggle filters/i);

    await user.click(button);

    expect(screen.getByLabelText(/filter by reading/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by completed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by on hold/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by plan to read/i)).toBeInTheDocument();
  });

  it('should handle platform filter selection', async () => {
    const user = userEvent.setup();
    const setFilters = jest.fn();
    mockUseSeriesStore.mockReturnValue({
      series: [],
      searchQuery: '',
      filters: { platforms: [], statuses: [] },
      setSeries: jest.fn(),
      setSearchQuery: jest.fn(),
      setFilters,
      resetFilters: jest.fn(),
      getFilteredSeries: jest.fn(() => []),
    } as any);

    render(<FilterPanel />);
    const button = screen.getByLabelText(/toggle filters/i);

    await user.click(button);
    const mangadexCheckbox = screen.getByLabelText(/filter by mangadex/i);
    await user.click(mangadexCheckbox);

    expect(setFilters).toHaveBeenCalledWith({ platforms: ['mangadex'] });
  });

  it('should handle status filter selection', async () => {
    const user = userEvent.setup();
    const setFilters = jest.fn();
    mockUseSeriesStore.mockReturnValue({
      series: [],
      searchQuery: '',
      filters: { platforms: [], statuses: [] },
      setSeries: jest.fn(),
      setSearchQuery: jest.fn(),
      setFilters,
      resetFilters: jest.fn(),
      getFilteredSeries: jest.fn(() => []),
    } as any);

    render(<FilterPanel />);
    const button = screen.getByLabelText(/toggle filters/i);

    await user.click(button);
    const readingCheckbox = screen.getByLabelText(/filter by reading/i);
    await user.click(readingCheckbox);

    expect(setFilters).toHaveBeenCalledWith({
      statuses: [SeriesStatus.READING],
    });
  });

  it('should handle multiple platform selections', async () => {
    const user = userEvent.setup();
    const setFilters = jest.fn();
    mockUseSeriesStore.mockReturnValue({
      series: [],
      searchQuery: '',
      filters: { platforms: ['mangadex'], statuses: [] },
      setSeries: jest.fn(),
      setSearchQuery: jest.fn(),
      setFilters,
      resetFilters: jest.fn(),
      getFilteredSeries: jest.fn(() => []),
    } as any);

    render(<FilterPanel />);
    const button = screen.getByLabelText(/toggle filters/i);

    await user.click(button);
    const otherCheckbox = screen.getByLabelText(/filter by other/i);
    await user.click(otherCheckbox);

    expect(setFilters).toHaveBeenCalledWith({
      platforms: ['mangadex', 'other'],
    });
  });

  it('should deselect platform filter when clicked again', async () => {
    const user = userEvent.setup();
    const setFilters = jest.fn();
    mockUseSeriesStore.mockReturnValue({
      series: [],
      searchQuery: '',
      filters: { platforms: ['mangadex'], statuses: [] },
      setSeries: jest.fn(),
      setSearchQuery: jest.fn(),
      setFilters,
      resetFilters: jest.fn(),
      getFilteredSeries: jest.fn(() => []),
    } as any);

    render(<FilterPanel />);
    const button = screen.getByLabelText(/toggle filters/i);

    await user.click(button);
    const mangadexCheckbox = screen.getByLabelText(/filter by mangadex/i);
    await user.click(mangadexCheckbox);

    expect(setFilters).toHaveBeenCalledWith({ platforms: [] });
  });

  it('should show filter count badge when filters active', async () => {
    const user = userEvent.setup();
    mockUseSeriesStore.mockReturnValue({
      series: [],
      searchQuery: '',
      filters: {
        platforms: ['mangadex'],
        statuses: [SeriesStatus.READING],
      },
      setSeries: jest.fn(),
      setSearchQuery: jest.fn(),
      setFilters: jest.fn(),
      resetFilters: jest.fn(),
      getFilteredSeries: jest.fn(() => []),
    } as any);

    render(<FilterPanel />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should not show filter count badge when no filters active', () => {
    render(<FilterPanel />);

    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('should show clear filters button when filters active', async () => {
    const user = userEvent.setup();
    mockUseSeriesStore.mockReturnValue({
      series: [],
      searchQuery: '',
      filters: { platforms: ['mangadex'], statuses: [] },
      setSeries: jest.fn(),
      setSearchQuery: jest.fn(),
      setFilters: jest.fn(),
      resetFilters: jest.fn(),
      getFilteredSeries: jest.fn(() => []),
    } as any);

    render(<FilterPanel />);
    const button = screen.getByLabelText(/toggle filters/i);

    await user.click(button);
    expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
  });

  it('should not show clear filters button when no filters active', async () => {
    const user = userEvent.setup();
    render(<FilterPanel />);
    const button = screen.getByLabelText(/toggle filters/i);

    await user.click(button);
    expect(screen.queryByText(/clear filters/i)).not.toBeInTheDocument();
  });

  it('should reset filters on clear button click', async () => {
    const user = userEvent.setup();
    const resetFilters = jest.fn();
    mockUseSeriesStore.mockReturnValue({
      series: [],
      searchQuery: '',
      filters: { platforms: ['mangadex'], statuses: [] },
      setSeries: jest.fn(),
      setSearchQuery: jest.fn(),
      setFilters: jest.fn(),
      resetFilters,
      getFilteredSeries: jest.fn(() => []),
    } as any);

    render(<FilterPanel />);
    const button = screen.getByLabelText(/toggle filters/i);

    await user.click(button);
    const clearButton = screen.getByText(/clear filters/i);
    await user.click(clearButton);

    expect(resetFilters).toHaveBeenCalled();
  });

  it('should close panel after clearing filters', async () => {
    const user = userEvent.setup();
    mockUseSeriesStore.mockReturnValue({
      series: [],
      searchQuery: '',
      filters: { platforms: ['mangadex'], statuses: [] },
      setSeries: jest.fn(),
      setSearchQuery: jest.fn(),
      setFilters: jest.fn(),
      resetFilters: jest.fn(),
      getFilteredSeries: jest.fn(() => []),
    } as any);

    render(<FilterPanel />);
    const button = screen.getByLabelText(/toggle filters/i);

    await user.click(button);
    expect(screen.getByText('Platform')).toBeInTheDocument();

    const clearButton = screen.getByText(/clear filters/i);
    await user.click(clearButton);

    expect(screen.queryByText('Platform')).not.toBeInTheDocument();
  });

  it('should display platform labels correctly', async () => {
    const user = userEvent.setup();
    render(<FilterPanel />);
    const button = screen.getByLabelText(/toggle filters/i);

    await user.click(button);

    expect(screen.getByText('mangadex')).toBeInTheDocument();
    expect(screen.getByText('other')).toBeInTheDocument();
  });

  it('should display status labels correctly', async () => {
    const user = userEvent.setup();
    render(<FilterPanel />);
    const button = screen.getByLabelText(/toggle filters/i);

    await user.click(button);

    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('On Hold')).toBeInTheDocument();
    expect(screen.getByText('Plan to Read')).toBeInTheDocument();
  });

  it('should handle multiple status selections', async () => {
    const user = userEvent.setup();
    const setFilters = jest.fn();
    mockUseSeriesStore.mockReturnValue({
      series: [],
      searchQuery: '',
      filters: {
        platforms: [],
        statuses: [SeriesStatus.READING],
      },
      setSeries: jest.fn(),
      setSearchQuery: jest.fn(),
      setFilters,
      resetFilters: jest.fn(),
      getFilteredSeries: jest.fn(() => []),
    } as any);

    render(<FilterPanel />);
    const button = screen.getByLabelText(/toggle filters/i);

    await user.click(button);
    const completedCheckbox = screen.getByLabelText(/filter by completed/i);
    await user.click(completedCheckbox);

    expect(setFilters).toHaveBeenCalledWith({
      statuses: [SeriesStatus.READING, SeriesStatus.COMPLETED],
    });
  });
});
