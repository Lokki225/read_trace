export function DashboardSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading your series library">
      <div
        data-testid="skeleton-tabs"
        className="flex gap-2 border-b border-[#FFEDE3] mb-6"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 rounded-t bg-[#FFEDE3] animate-pulse"
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            data-testid="skeleton-card"
            className="rounded-lg bg-[#FFEDE3] animate-pulse"
            style={{ height: '200px' }}
          />
        ))}
      </div>

      <span className="sr-only">Loading series library...</span>
    </div>
  );
}
