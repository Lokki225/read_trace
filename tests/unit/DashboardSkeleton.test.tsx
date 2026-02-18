import { render, screen } from '@testing-library/react';
import { DashboardSkeleton } from '../../src/components/dashboard/DashboardSkeleton';

describe('DashboardSkeleton', () => {
  it('renders skeleton tab bar', () => {
    render(<DashboardSkeleton />);
    expect(screen.getByTestId('skeleton-tabs')).toBeInTheDocument();
  });

  it('renders 6 skeleton series cards', () => {
    render(<DashboardSkeleton />);
    const skeletonCards = screen.getAllByTestId('skeleton-card');
    expect(skeletonCards).toHaveLength(6);
  });

  it('has role="status" for screen readers', () => {
    render(<DashboardSkeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-busy="true"', () => {
    render(<DashboardSkeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('has accessible label', () => {
    render(<DashboardSkeleton />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Loading your series library'
    );
  });

  it('has sr-only loading text', () => {
    render(<DashboardSkeleton />);
    expect(screen.getByText('Loading series library...')).toBeInTheDocument();
  });
});
