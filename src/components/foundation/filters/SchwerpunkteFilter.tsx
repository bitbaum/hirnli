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
      <div className="space-y-1">
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
              className={`flex min-h-11 w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-all ${
                isActive
                  ? 'bg-primary/10 font-semibold text-primary ring-1 ring-primary/30'
                  : 'text-text-muted hover:bg-surface-raised'
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 text-base">{sp.icon}</span>
                <span className="truncate">{sp.shortLabel}</span>
              </span>
              <span
                className="ml-2 shrink-0 tabular-nums text-xs font-bold"
                style={{ color: isActive ? undefined : sp.color }}
              >
                {matchingCount}
              </span>
            </button>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
