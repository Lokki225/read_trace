import React from 'react';
import { render, screen } from '@testing-library/react';
import { SeriesGrid } from '../../src/components/dashboard/SeriesGrid';
import { SeriesStatus } from '../../src/model/schemas/dashboard';
import { makeDashboardSeries } from '../factories/dashboard.factory';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const makeSeries = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    makeDashboardSeries({
      id: `series-${i}`,
      title: `Series ${i}`,
      status: SeriesStatus.READING,
      progress_percentage: 50,
      genres: ['action'],
      platform: 'mangadex',
    })
  );

describe('SeriesGrid', () => {
  describe('Rendering', () => {
    it('renders the grid container with correct data-testid', () => {
      render(<SeriesGrid series={makeSeries(3)} />);
      expect(screen.getByTestId('series-grid')).toBeInTheDocument();
    });

    it('renders correct number of series cards', () => {
      render(<SeriesGrid series={makeSeries(5)} />);
      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(5);
    });

    it('renders empty grid when series array is empty', () => {
      render(<SeriesGrid series={[]} />);
      const grid = screen.getByTestId('series-grid');
      expect(grid).toBeInTheDocument();
      expect(screen.queryAllByRole('article')).toHaveLength(0);
    });

    it('renders single series card', () => {
      render(<SeriesGrid series={makeSeries(1)} />);
      expect(screen.getAllByRole('article')).toHaveLength(1);
    });
  });

  describe('Responsive grid classes', () => {
    it('applies responsive grid column classes', () => {
      render(<SeriesGrid series={makeSeries(3)} />);
      const grid = screen.getByTestId('series-grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('sm:grid-cols-2');
      expect(grid).toHaveClass('md:grid-cols-3');
      expect(grid).toHaveClass('lg:grid-cols-4');
      expect(grid).toHaveClass('xl:grid-cols-5');
    });

    it('applies gap-4 spacing between cards', () => {
      render(<SeriesGrid series={makeSeries(3)} />);
      const grid = screen.getByTestId('series-grid');
      expect(grid).toHaveClass('gap-4');
    });
  });

  describe('Loading state', () => {
    it('renders skeleton when isLoading is true', () => {
      render(<SeriesGrid series={[]} isLoading={true} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('does not render grid when isLoading is true', () => {
      render(<SeriesGrid series={makeSeries(3)} isLoading={true} />);
      expect(screen.queryByTestId('series-grid')).not.toBeInTheDocument();
    });

    it('renders grid when isLoading is false', () => {
      render(<SeriesGrid series={makeSeries(3)} isLoading={false} />);
      expect(screen.getByTestId('series-grid')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies additional className to grid', () => {
      render(<SeriesGrid series={makeSeries(1)} className="custom-class" />);
      const grid = screen.getByTestId('series-grid');
      expect(grid).toHaveClass('custom-class');
    });
  });

  describe('Card click handler', () => {
    it('passes onCardClick to each SeriesCard', () => {
      const onCardClick = jest.fn();
      render(<SeriesGrid series={makeSeries(3)} onCardClick={onCardClick} />);
      const cards = screen.getAllByRole('article');
      expect(cards[0]).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Large dataset', () => {
    it('renders 20 cards without error', () => {
      expect(() => render(<SeriesGrid series={makeSeries(20)} />)).not.toThrow();
      expect(screen.getAllByRole('article')).toHaveLength(20);
    });
  });
});
