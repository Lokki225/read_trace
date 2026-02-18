import { memo } from 'react';
import Image from 'next/image';
import { UserSeries } from '@/model/schemas/dashboard';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';

interface SeriesCardProps {
  series: UserSeries;
  index?: number;
  onClick?: (series: UserSeries) => void;
}

function SeriesCardInner({ series, index = 0, onClick }: SeriesCardProps) {
  const handleClick = () => onClick?.(series);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(series);
    }
  };

  return (
    <article
      data-testid={`series-card-${index}`}
      className={[
        'flex flex-col bg-white rounded-lg border border-[#FFEDE3] overflow-hidden',
        'transition-all duration-200',
        onClick
          ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#FF7A45] focus:ring-offset-2'
          : '',
      ].join(' ')}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${series.title} — ${series.platform}`}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      {/* Cover image area */}
      <div className="relative w-full" style={{ height: '140px' }}>
        {series.cover_url ? (
          <Image
            src={series.cover_url}
            alt={`${series.title} cover`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div
            data-testid="image-placeholder"
            className="w-full h-full flex items-center justify-center bg-[#FFEDE3]"
            aria-hidden="true"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="40" height="40" rx="4" fill="#FFD5BE" />
              <path
                d="M10 28L16 20L20 24L26 16L30 28H10Z"
                fill="#FF7A45"
                opacity="0.6"
              />
              <circle cx="15" cy="14" r="3" fill="#FF7A45" opacity="0.6" />
            </svg>
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-2 left-2">
          <StatusBadge status={series.status} />
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        {/* Title */}
        <h3
          className="text-[#222222] font-semibold text-sm leading-tight line-clamp-2"
          title={series.title}
        >
          {series.title}
        </h3>

        {/* Platform */}
        <p className="text-[#6C757D] text-xs truncate">{series.platform}</p>

        {/* Genres */}
        {series.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {series.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="text-xs px-1.5 py-0.5 rounded bg-[#FFF8F2] text-[#FF7A45] border border-[#FFEDE3]"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-auto pt-1">
          <ProgressBar percentage={series.progress_percentage} />
        </div>
      </div>
    </article>
  );
}

export const SeriesCard = memo(SeriesCardInner);
