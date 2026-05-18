'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { PRIORITY_CONFIG, PRIORITY_LEVELS } from '@/lib/config/foundations';
import { READINESS_ENGINE } from '@/lib/config/fit-scoring';
import type { QualityTier } from '@/lib/schemas/foundation';
import type { FilterPresetId } from '@/lib/domain/foundation-filter';
import type { ResearchStats } from '@/lib/domain/foundation-research-stats';

interface Props {
  researchStats: ResearchStats;
  totalCount: number;
  gesuchCount: number;
  gesuchGapCount: number;
  tierCounts: Record<QualityTier, number>;
  priorityDist: Record<number, number>;
  onApplyPreset: (id: FilterPresetId) => void;
}

export default function PipelineOverviewCard({
  researchStats,
  totalCount,
  gesuchCount,
  gesuchGapCount,
  tierCounts,
  priorityDist,
  onApplyPreset,
}: Props) {
  return (
    <Card padding={false} className="mb-6 space-y-4 p-4">
      <h2 className="heading-detail">Pipeline-Übersicht</h2>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="heading-detail">Analyse-Fortschritt</span>
          <span className="text-sm tabular-nums text-grey-dark">
            <span className="font-semibold">{researchStats.researched}</span>
            <span className="text-text-muted"> / {totalCount}</span>
          </span>
        </div>
        <ProgressBar
          percent={researchStats.researchedPercent}
          size="md"
          color="bg-primary"
          label={`Analyse-Fortschritt: ${researchStats.researchedPercent}% abgeschlossen`}
        />
        <p className="mt-1.5 text-sm text-text-muted">
          Stiftungszweck und Fit manuell bewertet — {researchStats.researchedPercent}% abgeschlossen
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PRIORITY_LEVELS.map((level) => {
          const pc = PRIORITY_CONFIG[level];
          return (
            <div key={level} className={`rounded-lg border ${pc.cardColor} px-3 py-2 text-center`}>
              <div className={`text-lg font-bold tabular-nums ${pc.textColor}`}>{priorityDist[level]}</div>
              <div className="heading-detail">{pc.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="heading-section tabular-nums text-primary-text">{gesuchCount}</div>
          <div className="heading-detail">Mit Gesuch</div>
          <p className="mt-0.5 text-sm text-text-muted">Gesuch-Seite generiert (P1–P3)</p>
        </div>
        <div className="rounded-lg border border-success/20 bg-success-bg px-4 py-3">
          <div className="heading-section tabular-nums text-success-text">{tierCounts.anwendungsbereit}</div>
          <div className="heading-detail">Bewerbungsbereit</div>
          <p className="mt-0.5 text-sm text-text-muted">
            Höchste Datenvollständigkeit (Bereitschafts-Score ≥{READINESS_ENGINE.display.thresholds[0].minScore})
          </p>
        </div>
      </div>

      {gesuchGapCount > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm">
          <span>
            <span className="font-semibold text-warning-text">{gesuchGapCount}</span>
            {' '}von {gesuchCount} Gesuch-Seiten haben dünne Quelldaten — Notizen, Zweck, Kontakt oder Website vervollständigen.
          </span>
          <button
            onClick={() => onApplyPreset('mit-luecken')}
            className="ml-3 shrink-0 rounded-md bg-warning/20 px-2.5 py-1 text-xs font-medium text-warning-text hover:bg-warning/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Zeigen →
          </button>
        </div>
      )}

      <p className="text-sm text-text-muted">
        Priorität = Fit × Bereitschaft. Scores algorithmisch berechnet.{' '}
        <Link href="/fundraising/scoring-methodik" className="text-primary-text hover:underline">Methodik</Link>
      </p>
    </Card>
  );
}
