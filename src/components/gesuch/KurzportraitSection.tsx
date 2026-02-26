import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import { GESUCH_TEXT } from '@/lib/config/stories';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import PhotoPlaceholder from './PhotoPlaceholder';

interface KurzportraitSectionProps {
  dok: ComposedGesuchDokument;
}

export default function KurzportraitSection({ dok }: KurzportraitSectionProps) {
  return (
    <section className="gesuch-section mb-12">
      <h2 className="mb-2 border-b-2 border-grey-dark pb-2 text-2xl font-bold text-grey-dark">
        Kurzportrait {ORG_PROFILE.name}
      </h2>
      <p className="mb-6 text-xs text-text-muted">
        {GESUCH_TEXT.kurzportrait_subtitle}
      </p>

      {/* Facts grid */}
      <div className="mb-6 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
        {dok.kurzportrait.facts.map((fact) => (
          <div key={fact.label} className="flex justify-between border-b border-border py-1.5 text-sm">
            <span className="text-text-muted">{fact.label}</span>
            <span className="font-medium text-grey-dark">{fact.value}</span>
          </div>
        ))}
      </div>

      {/* Activities */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-semibold text-grey-dark">Tätigkeitsfelder</h3>
        <div className="grid grid-cols-1 gap-1 text-sm text-text-light sm:grid-cols-2">
          {dok.kurzportrait.activities.map((a) => (
            <p key={a}>• {a}</p>
          ))}
        </div>
      </div>

      {/* Unique selling points */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-semibold text-grey-dark">Alleinstellungsmerkmale</h3>
        <div className="grid grid-cols-1 gap-1 text-sm text-text-light sm:grid-cols-2">
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
      <div className="rounded border border-border p-4 text-sm">
        <p className="mb-1 font-semibold text-grey-dark">Online-Transparenz</p>
        <p className="text-text-light">
          Alle Kennzahlen, Finanzdaten und Wirkungsindikatoren sind öffentlich einsehbar
          unter <a href={ORG_PROFILE.platform.url} className="text-primary">{ORG_PROFILE.platform.url.replace('https://', '')}</a>.
          Jede Zahl ist bis zur Quelle nachvollziehbar.
        </p>
        <p className="mt-2 text-text-light">
          Personalisierte Projektübersicht: <a href={dok.landingPageUrl} className="text-primary">{dok.landingPageUrl}</a>
        </p>
      </div>
    </section>
  );
}
