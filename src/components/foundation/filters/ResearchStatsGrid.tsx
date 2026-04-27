'use client';

import CollapsibleSection from '@/components/ui/CollapsibleSection';
import ProgressBar from '@/components/ui/ProgressBar';
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
        <ProgressBar percent={stats.researchedPercent} size="sm" color="bg-primary" label={`Recherche-Fortschritt: ${stats.researchedPercent}% analysiert`} />
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>{stats.researchedPercent}% analysiert</span>
          <span>Ø {stats.avgCompleteness}% vollständig</span>
        </div>
      </div>
    </CollapsibleSection>
  );
}
