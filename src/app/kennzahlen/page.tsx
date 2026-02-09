import PageHeader from '@/components/layout/PageHeader';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getNumbersByCategory } from '@/lib/config/metrics';
import { MISSING_KPIS, MISSING_DIMENSIONS, ACTION_ITEMS } from './data';
import { CoverageCard, DimensionSection } from './components';

export default function KennzahlenPage() {
  const financialMetrics = getNumbersByCategory('financial');
  const environmentalMetrics = getNumbersByCategory('environmental');
  const socialMetrics = getNumbersByCategory('social');

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

      <DimensionSection icon="💰" title="Finanzielle Nachhaltigkeit" badge="Live-Daten" badgeVariant="live" metrics={financialMetrics} />
      <DimensionSection icon="🌍" title="Ökologische Wirkung" badge="Schätzungen" badgeVariant="estimated" metrics={environmentalMetrics} warning="Diese Werte basieren auf Finanzdaten (Warenverkauf / CHF 150). Für exakte Zahlen: Device-Tracking aktivieren." />
      <DimensionSection icon="🤝" title="Soziale Integration" badge="Kernmission" badgeVariant="none" metrics={socialMetrics} warning="Kritische Datenlücke: Diese KPIs messen unsere Kernmission — die Reintegration von Menschen aus schwierigen Situationen. Datenerfassung hat höchste Priorität!" missingKPIs={MISSING_KPIS.social_integration} />

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
              <MetricCard key={kpi.label} label={kpi.label} value="?" subtitle={`Ziel: ${kpi.target}`} sourceType="none" />
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
          {ACTION_ITEMS.map((item) => (
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
