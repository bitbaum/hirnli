import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { TIER_LABELS, TIER_COLORS, TIER_CAPABILITIES, QUALITY_TIERS } from '@/lib/domain/foundation-helpers';
import { formatNumber } from '@/lib/utils/format';
import type { FunnelStats } from '@/lib/domain/pipeline-stats';

interface Props {
  s: FunnelStats;
}

export default function TierDistributionSection({ s }: Props) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 heading-subsection">Aktuelle Verteilung nach Qualitätsstufe</h2>
      <p className="mb-4 text-sm text-text-secondary">
        Jede Stiftung wird anhand ihrer Datenvollständigkeit einer von fünf Qualitätsstufen zugeordnet.
        Die Stufe bestimmt, was mit der Stiftung möglich ist.
      </p>
      <Card>
        <div className="space-y-2">
          {[...QUALITY_TIERS].reverse().map(tier => {
            const count = s.tierCounts[tier];
            const pct = s.total > 0 ? ((count / s.total) * 100).toFixed(1) : '0';
            return (
              <div key={tier} className="flex items-center justify-between rounded-lg border border-border-default/50 p-3">
                <div className="flex items-center gap-3">
                  <Badge variant="raw" className={TIER_COLORS[tier]}>
                    {TIER_LABELS[tier]}
                  </Badge>
                  <span className="text-sm text-text-secondary">{TIER_CAPABILITIES[tier]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs tabular-nums text-text-muted">{pct}%</span>
                  <span className="w-16 text-right text-sm font-bold tabular-nums text-text-primary">
                    {formatNumber(count)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
