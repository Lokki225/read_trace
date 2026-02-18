import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { useSeriesStore } from '@/store/seriesStore';

jest.mock('@/store/seriesStore');

const mockUseSeriesStore = useSeriesStore as jest.MockedFunction<
  typeof useSeriesStore
>;

describe('SearchBar Component', () => {
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

  it('should render search input with placeholder', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      /search series by title, genre, or platform/i
    );
    expect(input).toBeInTheDocument();
  });

  it('should have proper aria-label', () => {
    render(<SearchBar />);
    const input = screen.getByLabelText(/search series/i);
    expect(input).toBeInTheDocument();
  });

  it('should display search icon', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      /search series by title, genre, or platform/i
    );
    expect(input.parentElement?.querySelector('svg')).toBeInTheDocument();
  });

  it('should update input value on user typing', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      /search series by title, genre, or platform/i
    ) as HTMLInputElement;

    await user.type(input, 'attack');
    expect(input.value).toBe('attack');
  });

  it('should debounce search input by 300ms', async () => {
    jest.useFakeTimers();
    const setSearchQuery = jest.fn();
    mockUseSeriesStore.mockReturnValue({
      series: [],
      searchQuery: '',
      filters: { platforms: [], statuses: [] },
      setSeries: jest.fn(),
      setSearchQuery,
      setFilters: jest.fn(),
      resetFilters: jest.fn(),
      getFilteredSeries: jest.fn(() => []),
    } as any);

    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      /search series by title, genre, or platform/i
    );

    fireEvent.change(input, { target: { value: 'test' } });

    expect(setSearchQuery).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);

    expect(setSearchQuery).toHaveBeenCalledWith('test');

    jest.useRealTimers();
  });

  it('should show clear button when input has value', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      /search series by title, genre, or platform/i
    );

    expect(screen.queryByLabelText(/clear search/i)).not.toBeInTheDocument();

    await user.type(input, 'attack');

    expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument();
  });

  it('should hide clear button when input is empty', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      /search series by title, genre, or platform/i
    );

    await user.type(input, 'attack');
    expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument();

    await user.clear(input);
    expect(screen.queryByLabelText(/clear search/i)).not.toBeInTheDocument();
  });

  it('should clear input and search query on clear button click', async () => {
    const user = userEvent.setup();
    const setSearchQuery = jest.fn();
    mockUseSeriesStore.mockReturnValue({
      series: [],
      searchQuery: 'attack',
      filters: { platforms: [], statuses: [] },
      setSeries: jest.fn(),
      setSearchQuery,
      setFilters: jest.fn(),
      resetFilters: jest.fn(),
      getFilteredSeries: jest.fn(() => []),
    } as any);

    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      /search series by title, genre, or platform/i
    ) as HTMLInputElement;

    expect(input.value).toBe('attack');

    const clearButton = screen.getByLabelText(/clear search/i);
    await user.click(clearButton);

    expect(setSearchQuery).toHaveBeenCalledWith('');
  });

  it('should sync input value with store search query', () => {
    const { rerender } = render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      /search series by title, genre, or platform/i
    ) as HTMLInputElement;

    expect(input.value).toBe('');

    mockUseSeriesStore.mockReturnValue({
      series: [],
      searchQuery: 'demon',
      filters: { platforms: [], statuses: [] },
      setSeries: jest.fn(),
      setSearchQuery: jest.fn(),
      setFilters: jest.fn(),
      resetFilters: jest.fn(),
      getFilteredSeries: jest.fn(() => []),
    } as any);

    rerender(<SearchBar />);

    expect(input.value).toBe('demon');
  });

  it('should have proper styling classes', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      /search series by title, genre, or platform/i
    );

    expect(input).toHaveClass('rounded-lg', 'border', 'border-gray-300');
  });

  it('should handle rapid input changes', async () => {
    jest.useFakeTimers();
    const setSearchQuery = jest.fn();
    mockUseSeriesStore.mockReturnValue({
      series: [],
      searchQuery: '',
      filters: { platforms: [], statuses: [] },
      setSeries: jest.fn(),
      setSearchQuery,
      setFilters: jest.fn(),
      resetFilters: jest.fn(),
      getFilteredSeries: jest.fn(() => []),
    } as any);

    render(<SearchBar />);
    const input = screen.getByPlaceholderText(
      /search series by title, genre, or platform/i
    );

    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'at' } });
    fireEvent.change(input, { target: { value: 'att' } });

    jest.advanceTimersByTime(300);

    expect(setSearchQuery).toHaveBeenCalledTimes(1);
    expect(setSearchQuery).toHaveBeenCalledWith('att');

    jest.useRealTimers();
  });
});
