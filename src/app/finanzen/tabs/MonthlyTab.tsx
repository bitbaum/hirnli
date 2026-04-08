import dynamic from 'next/dynamic';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import YearSelector from '@/components/ui/YearSelector';
import {
  formatCHF,
  formatPercent,
  formatMonthShort,
} from '@/lib/utils/format';
import { NumberSources, metricToInspectorData } from '@/lib/config/metrics';
import { REVENUE_CATEGORIES } from '../data';
import {
  InsightCard,
  YearComparison,
  MonthlyBreakdownTable,
} from '../components';
import type { InspectorHandle } from '@/app/fundraising/sections/Inspectable';
import type { useFinancialData } from '@/hooks/useFinancialData';

const ChartSkeleton = () => (
  <Card padding={false} className="flex h-80 items-center justify-center text-text-muted">Laden...</Card>
);

const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const CategoryBreakdown = dynamic(() => import('@/components/charts/CategoryBreakdown'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

type FinancialData = ReturnType<typeof useFinancialData>;

interface MonthlyTabProps {
  data: FinancialData;
  prevTotals: FinancialData['totals'];
  growth: number;
  inspector: InspectorHandle;
}

export default function MonthlyTab({ data, prevTotals, growth, inspector }: MonthlyTabProps) {
  const {
    selectedYear,
    setSelectedYear,
    availableYears,
    monthlyData,
    totals,
    monthCount,
    monthlyAvg,
    selfFinancingRate,
  } = data;

  const earned = totals.warenverkauf + totals.dienstleistungen + totals.integration;
  const donations = totals.spenden + totals.aufstockung;
  const prevDonations = prevTotals.spenden + prevTotals.aufstockung;

  return (
    <div>
      <YearSelector
        years={availableYears}
        selected={selectedYear}
        onChange={setSelectedYear}
        className="mb-6"
      />

      {/* Financial overview metrics */}
      <MetricGrid columns={4} className="mb-8">
        <MetricCard
          label="Gesamteinnahmen"
          value={formatCHF(totals.total)}
          subtitle={`${monthCount} Monate erfasst`}
          trend={growth !== 0 ? { value: growth, label: `vs. ${selectedYear - 1}` } : undefined}
          sourceType="live"
          onClick={() =>
            inspector.inspect(metricToInspectorData(
              NumberSources.financial_total_2025,
              formatCHF(totals.total),
              { year: selectedYear },
            ))
          }
        />
        <MetricCard
          label="Eigenerwirtschaftet"
          value={formatCHF(earned)}
          subtitle="Waren + Dienste + Integration"
          sourceType="derived"
          onClick={() =>
            inspector.inspect(metricToInspectorData(
              NumberSources.financial_earned_2025,
              formatCHF(earned),
              {
                year: selectedYear,
                formula: `${formatCHF(totals.warenverkauf)} + ${formatCHF(totals.dienstleistungen)} + ${formatCHF(totals.integration)}`,
              },
            ))
          }
        />
        <MetricCard
          label="Spenden & Förderung"
          value={formatCHF(donations)}
          subtitle={`${formatPercent(totals.total > 0 ? donations / totals.total : 0)} vom Total`}
          sourceType="live"
          onClick={() =>
            inspector.inspect(metricToInspectorData(
              NumberSources.financial_donations_2025,
              formatCHF(donations),
              {
                year: selectedYear,
                formula: `${formatCHF(totals.spenden)} + ${formatCHF(totals.aufstockung)}`,
              },
            ))
          }
        />
        <MetricCard
          label="Eigenfinanzierung"
          value={formatPercent(selfFinancingRate)}
          subtitle="Ziel: >70%"
          sourceType="derived"
          onClick={() =>
            inspector.inspect(metricToInspectorData(
              NumberSources.financial_self_financing_2025,
              formatPercent(selfFinancingRate),
              {
                year: selectedYear,
                formula: `(${formatCHF(totals.warenverkauf)} + ${formatCHF(totals.dienstleistungen)}) / ${formatCHF(totals.total)}`,
              },
            ))
          }
        />
      </MetricGrid>

      {/* Category breakdown cards */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-grey-dark">Einnahmen nach Kategorie</h2>
        <MetricGrid columns={3}>
          {REVENUE_CATEGORIES.map((cat) => {
            const amount = totals[cat.key];
            const share = totals.total > 0 ? amount / totals.total : 0;
            return (
              <MetricCard
                key={cat.key}
                label={cat.label}
                value={formatCHF(amount)}
                subtitle={`${formatPercent(share)} vom Total | Konto ${cat.code}`}
                sourceType="live"
                onClick={() =>
                  inspector.inspect({
                    label: cat.label,
                    value: formatCHF(amount),
                    sourceType: 'live',
                    source: `revamp-Einnahmen-${selectedYear}.xlsx`,
                    account: `${cat.code} (${cat.label})`,
                    description: `Einnahmen aus ${cat.label} im Jahr ${selectedYear}`,
                  })
                }
              />
            );
          })}
          <MetricCard
            label="Monatsdurchschnitt"
            value={formatCHF(monthlyAvg)}
            subtitle="pro aktivem Monat"
            sourceType="derived"
            onClick={() =>
              inspector.inspect(metricToInspectorData(
                NumberSources.financial_monthly_avg_2025,
                formatCHF(monthlyAvg),
                { year: selectedYear, formula: `${formatCHF(totals.total)} / ${monthCount} Monate` },
              ))
            }
          />
        </MetricGrid>
      </section>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <RevenueChart data={monthlyData} title={`Monatlicher Umsatzverlauf ${selectedYear}`} />
        <CategoryBreakdown
          warenverkauf={totals.warenverkauf}
          dienstleistungen={totals.dienstleistungen}
          integration={totals.integration}
          spenden={totals.spenden + totals.aufstockung}
          title={`Einnahmenverteilung ${selectedYear}`}
        />
      </div>

      {/* Year-over-year comparison */}
      <YearComparison
        selectedYear={selectedYear}
        totals={totals}
        prevTotals={prevTotals}
        donations={donations}
        prevDonations={prevDonations}
      />

      {/* Monthly breakdown table */}
      <MonthlyBreakdownTable
        selectedYear={selectedYear}
        monthlyData={monthlyData}
        totals={totals}
      />

      {/* Insights */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Management Insights</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <InsightCard
            variant={selfFinancingRate >= 0.6 ? 'success' : 'warning'}
            title={selfFinancingRate >= 0.6 ? 'Eigenfinanzierung stabil' : 'Hohe Spendenabhängigkeit'}
            text={
              selfFinancingRate >= 0.6
                ? `Mit ${formatPercent(selfFinancingRate)} Eigenfinanzierung ist die Organisation gut aufgestellt.`
                : `Nur ${formatPercent(selfFinancingRate)} werden selbst erwirtschaftet. Diversifizierung empfohlen.`
            }
          />
          {monthlyData.length > 0 && (
            <InsightCard
              variant="info"
              title="Stärkster Monat"
              text={(() => {
                const best = monthlyData.reduce((a, b) => (b.total > a.total ? b : a));
                return `${formatMonthShort(best.period)} mit ${formatCHF(best.total)} war der umsatzstärkste Monat.`;
              })()}
            />
          )}
          {growth !== 0 && (
            <InsightCard
              variant={growth > 0 ? 'success' : 'warning'}
              title={growth > 0 ? 'Wachstum gegenüber Vorjahr' : 'Rückgang gegenüber Vorjahr'}
              text={`${growth > 0 ? '+' : ''}${formatPercent(growth)} Einnahmen verglichen mit ${selectedYear - 1}.`}
            />
          )}
          <InsightCard
            variant="info"
            title="Warenverkauf-Anteil"
            text={`Warenverkauf macht ${formatPercent(totals.total > 0 ? totals.warenverkauf / totals.total : 0)} der Gesamteinnahmen aus.`}
          />
        </div>
      </Card>

      {/* Data source info */}
      <Card>
        <div className="text-sm text-text-light">
          <p className="font-medium text-grey-dark">Datenquelle</p>
          <p>Kivitendo Buchhaltung (Export: revamp-Einnahmen-{selectedYear}.xlsx)</p>
          <p className="mt-1 text-xs text-text-muted">
            Konten: 3100 Warenverkauf, 3400 Dienstleistungen, 3450 Integration, 3500 Spenden, 3510 Aufstockung
          </p>
        </div>
      </Card>
    </div>
  );
}
