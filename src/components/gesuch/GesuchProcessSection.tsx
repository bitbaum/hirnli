import Card from '@/components/ui/Card';
import Callout from '@/components/ui/Callout';
import Badge from '@/components/ui/Badge';
import { CASCADE_MODELS, CASCADE_SUMMARY } from '@/lib/config/value-cascade';
import type { CascadeTier } from '@/lib/config/value-cascade';

interface GesuchProcessSectionProps {
  /** Show future model (vintage/art tier) for kreislaufwirtschaft/klima foundations */
  showFuture?: boolean;
}

function CompactTierCard({ tier }: { tier: CascadeTier }) {
  return (
    <div className={`rounded-lg border-l-4 ${tier.color.border} ${tier.color.bg} p-3`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{tier.icon}</span>
        <span className={`heading-detail ${tier.color.text}`}>
          {tier.shortName}
        </span>
        <Badge variant="raw" className={`ml-auto ${tier.color.badgeBg} ${tier.color.badgeText}`}>
          {tier.catchRate}
        </Badge>
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">{tier.tagline}</p>
    </div>
  );
}

export default function GesuchProcessSection({
  showFuture = false,
}: GesuchProcessSectionProps) {
  const model = showFuture ? CASCADE_MODELS.future : CASCADE_MODELS.current;

  return (
    <section>
      <h2 className="mb-6 heading-page">
        {CASCADE_SUMMARY.headline}
      </h2>
      <p className="mb-6 text-base leading-relaxed text-text-secondary">
        {CASCADE_SUMMARY.body}
      </p>

      {/* Compact flow diagram */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {model.tiers.map((tier, i) => (
            <div key={tier.id} className="flex items-center gap-2">
              <div
                className={`rounded-lg border ${tier.color.border} ${tier.color.bg} px-3 py-2 text-center text-xs ${
                  tier.status === 'future' ? 'border-dashed' : ''
                }`}
              >
                <span className="block text-base">{tier.icon}</span>
                <span className={`font-semibold ${tier.color.text}`}>
                  {tier.shortName}
                </span>
              </div>
              {i < model.tiers.length - 1 && (
                <span className="text-text-muted">&rarr;</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Compact tier cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {CASCADE_MODELS.current.tiers.map((tier) => (
          <CompactTierCard key={tier.id} tier={tier} />
        ))}
      </div>

      {/* Insight callout */}
      <Callout color="primary" className="px-5">
        <p className="text-sm font-medium text-text leading-relaxed">
          {CASCADE_SUMMARY.insight}
        </p>
      </Callout>
    </section>
  );
}
