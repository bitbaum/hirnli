import Card from '@/components/ui/Card';
import type { Foundation } from '@/lib/schemas/foundation';
import { FIT_CONFIG } from '@/lib/config/foundations';
import ThemeBadgeList from './ThemeBadgeList';
import type { FitNarrative, ThemeAlignment } from '@/lib/domain/foundation-contextualization';

interface FitAnalysisProps {
  foundation: Foundation;
  fitNarrative?: FitNarrative;
  themeAlignments?: ThemeAlignment[];
}

export default function FitAnalysis({ foundation: f, fitNarrative, themeAlignments }: FitAnalysisProps) {
  const fit = FIT_CONFIG[f.fit as keyof typeof FIT_CONFIG];

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-grey-dark">Fit-Analyse</h3>

      <div className="mb-4 flex items-center gap-3">
        <span className={`text-3xl font-bold ${fit.color}`}>{f.fit}/3</span>
        <div>
          <span className={`text-lg font-semibold ${fit.color}`}>{fit.label}</span>
          <p className="text-sm text-text-light">{fit.description}</p>
        </div>
      </div>

      {/* Methodology — how the score is determined */}
      <details className="mb-4 rounded-lg border border-border">
        <summary className="cursor-pointer px-4 py-2 text-xs font-medium text-text-muted hover:text-grey-dark">
          Wie wird der Fit-Score berechnet?
        </summary>
        <div className="border-t border-border px-4 py-3 text-xs text-text-light space-y-1">
          <p>Der Fit-Score (1–3) basiert auf manueller Recherche-Bewertung anhand von:</p>
          <ul className="list-inside list-disc space-y-0.5 ml-1">
            <li><strong>Thematische Übereinstimmung</strong> — Wie gut passen unsere Schwerpunkte zu den Förderbereichen?</li>
            <li><strong>Fördervolumen & -art</strong> — Passt die Grössenordnung zu unserem Bedarf?</li>
            <li><strong>Bewerbungszugang</strong> — Nimmt die Stiftung externe Gesuche an?</li>
            <li><strong>Geographischer Fokus</strong> — Fördert die Stiftung in unserem Einzugsgebiet?</li>
          </ul>
          <p className="text-text-muted mt-2">Letzte Bewertung: {f.researchDate || 'Unbekannt'}</p>
        </div>
      </details>

      {/* Fit narrative — explains WHY the fit is good/moderate/limited */}
      {fitNarrative && (
        <div className="mb-4 rounded-lg bg-bg-light p-4">
          <h4 className="mb-2 text-sm font-semibold text-grey-dark">
            Warum passt diese Stiftung?
          </h4>
          <p className="text-sm leading-relaxed text-text-light">
            {fitNarrative.text}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-grey-dark">Thematische Übereinstimmung</h4>
        <ThemeBadgeList themeIds={f.themes} variant="detailed" />
      </div>

      {/* Theme alignments — how each theme connects to our org */}
      {themeAlignments && themeAlignments.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-3 text-sm font-semibold text-grey-dark">Thematische Brücken</h4>
          <div className="space-y-2">
            {themeAlignments.map((a) => (
              <div key={a.themeId} className="flex gap-3 rounded border border-border p-3">
                <span className="text-lg">{a.icon}</span>
                <div>
                  <span className="text-xs font-semibold text-primary">{a.themeLabel}</span>
                  <p className="mt-0.5 text-xs text-text-light">{a.revampConnection}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {f.isOperative && (
        <div className="mt-4 rounded-lg bg-warning-bg p-3">
          <p className="text-sm font-medium text-warning">
            Achtung: Operative Stiftung
          </p>
          <p className="mt-1 text-xs text-text-light">
            Diese Stiftung betreibt eigene Programme und vergibt in der Regel keine Fördergelder an externe Projekte.
          </p>
        </div>
      )}

      {f.purposeSummary && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-grey-dark">Stiftungszweck</h4>
          <p className="mt-1 text-sm text-text-light">{f.purposeSummary}</p>
        </div>
      )}
    </Card>
  );
}
