/**
 * Shared error alert component.
 *
 * Inline error banner with optional retry button or back link.
 * Use fullPage=true to center within a min-h-screen container.
 */

import Link from 'next/link';

export function ErrorAlert({
  error,
  onRetry,
  backLink,
}: {
  error: string | null;
  onRetry?: () => void;
  backLink?: { href: string; label: string };
}) {
  if (!error) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-red-700">Fehler: {error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
        >
          Erneut versuchen
        </button>
      )}
      {backLink && (
        <Link
          href={backLink.href}
          className="mt-2 block text-sm text-primary hover:underline"
        >
          {backLink.label}
        </Link>
      )}
    </div>
  );
}
