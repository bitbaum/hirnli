'use client';

import { Button } from '@/components/ui/Button';

export default function StiftungenError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="heading-section mb-3">
        Stiftungen konnten nicht geladen werden
      </h2>
      <p className="text-text-light mb-6 max-w-md">
        Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.
      </p>
      <Button variant="soft" onClick={reset}>
        Erneut versuchen
      </Button>
    </div>
  );
}
