'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import type { ResearchStats } from '@/lib/domain/foundation-research-stats';
import type { Foundation } from '@/lib/schemas/foundation';

interface ResearchOverviewProps {
  stats: ResearchStats;
  needsAttention: Foundation[];
}

export default function ResearchOverview({ stats, needsAttention }: ResearchOverviewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-grey-dark"
      >
        <span>{expanded ? '▾' : '▸'}</span>
        Recherche-Status
      </button>

      {expanded && (
        <div className="space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="text-center">
              <p className="text-2xl font-bold text-grey-dark">{stats.total}</p>
              <p className="text-xs text-text-muted">Total</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-success">{stats.researchedPercent}%</p>
              <p className="text-xs text-text-muted">Recherchiert</p>
            </Card>
            <Card className="text-center">
              <p className={`text-2xl font-bold ${stats.stale > 10 ? 'text-warning' : 'text-text-light'}`}>
                {stats.stale}
              </p>
              <p className="text-xs text-text-muted">Veraltet</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.avgCompleteness}%</p>
              <p className="text-xs text-text-muted">Vollst.</p>
            </Card>
          </div>

          {/* Needs attention list */}
          {needsAttention.length > 0 && (
            <Card>
              <h4 className="mb-2 text-sm font-semibold text-grey-dark">
                Braucht Aufmerksamkeit
              </h4>
              <p className="mb-3 text-xs text-text-muted">
                Stiftungen mit hohem Fit aber unvollstaendiger Recherche
              </p>
              <div className="space-y-1">
                {needsAttention.slice(0, 5).map((f) => (
                  <Link
                    key={f.slug}
                    href={`/fundraising/stiftungen/${f.slug}`}
                    className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-bg-light hover:no-underline"
                  >
                    <span className="text-grey-dark">{f.name}</span>
                    <span className="text-xs text-warning">
                      {f.fit === 0 ? 'Nicht geprüft — Recherche nötig' : `Fit ${f.fit} — offen`}
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
