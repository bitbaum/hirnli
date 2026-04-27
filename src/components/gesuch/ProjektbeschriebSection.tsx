import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import { GESUCH_TEXT, findEvidence } from '@/lib/config/stories';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { extractPurposeCore } from '@/lib/domain/bridge-composer';
import PhotoPlaceholder from './PhotoPlaceholder';

interface ProjektbeschriebSectionProps {
  dok: ComposedGesuchDokument;
}

export default function ProjektbeschriebSection({ dok }: ProjektbeschriebSectionProps) {
  return (
    <section className="gesuch-section mb-12">
      <h2 className="mb-2 border-b-2 border-grey-dark pb-2 text-2xl font-bold text-grey-dark">
        Projektbeschrieb
      </h2>
      <p className="mb-8 text-sm text-text-muted">
        {dok.organization.organization.name} — Fördergesuch an {dok.foundation.name}
      </p>

      {/* 1. Zusammenfassung — with foundation purpose (Gap #3) */}
      <div className="mb-8">
        <h3 className="mb-2 text-lg font-semibold text-grey-dark">1. Zusammenfassung</h3>
        {dok.foundation.purposeSummary && (
          <p className="mb-3 text-sm leading-relaxed text-text">
            Die {dok.foundation.name} hat sich dem Thema {extractPurposeCore(dok.foundation.purposeSummary)} verschrieben.
            {' '}{ORG_PROFILE.name} adressiert dieses Anliegen direkt:
          </p>
        )}
        <p className="text-sm leading-relaxed text-text">
          {GESUCH_TEXT.zusammenfassung_intro}
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
          {/* Photo placeholder: WHY section (Gap #2) */}
          {dok.photos.why.map((slot) => (
            <PhotoPlaceholder key={slot.id} slot={slot} />
          ))}
        </div>
      )}

      {/* Anecdotes — human stories after Ausgangslage (Gap #1) */}
      {dok.anecdotes.why.length > 0 && (
        <div className="mb-8 rounded border border-border bg-surface-alt p-4">
          <p className="mb-2 text-sm font-semibold text-grey-dark">Aus der Praxis</p>
          {dok.anecdotes.why.map((a) => (
            <p key={a.id} className="mb-2 text-sm leading-relaxed text-text italic">
              {a.template}
            </p>
          ))}
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
              <p className="text-sm text-text-muted">{pp.label}</p>
            </div>
          ))}
        </div>
        {dok.story.how.competencies.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dok.story.how.competencies.map((comp) => (
              <div key={comp.headline}>
                <p className="mb-1 text-sm font-semibold text-grey-dark">{comp.headline}</p>
                <ul className="text-sm text-text-light">
                  {comp.capabilities.slice(0, 4).map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
                {/* Evidence citations per competency (Gap #4) */}
                {comp.evidence && comp.evidence.length > 0 && (
                  <p className="mt-1 text-xs text-text-muted">
                    Quellen: {comp.evidence
                      .map((key) => findEvidence(key))
                      .filter((e): e is NonNullable<typeof e> => e !== null)
                      .map((e) => `${e.title} (${e.year})`)
                      .join('; ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* HOW anecdote (Gap #1) */}
        {dok.anecdotes.how.length > 0 && (
          <div className="mt-4 rounded border border-border bg-surface-alt p-4">
            {dok.anecdotes.how.map((a) => (
              <p key={a.id} className="text-sm leading-relaxed text-text italic">
                {a.template}
              </p>
            ))}
          </div>
        )}

        {/* Photo placeholder: HOW section (Gap #2) */}
        {dok.photos.how.map((slot) => (
          <PhotoPlaceholder key={slot.id} slot={slot} />
        ))}

        {/* Partner highlights — Stadt Zürich prominent mention (Gap #5) */}
        {dok.partnerHighlights.length > 0 && (
          <div className="mt-4 rounded border border-primary/20 bg-primary/5 p-4">
            <p className="mb-2 text-sm font-semibold text-grey-dark">Referenz-Partnerschaften</p>
            {dok.partnerHighlights.map((p) => (
              <div key={p.name}>
                <p className="text-sm leading-relaxed text-text">
                  <span className="font-semibold">{p.name}:</span> {p.relationship}
                </p>
                <p className="mt-1 text-xs text-text-muted">{p.since}</p>
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

              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
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
          {/* Photo placeholder: projects section (Gap #2) */}
          {dok.photos.projects.map((slot) => (
            <PhotoPlaceholder key={slot.id} slot={slot} />
          ))}
        </div>
      )}

      {/* 5. Wirkungsmessung */}
      <div className="mb-8">
        <h3 className="mb-2 text-lg font-semibold text-grey-dark">5. Wirkungsmessung und Nachhaltigkeit</h3>
        <p className="text-sm leading-relaxed text-text">
          {GESUCH_TEXT.wirkungsmessung.indicators}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text">
          {GESUCH_TEXT.wirkungsmessung.sustainability}
        </p>
      </div>
    </section>
  );
}
