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
    red: 'bg-error',
    yellow: 'bg-warning',
    green: 'bg-success'
  };

  const textColorClasses: Record<'red' | 'yellow' | 'green', string> = {
    red: 'text-error',
    yellow: 'text-warning',
    green: 'text-success'
  };

  const barWidth = `${validation.score}%`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">Password strength</span>
        <span className={cn('text-xs font-semibold', textColorClasses[strengthColor])}>
          {strengthLabel}
        </span>
      </div>

      <div className="h-2 w-full bg-border rounded-full overflow-hidden">
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
            <li key={index} className="text-xs text-error flex items-start gap-1">
              <span className="text-error mt-0.5">•</span>
              <span>{error}</span>
            </li>
          ))}
        </ul>
      )}

      {validation.isValid && validation.score < 70 && (
        <div className="mt-2">
          <p className="text-xs text-muted">
            <span className="font-medium">Tip:</span> Use a longer password with mixed characters for better security.
          </p>
        </div>
      )}
    </div>
  );
}
