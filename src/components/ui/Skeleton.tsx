export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-surface-container-high ${className}`}
      aria-hidden="true"
    />
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-gutter py-margin animate-in fade-in" role="status" aria-label="Cargando...">
      <div className="flex flex-col gap-space-lg">
        {/* Header skeleton */}
        <div className="flex flex-col gap-space-sm">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        {/* Content skeleton */}
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <span className="sr-only">Cargando contenido...</span>
    </div>
  );
}
