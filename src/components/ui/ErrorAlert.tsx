/**
 * Shared error alert component.
 *
 * Two modes:
 *   <ErrorAlert error={msg} onRetry={fn} />     — "Fehler: {msg}" with optional retry/back
 *   <ErrorAlert className="mb-4">{msg}</ErrorAlert> — renders children directly, no prefix
 *
 * Renders nothing when both error and children are falsy.
 */

import { Button } from '@/components/ui/Button';

export function ErrorAlert({
  error,
  children,
  className,
  onRetry,
  backLink,
}: {
  error?: string | null;
  children?: React.ReactNode;
  className?: string;
  onRetry?: () => void;
  backLink?: { href: string; label: string };
}) {
  if (!error && !children) return null;

  return (
    <div className={`rounded-lg border border-danger/20 bg-danger/10 px-4 py-3${className ? ` ${className}` : ''}`}>
      <p className="text-sm text-danger-text">{children ?? `Fehler: ${error}`}</p>
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
          className="mt-2 text-primary-text"
        >
          {backLink.label}
        </Button>
      )}
    </div>
  );
}
