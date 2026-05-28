/**
 * Shared loading state components.
 *
 * PageLoadingSpinner — full-viewport spinner for Next.js loading.tsx files
 * LoadingState — centered spinner with optional label for async data sections
 *
 * Both consume `<Spinner>` so the inline glyph and the page-level affordance
 * stay visually in sync if we ever retune sizes or arc colours.
 */

import Spinner from './Spinner';

export function PageLoadingSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner size="xl" tone="accent" label="Seite wird geladen…" />
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
        <Spinner size="lg" tone="accent" className="mx-auto mb-4 block" label={label ?? 'Lädt…'} />
        {label && <p className="text-sm text-text-muted">{label}</p>}
      </div>
    </div>
  );
}
