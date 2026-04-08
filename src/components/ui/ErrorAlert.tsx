/**
 * Shared error alert component.
 *
 * Inline error banner with optional retry button or back link.
 * Use fullPage=true to center within a min-h-screen container.
 */

import { Button } from '@/components/ui/Button';

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
    <div className="rounded-lg border border-danger/20 bg-danger/10 p-4">
      <p className="text-danger">Fehler: {error}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="danger"
          size="sm"
          className="mt-2"
        >
          Erneut versuchen
        </Button>
      )}
      {backLink && (
        <Button
          href={backLink.href}
          variant="ghost"
          size="sm"
          className="mt-2 text-primary"
        >
          {backLink.label}
        </Button>
      )}
    </div>
  );
}
