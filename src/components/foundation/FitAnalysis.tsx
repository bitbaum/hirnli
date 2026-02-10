import Card from '@/components/ui/Card';
import type { Foundation } from '@/lib/schemas/foundation';
import { FIT_CONFIG } from '@/lib/config/foundations';
import ThemeBadgeList from './ThemeBadgeList';

interface FitAnalysisProps {
  foundation: Foundation;
}

export default function FitAnalysis({ foundation: f }: FitAnalysisProps) {
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

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-grey-dark">Thematische Übereinstimmung</h4>
        <ThemeBadgeList themeIds={f.themes} variant="detailed" />
      </div>

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
