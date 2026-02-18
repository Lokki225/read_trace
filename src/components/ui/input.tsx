import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2 border border-gray-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
          'placeholder:text-gray-400',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
