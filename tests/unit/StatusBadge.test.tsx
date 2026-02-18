import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../../src/components/dashboard/StatusBadge';
import { SeriesStatus } from '../../src/model/schemas/dashboard';

describe('StatusBadge', () => {
  it('renders Reading status with orange color', () => {
    render(<StatusBadge status={SeriesStatus.READING} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Reading');
    expect(badge).toHaveClass('bg-orange-500');
  });

  it('renders Completed status with green color', () => {
    render(<StatusBadge status={SeriesStatus.COMPLETED} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Completed');
    expect(badge).toHaveClass('bg-green-500');
  });

  it('renders On Hold status with yellow color', () => {
    render(<StatusBadge status={SeriesStatus.ON_HOLD} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('On Hold');
    expect(badge).toHaveClass('bg-yellow-500');
  });

  it('renders Plan to Read status with gray color', () => {
    render(<StatusBadge status={SeriesStatus.PLAN_TO_READ} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Plan to Read');
    expect(badge).toHaveClass('bg-gray-500');
  });

  it('has ARIA label describing the status', () => {
    render(<StatusBadge status={SeriesStatus.READING} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveAttribute('aria-label', 'Status: Reading');
  });

  it('applies additional className when provided', () => {
    render(<StatusBadge status={SeriesStatus.READING} className="extra-class" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveClass('extra-class');
  });

  it('renders all four status types without throwing', () => {
    const statuses = [
      SeriesStatus.READING,
      SeriesStatus.COMPLETED,
      SeriesStatus.ON_HOLD,
      SeriesStatus.PLAN_TO_READ,
    ];
    statuses.forEach((status) => {
      expect(() => {
        const { unmount } = render(<StatusBadge status={status} />);
        unmount();
      }).not.toThrow();
    });
  });
});
