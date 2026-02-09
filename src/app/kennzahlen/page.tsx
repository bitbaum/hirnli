import PageHeader from '@/components/layout/PageHeader';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { NumberSources, getNumbersByCategory } from '@/lib/config/metrics';
import type { Metric } from '@/lib/schemas/metric';

// Dimension config — SSOT for how dimensions are displayed
const DIMENSIONS = [
  {
    id: 'financial',
    label: 'Finanzielle Nachhaltigkeit',
    icon: '💰',
    color: 'border-l-primary',
    headerBg: 'bg-primary/10',
    category: 'financial',
    status: 'Live-Daten',
    statusVariant: 'live' as const,
  },
  {
    id: 'environmental',
    label: 'Ökologische Wirkung',
    icon: '🌍',
    color: 'border-l-success',
    headerBg: 'bg-success-bg',
    category: 'environmental',
    status: 'Schätzungen',
    statusVariant: 'estimated' as const,
  },
  {
    id: 'social',
    label: 'Soziale Integration',
    icon: '🤝',
    color: 'border-l-purple-500',
    headerBg: 'bg-purple-50',
    category: 'social',
    status: 'Kernmission',
    statusVariant: 'none' as const,
  },
] as const;

// KPIs that exist as targets but have no data in NumberSources — shown as placeholders
const MISSING_KPIS = {
  social_integration: [
    { label: 'Aktive Teilnehmende', target: '2-4/Monat' },
    { label: 'Integrationsstunden', target: '150-300 Std./Monat' },
    { label: 'Skill-Entwicklung', target: '3.5 (1-5 Skala)' },
    { label: 'Erfolgsquote', target: '40%' },
  ],
  education: [
    { label: 'Workshops durchgeführt', target: '1-2/Monat' },
    { label: 'Teilnehmende', target: '15-25/Monat' },
    { label: 'Lernstunden vermittelt', target: '30-60 Std./Monat' },
  ],
  digital: [
    { label: 'Linux-Installationen', target: '20-25/Monat' },
    { label: 'Aktive Linux-Nutzer', target: '40/Monat' },
  ],
  operations: [
    { label: 'Geräteeingang', target: '40-60/Monat' },
    { label: 'Ø Lagerdauer', target: '≤30 Tage' },
    { label: 'Verarbeitungsquote', target: '80%' },
    { label: 'Lagerbestand', target: '50-100' },
  ],
};

const MISSING_DIMENSIONS = [
  { id: 'education', label: 'Bildung & Kompetenzaufbau', icon: '📚', kpis: MISSING_KPIS.education },
  { id: 'digital', label: 'Digitale Souveränität', icon: '💻', kpis: MISSING_KPIS.digital },
  { id: 'operations', label: 'Operative Exzellenz', icon: '⚙️', kpis: MISSING_KPIS.operations },
];

