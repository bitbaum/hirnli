import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import { CORE_FACTS } from '@/lib/config/stories';

interface ProjektbeschriebSectionProps {
  dok: ComposedGesuchDokument;
}

export default function ProjektbeschriebSection({ dok }: ProjektbeschriebSectionProps) {
  const metrics = CORE_FACTS.metrics;

  return (
    <section className="gesuch-section mb-12">
      <h2 className="mb-2 border-b-2 border-grey-dark pb-2 text-2xl font-bold text-grey-dark">
        Projektbeschrieb
      </h2>
      <p className="mb-8 text-xs text-text-muted">
        {dok.organization.organization.name} — Fördergesuch an {dok.foundation.name}
      </p>

      {/* 1. Zusammenfassung */}
      <div className="mb-8">
        <h3 className="mb-2 text-lg font-semibold text-grey-dark">1. Zusammenfassung</h3>
        <p className="text-sm leading-relaxed text-text">
          Revamp-IT verlängert die Lebensdauer von IT-Geräten durch professionelles Refurbishing
          und bietet gleichzeitig Arbeitsintegrationsplätze für Menschen am Rand des Arbeitsmarktes.
          {dok.story.why && ` ${dok.story.why.solution}`}
        </p>
      </div>

      {/* 2. Ausgangslage / Problem */}
      {dok.story.why && (
        <div className="mb-8">
          <h3 className="mb-2 text-lg font-semibold text-grey-dark">2. Ausgangslage und Problemstellung</h3>
          <p className="text-sm leading-relaxed text-text">
            {dok.story.why.problem}
          </p>
          {dok.story.evidence.length > 0 && (
            <p className="mt-2 text-xs text-text-muted">
              Quellen: {dok.story.evidence.map((e) => `${e.title} (${e.year})`).join('; ')}
            </p>
          )}
        </div>
      )}

      {/* 3. Trägerschaft */}
      <div className="mb-8">
        <h3 className="mb-2 text-lg font-semibold text-grey-dark">3. Trägerschaft und Kompetenzen</h3>
        <p className="mb-3 text-sm leading-relaxed text-text">
          {dok.story.how.track_record.text}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {dok.story.how.track_record.proof_points.map((pp) => (
            <div key={pp.label} className="rounded border border-border p-2 text-center">
              <p className="text-lg font-bold text-primary">{pp.value}</p>
              <p className="text-xs text-text-muted">{pp.label}</p>
            </div>
          ))}
        </div>
        {dok.story.how.competencies.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dok.story.how.competencies.map((comp) => (
              <div key={comp.headline}>
                <p className="mb-1 text-sm font-semibold text-grey-dark">{comp.headline}</p>
                <ul className="text-xs text-text-light">
                  {comp.capabilities.slice(0, 4).map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Zielsetzung und Massnahmen */}
      {dok.story.projects.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-2 text-lg font-semibold text-grey-dark">4. Zielsetzung und Massnahmen</h3>
          {dok.story.projects.map((project) => (
            <div key={project.title} className="mb-6">
              <p className="mb-1 font-semibold text-grey-dark">{project.title}</p>
              <p className="mb-3 text-sm text-text-light">{project.summary}</p>

              <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
                <div>
                  <p className="mb-1 font-semibold text-primary">Ziele</p>
                  <ul className="text-text-light">
                    {project.goals.map((g) => <li key={g}>• {g}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-accent">Massnahmen</p>
                  <ul className="text-text-light">
                    {project.activities.map((a) => <li key={a}>• {a}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-secondary">Erwartete Wirkung</p>
                  <ul className="text-text-light">
                    {project.outcomes.map((o) => <li key={o}>• {o}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Wirkungsmessung — metrics interpolated from CORE_FACTS */}
      <div className="mb-8">
        <h3 className="mb-2 text-lg font-semibold text-grey-dark">5. Wirkungsmessung und Nachhaltigkeit</h3>
        <p className="text-sm leading-relaxed text-text">
          Revamp-IT misst die Wirkung seiner Aktivitäten anhand konkreter Indikatoren:
          CO₂-Einsparung pro Gerät ({metrics.environmental.co2_per_laptop} kg/Laptop), Anzahl betreuter Praktikant:innen,
          Wiedereingliederungsquote (~{metrics.social.success_rate === 'erfolgsquote_40' ? '40' : metrics.social.success_rate}%), sowie die Reuse-Rate ({metrics.environmental.reuse_rate}%) der eingegangenen Geräte.
          Die Ergebnisse werden in unserem transparenten Online-Dashboard publiziert.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text">
          Revamp-IT hat über 20 Jahre bewiesen, dass das Kerngeschäft tragfähig ist.
          Stiftungsgelder ermöglichen die gezielte Skalierung: grösserer Standort, Programmleitung, Sovereign-AI-Infrastruktur und mehr Ausbildungsplätze.
        </p>
      </div>
    </section>
  );
}
