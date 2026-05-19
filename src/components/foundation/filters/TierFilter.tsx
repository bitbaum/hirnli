'use client';

import CollapsibleSection from '@/components/ui/CollapsibleSection';
import { QUALITY_TIERS, TIER_LABELS, TIER_COLORS, TIER_DESCRIPTIONS } from '@/lib/domain/foundation-helpers';
import { formatNumber } from '@/lib/utils/format';
import type { QualityTier } from '@/lib/schemas/foundation';

interface TierFilterProps {
  activeTier: QualityTier;
  tierCounts: Record<QualityTier, number>;
  onSelect: (tier: QualityTier) => void;
}

export default function TierFilter({ activeTier, tierCounts, onSelect }: TierFilterProps) {
  // Only show tiers that have entries — avoids confusing empty rows
  const visibleTiers = [...QUALITY_TIERS].reverse().filter((tier) => tierCounts[tier] > 0);

  if (visibleTiers.length <= 1) return null;

  return (
    <CollapsibleSection title="Bereitschaft" defaultOpen>
      <div className="space-y-1">
        {visibleTiers.map((tier) => {
          const isActive = activeTier === tier;
          const count = tierCounts[tier];
          return (
            <button
              key={tier}
              onClick={() => onSelect(tier)}
              className={`flex min-h-11 w-full flex-col rounded-lg px-2.5 py-2 text-left transition-all ${
                isActive
                  ? 'bg-primary/10 ring-1 ring-primary/30'
                  : 'hover:bg-surface-raised'
              }`}
            >
              <span className="flex w-full items-center justify-between">
                <span className={`flex items-center gap-2 text-sm ${isActive ? 'font-semibold text-primary' : 'text-text-muted'}`}>
                  <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${TIER_COLORS[tier].split(' ')[0]}`} />
                  {TIER_LABELS[tier]}
                </span>
                <span className="text-xs tabular-nums text-text-muted">{formatNumber(count)}</span>
              </span>
              {isActive && (
                <span className="mt-0.5 pl-4 text-sm text-text-muted">
                  {TIER_DESCRIPTIONS[tier]}
                </span>
              )}
            </button>
          );
        })}
        <p className="mt-1 text-sm text-text-muted">
          Zeigt alle Stiftungen ab gewählter Stufe.
        </p>
      </div>
    </CollapsibleSection>
  );
}
