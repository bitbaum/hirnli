import dynamic from 'next/dynamic';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCHF, calcGrowth } from '@/lib/utils/format';
import {
  ANNUAL_PL,
  COMPLETE_YEARS,
  LATEST_COMPLETE,
  PEAK_REVENUE,
  PEAK_YEAR,
  CUMULATIVE_RESULT,
  AVG_REVENUE,
  DATA_QUALITY,
} from '../data';
import { InsightCard, ProfitLossTable, CostStructureCard } from '../components';
import type { InspectorHandle } from '@/app/fundraising/sections/Inspectable';

const ChartSkeleton = () => (
  <Card padding={false} className="flex h-80 items-center justify-center text-text-muted">Laden...</Card>
);

const AnnualTrendChart = dynamic(() => import('@/components/charts/AnnualTrendChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export default function OverviewTab({ inspector }: { inspector: InspectorHandle }) {
  return (
    <div>
      {/* Data quality banner */}
      <div className="mb-6 rounded-lg border-2 border-warning/50 bg-warning-bg/30 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-xl text-warning">&#9888;</span>
          <div>
            <h3 className="text-sm font-bold text-grey-dark">
              Wichtig: Eingeschränkte Datenverfügbarkeit
            </h3>
            <p className="mt-1 text-sm text-text-light">
              <strong>Vollständige P&L (Einnahmen + Aufwände):</strong> {DATA_QUALITY.completeRange}.{' '}
              <strong>Nur Einnahmen:</strong> {DATA_QUALITY.incompleteRange} — Aufwände wurden im Buchhaltungssystem nicht verbucht.
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Quelle: {DATA_QUALITY.source}. {DATA_QUALITY.caveat}
            </p>
          </div>
        </div>
      </div>

      {/* Summary metrics */}
      <MetricGrid columns={4} className="mb-8">
        <MetricCard
          label="Spitzenjahr"
          value={formatCHF(PEAK_REVENUE)}
          subtitle={`${PEAK_YEAR} — höchster Umsatz`}
          sourceType="live"
          onClick={() =>
            inspector.inspect({
              label: 'Spitzenumsatz',
              value: formatCHF(PEAK_REVENUE),
              sourceType: 'live',
              source: DATA_QUALITY.source,
              description: `Höchster Jahresumsatz war ${PEAK_YEAR} mit ${formatCHF(PEAK_REVENUE)}.`,
            })
          }
        />
        <MetricCard
          label={`Umsatz ${ANNUAL_PL[ANNUAL_PL.length - 1].year}`}
          value={formatCHF(ANNUAL_PL[ANNUAL_PL.length - 1].revenue)}
          subtitle="Aktuellstes Jahr"
          trend={{
            value: calcGrowth(
              ANNUAL_PL[ANNUAL_PL.length - 2].revenue,
              ANNUAL_PL[ANNUAL_PL.length - 1].revenue,
            ),
            label: `vs. ${ANNUAL_PL[ANNUAL_PL.length - 2].year}`,
          }}
          sourceType="live"
          onClick={() =>
            inspector.inspect({
              label: `Umsatz ${ANNUAL_PL[ANNUAL_PL.length - 1].year}`,
              value: formatCHF(ANNUAL_PL[ANNUAL_PL.length - 1].revenue),
              sourceType: 'live',
              source: DATA_QUALITY.source,
              description: ANNUAL_PL[ANNUAL_PL.length - 1].note || 'Einnahmen aus Kivitendo Erfolgsrechnung.',
            })
          }
        />
        <MetricCard
          label="Kumuliertes Ergebnis"
          value={formatCHF(CUMULATIVE_RESULT)}
          subtitle={`${DATA_QUALITY.completeRange} (${COMPLETE_YEARS.length} Jahre)`}
          sourceType="derived"
          onClick={() =>
            inspector.inspect({
              label: 'Kumuliertes Ergebnis',
              value: formatCHF(CUMULATIVE_RESULT),
              sourceType: 'derived',
              source: DATA_QUALITY.source,
              formula: `SUM(Ergebnis ${DATA_QUALITY.completeRange})`,
              description: `Summe aller Geschäftsergebnisse ${DATA_QUALITY.completeRange}. Nur vollständige Jahre (mit verbuchten Aufwänden) berücksichtigt.`,
            })
          }
        />
        <MetricCard
          label="Durchschnitt"
          value={formatCHF(AVG_REVENUE)}
          subtitle={`Ø Umsatz ${DATA_QUALITY.completeRange}`}
          sourceType="derived"
          onClick={() =>
            inspector.inspect({
              label: 'Durchschnittlicher Umsatz',
              value: formatCHF(AVG_REVENUE),
              sourceType: 'derived',
              source: DATA_QUALITY.source,
              formula: `SUM(Umsatz ${DATA_QUALITY.completeRange}) / ${COMPLETE_YEARS.length}`,
              description: 'Durchschnittlicher Jahresumsatz über alle vollständigen Geschäftsjahre.',
            })
          }
        />
      </MetricGrid>

      {/* 8-year trend chart */}
      <div className="mb-8">
        <AnnualTrendChart data={ANNUAL_PL} />
      </div>

      {/* P&L table */}
      <ProfitLossTable data={ANNUAL_PL} />

      {/* Cost structure for benchmark year (2023) */}
      <CostStructureCard entry={LATEST_COMPLETE} />

      {/* Management insights */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Analyse</CardTitle>
        </CardHeader>
        {(() => {
          const lossYears = COMPLETE_YEARS.filter(y => y.result < 0);
          const lossYearRange = lossYears.length > 0
            ? `${lossYears[0].year}–${lossYears[lossYears.length - 1].year}`
            : '';
          const rentFirst = ANNUAL_PL[0].expenseDetail?.miete ?? 0;
          const rentPeak = Math.max(...COMPLETE_YEARS.filter(y => y.expenseDetail?.miete).map(y => y.expenseDetail!.miete));
          const profitYear = COMPLETE_YEARS.find(y => y.result > 0);

          return (
            <div className="grid gap-4 sm:grid-cols-2">
              <InsightCard
                variant="warning"
                title={`${lossYears.length} Jahre Verlust (${lossYearRange})`}
                text={`Kumulierter Verlust: ${formatCHF(CUMULATIVE_RESULT)}. Hauptursache: Miete von ${formatCHF(rentFirst)} (${ANNUAL_PL[0].year}) auf ${formatCHF(rentPeak)} (2021+), während Einnahmen stagnierten.`}
              />
              <InsightCard
                variant="warning"
                title="Umsatzrückgang 2024–2025"
                text={`Von ${formatCHF(PEAK_REVENUE)} (${PEAK_YEAR}) auf ${formatCHF(ANNUAL_PL[ANNUAL_PL.length - 1].revenue)} (${ANNUAL_PL[ANNUAL_PL.length - 1].year}). Dienstleistungen am stärksten betroffen.`}
              />
              <InsightCard
                variant="info"
                title={`Kostenstruktur ${LATEST_COMPLETE.year}`}
                text={`Miete & Nebenkosten: ${formatCHF(LATEST_COMPLETE.expenseDetail?.miete ?? 0)} (50% der Kosten). Personal: ${formatCHF(LATEST_COMPLETE.expenseDetail?.personal ?? 0)} (30%).`}
              />
              {profitYear && (
                <InsightCard
                  variant="info"
                  title={`Einziges Gewinnjahr: ${profitYear.year}`}
                  text={`${formatCHF(profitYear.result)} Gewinn bei niedrigen Kosten (Miete: ${formatCHF(profitYear.expenseDetail?.miete ?? 0)}, Personal: ${formatCHF(profitYear.expenseDetail?.personal ?? 0)}). Seither strukturelle Unterdeckung.`}
                />
              )}
            </div>
          );
        })()}
      </Card>

      {/* Data source */}
      <Card>
        <div className="text-sm text-text-light">
          <p className="font-medium text-grey-dark">Datenquelle</p>
          <p>{DATA_QUALITY.source}</p>
          <p className="mt-1 text-xs text-text-muted">
            System: {DATA_QUALITY.sourceSystem} | Vollständig: {DATA_QUALITY.completeRange} | Unvollständig: {DATA_QUALITY.incompleteRange}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {DATA_QUALITY.caveat}
          </p>
        </div>
      </Card>
    </div>
  );
}
