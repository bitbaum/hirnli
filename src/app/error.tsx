'use client';

import { Button } from '@/components/ui/Button';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-bold text-grey-dark mb-3">
        Etwas ist schiefgelaufen
      </h2>
      <p className="text-text-light mb-6 max-w-md">
        Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
      </p>
      <Button variant="soft" onClick={reset}>
        Erneut versuchen
      </Button>
    </div>
  );
}
