import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeriesCard } from '../../src/components/dashboard/SeriesCard';
import { SeriesStatus, UserSeries } from '../../src/model/schemas/dashboard';
import { makeDashboardSeries } from '../factories/dashboard.factory';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const makeSeries = (overrides: Partial<UserSeries> = {}): UserSeries =>
  makeDashboardSeries({
    id: 'series-1',
    title: 'Attack on Titan',
    cover_url: 'https://example.com/aot.jpg',
    status: SeriesStatus.READING,
    progress_percentage: 65,
    genres: ['action', 'adventure'],
    platform: 'mangadex',
    current_chapter: 130,
    total_chapters: 139,
    ...overrides,
  });

describe('SeriesCard', () => {
  describe('TC 1.1: Renders with required props', () => {
    it('renders series title', () => {
      render(<SeriesCard series={makeSeries()} />);
      expect(screen.getByText('Attack on Titan')).toBeInTheDocument();
    });

    it('renders cover image with correct alt text', () => {
      render(<SeriesCard series={makeSeries()} />);
      expect(screen.getByAltText('Attack on Titan cover')).toBeInTheDocument();
    });

    it('uses article semantic element', () => {
      const { container } = render(<SeriesCard series={makeSeries()} />);
      expect(container.querySelector('article')).toBeInTheDocument();
    });

    it('has aria-label describing the series', () => {
      render(<SeriesCard series={makeSeries()} />);
      const card = screen.getByTestId('series-card-0');
      expect(card).toHaveAttribute('aria-label', 'Attack on Titan — mangadex');
    });
  });

  describe('TC 1.2: Fallback placeholder when image missing', () => {
    it('shows placeholder when cover_url is null', () => {
      render(<SeriesCard series={makeSeries({ cover_url: null })} />);
      expect(screen.getByTestId('image-placeholder')).toBeInTheDocument();
    });

    it('does not render img element when cover_url is null', () => {
      render(<SeriesCard series={makeSeries({ cover_url: null })} />);
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renders without throwing when cover_url is null', () => {
      expect(() =>
        render(<SeriesCard series={makeSeries({ cover_url: null })} />)
      ).not.toThrow();
    });
  });

  describe('TC 1.3: Shows genres and platform information', () => {
    it('displays genre tags', () => {
      render(<SeriesCard series={makeSeries({ genres: ['action', 'adventure', 'supernatural'] })} />);
      expect(screen.getByText('action')).toBeInTheDocument();
      expect(screen.getByText('adventure')).toBeInTheDocument();
      expect(screen.getByText('supernatural')).toBeInTheDocument();
    });

    it('displays platform information', () => {
      render(<SeriesCard series={makeSeries({ platform: 'mangadex' })} />);
      expect(screen.getByText('mangadex')).toBeInTheDocument();
    });

    it('limits displayed genres to 3', () => {
      render(
        <SeriesCard
          series={makeSeries({ genres: ['action', 'adventure', 'supernatural', 'drama', 'romance'] })}
        />
      );
      expect(screen.getByText('action')).toBeInTheDocument();
      expect(screen.getByText('adventure')).toBeInTheDocument();
      expect(screen.getByText('supernatural')).toBeInTheDocument();
      expect(screen.queryByText('drama')).not.toBeInTheDocument();
      expect(screen.queryByText('romance')).not.toBeInTheDocument();
    });

    it('renders without genres gracefully', () => {
      expect(() =>
        render(<SeriesCard series={makeSeries({ genres: [] })} />)
      ).not.toThrow();
    });
  });

  describe('TC 1.4: Status badge rendering', () => {
    it('renders status badge for reading status', () => {
      render(<SeriesCard series={makeSeries({ status: SeriesStatus.READING })} />);
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('Reading');
      expect(badge).toHaveClass('bg-orange-500');
    });

    it('renders status badge for completed status', () => {
      render(<SeriesCard series={makeSeries({ status: SeriesStatus.COMPLETED })} />);
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('Completed');
      expect(badge).toHaveClass('bg-green-500');
    });

    it('renders status badge for on hold status', () => {
      render(<SeriesCard series={makeSeries({ status: SeriesStatus.ON_HOLD })} />);
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('On Hold');
      expect(badge).toHaveClass('bg-yellow-500');
    });

    it('renders status badge for plan to read status', () => {
      render(<SeriesCard series={makeSeries({ status: SeriesStatus.PLAN_TO_READ })} />);
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('Plan to Read');
      expect(badge).toHaveClass('bg-gray-500');
    });
  });

  describe('Progress bar', () => {
    it('renders progress bar with correct percentage', () => {
      render(<SeriesCard series={makeSeries({ progress_percentage: 65 })} />);
      const fill = screen.getByTestId('progress-fill');
      expect(fill).toHaveStyle({ width: '65%' });
    });

    it('renders 0% progress for unstarted series', () => {
      render(<SeriesCard series={makeSeries({ progress_percentage: 0 })} />);
      const fill = screen.getByTestId('progress-fill');
      expect(fill).toHaveStyle({ width: '0%' });
    });
  });

  describe('Click and keyboard interaction', () => {
    it('calls onClick when card is clicked', () => {
      const onClick = jest.fn();
      const series = makeSeries();
      render(<SeriesCard series={series} onClick={onClick} />);
      fireEvent.click(screen.getByTestId('series-card-0'));
      expect(onClick).toHaveBeenCalledWith(series);
    });

    it('calls onClick when Enter key is pressed', () => {
      const onClick = jest.fn();
      const series = makeSeries();
      render(<SeriesCard series={series} onClick={onClick} />);
      fireEvent.keyDown(screen.getByTestId('series-card-0'), { key: 'Enter' });
      expect(onClick).toHaveBeenCalledWith(series);
    });

    it('calls onClick when Space key is pressed', () => {
      const onClick = jest.fn();
      const series = makeSeries();
      render(<SeriesCard series={series} onClick={onClick} />);
      fireEvent.keyDown(screen.getByTestId('series-card-0'), { key: ' ' });
      expect(onClick).toHaveBeenCalledWith(series);
    });

    it('is not focusable when no onClick provided', () => {
      render(<SeriesCard series={makeSeries()} />);
      const card = screen.getByTestId('series-card-0');
      expect(card).not.toHaveAttribute('tabindex');
    });

    it('is focusable when onClick is provided', () => {
      render(<SeriesCard series={makeSeries()} onClick={jest.fn()} />);
      const card = screen.getByTestId('series-card-0');
      expect(card).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Index prop', () => {
    it('uses provided index in data-testid', () => {
      render(<SeriesCard series={makeSeries()} index={3} />);
      expect(screen.getByTestId('series-card-3')).toBeInTheDocument();
    });

    it('defaults to index 0', () => {
      render(<SeriesCard series={makeSeries()} />);
      expect(screen.getByTestId('series-card-0')).toBeInTheDocument();
    });
  });
});
