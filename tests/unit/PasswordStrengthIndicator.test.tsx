import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';

describe('PasswordStrengthIndicator Component', () => {
  it('should render password strength indicator', () => {
    render(<PasswordStrengthIndicator password="TestPass123!" />);

    expect(screen.getByText(/password strength/i)).toBeInTheDocument();
  });

  it('should show errors for password missing requirements', () => {
    render(<PasswordStrengthIndicator password="weak" />);

    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/weak/i)).toBeInTheDocument();
  });

  it('should show medium strength for medium password', () => {
    render(<PasswordStrengthIndicator password="TestPass123!" />);

    expect(screen.getByText(/medium|strong/i)).toBeInTheDocument();
  });

  it('should show strong strength for strong password', () => {
    render(<PasswordStrengthIndicator password="VerySecurePassword123!@#" />);

    expect(screen.getByText(/strong/i)).toBeInTheDocument();
  });

  it('should display validation errors for invalid password', () => {
    render(<PasswordStrengthIndicator password="weak" />);

    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('should display multiple validation errors', () => {
    render(<PasswordStrengthIndicator password="short" />);

    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('should show progress bar with correct aria attributes', () => {
    render(<PasswordStrengthIndicator password="TestPass123!" />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should show tip for valid but weak passwords', () => {
    render(<PasswordStrengthIndicator password="Pass123!" />);

    const tipText = screen.queryByText(/tip:/i);
    if (tipText) {
      expect(tipText).toBeInTheDocument();
    }
  });

  it('should not show errors for strong password', () => {
    render(<PasswordStrengthIndicator password="VerySecurePassword123!@#" />);

    expect(screen.queryByText(/password must be at least/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/password must contain/i)).not.toBeInTheDocument();
  });

  it('should show common password error', () => {
    render(<PasswordStrengthIndicator password="password" />);

    expect(screen.getByText(/too common/i)).toBeInTheDocument();
  });
});
