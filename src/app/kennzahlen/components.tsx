import Badge from '@/components/ui/Badge';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import type { Metric } from '@/lib/schemas/metric';

export function CoverageCard({
  icon, label, count, status, variant,
}: {
  icon: string;
  label: string;
  count: number;
  status: string;
  variant: 'live' | 'derived' | 'estimated' | 'none';
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3">
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-text-muted">{count} KPIs</p>
      </div>
      <Badge variant={variant}>{status}</Badge>
    </div>
  );
}

export function DimensionSection({
  icon, title, badge, badgeVariant, metrics, warning, missingKPIs,
}: {
  icon: string;
  title: string;
  badge: string;
  badgeVariant: 'live' | 'derived' | 'estimated' | 'none';
  metrics: Metric[];
  warning?: string;
  missingKPIs?: Array<{ label: string; target: string }>;
}) {
  const borderColor = badgeVariant === 'live'
    ? 'border-l-primary'
    : badgeVariant === 'estimated'
      ? 'border-l-warning'
      : 'border-l-gray-400';

  return (
    <Card className={`mb-6 border-l-4 ${borderColor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{icon} {title}</CardTitle>
          <Badge variant={badgeVariant}>{metrics.length} KPIs - {badge}</Badge>
        </div>
      </CardHeader>

      {warning && (
        <div className="mb-4 rounded-lg bg-warning-bg/50 p-3 text-sm text-warning">
          {warning}
        </div>
      )}

      <MetricGrid columns={3}>
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            label={metric.name}
            value={formatMetricValue(metric)}
            subtitle={metric.documentation.description.slice(0, 80) + (metric.documentation.description.length > 80 ? '...' : '')}
            sourceType={mapSourceType(metric.source.type)}
          />
        ))}
        {missingKPIs?.map((kpi) => (
          <MetricCard
            key={kpi.label}
            label={kpi.label}
            value="?"
            subtitle={`Ziel: ${kpi.target}`}
            sourceType="none"
          />
        ))}
      </MetricGrid>
    </Card>
  );
}

/** Map metric source types to the Badge/MetricCard variant union */
function mapSourceType(type: string): 'live' | 'derived' | 'estimated' | 'none' {
  switch (type) {
    case 'source': return 'live';
    case 'derived':
    case 'calculated': return 'derived';
    case 'estimated': return 'estimated';
    case 'target':
    case 'capacity':
    default: return 'none';
  }
}

/** Format a metric placeholder value based on its format type */
function formatMetricValue(metric: Metric): string {
  switch (metric.format) {
    case 'CHF': return 'CHF --';
    case 'percent': return '--%';
    case 'integer': return '--';
    case 'tonnes': return '-- t';
    case 'kg': return '-- kg';
    case 'range': return '--';
    default: return '--';
  }
}
