import { formatProgressPercentage } from '@/lib/progress';

interface ProgressBarProps {
  percentage: number;
  className?: string;
}

export function ProgressBar({ percentage, className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(percentage)));
  const label = formatProgressPercentage(clamped);

  return (
    <div className={['w-full', className].join(' ')}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Reading progress: ${label}`}
        className="w-full h-1.5 bg-[#FFEDE3] rounded-full overflow-hidden"
      >
        <div
          data-testid="progress-fill"
          className="h-full bg-[#FF7A45] rounded-full transition-all duration-200"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-xs text-[#6C757D] mt-0.5 block">{label}</span>
    </div>
  );
}
