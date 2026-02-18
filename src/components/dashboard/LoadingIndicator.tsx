'use client';

import React from 'react';

interface LoadingIndicatorProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  isLoading,
  message = 'Loading more series...',
}) => {
  if (!isLoading) return null;

  return (
    <div
      className="flex items-center justify-center py-8"
      role="status"
      aria-busy={isLoading}
      aria-label={message}
      data-testid="loading-indicator"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
        </div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
