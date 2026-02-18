import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferredSitesForm } from '@/components/settings/PreferredSitesForm';
import { SUPPORTED_PLATFORMS } from '@/lib/platforms';

// Mock fetch for custom sites
global.fetch = jest.fn();

// Mock the usePreferredSites hook
jest.mock('@/hooks/usePreferredSites', () => ({
  usePreferredSites: jest.fn((initial) => ({
    preferences: initial || ['mangadex'],
    isLoading: false,
    isSaving: false,
    error: null,
    updatePreferences: jest.fn(async (prefs) => {
      // Mock successful save
    }),
    resetToDefaults: jest.fn(),
  })),
}));

describe('PreferredSitesForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  describe('rendering', () => {
    it('should render form title and description', () => {
      render(<PreferredSitesForm />);
      expect(screen.getByText('Preferred Scan Sites')).toBeInTheDocument();
      expect(
        screen.getByText(/drag to reorder your preferred sites/i)
      ).toBeInTheDocument();
    });

    it('should render all supported platforms as checkboxes', async () => {
      render(<PreferredSitesForm />);
      
      // Wait for custom sites to load
      await waitFor(() => {
        expect(screen.queryByText('Loading custom sites...')).not.toBeInTheDocument();
      });
      
      SUPPORTED_PLATFORMS.forEach((platform) => {
        expect(screen.getByLabelText(`Select ${platform.name}`)).toBeInTheDocument();
      });
    });

    it('should render Save and Reset buttons', () => {
      render(<PreferredSitesForm />);
      expect(screen.getByText('Save Preferences')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should display selected sites in order', async () => {
      render(<PreferredSitesForm initialPreferences={['mangadex', 'manganelo']} />);
      const selectedSection = screen.getByText('Selected Sites (in order)');
      expect(selectedSection).toBeInTheDocument();
      
      // Wait for custom sites to load
      await waitFor(() => {
        expect(screen.queryByText('Loading custom sites...')).not.toBeInTheDocument();
      });
    });
  });

  describe('platform selection', () => {
    it('should toggle platform selection', async () => {
      const user = userEvent.setup();
      render(<PreferredSitesForm initialPreferences={['mangadex']} />);

      // Wait for custom sites to load
      await waitFor(() => {
        expect(screen.queryByText('Loading custom sites...')).not.toBeInTheDocument();
      });

      const manganelo = screen.getByLabelText('Select MangaNelo');
      expect(manganelo).not.toBeChecked();

      await user.click(manganelo);
      expect(manganelo).toBeChecked();
    });

    it('should uncheck selected platform', async () => {
      const user = userEvent.setup();
      render(<PreferredSitesForm initialPreferences={['mangadex']} />);

      // Wait for custom sites to load
      await waitFor(() => {
        expect(screen.queryByText('Loading custom sites...')).not.toBeInTheDocument();
      });

      const mangadex = screen.getByLabelText('Select MangaDex');
      expect(mangadex).toBeChecked();

      await user.click(mangadex);
      expect(mangadex).not.toBeChecked();
    });

    it('should remove platform from selected list', async () => {
      const user = userEvent.setup();
      render(<PreferredSitesForm initialPreferences={['mangadex', 'manganelo']} />);

      const removeButtons = screen.getAllByText('Remove');
      await user.click(removeButtons[0]);

      expect(screen.queryByTestId('platform-mangadex')).not.toBeInTheDocument();
    });
  });

  describe('drag and drop', () => {
    it('should reorder platforms on drag', () => {
      render(<PreferredSitesForm initialPreferences={['mangadex', 'manganelo']} />);

      const mangadex = screen.getByTestId('platform-mangadex');
      const manganelo = screen.getByTestId('platform-manganelo');

      fireEvent.dragStart(mangadex);
      fireEvent.dragOver(manganelo);
      fireEvent.drop(manganelo);

      // After reorder, manganelo should be first
      const items = screen.getAllByTestId(/^platform-/);
      expect(items[0]).toHaveAttribute('data-testid', 'platform-manganelo');
    });

    it('should show visual feedback during drag', () => {
      render(<PreferredSitesForm initialPreferences={['mangadex', 'manganelo']} />);

      const mangadex = screen.getByTestId('platform-mangadex');

      fireEvent.dragStart(mangadex);
      expect(mangadex).toHaveClass('opacity-50');

      fireEvent.dragEnd(mangadex);
    });
  });

  describe('save functionality', () => {
    it('should call updatePreferences on save', async () => {
      const user = userEvent.setup();
      const { usePreferredSites } = require('@/hooks/usePreferredSites');
      const mockUpdate = jest.fn();
      usePreferredSites.mockReturnValue({
        preferences: ['mangadex'],
        isLoading: false,
        isSaving: false,
        error: null,
        updatePreferences: mockUpdate,
        resetToDefaults: jest.fn(),
      });

      render(<PreferredSitesForm initialPreferences={['mangadex']} />);

      const saveButton = screen.getByText('Save Preferences');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled();
      });
    });

    it('should show success message after save', async () => {
      const user = userEvent.setup();
      const { usePreferredSites } = require('@/hooks/usePreferredSites');
      usePreferredSites.mockReturnValue({
        preferences: ['mangadex'],
        isLoading: false,
        isSaving: false,
        error: null,
        updatePreferences: jest.fn(async () => {}),
        resetToDefaults: jest.fn(),
      });

      render(<PreferredSitesForm initialPreferences={['mangadex']} />);

      const saveButton = screen.getByText('Save Preferences');
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText('Preferences saved successfully!')
        ).toBeInTheDocument();
      });
    });

    it('should disable buttons while saving', async () => {
      const user = userEvent.setup();
      const { usePreferredSites } = require('@/hooks/usePreferredSites');
      usePreferredSites.mockReturnValue({
        preferences: ['mangadex'],
        isLoading: false,
        isSaving: true,
        error: null,
        updatePreferences: jest.fn(),
        resetToDefaults: jest.fn(),
      });

      render(<PreferredSitesForm initialPreferences={['mangadex']} />);

      const saveButton = screen.getByText('Saving...');
      expect(saveButton).toBeDisabled();

      const resetButton = screen.getByText('Reset');
      expect(resetButton).toBeDisabled();
    });
  });

  describe('error handling', () => {
    it('should display error message', () => {
      const { usePreferredSites } = require('@/hooks/usePreferredSites');
      usePreferredSites.mockReturnValue({
        preferences: ['mangadex'],
        isLoading: false,
        isSaving: false,
        error: 'Failed to save preferences',
        updatePreferences: jest.fn(),
        resetToDefaults: jest.fn(),
      });

      render(<PreferredSitesForm initialPreferences={['mangadex']} />);

      expect(
        screen.getByText('Failed to save preferences')
      ).toBeInTheDocument();
    });
  });

  describe('reset functionality', () => {
    it('should reset to initial preferences', async () => {
      const user = userEvent.setup();
      render(<PreferredSitesForm initialPreferences={['mangadex']} />);

      // Wait for custom sites to load
      await waitFor(() => {
        expect(screen.queryByText('Loading custom sites...')).not.toBeInTheDocument();
      });

      const manganelo = screen.getByLabelText('Select MangaNelo');
      await user.click(manganelo);

      const resetButton = screen.getByText('Reset');
      await user.click(resetButton);

      expect(manganelo).not.toBeChecked();
    });
  });

  describe('callbacks', () => {
    it('should call onSaveComplete callback', async () => {
      const user = userEvent.setup();
      const onSaveComplete = jest.fn();
      const { usePreferredSites } = require('@/hooks/usePreferredSites');
      usePreferredSites.mockReturnValue({
        preferences: ['mangadex'],
        isLoading: false,
        isSaving: false,
        error: null,
        updatePreferences: jest.fn(async () => {}),
        resetToDefaults: jest.fn(),
      });

      render(
        <PreferredSitesForm
          initialPreferences={['mangadex']}
          onSaveComplete={onSaveComplete}
        />
      );

      const saveButton = screen.getByText('Save Preferences');
      await user.click(saveButton);

      await waitFor(() => {
        expect(onSaveComplete).toHaveBeenCalled();
      });
    });
  });
});
