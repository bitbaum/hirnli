import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import { resolveStories } from '@/lib/config/stories';
import PhotoPlaceholder from './PhotoPlaceholder';

interface KurzportraitSectionProps {
  dok: ComposedGesuchDokument;
}

export default function KurzportraitSection({ dok }: KurzportraitSectionProps) {
  // Filled for this organisation. Read straight from the module these
  // strings render as "seit {{founded}}" — the templates are shared, the
  // values are not, and only resolveStories() joins the two.
  const { GESUCH_TEXT } = resolveStories(dok.tenant);
  return (
    <section className="gesuch-section mb-12">
      <h2 className="mb-2 border-b-2 border-grey-dark pb-2 heading-section">
        Kurzportrait {dok.tenant.name}
      </h2>
      <p className="mb-6 text-sm text-text-muted">{GESUCH_TEXT.kurzportrait_subtitle}</p>

      {/* Facts grid */}
      <div className="mb-6 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
        {dok.kurzportrait.facts.map((fact) => (
          <div
            key={fact.label}
            className="flex justify-between border-b border-border-default py-1.5 text-sm"
          >
            <span className="text-text-muted">{fact.label}</span>
            <span className="font-medium text-text-primary">{fact.value}</span>
          </div>
        ))}
      </div>

      {/* Activities */}
      <div className="mb-6">
        <h3 className="mb-2 heading-detail">Tätigkeitsfelder</h3>
        <div className="grid grid-cols-1 gap-1 text-sm text-text-secondary sm:grid-cols-2">
          {dok.kurzportrait.activities.map((a) => (
            <p key={a}>• {a}</p>
          ))}
        </div>
      </div>

      {/* Unique selling points */}
      <div className="mb-6">
        <h3 className="mb-2 heading-detail">Alleinstellungsmerkmale</h3>
        <div className="grid grid-cols-1 gap-1 text-sm text-text-secondary sm:grid-cols-2">
          {dok.kurzportrait.unique.map((u) => (
            <p key={u}>• {u}</p>
          ))}
        </div>
      </div>

      {/* Team photo placeholder (Gap #2) */}
      {dok.photos.kurzportrait.map((slot) => (
        <PhotoPlaceholder key={slot.id} slot={slot} />
      ))}

      {/* Online presence */}
      <div className="rounded border border-border-default p-4 text-sm">
        <p className="mb-1 heading-detail">Online-Transparenz</p>
        {/* The claim is "look it up at this address". Without an address there
            is nothing to look up, so the sentence goes rather than trailing off
            — this paragraph is read by a foundation assessing credibility. */}
        {dok.tenant.siteUrl && (
          <p className="text-text-secondary">
            Alle Kennzahlen, Finanzdaten und Wirkungsindikatoren sind öffentlich einsehbar unter{' '}
            <a href={dok.tenant.siteUrl} className="text-primary">
              {new URL(dok.tenant.siteUrl).hostname}
            </a>
            . Jede Zahl ist bis zur Quelle nachvollziehbar.
          </p>
        )}
        <p className="mt-2 text-text-secondary">
          Personalisierte Projektübersicht:{' '}
          <a href={dok.landingPageUrl} className="text-primary">
            {dok.landingPageUrl}
          </a>
        </p>
      </div>
    </section>
  );
}
