'use client';

import PageHeader from '@/components/layout/PageHeader';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import NumberInspector from '@/components/metrics/NumberInspector';
import RevenueChart from '@/components/charts/RevenueChart';
import CategoryBreakdown from '@/components/charts/CategoryBreakdown';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useNumberInspector } from '@/hooks/useNumberInspector';
import {
  formatCHF,
  formatPercent,
  formatMonthShort,
  formatNumber,
  calcGrowth,
} from '@/lib/utils/format';
import type { MonthlyAggregate } from '@/lib/schemas/financial';

// Revenue category config — SSOT for labels, codes, colors
const REVENUE_CATEGORIES = [
  { key: 'warenverkauf' as const, label: 'Warenverkauf', code: '3100' },
  { key: 'dienstleistungen' as const, label: 'Dienstleistungen', code: '3400' },
  { key: 'integration' as const, label: 'Integration', code: '3450' },
  { key: 'spenden' as const, label: 'Spenden', code: '3500' },
  { key: 'aufstockung' as const, label: 'Aufstockung', code: '3510' },
] as const;

export default function FinanzenPage() {
  const {
    selectedYear,
    setSelectedYear,
    availableYears,
    monthlyData,
    totals,
    monthCount,
    monthlyAvg,
    selfFinancingRate,
  } = useFinancialData(2025);

  const inspector = useNumberInspector();

  // Previous year for comparison
  const prevYear = useFinancialData(selectedYear - 1);
  const growth = prevYear.totals.total > 0
    ? calcGrowth(prevYear.totals.total, totals.total)
    : 0;

  // Derived values
  const earned = totals.warenverkauf + totals.dienstleistungen + totals.integration;
  const donations = totals.spenden + totals.aufstockung;

  return (
    <div>
      <PageHeader
        title={`Finanzubersicht ${selectedYear}`}
        subtitle="Detaillierte Einnahmenanalyse nach Kivitendo-Konten"
        badge="Quelldaten aus Buchhaltung"
      />

      {/* Year selector */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-text-muted">Jahr:</span>
        {availableYears.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedYear === year
                ? 'bg-primary text-white'
                : 'bg-grey-light text-grey-dark hover:bg-border'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Financial overview metrics */}
      <MetricGrid columns={4} className="mb-8">
        <MetricCard
          label="Gesamteinnahmen"
          value={formatCHF(totals.total)}
          subtitle={`${monthCount} Monate erfasst`}
          trend={growth !== 0 ? { value: growth, label: `vs. ${selectedYear - 1}` } : undefined}
          sourceType="live"
          onClick={() =>
            inspector.inspect({
              label: 'Gesamteinnahmen',
              value: formatCHF(totals.total),
              sourceType: 'live',
              source: `revamp-Einnahmen-${selectedYear}.xlsx`,
              account: '30-38 (Nettoerlöse Total)',
              description: `Gesamteinnahmen aus allen Geschäftsbereichen im Jahr ${selectedYear}`,
            })
          }
        />
        <MetricCard
          label="Eigenerwirtschaftet"
          value={formatCHF(earned)}
          subtitle="Waren + Dienste + Integration"
          sourceType="derived"
          onClick={() =>
            inspector.inspect({
              label: 'Eigenerwirtschaftet',
              value: formatCHF(earned),
              sourceType: 'derived',
              source: 'Berechnet aus Kategorien',
              formula: `${formatCHF(totals.warenverkauf)} + ${formatCHF(totals.dienstleistungen)} + ${formatCHF(totals.integration)}`,
              description: 'Summe aller Einnahmen aus eigener Wirtschaftstätigkeit (ohne Spenden)',
            })
          }
        />
        <MetricCard
          label="Spenden & Förderung"
          value={formatCHF(donations)}
          subtitle={`${formatPercent(totals.total > 0 ? donations / totals.total : 0)} vom Total`}
          sourceType="live"
          onClick={() =>
            inspector.inspect({
              label: 'Spenden & Förderung',
              value: formatCHF(donations),
              sourceType: 'live',
              source: `revamp-Einnahmen-${selectedYear}.xlsx`,
              account: '3500 + 3510',
              formula: `${formatCHF(totals.spenden)} + ${formatCHF(totals.aufstockung)}`,
              description: 'Einnahmen aus Spenden und Aufstockungen',
            })
          }
        />
        <MetricCard
          label="Eigenfinanzierung"
          value={formatPercent(selfFinancingRate)}
          subtitle="Ziel: >70%"
          sourceType="derived"
          onClick={() =>
            inspector.inspect({
              label: 'Eigenfinanzierungsgrad',
              value: formatPercent(selfFinancingRate),
              sourceType: 'derived',
              source: 'Berechnet aus Kategorien',
              formula: `(${formatCHF(totals.warenverkauf)} + ${formatCHF(totals.dienstleistungen)}) / ${formatCHF(totals.total)}`,
              description: 'Anteil der Einnahmen aus eigener Wirtschaftstätigkeit. Ziel: >70%',
            })
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
              inspector.inspect({
                label: 'Monatsdurchschnitt',
                value: formatCHF(monthlyAvg),
                sourceType: 'derived',
                source: 'Berechnet aus Gesamteinnahmen',
                formula: `${formatCHF(totals.total)} / ${monthCount} Monate`,
                description: 'Durchschnittliche monatliche Einnahmen',
              })
            }
          />
        </MetricGrid>
      </section>

      {/* Charts: Revenue over time + Category breakdown */}
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
      {prevYear.totals.total > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Jahresvergleich {selectedYear - 1} vs. {selectedYear}</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {[
              { label: 'Gesamteinnahmen', current: totals.total, previous: prevYear.totals.total },
              { label: 'Warenverkauf', current: totals.warenverkauf, previous: prevYear.totals.warenverkauf },
              { label: 'Dienstleistungen', current: totals.dienstleistungen, previous: prevYear.totals.dienstleistungen },
              { label: 'Integration', current: totals.integration, previous: prevYear.totals.integration },
              { label: 'Spenden + Aufstockung', current: donations, previous: prevYear.totals.spenden + prevYear.totals.aufstockung },
            ].map((row) => {
              const change = row.previous > 0 ? calcGrowth(row.previous, row.current) : 0;
              return (
                <div key={row.label} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <span className="text-sm">{row.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-text-muted">{formatCHF(row.previous)}</span>
                    <span className="font-semibold">{formatCHF(row.current)}</span>
                    {row.previous > 0 && (
                      <Badge variant={change > 0.05 ? 'success' : change < -0.05 ? 'danger' : 'default'}>
                        {change > 0 ? '+' : ''}{formatPercent(change)}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Monthly breakdown table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Monatliche Aufschlüsselung {selectedYear}</CardTitle>
        </CardHeader>
        <Table<MonthlyAggregate>
          columns={[
            {
              key: 'period',
              header: 'Monat',
              render: (row) => formatMonthShort(row.period),
            },
            {
              key: 'warenverkauf',
              header: 'Warenverkauf',
              align: 'right',
              render: (row) => formatCHF(row.warenverkauf),
            },
            {
              key: 'dienstleistungen',
              header: 'Dienste',
              align: 'right',
              render: (row) => formatCHF(row.dienstleistungen),
            },
            {
              key: 'integration',
              header: 'Integration',
              align: 'right',
              render: (row) => formatCHF(row.integration),
            },
            {
              key: 'spenden',
              header: 'Spenden',
              align: 'right',
              render: (row) => formatCHF(row.spenden),
            },
            {
              key: 'aufstockung',
              header: 'Aufstockung',
              align: 'right',
              render: (row) => formatCHF(row.aufstockung),
            },
            {
              key: 'total',
              header: 'Total',
              align: 'right',
              className: 'font-semibold',
              render: (row) => formatCHF(row.total),
            },
          ]}
          data={monthlyData}
          keyExtractor={(row) => row.period}
          compact
        />

        {/* Totals row */}
        {monthlyData.length > 0 && (
          <div className="mt-2 flex items-center justify-between border-t-2 border-border bg-bg-light px-3 py-2 text-sm font-bold">
            <span>TOTAL</span>
            <div className="flex gap-6">
              <span>{formatCHF(totals.warenverkauf)}</span>
              <span>{formatCHF(totals.dienstleistungen)}</span>
              <span>{formatCHF(totals.integration)}</span>
              <span>{formatCHF(totals.spenden)}</span>
              <span>{formatCHF(totals.aufstockung)}</span>
              <span>{formatCHF(totals.total)}</span>
            </div>
          </div>
        )}
      </Card>

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

      <NumberInspector isOpen={inspector.isOpen} onClose={inspector.close} data={inspector.data} />
    </div>
  );
}

// Small helper component for insight cards — keeps the page component clean
function InsightCard({
  variant,
  title,
  text,
}: {
  variant: 'success' | 'warning' | 'info';
  title: string;
  text: string;
}) {
  const colors = {
    success: 'border-l-4 border-l-success bg-success-bg/30',
    warning: 'border-l-4 border-l-warning bg-warning-bg/30',
    info: 'border-l-4 border-l-primary bg-primary/5',
  };

  return (
    <div className={`rounded-lg p-4 ${colors[variant]}`}>
      <h4 className="mb-1 text-sm font-semibold text-grey-dark">{title}</h4>
      <p className="text-xs text-text-light">{text}</p>
    </div>
  );
}
