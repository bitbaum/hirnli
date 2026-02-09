import Card from '@/components/ui/Card';
import type { Foundation } from '@/lib/schemas/foundation';
import { THEMES } from '@/lib/config/foundations';

interface FitAnalysisProps {
  foundation: Foundation;
}

export default function FitAnalysis({ foundation: f }: FitAnalysisProps) {
  const fitLevel = f.fit === 3 ? 'Exzellent' : f.fit === 2 ? 'Gut' : 'Gering';
  const fitColor = f.fit === 3 ? 'text-success' : f.fit === 2 ? 'text-warning' : 'text-text-muted';

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-grey-dark">Fit-Analyse</h3>

      <div className="mb-4 flex items-center gap-3">
        <span className={`text-3xl font-bold ${fitColor}`}>{f.fit}/3</span>
        <div>
          <span className={`text-lg font-semibold ${fitColor}`}>{fitLevel}</span>
          <p className="text-sm text-text-light">
            {f.fit === 3
              ? 'Hervorragende Übereinstimmung mit Revamp-IT'
              : f.fit === 2
                ? 'Gute Übereinstimmung, gezielte Argumentation nötig'
                : 'Eingeschränkte Übereinstimmung'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-grey-dark">Thematische Übereinstimmung</h4>
        {f.themes.map((themeId) => {
          const theme = THEMES[themeId];
          if (!theme) return null;
          return (
            <div key={themeId} className="flex items-center gap-2">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm"
                style={{ backgroundColor: theme.color + '20' }}
              >
                {theme.icon}
              </span>
              <div>
                <span className="text-sm font-medium text-grey-dark">{theme.label}</span>
                <span className="block text-xs text-text-muted">{theme.description}</span>
              </div>
            </div>
          );
        })}
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
