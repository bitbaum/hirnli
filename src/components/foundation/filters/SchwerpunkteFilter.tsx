'use client';

import CollapsibleSection from '@/components/ui/CollapsibleSection';
import { SCHWERPUNKTE, SCHWERPUNKT_IDS } from '@/lib/config/schwerpunkte';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { Foundation } from '@/lib/schemas/foundation';

interface SchwerpunkteFilterProps {
  activeSchwerpunkt: SchwerpunktId | null;
  foundations: Foundation[];
  onSelect: (id: SchwerpunktId | null) => void;
}

export default function SchwerpunkteFilter({
  activeSchwerpunkt,
  foundations,
  onSelect,
}: SchwerpunkteFilterProps) {
  return (
    <CollapsibleSection title="Schwerpunkte" defaultOpen>
      <div className="grid grid-cols-2 gap-2">
        {SCHWERPUNKT_IDS.map((id) => {
          const sp = SCHWERPUNKTE[id];
          const themeIdSet = new Set(sp.themeIds);
          const matchingCount = foundations.filter((f) =>
            f.themes.some((t) => themeIdSet.has(t)),
          ).length;
          const isActive = activeSchwerpunkt === id;

          return (
            <button
              key={id}
              onClick={() => onSelect(isActive ? null : id)}
              className={`min-h-11 rounded-lg border p-2.5 text-left transition-all ${
                isActive
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">{sp.icon}</span>
                <span className="text-xs font-semibold text-grey-dark">{sp.shortLabel}</span>
              </div>
              <div className="mt-1 text-sm font-bold" style={{ color: sp.color }}>
                {matchingCount}
              </div>
            </button>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
