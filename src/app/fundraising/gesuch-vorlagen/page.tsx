import type { Metadata } from 'next';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { TYPE_LABELS } from '@/lib/config/foundations';
import { TYPE_TEMPLATE_KEYS, TEMPLATE_LABELS } from '@/lib/config/gesuch-templates';

export const metadata: Metadata = {
  title: 'Gesuch-Vorlagen — Revamp-IT',
  description: 'Gesuch-Referenzvorlagen nach Stiftungstyp (A/B/C/D/Netzwerk) plus universelle Fallback-Vorlage',
};

function TemplateCard({ slug, title, description, subtitle }: {
  slug: string;
  title: string;
  description: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-grey-dark">{title}</h3>
          <p className="mt-1 text-sm text-text-light">{description}</p>
          {subtitle && (
            <p className="mt-2 text-xs text-text-muted">{subtitle}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/fundraising/gesuch-vorlagen/${slug}`}
            className="rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20"
          >
            Interaktiv
          </Link>
          <Link
            href={`/fundraising/gesuch-vorlagen/${slug}/dokument`}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-grey-dark hover:bg-bg-light"
          >
            Dokument (PDF)
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default function GesuchVorlagenPage() {
  const generisch = TEMPLATE_LABELS['generisch'];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-grey-dark">Gesuch-Vorlagen</h1>
        <p className="mb-2 text-lg text-text-light">
          6 Referenz-Vorlagen: nach Stiftungstyp (A/B/C/D/Netzwerk) + eine universelle Fallback-Vorlage.
        </p>
        <p className="text-sm text-text-muted">
          Verwenden Sie diese als Ausgangspunkt für neue Stiftungen. Jede Vorlage zeigt die richtige Struktur,
          den passenden Ton und relevante Inhalte für den jeweiligen Foundation-Typ.
          Platzhalter wie <span className="rounded bg-warning-bg px-1 py-0.5 font-mono text-xs text-warning">[Name der Stiftung]</span> ersetzen
          Sie mit echten Angaben.
        </p>
      </div>

      {/* Section 1: Universelle Vorlage */}
      <section className="mb-10">
        <h2 className="mb-2 text-xl font-semibold text-grey-dark">Universelle Vorlage</h2>
        <p className="mb-4 text-sm text-text-light">
          Verwenden Sie diese Vorlage, wenn Sie den Fokus der Stiftung noch nicht kennen.
          Sie enthält das gesamte Revamp-IT-Profil mit allen Schwerpunkten.
        </p>
        <TemplateCard
          slug="generisch"
          title={generisch.long}
          description={generisch.desc}
        />
      </section>

      {/* Section 2: Nach Stiftungstyp (Robert Schmuki) */}
      <section className="mb-10">
        <h2 className="mb-2 text-xl font-semibold text-grey-dark">Nach Stiftungstyp</h2>
        <p className="mb-4 text-sm text-text-light">
          Jeder Stiftungstyp benötigt eine andere Ansprache und Struktur:
          Typ A (professionalisierte Foundations) = strukturiert & metriklastig.
          Typ C (kleine Familienstiftungen) = kurz & persönlich.
          Typ D (Corporate) = business-case & ROI.
          Netzwerk = Partnerschaft statt Förderantrag.
        </p>
        <div className="mb-4 grid gap-2 text-sm md:grid-cols-5">
          {TYPE_TEMPLATE_KEYS.map((type) => {
            const label = TYPE_LABELS[type];
            return (
              <div key={type} className="rounded border border-border bg-white p-3">
                <p className="font-bold text-primary">{label.short}</p>
                <p className="text-xs text-text-light">{label.long}</p>
              </div>
            );
          })}
        </div>
        <div className="space-y-4">
          {TYPE_TEMPLATE_KEYS.map((type) => {
            const label = TYPE_LABELS[type];
            return (
              <TemplateCard
                key={type}
                slug={type}
                title={`Typ ${label.short}: ${label.long}`}
                description={label.desc}
                subtitle={`Empfohlene Ansprache: ${label.approach}`}
              />
            );
          })}
        </div>
      </section>


      <div className="mt-8 rounded-lg bg-bg-light p-6 text-center">
        <p className="mb-3 text-sm text-text-light">
          Für massgeschneiderte Gesuche mit stiftungsspezifischer Argumentation:
        </p>
        <Link
          href="/fundraising/stiftungen"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Stiftungen-Übersicht mit personalisierten Gesuchen &rarr;
        </Link>
      </div>
    </div>
  );
}
