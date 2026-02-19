import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ResumeButton } from '../../src/components/dashboard/ResumeButton';

jest.mock('../../src/lib/resume', () => ({
  navigateToResume: jest.fn(() => ({ success: true, url: 'https://mangadex.org/chapter/abc' })),
}));

import { navigateToResume } from '../../src/lib/resume';

const mockNavigate = navigateToResume as jest.MockedFunction<typeof navigateToResume>;

const defaultProps = {
  seriesId: 'series-1',
  seriesTitle: 'Attack on Titan',
  resumeUrl: 'https://mangadex.org/chapter/abc-123',
};

describe('ResumeButton', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('TC 2.1: Renders with resumeUrl', () => {
    it('renders Resume button when resumeUrl is provided', () => {
      render(<ResumeButton {...defaultProps} />);
      expect(screen.getByTestId('resume-button-series-1')).toBeInTheDocument();
    });

    it('button text shows Resume', () => {
      render(<ResumeButton {...defaultProps} />);
      expect(screen.getByText('▶ Resume')).toBeInTheDocument();
    });

    it('button has orange background class', () => {
      render(<ResumeButton {...defaultProps} />);
      const btn = screen.getByTestId('resume-button-series-1');
      expect(btn).toHaveClass('bg-[#FF7A45]');
    });

    it('button has correct aria-label', () => {
      render(<ResumeButton {...defaultProps} />);
      const btn = screen.getByTestId('resume-button-series-1');
      expect(btn).toHaveAttribute('aria-label', 'Resume reading Attack on Titan');
    });

    it('button is not disabled initially', () => {
      render(<ResumeButton {...defaultProps} />);
      const btn = screen.getByTestId('resume-button-series-1');
      expect(btn).not.toBeDisabled();
    });

    it('button has minimum touch target height', () => {
      render(<ResumeButton {...defaultProps} />);
      const btn = screen.getByTestId('resume-button-series-1');
      expect(btn).toHaveClass('min-h-[44px]');
    });
  });

  describe('TC 2.2: Fallback message when no resumeUrl', () => {
    it('renders fallback message when resumeUrl is null', () => {
      render(<ResumeButton {...defaultProps} resumeUrl={null} />);
      expect(screen.getByText('Start reading to track progress')).toBeInTheDocument();
    });

    it('does not render button when resumeUrl is null', () => {
      render(<ResumeButton {...defaultProps} resumeUrl={null} />);
      expect(screen.queryByTestId('resume-button-series-1')).not.toBeInTheDocument();
    });

    it('fallback message has accessible aria-label', () => {
      render(<ResumeButton {...defaultProps} resumeUrl={null} />);
      const msg = screen.getByText('Start reading to track progress').closest('p');
      expect(msg).toHaveAttribute('aria-label', expect.stringContaining('Attack on Titan'));
    });
  });

  describe('TC 2.3: Loading state on click', () => {
    it('shows spinner after click', () => {
      render(<ResumeButton {...defaultProps} />);
      fireEvent.click(screen.getByTestId('resume-button-series-1'));
      expect(screen.getByTestId('resume-spinner')).toBeInTheDocument();
    });

    it('button text changes to Resuming… during loading', () => {
      render(<ResumeButton {...defaultProps} />);
      fireEvent.click(screen.getByTestId('resume-button-series-1'));
      expect(screen.getByText('Resuming…')).toBeInTheDocument();
    });

    it('button is disabled during loading', () => {
      render(<ResumeButton {...defaultProps} />);
      fireEvent.click(screen.getByTestId('resume-button-series-1'));
      expect(screen.getByTestId('resume-button-series-1')).toBeDisabled();
    });

    it('aria-label changes to resuming state during loading', () => {
      render(<ResumeButton {...defaultProps} />);
      fireEvent.click(screen.getByTestId('resume-button-series-1'));
      const btn = screen.getByTestId('resume-button-series-1');
      expect(btn).toHaveAttribute('aria-label', 'Resuming Attack on Titan…');
    });

    it('aria-busy is true during loading', () => {
      render(<ResumeButton {...defaultProps} />);
      fireEvent.click(screen.getByTestId('resume-button-series-1'));
      const btn = screen.getByTestId('resume-button-series-1');
      expect(btn).toHaveAttribute('aria-busy', 'true');
    });

    it('button returns to normal state after 2 seconds', async () => {
      render(<ResumeButton {...defaultProps} />);
      fireEvent.click(screen.getByTestId('resume-button-series-1'));
      expect(screen.getByTestId('resume-button-series-1')).toBeDisabled();

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('resume-button-series-1')).not.toBeDisabled();
      });
    });
  });

  describe('TC 2.4: Click handling and navigation', () => {
    it('calls navigateToResume with correct URL on click', () => {
      render(<ResumeButton {...defaultProps} />);
      fireEvent.click(screen.getByTestId('resume-button-series-1'));
      expect(mockNavigate).toHaveBeenCalledWith(defaultProps.resumeUrl);
    });

    it('calls custom onNavigate when provided', () => {
      const onNavigate = jest.fn();
      render(<ResumeButton {...defaultProps} onNavigate={onNavigate} />);
      fireEvent.click(screen.getByTestId('resume-button-series-1'));
      expect(onNavigate).toHaveBeenCalledWith(defaultProps.resumeUrl);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not call navigate again if already loading', () => {
      render(<ResumeButton {...defaultProps} />);
      const btn = screen.getByTestId('resume-button-series-1');
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('TC 2.5: Keyboard accessibility', () => {
    it('activates on Enter key press', () => {
      render(<ResumeButton {...defaultProps} />);
      fireEvent.keyDown(screen.getByTestId('resume-button-series-1'), { key: 'Enter' });
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('activates on Space key press', () => {
      render(<ResumeButton {...defaultProps} />);
      fireEvent.keyDown(screen.getByTestId('resume-button-series-1'), { key: ' ' });
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('does not activate on other keys', () => {
      render(<ResumeButton {...defaultProps} />);
      fireEvent.keyDown(screen.getByTestId('resume-button-series-1'), { key: 'Tab' });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('has focus ring class for keyboard users', () => {
      render(<ResumeButton {...defaultProps} />);
      const btn = screen.getByTestId('resume-button-series-1');
      expect(btn).toHaveClass('focus:ring-2');
    });
  });
});
