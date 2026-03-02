'use client';

import CollapsibleSection from '@/components/ui/CollapsibleSection';
import type { ResearchStats } from '@/lib/domain/foundation-research-stats';

interface ResearchStatsGridProps {
  stats: ResearchStats;
}

export default function ResearchStatsGrid({ stats }: ResearchStatsGridProps) {
  return (
    <CollapsibleSection title="Recherche-Status">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-white p-2.5 text-center">
          <p className="text-lg font-bold text-grey-dark">{stats.total.toLocaleString('de-CH')}</p>
          <p className="text-xs text-text-muted">Total</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-2.5 text-center">
          <p className="text-lg font-bold text-success">{stats.researchedPercent}%</p>
          <p className="text-xs text-text-muted">Recherchiert</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-2.5 text-center">
          <p className={`text-lg font-bold ${stats.stale > 10 ? 'text-warning' : 'text-text-light'}`}>
            {stats.stale}
          </p>
          <p className="text-xs text-text-muted">Veraltet</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-2.5 text-center">
          <p className="text-lg font-bold text-primary">{stats.avgCompleteness}%</p>
          <p className="text-xs text-text-muted">Vollst.</p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
