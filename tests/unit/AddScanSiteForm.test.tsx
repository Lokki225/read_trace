import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddScanSiteForm } from '@/components/settings/AddScanSiteForm';
import { CustomSite } from '@/types/preferences';

// Mock fetch
global.fetch = jest.fn();

describe('AddScanSiteForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render form title and description', () => {
      render(<AddScanSiteForm />);
      expect(screen.getByText('Add Custom Scan Site')).toBeInTheDocument();
      expect(
        screen.getByText(/add a new scanlation site/i)
      ).toBeInTheDocument();
    });

    it('should render site name and URL input fields', () => {
      render(<AddScanSiteForm />);
      expect(screen.getByLabelText('Site Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Site URL')).toBeInTheDocument();
    });

    it('should render Add Site button', () => {
      render(<AddScanSiteForm />);
      expect(screen.getByText('Add Site')).toBeInTheDocument();
    });

    it('should display character count for site name', () => {
      render(<AddScanSiteForm />);
      expect(screen.getByText('0/100 characters')).toBeInTheDocument();
    });

    it('should display existing custom sites', () => {
      const customSites: CustomSite[] = [
        {
          id: 'custom_1',
          name: 'MangaPlus',
          url: 'https://mangaplus.com',
          createdAt: '2026-02-18T10:00:00Z',
        },
      ];

      render(<AddScanSiteForm existingSites={customSites} />);
      expect(screen.getByText('Your Custom Sites (1)')).toBeInTheDocument();
      expect(screen.getByText('MangaPlus')).toBeInTheDocument();
      expect(screen.getByText('https://mangaplus.com')).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should show error for empty site name', async () => {
      const user = userEvent.setup();
      render(<AddScanSiteForm />);

      const urlInput = screen.getByLabelText('Site URL');
      await user.type(urlInput, 'https://example.com');

      const submitButton = screen.getByText('Add Site');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Site name is required')).toBeInTheDocument();
      });
    });

    it('should show error for empty site URL', async () => {
      const user = userEvent.setup();
      render(<AddScanSiteForm />);

      const nameInput = screen.getByLabelText('Site Name');
      await user.type(nameInput, 'Example Site');

      const submitButton = screen.getByText('Add Site');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Site URL is required')).toBeInTheDocument();
      });
    });

    it('should prevent submission with invalid URL', async () => {
      const user = userEvent.setup();
      render(<AddScanSiteForm />);

      const nameInput = screen.getByLabelText('Site Name');
      const urlInput = screen.getByLabelText('Site URL');

      await user.type(nameInput, 'Example Site');
      await user.type(urlInput, 'not-a-valid-url');

      const submitButton = screen.getByText('Add Site');
      await user.click(submitButton);

      // Fetch should not be called with invalid URL
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should cap site name at 100 characters', async () => {
      const user = userEvent.setup();
      render(<AddScanSiteForm />);

      const nameInput = screen.getByLabelText('Site Name') as HTMLInputElement;
      const longName = 'a'.repeat(101);

      await user.type(nameInput, longName);

      // The input should be capped at 100 characters due to maxLength
      expect(nameInput.value.length).toBeLessThanOrEqual(100);
    });

    it('should show error for duplicate site name', async () => {
      const user = userEvent.setup();
      const customSites: CustomSite[] = [
        {
          id: 'custom_1',
          name: 'MangaPlus',
          url: 'https://mangaplus.com',
          createdAt: '2026-02-18T10:00:00Z',
        },
      ];

      render(<AddScanSiteForm existingSites={customSites} />);

      const nameInput = screen.getByLabelText('Site Name');
      const urlInput = screen.getByLabelText('Site URL');

      await user.type(nameInput, 'MangaPlus');
      await user.type(urlInput, 'https://different.com');

      const submitButton = screen.getByText('Add Site');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/a site with this name already exists/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      const mockOnSiteAdded = jest.fn();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 'custom_1',
            name: 'MangaPlus',
            url: 'https://mangaplus.com',
            createdAt: '2026-02-18T10:00:00Z',
          },
        }),
      });

      render(<AddScanSiteForm onSiteAdded={mockOnSiteAdded} />);

      const nameInput = screen.getByLabelText('Site Name');
      const urlInput = screen.getByLabelText('Site URL');

      await user.type(nameInput, 'MangaPlus');
      await user.type(urlInput, 'https://mangaplus.com');

      const submitButton = screen.getByText('Add Site');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSiteAdded).toHaveBeenCalled();
      });
    });

    it('should show success message after adding site', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 'custom_1',
            name: 'MangaPlus',
            url: 'https://mangaplus.com',
            createdAt: '2026-02-18T10:00:00Z',
          },
        }),
      });

      render(<AddScanSiteForm />);

      const nameInput = screen.getByLabelText('Site Name');
      const urlInput = screen.getByLabelText('Site URL');

      await user.type(nameInput, 'MangaPlus');
      await user.type(urlInput, 'https://mangaplus.com');

      const submitButton = screen.getByText('Add Site');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/site added successfully/i)
        ).toBeInTheDocument();
      });
    });

    it('should clear form after successful submission', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 'custom_1',
            name: 'MangaPlus',
            url: 'https://mangaplus.com',
            createdAt: '2026-02-18T10:00:00Z',
          },
        }),
      });

      render(<AddScanSiteForm />);

      const nameInput = screen.getByLabelText('Site Name') as HTMLInputElement;
      const urlInput = screen.getByLabelText('Site URL') as HTMLInputElement;

      await user.type(nameInput, 'MangaPlus');
      await user.type(urlInput, 'https://mangaplus.com');

      const submitButton = screen.getByText('Add Site');
      await user.click(submitButton);

      await waitFor(() => {
        expect(nameInput.value).toBe('');
        expect(urlInput.value).toBe('');
      });
    });

    it('should disable button while loading', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    data: {
                      id: 'custom_1',
                      name: 'MangaPlus',
                      url: 'https://mangaplus.com',
                      createdAt: '2026-02-18T10:00:00Z',
                    },
                  }),
                }),
              100
            )
          )
      );

      render(<AddScanSiteForm />);

      const nameInput = screen.getByLabelText('Site Name');
      const urlInput = screen.getByLabelText('Site URL');

      await user.type(nameInput, 'MangaPlus');
      await user.type(urlInput, 'https://mangaplus.com');

      const submitButton = screen.getByText('Add Site');
      await user.click(submitButton);

      expect(screen.getByText('Adding Site...')).toBeDisabled();
    });
  });

  describe('error handling', () => {
    it('should display API error message', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Site already exists' }),
      });

      render(<AddScanSiteForm />);

      const nameInput = screen.getByLabelText('Site Name');
      const urlInput = screen.getByLabelText('Site URL');

      await user.type(nameInput, 'MangaPlus');
      await user.type(urlInput, 'https://mangaplus.com');

      const submitButton = screen.getByText('Add Site');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Site already exists')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<AddScanSiteForm />);

      const nameInput = screen.getByLabelText('Site Name');
      const urlInput = screen.getByLabelText('Site URL');

      await user.type(nameInput, 'MangaPlus');
      await user.type(urlInput, 'https://mangaplus.com');

      const submitButton = screen.getByText('Add Site');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('character counter', () => {
    it('should update character count as user types', async () => {
      const user = userEvent.setup();
      render(<AddScanSiteForm />);

      const nameInput = screen.getByLabelText('Site Name');

      expect(screen.getByText('0/100 characters')).toBeInTheDocument();

      await user.type(nameInput, 'MangaPlus');

      expect(screen.getByText('9/100 characters')).toBeInTheDocument();
    });

    it('should prevent input beyond 100 characters', async () => {
      const user = userEvent.setup();
      render(<AddScanSiteForm />);

      const nameInput = screen.getByLabelText('Site Name') as HTMLInputElement;

      const longText = 'a'.repeat(150);
      await user.type(nameInput, longText);

      expect(nameInput.value.length).toBeLessThanOrEqual(100);
    });
  });

  describe('URL validation', () => {
    it('should accept valid HTTP URLs', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 'custom_1',
            name: 'Example',
            url: 'http://example.com',
            createdAt: '2026-02-18T10:00:00Z',
          },
        }),
      });

      render(<AddScanSiteForm />);

      const nameInput = screen.getByLabelText('Site Name');
      const urlInput = screen.getByLabelText('Site URL');

      await user.type(nameInput, 'Example');
      await user.type(urlInput, 'http://example.com');

      const submitButton = screen.getByText('Add Site');
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should accept valid HTTPS URLs', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 'custom_1',
            name: 'Example',
            url: 'https://example.com',
            createdAt: '2026-02-18T10:00:00Z',
          },
        }),
      });

      render(<AddScanSiteForm />);

      const nameInput = screen.getByLabelText('Site Name');
      const urlInput = screen.getByLabelText('Site URL');

      await user.type(nameInput, 'Example');
      await user.type(urlInput, 'https://example.com');

      const submitButton = screen.getByText('Add Site');
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });
});
