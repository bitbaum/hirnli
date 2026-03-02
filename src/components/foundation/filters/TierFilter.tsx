'use client';

import CollapsibleSection from '@/components/ui/CollapsibleSection';
import { QUALITY_TIERS, TIER_LABELS, TIER_COLORS } from '@/lib/domain/foundation-helpers';
import type { QualityTier } from '@/lib/schemas/foundation';

interface TierFilterProps {
  activeTier: QualityTier;
  tierCounts: Record<QualityTier, number>;
  onSelect: (tier: QualityTier) => void;
}

export default function TierFilter({ activeTier, tierCounts, onSelect }: TierFilterProps) {
  return (
    <CollapsibleSection title="Datenqualität" defaultOpen>
      <div className="space-y-1">
        {([...QUALITY_TIERS].reverse()).map((tier) => {
          const isActive = activeTier === tier;
          const count = tierCounts[tier];
          return (
            <button
              key={tier}
              onClick={() => onSelect(tier)}
              className={`flex min-h-11 w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition-all ${
                isActive
                  ? 'bg-primary/10 font-semibold text-primary ring-1 ring-primary/30'
                  : 'text-text-muted hover:bg-bg-light'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${TIER_COLORS[tier].split(' ')[0]}`} />
                {TIER_LABELS[tier]}
              </span>
              <span className="text-xs tabular-nums">{count.toLocaleString('de-CH')}</span>
            </button>
          );
        })}
        <p className="mt-1 text-xs text-text-muted">
          Zeigt alle Stiftungen ab gewählter Stufe.
        </p>
      </div>
    </CollapsibleSection>
  );
}
