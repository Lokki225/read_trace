import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OAuthButton } from '@/components/auth/OAuthButton';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { DiscordSignInButton } from '@/components/auth/DiscordSignInButton';
import { OAuthProvider } from '@/model/schemas/oauth';

// Mock fetch
global.fetch = jest.fn();

describe('OAuth Button Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('OAuthButton', () => {
    it('should render Google button with correct label', () => {
      render(<OAuthButton provider={OAuthProvider.GOOGLE} />);
      expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
    });

    it('should render Discord button with correct label', () => {
      render(<OAuthButton provider={OAuthProvider.DISCORD} />);
      expect(screen.getByText(/Sign in with Discord/i)).toBeInTheDocument();
    });

    it('should have correct aria-label for accessibility', () => {
      const { rerender } = render(<OAuthButton provider={OAuthProvider.GOOGLE} />);
      expect(screen.getByLabelText('Sign in with Google')).toBeInTheDocument();

      rerender(<OAuthButton provider={OAuthProvider.DISCORD} />);
      expect(screen.getByLabelText('Sign in with Discord')).toBeInTheDocument();
    });

    it('should be disabled while loading', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: () => ({ authUrl: 'http://example.com' }) }), 100))
      );

      render(<OAuthButton provider={OAuthProvider.GOOGLE} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('should call fetch with correct provider', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ authUrl: 'http://example.com' })
      });

      render(<OAuthButton provider={OAuthProvider.GOOGLE} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/oauth',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ provider: OAuthProvider.GOOGLE })
          })
        );
      });
    });

    it('should handle fetch errors gracefully', async () => {
      const onError = jest.fn();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<OAuthButton provider={OAuthProvider.GOOGLE} onError={onError} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('should accept custom className', () => {
      const { container } = render(
        <OAuthButton provider={OAuthProvider.GOOGLE} className="custom-class" />
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('GoogleSignInButton', () => {
    it('should render with Google provider', () => {
      render(<GoogleSignInButton />);
      expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
    });

    it('should pass through onSuccess callback', async () => {
      const onSuccess = jest.fn();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ authUrl: 'http://example.com' })
      });

      render(<GoogleSignInButton onSuccess={onSuccess} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      // Note: onSuccess would be called after OAuth redirect, which we can't test in unit tests
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should pass through onError callback', async () => {
      const onError = jest.fn();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<GoogleSignInButton onError={onError} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe('DiscordSignInButton', () => {
    it('should render with Discord provider', () => {
      render(<DiscordSignInButton />);
      expect(screen.getByText(/Sign in with Discord/i)).toBeInTheDocument();
    });

    it('should pass through onError callback', async () => {
      const onError = jest.fn();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<DiscordSignInButton onError={onError} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe('Button States', () => {
    it('should show loading state with spinner', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: () => ({ authUrl: 'http://example.com' }) }), 100))
      );

      render(<OAuthButton provider={OAuthProvider.GOOGLE} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Signing in/i)).toBeInTheDocument();
      });
    });

    it('should display error message on failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('OAuth failed'));

      render(<OAuthButton provider={OAuthProvider.GOOGLE} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/OAuth failed/i)).toBeInTheDocument();
      });
    });
  });
});
