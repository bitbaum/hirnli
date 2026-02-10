import type { Metadata } from 'next';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { TYPE_LABELS } from '@/lib/config/foundations';
import { TEMPLATE_TYPES } from '@/lib/config/gesuch-templates';

export const metadata: Metadata = {
  title: 'Gesuch-Vorlagen — Revamp-IT',
  description: 'Gesuch-Vorlagen nach Stiftungstyp (Robert Schmuki Framework)',
};

export default function GesuchVorlagenPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-grey-dark">Gesuch-Vorlagen</h1>
        <p className="mb-2 text-lg text-text-light">
          Fertige Gesuch-Vorlagen nach Stiftungstyp, basierend auf Robert Schmukis Framework.
        </p>
        <p className="text-sm text-text-muted">
          Verwenden Sie diese Vorlagen, wenn Sie eine Stiftung ansprechen, die noch nicht in unserer Datenbank
          profiliert ist. Die Platzhalterfelder <span className="rounded bg-warning-bg px-1 py-0.5 font-mono text-xs text-warning">[Name der Stiftung]</span> können
          Sie vor dem Versand durch die tatsächlichen Angaben ersetzen.
        </p>
      </div>

      <div className="mb-8 rounded-lg bg-bg-light p-6">
        <h2 className="mb-3 text-lg font-semibold text-grey-dark">Stiftungstypen nach Robert Schmuki</h2>
        <p className="mb-4 text-sm text-text-light">
          Jeder Stiftungstyp erfordert eine andere Ansprache. Die Vorlagen sind entsprechend angepasst:
          Typ A erhält strukturierte, metriklastige Anträge; Typ C bekommt kurze, emotionale Anfragen.
        </p>
        <div className="grid gap-2 text-sm md:grid-cols-5">
          {TEMPLATE_TYPES.map((type) => {
            const label = TYPE_LABELS[type];
            return (
              <div key={type} className="rounded border border-border bg-white p-3">
                <p className="font-bold text-primary">{label.short}</p>
                <p className="text-xs text-text-light">{label.long}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {TEMPLATE_TYPES.map((type) => {
          const label = TYPE_LABELS[type];
          return (
            <Card key={type}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-grey-dark">
                    Typ {label.short}: {label.long}
                  </h3>
                  <p className="mt-1 text-sm text-text-light">{label.desc}</p>
                  <p className="mt-2 text-xs text-text-muted">
                    Empfohlene Ansprache: {label.approach}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/fundraising/gesuch-vorlagen/${type}`}
                    className="rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20"
                  >
                    Interaktiv
                  </Link>
                  <Link
                    href={`/fundraising/gesuch-vorlagen/${type}/dokument`}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-grey-dark hover:bg-bg-light"
                  >
                    Dokument (PDF)
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/fundraising/stiftungen"
          className="text-sm text-primary hover:underline"
        >
          &larr; Zurück zur Stiftungen-Übersicht
        </Link>
      </div>
    </div>
  );
}
