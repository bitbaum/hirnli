import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import { formatNumber } from '@/lib/utils/format';
import { computeTierCounts, TIER_LABELS, TIER_DESCRIPTIONS } from '@/lib/domain/foundation-helpers';
import { computePipelineStats } from '../data';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';

export default function PipelineMetrics() {
  const stats = computePipelineStats();
  const tierCounts = computeTierCounts(STIFTUNGEN_DATA);

  return (
    <MetricGrid columns={4} className="mb-8">
      <MetricCard
        label={TIER_LABELS.anwendungsbereit}
        value={formatNumber(tierCounts.anwendungsbereit)}
        subtitle={TIER_DESCRIPTIONS.anwendungsbereit}
        sourceType="live"
      />
      <MetricCard
        label={`${TIER_LABELS.recherchiert}+`}
        value={formatNumber(tierCounts.anwendungsbereit + tierCounts.recherchiert)}
        subtitle={TIER_DESCRIPTIONS.recherchiert}
        sourceType="derived"
      />
      <MetricCard
        label="Im Verzeichnis"
        value={formatNumber(stats.total)}
        subtitle="Schweizer Stiftungen erfasst"
        sourceType="live"
      />
      <MetricCard
        label="Hoher Fit (3/3)"
        value={String(stats.highFitCount)}
        subtitle="Beste Übereinstimmung"
        sourceType="derived"
      />
    </MetricGrid>
  );
}
