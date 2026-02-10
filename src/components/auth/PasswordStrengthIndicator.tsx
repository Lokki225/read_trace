'use client';

import { useMemo } from 'react';
import { validatePassword, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/backend/services/auth/passwordValidator';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const validation = useMemo(() => validatePassword(password), [password]);
  const strengthLabel = getPasswordStrengthLabel(validation.score);
  const strengthColor = getPasswordStrengthColor(validation.score) as 'red' | 'yellow' | 'green';

  const colorClasses: Record<'red' | 'yellow' | 'green', string> = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500'
  };

  const textColorClasses: Record<'red' | 'yellow' | 'green', string> = {
    red: 'text-red-700',
    yellow: 'text-yellow-700',
    green: 'text-green-700'
  };

  const barWidth = `${validation.score}%`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">Password strength</span>
        <span className={cn('text-xs font-semibold', textColorClasses[strengthColor])}>
          {strengthLabel}
        </span>
      </div>

      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300 ease-out', colorClasses[strengthColor])}
          style={{ width: barWidth }}
          role="progressbar"
          aria-valuenow={validation.score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Password strength: ${strengthLabel}`}
        />
      </div>

      {validation.errors.length > 0 && (
        <ul className="mt-2 space-y-1" role="list">
          {validation.errors.map((error, index) => (
            <li key={index} className="text-xs text-red-600 flex items-start gap-1">
              <span className="text-red-500 mt-0.5">•</span>
              <span>{error}</span>
            </li>
          ))}
        </ul>
      )}

      {validation.isValid && validation.score < 70 && (
        <div className="mt-2">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Tip:</span> Use a longer password with mixed characters for better security.
          </p>
        </div>
      )}
    </div>
  );
}
