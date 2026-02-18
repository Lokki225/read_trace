import { cn } from '@/lib/utils';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn('block text-sm font-medium text-gray-700', className)}
      {...props}
    />
  );
}
