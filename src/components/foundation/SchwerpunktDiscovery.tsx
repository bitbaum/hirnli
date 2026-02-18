'use client';

import { SCHWERPUNKTE, SCHWERPUNKT_IDS } from '@/lib/config/schwerpunkte';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { Foundation } from '@/lib/schemas/foundation';

interface SchwerpunktDiscoveryProps {
  foundations: Foundation[];
  activeSchwerpunkt: SchwerpunktId | null;
  onSelect: (id: SchwerpunktId | null) => void;
}

export default function SchwerpunktDiscovery({
  foundations,
  activeSchwerpunkt,
  onSelect,
}: SchwerpunktDiscoveryProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {SCHWERPUNKT_IDS.map((id) => {
        const sp = SCHWERPUNKTE[id];
        const themeIdSet = new Set(sp.themeIds);
        const matchingCount = foundations.filter((f) =>
          f.themes.some((t) => themeIdSet.has(t)),
        ).length;
        const topNames = foundations
          .filter((f) => f.themes.some((t) => themeIdSet.has(t)))
          .sort((a, b) => b.fit - a.fit || a.priority - b.priority)
          .slice(0, 3)
          .map((f) => f.name);

        const isActive = activeSchwerpunkt === id;

        return (
          <button
            key={id}
            onClick={() => onSelect(isActive ? null : id)}
            className={`rounded-xl border p-4 text-left transition-all ${
              isActive
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xl">{sp.icon}</span>
              <span className="text-sm font-semibold text-grey-dark">{sp.shortLabel}</span>
            </div>
            <p className="mb-2 text-xs text-text-muted">{sp.description}</p>
            <div className="mb-1 text-lg font-bold" style={{ color: sp.color }}>
              {matchingCount}
            </div>
            <div className="space-y-0.5">
              {topNames.map((name) => (
                <p key={name} className="truncate text-[10px] text-text-light">
                  {name}
                </p>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
