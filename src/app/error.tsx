'use client';

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
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Erneut versuchen
      </button>
    </div>
  );
}
