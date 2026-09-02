import Card from '@/components/ui/Card';
import type { Foundation } from '@/lib/schemas/foundation';
import { UNKNOWN_FIELD } from '@/lib/schemas/foundation';
import { FIT_CONFIG } from '@/lib/config/foundations';
import { SCORING_ENGINE } from '@/lib/config/fit-scoring';
import { getFitLevel } from '@/lib/domain/foundation-helpers';
import { explainFitScore } from '@/lib/domain/fit-scoring';
import ProgressBar from '@/components/ui/ProgressBar';
import ThemeBadgeList from './ThemeBadgeList';
import type { FitNarrative, ThemeAlignment } from '@/lib/domain/foundation-contextualization';

interface FitAnalysisProps {
  foundation: Foundation;
  fitNarrative?: FitNarrative;
  themeAlignments?: ThemeAlignment[];
}

export default function FitAnalysis({
  foundation: f,
  fitNarrative,
  themeAlignments,
}: FitAnalysisProps) {
  const fitLevel = getFitLevel(f);
  const fit = FIT_CONFIG[fitLevel];
  const isUnassessed = fitLevel === 0;
  const explanation = explainFitScore({
    themes: f.themes,
    applicationMethod: f.applicationMethod, // isFunder lives only in the ingest pipeline; false here means unknown-method funder
    // fallbacks reconcile as inconsistent → honest fallback text instead of wrong numbers
    isFunder: false,
    fitScore: f.fitScore,
  });

  return (
    <Card>
      <h3 className="mb-4 heading-card">Fit-Analyse</h3>

      {isUnassessed ? (
        <div className="mb-4 rounded-lg border border-border-default bg-surface-raised p-4">
          <div className="flex items-center gap-3">
            <span className="heading-stat text-text-muted">○○○</span>
            <div>
              <span className="heading-card text-text-muted">Noch nicht geprüft</span>
              <p className="text-sm text-text-secondary">
                Diese Stiftung wurde nur automatisch aus dem ESA-Register gescreent. Eine manuelle
                Bewertung steht noch aus.
              </p>
            </div>
          </div>
          {f.fitScore > 0 && (
            <p className="mt-3 text-sm text-text-muted">
              Vorläufiger Score: {f.fitScore}/10 (automatisch berechnet, nicht verifiziert)
            </p>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <span className={`heading-stat ${fit.color}`}>{f.fitScore}/10</span>
            <div>
              <span className={`heading-card ${fit.color}`}>{fit.label}</span>
              <p className="text-sm text-text-secondary">{fit.description}</p>
            </div>
          </div>

          {/* Where the score comes from — per-dimension, computed, no magic */}
          {explanation.consistent ? (
            <div className="mt-3 space-y-2 rounded-lg border border-border-default p-3">
              {explanation.dimensions.map((d) => (
                <div key={d.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{d.label}</span>
                    <span className="font-semibold tabular-nums text-text-primary">
                      {d.score}/{d.max}
                    </span>
                  </div>
                  <ProgressBar
                    percent={d.max > 0 ? ((d.score ?? 0) / d.max) * 100 : 0}
                    size="xs"
                    color="bg-primary/60"
                    label={`${d.label}: ${d.score} von ${d.max}`}
                  />
                  <p className="mt-0.5 text-xs text-text-muted">{d.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-text-muted">
              Bewertet aus Registerdaten bei der Erfassung — Aufschlüsselung siehe Methodik unten.
            </p>
          )}
        </div>
      )}

      {/* Methodology — how the score is determined */}
      <details className="mb-4 rounded-lg border border-border-default">
        <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary">
          Wie wird der Fit-Score berechnet?
        </summary>
        <div className="border-t border-border-default px-4 py-3 text-sm text-text-secondary space-y-1">
          <p>Der Fit-Score basiert auf drei Dimensionen (0–10 Punkte):</p>
          <ul className="list-inside list-disc space-y-0.5 ml-1">
            {SCORING_ENGINE.dimensions.map((d) => (
              <li key={d.id}>
                <strong>
                  {d.label} (0–{d.maxScore})
                </strong>{' '}
                — {d.description}
              </li>
            ))}
          </ul>
          <p className="text-text-muted mt-1">
            7–10 = Exzellent (★★★), 4–6 = Gut (★★☆), 1–3 = Gering (★☆☆)
          </p>
          {isUnassessed && (
            <p className="text-text-muted mt-1">
              Stiftungen mit ungenügender Datengrundlage (Tier unter «Profiliert») werden als «Nicht
              geprüft» angezeigt.
            </p>
          )}
          <p className="text-text-muted mt-1">
            Letzte Bewertung: {f.researchDate || UNKNOWN_FIELD}
          </p>
        </div>
      </details>

      {/* Fit narrative — explains WHY the fit is good/moderate/limited */}
      {fitNarrative && (
        <div className="mb-4 rounded-lg bg-surface-raised p-4">
          <h4 className="mb-2 heading-detail">Warum passt diese Stiftung?</h4>
          <p className="text-sm leading-relaxed text-text-secondary">{fitNarrative.text}</p>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="heading-detail">Thematische Übereinstimmung</h4>
        <ThemeBadgeList themeIds={f.themes} variant="detailed" />
      </div>

      {/* Theme alignments — how each theme connects to our org */}
      {themeAlignments && themeAlignments.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-3 heading-detail">Thematische Brücken</h4>
          <div className="space-y-2">
            {themeAlignments.map((a) => (
              <div key={a.themeId} className="flex gap-3 rounded border border-border-default p-3">
                <span className="text-lg">{a.icon}</span>
                <div>
                  <span className="text-xs font-semibold text-primary">{a.themeLabel}</span>
                  <p className="mt-0.5 text-sm text-text-secondary">{a.revampConnection}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {f.isOperative && (
        <div className="mt-4 rounded-lg bg-warning-bg p-3">
          <p className="text-sm font-medium text-warning">Achtung: Operative Stiftung</p>
          <p className="mt-1 text-sm text-text-secondary">
            Diese Stiftung betreibt eigene Programme und vergibt in der Regel keine Fördergelder an
            externe Projekte.
          </p>
        </div>
      )}

      {f.purposeSummary && (
        <div className="mt-4">
          <h4 className="heading-detail">Stiftungszweck</h4>
          <p className="mt-1 text-sm text-text-secondary">{f.purposeSummary}</p>
        </div>
      )}
    </Card>
  );
}
