import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferredSitesStep } from '@/components/onboarding/PreferredSitesStep';
import { DEFAULT_PREFERRED_SITES } from '@/lib/platforms';

// Mock the PreferredSitesForm component
jest.mock('@/components/settings/PreferredSitesForm', () => ({
  PreferredSitesForm: ({
    onSaveComplete,
  }: {
    onSaveComplete?: () => void;
  }) => (
    <div data-testid="preferred-sites-form">
      <button onClick={onSaveComplete}>Save Form</button>
    </div>
  ),
}));

describe('PreferredSitesStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should render intro screen initially', () => {
      const onComplete = jest.fn();
      const onSkip = jest.fn();

      render(
        <PreferredSitesStep onComplete={onComplete} onSkip={onSkip} />
      );

      expect(
        screen.getByText('Configure Your Preferred Scan Sites')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/tell us which scanlation sites/i)
      ).toBeInTheDocument();
    });

    it('should render Configure Sites and Skip buttons', () => {
      const onComplete = jest.fn();
      const onSkip = jest.fn();

      render(
        <PreferredSitesStep onComplete={onComplete} onSkip={onSkip} />
      );

      expect(screen.getByText('Configure Sites')).toBeInTheDocument();
      expect(screen.getByText('Skip for Now')).toBeInTheDocument();
    });

    it('should show helpful tip', () => {
      const onComplete = jest.fn();
      const onSkip = jest.fn();

      render(
        <PreferredSitesStep onComplete={onComplete} onSkip={onSkip} />
      );

      expect(
        screen.getByText(/you can change these preferences anytime/i)
      ).toBeInTheDocument();
    });
  });

  describe('skip functionality', () => {
    it('should call onSkip when Skip button clicked', async () => {
      const user = userEvent.setup();
      const onComplete = jest.fn();
      const onSkip = jest.fn();

      render(
        <PreferredSitesStep onComplete={onComplete} onSkip={onSkip} />
      );

      const skipButton = screen.getByText('Skip for Now');
      await user.click(skipButton);

      expect(onSkip).toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('form display', () => {
    it('should show form when Configure Sites clicked', async () => {
      const user = userEvent.setup();
      const onComplete = jest.fn();
      const onSkip = jest.fn();

      render(
        <PreferredSitesStep onComplete={onComplete} onSkip={onSkip} />
      );

      const configureButton = screen.getByText('Configure Sites');
      await user.click(configureButton);

      await waitFor(() => {
        expect(screen.getByTestId('preferred-sites-form')).toBeInTheDocument();
      });
    });

    it('should pass default preferences to form', async () => {
      const user = userEvent.setup();
      const onComplete = jest.fn();
      const onSkip = jest.fn();

      render(
        <PreferredSitesStep onComplete={onComplete} onSkip={onSkip} />
      );

      const configureButton = screen.getByText('Configure Sites');
      await user.click(configureButton);

      await waitFor(() => {
        expect(screen.getByTestId('preferred-sites-form')).toBeInTheDocument();
      });
    });
  });

  describe('form completion', () => {
    it('should call onComplete with default preferences when form saved', async () => {
      const user = userEvent.setup();
      const onComplete = jest.fn();
      const onSkip = jest.fn();

      render(
        <PreferredSitesStep onComplete={onComplete} onSkip={onSkip} />
      );

      const configureButton = screen.getByText('Configure Sites');
      await user.click(configureButton);

      await waitFor(() => {
        expect(screen.getByTestId('preferred-sites-form')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save Form');
      await user.click(saveButton);

      expect(onComplete).toHaveBeenCalledWith(DEFAULT_PREFERRED_SITES);
    });

    it('should hide form after completion', async () => {
      const user = userEvent.setup();
      const onComplete = jest.fn();
      const onSkip = jest.fn();

      render(
        <PreferredSitesStep onComplete={onComplete} onSkip={onSkip} />
      );

      const configureButton = screen.getByText('Configure Sites');
      await user.click(configureButton);

      await waitFor(() => {
        expect(screen.getByTestId('preferred-sites-form')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save Form');
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId('preferred-sites-form')
        ).not.toBeInTheDocument();
      });
    });
  });
});
