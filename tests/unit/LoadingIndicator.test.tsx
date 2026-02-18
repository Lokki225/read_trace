import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingIndicator } from '@/components/dashboard/LoadingIndicator';

describe('LoadingIndicator', () => {
  it('should render when isLoading is true', () => {
    render(<LoadingIndicator isLoading={true} />);
    const indicator = screen.getByTestId('loading-indicator');
    expect(indicator).toBeInTheDocument();
  });

  it('should not render when isLoading is false', () => {
    const { container } = render(<LoadingIndicator isLoading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should display default message', () => {
    render(<LoadingIndicator isLoading={true} />);
    expect(screen.getByText('Loading more series...')).toBeInTheDocument();
  });

  it('should display custom message', () => {
    const customMessage = 'Fetching your library...';
    render(<LoadingIndicator isLoading={true} message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(<LoadingIndicator isLoading={true} />);
    const indicator = screen.getByTestId('loading-indicator');
    expect(indicator).toHaveAttribute('role', 'status');
    expect(indicator).toHaveAttribute('aria-busy', 'true');
  });

  it('should have aria-label with message', () => {
    const customMessage = 'Loading data...';
    render(<LoadingIndicator isLoading={true} message={customMessage} />);
    const indicator = screen.getByTestId('loading-indicator');
    expect(indicator).toHaveAttribute('aria-label', customMessage);
  });

  it('should render spinner element', () => {
    render(<LoadingIndicator isLoading={true} />);
    const indicator = screen.getByTestId('loading-indicator');
    const spinner = indicator.querySelector('[class*="animate-spin"]');
    expect(spinner).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    render(<LoadingIndicator isLoading={true} />);
    const indicator = screen.getByTestId('loading-indicator');
    expect(indicator).toHaveClass('flex', 'items-center', 'justify-center', 'py-8');
  });

  it('should handle empty message string', () => {
    render(<LoadingIndicator isLoading={true} message="" />);
    const indicator = screen.getByTestId('loading-indicator');
    expect(indicator).toBeInTheDocument();
  });

  it('should toggle visibility based on isLoading prop', () => {
    const { rerender } = render(<LoadingIndicator isLoading={false} />);
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

    rerender(<LoadingIndicator isLoading={true} />);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

    rerender(<LoadingIndicator isLoading={false} />);
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });
});
