'use client';

import CollapsibleSection from '@/components/ui/CollapsibleSection';
import type { ResearchStats } from '@/lib/domain/foundation-research-stats';

interface ResearchStatsGridProps {
  stats: ResearchStats;
}

export default function ResearchStatsGrid({ stats }: ResearchStatsGridProps) {
  return (
    <CollapsibleSection title="Recherche-Stand">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Zweck analysiert</span>
          <span className="font-semibold text-grey-dark">{stats.researched}/{stats.total}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-bg-light" role="progressbar" aria-valuenow={stats.researchedPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Recherche-Fortschritt: ${stats.researchedPercent}% analysiert`}>
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${stats.researchedPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>{stats.researchedPercent}% analysiert</span>
          <span>Ø {stats.avgCompleteness}% vollständig</span>
        </div>
      </div>
    </CollapsibleSection>
  );
}
