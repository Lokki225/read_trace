import { render, screen } from '@testing-library/react';
import { ProgressIndicator, ProgressIndicatorProps } from '@/components/dashboard/ProgressIndicator';

describe('ProgressIndicator', () => {
  const defaultProps: ProgressIndicatorProps = {
    current_chapter: 12,
    total_chapters: 50,
    progress_percentage: 24,
    last_read_at: '2026-02-18T10:00:00Z',
  };

  it('should render progress bar with correct percentage', () => {
    render(<ProgressIndicator {...defaultProps} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '24');
  });

  it('should display percentage text', () => {
    render(<ProgressIndicator {...defaultProps} />);
    expect(screen.getByText('24%')).toBeInTheDocument();
  });

  it('should display chapter information', () => {
    render(<ProgressIndicator {...defaultProps} />);
    expect(screen.getByText('Ch. 12 / 50')).toBeInTheDocument();
  });

  it('should display last read date', () => {
    render(<ProgressIndicator {...defaultProps} />);
    const lastReadText = screen.getByText(/Last read:/);
    expect(lastReadText).toBeInTheDocument();
  });

  it('should handle null current chapter', () => {
    render(
      <ProgressIndicator
        {...defaultProps}
        current_chapter={null}
      />
    );
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('should handle null total chapters', () => {
    render(
      <ProgressIndicator
        {...defaultProps}
        total_chapters={null}
      />
    );
    expect(screen.getByText('Ch. 12')).toBeInTheDocument();
  });

  it('should handle null last read date', () => {
    render(
      <ProgressIndicator
        {...defaultProps}
        last_read_at={null}
      />
    );
    expect(screen.getByText(/Last read: Never/)).toBeInTheDocument();
  });

  it('should clamp progress percentage to 0-100', () => {
    const { rerender } = render(
      <ProgressIndicator
        {...defaultProps}
        progress_percentage={150}
      />
    );
    expect(screen.getByText('100%')).toBeInTheDocument();

    rerender(
      <ProgressIndicator
        {...defaultProps}
        progress_percentage={-50}
      />
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should have proper ARIA labels', () => {
    render(<ProgressIndicator {...defaultProps} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-label');
  });

  it('should render with 0% progress', () => {
    render(
      <ProgressIndicator
        {...defaultProps}
        progress_percentage={0}
        current_chapter={0}
      />
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should render with 100% progress', () => {
    render(
      <ProgressIndicator
        {...defaultProps}
        progress_percentage={100}
        current_chapter={50}
      />
    );
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should be memoized', () => {
    const { rerender } = render(<ProgressIndicator {...defaultProps} />);
    const firstRender = screen.getByRole('progressbar');

    rerender(<ProgressIndicator {...defaultProps} />);
    const secondRender = screen.getByRole('progressbar');

    expect(firstRender).toBe(secondRender);
  });
});
