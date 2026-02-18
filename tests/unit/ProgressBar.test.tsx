import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../../src/components/dashboard/ProgressBar';

describe('ProgressBar', () => {
  it('displays progress bar at correct percentage', () => {
    render(<ProgressBar percentage={65} />);
    const fill = screen.getByTestId('progress-fill');
    expect(fill).toHaveStyle({ width: '65%' });
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('handles 0% progress', () => {
    render(<ProgressBar percentage={0} />);
    const fill = screen.getByTestId('progress-fill');
    expect(fill).toHaveStyle({ width: '0%' });
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('handles 100% progress', () => {
    render(<ProgressBar percentage={100} />);
    const fill = screen.getByTestId('progress-fill');
    expect(fill).toHaveStyle({ width: '100%' });
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('clamps values above 100 to 100%', () => {
    render(<ProgressBar percentage={150} />);
    const fill = screen.getByTestId('progress-fill');
    expect(fill).toHaveStyle({ width: '100%' });
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('clamps negative values to 0%', () => {
    render(<ProgressBar percentage={-10} />);
    const fill = screen.getByTestId('progress-fill');
    expect(fill).toHaveStyle({ width: '0%' });
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('has progressbar role with correct ARIA attributes', () => {
    render(<ProgressBar percentage={45} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '45');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('has descriptive ARIA label', () => {
    render(<ProgressBar percentage={30} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-label', 'Reading progress: 30%');
  });

  it('rounds decimal percentages', () => {
    render(<ProgressBar percentage={33.7} />);
    expect(screen.getByText('34%')).toBeInTheDocument();
  });

  it('applies additional className when provided', () => {
    const { container } = render(<ProgressBar percentage={50} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
