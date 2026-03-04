import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-bold text-grey-dark mb-3">
        Seite nicht gefunden
      </h2>
      <p className="text-text-light mb-6 max-w-md">
        Die angeforderte Seite existiert nicht oder wurde verschoben.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
