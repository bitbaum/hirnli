/**
 * Shared loading state components.
 *
 * PageLoadingSpinner — full-viewport spinner for Next.js loading.tsx files
 * LoadingState — centered spinner with optional label for async data sections
 */

export function PageLoadingSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export function LoadingState({
  label,
  className = 'h-96',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        {label && <p className="text-sm text-text-muted">{label}</p>}
      </div>
    </div>
  );
}
