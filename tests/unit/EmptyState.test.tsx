import { render, screen } from '@testing-library/react';
import { EmptyState } from '../../src/components/dashboard/EmptyState';
import { SeriesStatus } from '../../src/model/schemas/dashboard';

jest.mock('next/link', () => {
  const MockLink = ({ children, href, 'aria-label': ariaLabel }: { children: React.ReactNode; href: string; 'aria-label'?: string }) => (
    <a href={href} aria-label={ariaLabel}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('EmptyState', () => {
  describe('Reading status', () => {
    it('renders encouraging message for Reading tab', () => {
      render(<EmptyState status={SeriesStatus.READING} />);
      expect(
        screen.getByText('No series being read yet. Start your reading journey!')
      ).toBeInTheDocument();
    });

    it('renders CTA link for Reading tab', () => {
      render(<EmptyState status={SeriesStatus.READING} />);
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/onboarding/import');
    });
  });

  describe('Completed status', () => {
    it('renders encouraging message for Completed tab', () => {
      render(<EmptyState status={SeriesStatus.COMPLETED} />);
      expect(screen.getByText('No completed series yet. Keep reading!')).toBeInTheDocument();
    });

    it('renders CTA link for Completed tab', () => {
      render(<EmptyState status={SeriesStatus.COMPLETED} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('On Hold status', () => {
    it('renders encouraging message for On Hold tab', () => {
      render(<EmptyState status={SeriesStatus.ON_HOLD} />);
      expect(
        screen.getByText("No series on hold. Good to know you're keeping up!")
      ).toBeInTheDocument();
    });

    it('renders CTA link for On Hold tab', () => {
      render(<EmptyState status={SeriesStatus.ON_HOLD} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Plan to Read status', () => {
    it('renders encouraging message for Plan to Read tab', () => {
      render(<EmptyState status={SeriesStatus.PLAN_TO_READ} />);
      expect(
        screen.getByText('No series planned yet. Add some to your reading list!')
      ).toBeInTheDocument();
    });

    it('renders CTA link for Plan to Read tab', () => {
      render(<EmptyState status={SeriesStatus.PLAN_TO_READ} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/onboarding/import');
    });
  });

  it('renders a book emoji icon', () => {
    render(<EmptyState status={SeriesStatus.READING} />);
    expect(screen.getByText('📚')).toBeInTheDocument();
  });

  it('CTA link has aria-label', () => {
    render(<EmptyState status={SeriesStatus.READING} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label');
  });
});