export default function KennzahlenPage() {
  // Gather metrics from the config registry
  const financialMetrics = getNumbersByCategory('financial');
  const environmentalMetrics = getNumbersByCategory('environmental');
  const socialMetrics = getNumbersByCategory('social');

  // Summary stats
  const totalKPIs = 28;
  const trackedKPIs = financialMetrics.length + environmentalMetrics.length;
  const coverage = Math.round((trackedKPIs / totalKPIs) * 100);

  return (
    <div>
      <PageHeader
        title="Kennzahlen-Dashboard"
        subtitle={`${totalKPIs} KPIs über 6 strategische Dimensionen — Status und Performance auf einen Blick`}
      />

      {/* Overview stats */}
      <MetricGrid columns={4} className="mb-8">
        <MetricCard label="KPIs definiert" value={String(totalKPIs)} sourceType="derived" />
        <MetricCard label="Mit Daten" value={String(trackedKPIs)} sourceType="live" />
        <MetricCard label="Abdeckung" value={`${coverage}%`} subtitle="Ziel: 75%" sourceType="derived" />
        <MetricCard label="Dimensionen" value="6" sourceType="derived" />
      </MetricGrid>

      {/* Data coverage overview */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-grey-dark">Datenabdeckung nach Dimension</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CoverageCard icon="💰" label="Finanziell" count={financialMetrics.length} status="Live-Daten" variant="live" />
          <CoverageCard icon="🌍" label="Ökologisch" count={environmentalMetrics.length} status="Schätzung" variant="estimated" />
          <CoverageCard icon="🤝" label="Integration" count={4} status="Fehlt" variant="none" />
          <CoverageCard icon="📚" label="Bildung" count={3} status="Fehlt" variant="none" />
          <CoverageCard icon="💻" label="Digital" count={2} status="Fehlt" variant="none" />
          <CoverageCard icon="⚙️" label="Operativ" count={4} status="Fehlt" variant="none" />
        </div>
      </section>

      {/* Financial dimension */}
      <DimensionSection
        icon="💰"
        title="Finanzielle Nachhaltigkeit"
        badge="Live-Daten"
        badgeVariant="live"
        metrics={financialMetrics}
      />

      {/* Environmental dimension */}
      <DimensionSection
        icon="🌍"
        title="Ökologische Wirkung"
        badge="Schätzungen"
        badgeVariant="estimated"
        metrics={environmentalMetrics}
        warning="Diese Werte basieren auf Finanzdaten (Warenverkauf / CHF 150). Für exakte Zahlen: Device-Tracking aktivieren."
      />

      {/* Social dimension */}
      <DimensionSection
        icon="🤝"
        title="Soziale Integration"
        badge="Kernmission"
        badgeVariant="none"
        metrics={socialMetrics}
        warning="Kritische Datenlücke: Diese KPIs messen unsere Kernmission — die Reintegration von Menschen aus schwierigen Situationen. Datenerfassung hat höchste Priorität!"
        missingKPIs={MISSING_KPIS.social_integration}
      />

      {/* Missing dimensions */}
      {MISSING_DIMENSIONS.map((dim) => (
        <Card key={dim.id} className="mb-6 border-l-4 border-l-gray-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{dim.icon} {dim.label}</CardTitle>
              <Badge variant="none">{dim.kpis.length} KPIs - Fehlt</Badge>
            </div>
          </CardHeader>
          <MetricGrid columns={3}>
            {dim.kpis.map((kpi) => (
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
      ))}

      {/* Historical note for social integration */}
      <Card className="mb-8 border-l-4 border-l-purple-500 bg-purple-50/50">
        <h3 className="mb-2 text-sm font-semibold text-grey-dark">Historische Wirkung (seit 2009)</h3>
        <ul className="space-y-1 text-sm text-text-light">
          <li><strong>100+</strong> Praktikant:innen begleitet</li>
          <li><strong>~40%</strong> mit erfolgreicher Anschlusslösung</li>
          <li><strong>8-10 Plätze</strong> gleichzeitig verfügbar</li>
        </ul>
      </Card>

      {/* Action plan */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Aktionsplan: Datenabdeckung erhöhen</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {[
            { priority: 'HOCH', color: 'text-danger', action: 'Teilhabe-Tracking aktivieren (03_Teilhabe_Reintegration_Tracking.csv)', kpis: '4 Integration-KPIs', owner: 'HR/Veronica' },
            { priority: 'HOCH', color: 'text-danger', action: 'Device-Outcome-Tracking einführen (01_Device_Outcome_Tracking.csv)', kpis: '4 Öko + 4 Ops-KPIs', owner: 'Operations' },
            { priority: 'MITTEL', color: 'text-warning', action: 'Workshop-Tracking starten (04_Workshop_Tracking.csv)', kpis: '3 Bildungs-KPIs', owner: 'Events' },
            { priority: 'NIEDRIG', color: 'text-text-muted', action: 'Linux-Nutzung im Device-Tracking erfassen', kpis: '2 Digital-KPIs', owner: 'Tech' },
          ].map((item) => (
            <div key={item.action} className="flex items-start gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
              <span className={`text-xs font-bold ${item.color}`}>{item.priority}</span>
              <div className="flex-1">
                <p className="text-sm">{item.action}</p>
                <p className="text-xs text-text-muted">{item.kpis} | {item.owner}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Data source info */}
      <Card>
        <div className="text-sm text-text-light">
          <p className="font-medium text-grey-dark">Datenquelle</p>
          <p>Kivitendo Buchhaltung (Finanz-KPIs) | Schätzungen aus Umsatzdaten (Öko-KPIs)</p>
          <p className="mt-1 text-xs text-text-muted">
            Quelldaten: 01_Management/B_Finanzen/revamp-Einnahmen-2025.xlsx
          </p>
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components (kept in same file — only used here)
// ---------------------------------------------------------------------------

function CoverageCard({
  icon,
  label,
  count,
  status,
  variant,
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

function DimensionSection({
  icon,
  title,
  badge,
  badgeVariant,
  metrics,
  warning,
  missingKPIs,
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
    case 'source':
      return 'live';
    case 'derived':
    case 'calculated':
      return 'derived';
    case 'estimated':
      return 'estimated';
    case 'target':
    case 'capacity':
    default:
      return 'none';
  }
}

/** Format a metric placeholder value based on its format type */
function formatMetricValue(metric: Metric): string {
  // These are definition-only metrics — actual values come from the financial hook at runtime
  // Show the format hint so users understand what will be displayed
  switch (metric.format) {
    case 'CHF':
      return 'CHF --';
    case 'percent':
      return '--%';
    case 'integer':
      return '--';
    case 'tonnes':
      return '-- t';
    case 'kg':
      return '-- kg';
    case 'range':
      return '--';
    default:
      return '--';
  }
}
