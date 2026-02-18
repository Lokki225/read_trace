import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeriesGrid } from '../../src/components/dashboard/SeriesGrid';
import { SeriesStatus, UserSeries } from '../../src/model/schemas/dashboard';
import { makeDashboardSeries } from '../factories/dashboard.factory';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const makeSeriesArray = (count: number, overrides: Partial<UserSeries> = {}): UserSeries[] =>
  Array.from({ length: count }, (_, i) =>
    makeDashboardSeries({
      id: `series-${i}`,
      title: `Series ${i}`,
      status: SeriesStatus.READING,
      progress_percentage: 50,
      genres: ['action'],
      platform: 'mangadex',
      cover_url: 'https://example.com/image.jpg',
      ...overrides,
    })
  );

describe('SeriesGrid Integration', () => {
  describe('TC 1.1: Grid adapts to screen size', () => {
    it('renders with responsive grid column classes for mobile and desktop', () => {
      render(<SeriesGrid series={makeSeriesArray(20)} />);
      const grid = screen.getByTestId('series-grid');
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-4', 'xl:grid-cols-5');
    });
  });

  describe('TC 1.2: Cards render with proper spacing', () => {
    it('applies correct gap between cards', () => {
      render(<SeriesGrid series={makeSeriesArray(10)} />);
      const grid = screen.getByTestId('series-grid');
      expect(grid).toHaveClass('gap-4');
    });
  });

  describe('TC 1.3: Full card content renders correctly', () => {
    it('renders title, platform, status badge, and progress bar for each card', () => {
      const series = makeSeriesArray(1, {
        title: 'Attack on Titan',
        platform: 'mangadex',
        status: SeriesStatus.READING,
        progress_percentage: 65,
        genres: ['action', 'adventure'],
      });
      render(<SeriesGrid series={series} />);
      expect(screen.getByText('Attack on Titan')).toBeInTheDocument();
      expect(screen.getByText('mangadex')).toBeInTheDocument();
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Reading');
      expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '65%' });
    });
  });

  describe('TC 1.4: Missing cover image shows placeholder', () => {
    it('shows placeholder for series without cover_url', () => {
      const series = makeSeriesArray(1, { cover_url: null });
      render(<SeriesGrid series={series} />);
      expect(screen.getByTestId('image-placeholder')).toBeInTheDocument();
    });
  });

  describe('TC 1.5: Mixed series statuses', () => {
    it('renders cards with different statuses correctly', () => {
      const series = [
        makeDashboardSeries({ id: '1', title: 'Reading Series', status: SeriesStatus.READING, progress_percentage: 50, genres: [] }),
        makeDashboardSeries({ id: '2', title: 'Completed Series', status: SeriesStatus.COMPLETED, progress_percentage: 100, genres: [] }),
        makeDashboardSeries({ id: '3', title: 'On Hold Series', status: SeriesStatus.ON_HOLD, progress_percentage: 30, genres: [] }),
      ];
      render(<SeriesGrid series={series} />);
      const badges = screen.getAllByTestId('status-badge');
      expect(badges).toHaveLength(3);
      expect(badges[0]).toHaveTextContent('Reading');
      expect(badges[1]).toHaveTextContent('Completed');
      expect(badges[2]).toHaveTextContent('On Hold');
    });
  });

  describe('TC 1.6: Click handler propagation', () => {
    it('fires onCardClick with correct series when card is clicked', () => {
      const onCardClick = jest.fn();
      const series = makeSeriesArray(3);
      render(<SeriesGrid series={series} onCardClick={onCardClick} />);
      const cards = screen.getAllByRole('article');
      fireEvent.click(cards[1]);
      expect(onCardClick).toHaveBeenCalledWith(series[1]);
    });
  });

  describe('TC 1.7: Large dataset performance', () => {
    it('renders 100 cards without throwing', () => {
      expect(() => render(<SeriesGrid series={makeSeriesArray(100)} />)).not.toThrow();
      expect(screen.getAllByRole('article')).toHaveLength(100);
    });
  });
});
