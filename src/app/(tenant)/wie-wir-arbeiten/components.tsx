'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { CascadeTier } from '@/lib/config/value-cascade';

// ---------------------------------------------------------------------------
// CascadeDiagram — horizontal flow with arrows (Methodik PIPELINE_STEPS pattern)
// ---------------------------------------------------------------------------

interface CascadeDiagramProps {
  tiers: readonly CascadeTier[];
}

export function CascadeDiagram({ tiers }: CascadeDiagramProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg bg-surface-raised p-4">
      {tiers.map((tier, i) => (
        <div key={tier.id} className="flex items-center gap-2">
          <div
            className={`min-w-[100px] rounded-lg border-2 p-3 text-center text-sm ${tier.color.border} ${tier.color.bg} ${
              tier.status === 'future' ? 'border-dashed' : ''
            }`}
          >
            <span className="mb-1 block text-lg">{tier.icon}</span>
            <span className={`font-semibold ${tier.color.text}`}>{tier.shortName}</span>
            <span className="mt-1 block text-sm text-text-muted">{tier.catchRate}</span>
          </div>
          {i < tiers.length - 1 && <span className="text-lg text-text-muted">&rarr;</span>}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TierDetailCard — card per tier with icon, description, details checklist
// ---------------------------------------------------------------------------

interface TierDetailCardProps {
  tier: CascadeTier;
}

export function TierDetailCard({ tier }: TierDetailCardProps) {
  return (
    <Card className={`border-l-4 ${tier.color.border}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{tier.icon}</span>
          <div>
            <h3 className="heading-card">
              Stufe {tier.number}: {tier.name}
            </h3>
            <Badge variant="raw" className={`${tier.color.badgeBg} ${tier.color.badgeText}`}>
              {tier.catchRate} der Geräte
            </Badge>
          </div>
        </div>
      </div>
      <p className="mb-2 text-sm font-medium italic text-text-muted">{tier.tagline}</p>
      <p className="mb-4 text-sm leading-relaxed text-text-secondary">{tier.description}</p>
      <ul className="space-y-1.5">
        {tier.technicalDetails.map((detail) => (
          <li key={detail} className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="mt-0.5 text-secondary">&#10003;</span>
            {detail}
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// FutureVisionBlock — wrapper with dashed border + "Mit Förderung" label
// ---------------------------------------------------------------------------

interface FutureVisionBlockProps {
  children: React.ReactNode;
}

export function FutureVisionBlock({ children }: FutureVisionBlockProps) {
  return (
    <div className="relative rounded-xl border-2 border-dashed border-chart-5/20 bg-chart-5/10 p-6 md:p-8">
      <div className="absolute -top-3 left-4 rounded-full bg-chart-5/10 px-3 py-0.5 text-xs font-semibold text-chart-5">
        Mit Förderung
      </div>
      {children}
    </div>
  );
}
