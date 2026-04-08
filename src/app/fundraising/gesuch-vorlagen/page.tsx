import type { Metadata } from 'next';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { TYPE_LABELS } from '@/lib/config/foundations';
import { TYPE_TEMPLATE_KEYS, TEMPLATE_LABELS, SCHWERPUNKT_TEMPLATE_TYPES } from '@/lib/config/gesuch-templates';
import { SCHWERPUNKTE, SCHWERPUNKT_IDS } from '@/lib/config/schwerpunkte';

export const metadata: Metadata = {
  title: `Gesuch-Vorlagen — ${ORG_PROFILE.name}`,
  description: 'Gesuch-Vorlagen nach Schwerpunkt und Stiftungstyp — themenspezifische und typbasierte Referenzvorlagen',
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
          <Button href={`/fundraising/gesuch-vorlagen/${slug}`} variant="soft">
            Interaktiv
          </Button>
          <Button href={`/fundraising/gesuch-vorlagen/${slug}/dokument`} variant="secondary">
            Dokument (PDF)
          </Button>
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
          Vorlagen nach Schwerpunkt (themenspezifisch) und Stiftungstyp (tonspezifisch).
        </p>
        <p className="text-sm text-text-muted">
          Jede Vorlage zeigt die richtige Struktur, den passenden Ton und relevante Inhalte.
          Platzhalter wie <span className="rounded bg-warning-bg px-1 py-0.5 font-mono text-xs text-warning">[Name der Stiftung]</span> ersetzen
          Sie mit echten Angaben.
        </p>
      </div>

      {/* Section 1: Nach Schwerpunkt (primary — the new way) */}
      <section className="mb-10">
        <h2 className="mb-2 text-xl font-semibold text-grey-dark">Nach Schwerpunkt</h2>
        <p className="mb-4 text-sm text-text-light">
          Wählen Sie den thematischen Schwerpunkt, der zur Stiftung passt.
          Gleiches Budget, unterschiedliche Framing — die Stiftung sieht genau die Aktivitäten,
          die ihrem Förderzweck entsprechen.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {SCHWERPUNKT_IDS.map((id) => {
            const sp = SCHWERPUNKTE[id];
            return (
              <Card key={id} padding={false} className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">{sp.icon}</span>
                  <div>
                    <h3 className="font-semibold text-grey-dark">{sp.shortLabel}</h3>
                    <p className="text-xs text-text-muted">{sp.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SCHWERPUNKT_TEMPLATE_TYPES.map((type) => {
                    const typeLabel = TYPE_LABELS[type];
                    return (
                      <div key={type} className="flex gap-1">
                        <Link
                          href={`/fundraising/gesuch-vorlagen/${id}/${type}`}
                          className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                          title={`${sp.shortLabel} × ${typeLabel.long}`}
                        >
                          {typeLabel.short}
                        </Link>
                        <Link
                          href={`/fundraising/gesuch-vorlagen/${id}/${type}/dokument`}
                          className="rounded-md border border-border px-2 py-1.5 text-xs text-text-muted hover:bg-bg-light"
                          title={`${sp.shortLabel} × ${typeLabel.long} (Dokument)`}
                        >
                          PDF
                        </Link>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  A = Professionell · B = Familienstiftung · C = Klein
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Section 2: Universelle Vorlage */}
      <section className="mb-10">
        <h2 className="mb-2 text-xl font-semibold text-grey-dark">Universelle Vorlage</h2>
        <p className="mb-4 text-sm text-text-light">
          Verwenden Sie diese Vorlage, wenn Sie den Fokus der Stiftung noch nicht kennen.
          Sie enthält das gesamte {ORG_PROFILE.name}-Profil mit allen Schwerpunkten.
        </p>
        <TemplateCard
          slug="generisch"
          title={generisch.long}
          description={generisch.desc}
        />
      </section>

      {/* Section 3: Nach Stiftungstyp (legacy) */}
      <section className="mb-10">
        <h2 className="mb-2 text-xl font-semibold text-grey-dark">Nach Stiftungstyp</h2>
        <p className="mb-4 text-sm text-text-light">
          Klassische Vorlagen nur nach Typ — wenn Sie den Schwerpunkt noch nicht kennen,
          aber den Stiftungstyp schon. Inkl. D (Corporate) und Netzwerk.
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
