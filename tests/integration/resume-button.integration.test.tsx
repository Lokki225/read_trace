import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { SeriesCard } from '../../src/components/dashboard/SeriesCard';
import { SeriesStatus } from '../../src/model/schemas/dashboard';
import { makeDashboardSeries } from '../factories/dashboard.factory';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

jest.mock('../../src/lib/resume', () => ({
  navigateToResume: jest.fn(() => ({ success: true, url: 'https://mangadex.org/chapter/abc' })),
  validateResumeUrl: jest.fn(() => true),
}));

const makeSeriesWithResume = (resumeUrl: string | null = 'https://mangadex.org/chapter/abc-123') =>
  makeDashboardSeries({
    id: 'series-int-1',
    title: 'Integration Series',
    status: SeriesStatus.READING,
    platform: 'mangadex',
    resume_url: resumeUrl,
  });

describe('SeriesCard + ResumeButton Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('TC 3.1: ResumeButton renders inside SeriesCard', () => {
    it('renders resume button when series has resume_url', () => {
      render(<SeriesCard series={makeSeriesWithResume()} />);
      expect(screen.getByTestId('resume-button-series-int-1')).toBeInTheDocument();
    });

    it('renders fallback message when series has no resume_url', () => {
      render(<SeriesCard series={makeSeriesWithResume(null)} />);
      expect(screen.getByText('Start reading to track progress')).toBeInTheDocument();
    });

    it('does not render resume button when resume_url is null', () => {
      render(<SeriesCard series={makeSeriesWithResume(null)} />);
      expect(screen.queryByTestId('resume-button-series-int-1')).not.toBeInTheDocument();
    });
  });

  describe('TC 3.2: Data flow from SeriesCard to ResumeButton', () => {
    it('passes series title to ResumeButton aria-label', () => {
      render(<SeriesCard series={makeSeriesWithResume()} />);
      const btn = screen.getByTestId('resume-button-series-int-1');
      expect(btn).toHaveAttribute('aria-label', 'Resume reading Integration Series');
    });

    it('passes series id to ResumeButton data-testid', () => {
      render(<SeriesCard series={makeSeriesWithResume()} />);
      expect(screen.getByTestId('resume-button-series-int-1')).toBeInTheDocument();
    });
  });

  describe('TC 3.3: Navigation flow', () => {
    it('clicking resume button triggers navigation', () => {
      const { navigateToResume } = require('../../src/lib/resume');
      render(<SeriesCard series={makeSeriesWithResume()} />);
      fireEvent.click(screen.getByTestId('resume-button-series-int-1'));
      expect(navigateToResume).toHaveBeenCalledWith('https://mangadex.org/chapter/abc-123');
    });

    it('shows loading state after click', () => {
      render(<SeriesCard series={makeSeriesWithResume()} />);
      fireEvent.click(screen.getByTestId('resume-button-series-int-1'));
      expect(screen.getByTestId('resume-spinner')).toBeInTheDocument();
    });

    it('button is disabled during loading', () => {
      render(<SeriesCard series={makeSeriesWithResume()} />);
      fireEvent.click(screen.getByTestId('resume-button-series-int-1'));
      expect(screen.getByTestId('resume-button-series-int-1')).toBeDisabled();
    });

    it('button re-enables after 2 seconds', async () => {
      render(<SeriesCard series={makeSeriesWithResume()} />);
      fireEvent.click(screen.getByTestId('resume-button-series-int-1'));

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('resume-button-series-int-1')).not.toBeDisabled();
      });
    });
  });

  describe('TC 3.4: Multiple cards render independently', () => {
    it('each card has its own resume button', () => {
      const series1 = makeDashboardSeries({
        id: 'card-a',
        title: 'Series A',
        resume_url: 'https://mangadex.org/chapter/aaa',
      });
      const series2 = makeDashboardSeries({
        id: 'card-b',
        title: 'Series B',
        resume_url: 'https://mangadex.org/chapter/bbb',
      });

      render(
        <>
          <SeriesCard series={series1} />
          <SeriesCard series={series2} />
        </>
      );

      expect(screen.getByTestId('resume-button-card-a')).toBeInTheDocument();
      expect(screen.getByTestId('resume-button-card-b')).toBeInTheDocument();
    });

    it('clicking one card button does not affect the other', () => {
      const series1 = makeDashboardSeries({
        id: 'card-a',
        title: 'Series A',
        resume_url: 'https://mangadex.org/chapter/aaa',
      });
      const series2 = makeDashboardSeries({
        id: 'card-b',
        title: 'Series B',
        resume_url: 'https://mangadex.org/chapter/bbb',
      });

      render(
        <>
          <SeriesCard series={series1} />
          <SeriesCard series={series2} />
        </>
      );

      fireEvent.click(screen.getByTestId('resume-button-card-a'));
      expect(screen.getByTestId('resume-button-card-a')).toBeDisabled();
      expect(screen.getByTestId('resume-button-card-b')).not.toBeDisabled();
    });
  });

  describe('TC 3.5: SeriesCard still renders all existing content', () => {
    it('still renders series title alongside resume button', () => {
      render(<SeriesCard series={makeSeriesWithResume()} />);
      expect(screen.getByText('Integration Series')).toBeInTheDocument();
      expect(screen.getByTestId('resume-button-series-int-1')).toBeInTheDocument();
    });

    it('still renders status badge alongside resume button', () => {
      render(<SeriesCard series={makeSeriesWithResume()} />);
      expect(screen.getByTestId('status-badge')).toBeInTheDocument();
      expect(screen.getByTestId('resume-button-series-int-1')).toBeInTheDocument();
    });
  });
});
