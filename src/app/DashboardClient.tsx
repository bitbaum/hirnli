'use client';

import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import NumberInspector from '@/components/metrics/NumberInspector';
import RevenueChart from '@/components/charts/RevenueChart';
import CategoryBreakdown from '@/components/charts/CategoryBreakdown';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useNumberInspector } from '@/hooks/useNumberInspector';
import { formatCHF, formatPercent, formatMonthShort, calcGrowth } from '@/lib/utils/format';
import { estimateDeviceCount, estimateCO2Avoided } from '@/lib/domain/calculations';
import type { MonthlyAggregate } from '@/lib/schemas/financial';

export default function DashboardClient() {
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

  // Derived metrics
  const deviceCount = estimateDeviceCount(totals.warenverkauf);
  const co2Avoided = estimateCO2Avoided(deviceCount);

  // Year comparison
  const prevYearData = useFinancialData(selectedYear - 1);
  const growth = prevYearData.totals.total > 0
    ? calcGrowth(prevYearData.totals.total, totals.total)
    : 0;

  return (
    <div>
      <PageHeader
        title="Revamp-IT Dashboard"
        subtitle="Finanzielle Kennzahlen und Wirkungsdaten"
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

      {/* Hero stats */}
      <MetricGrid columns={4} className="mb-8">
        <MetricCard
          label="Gesamteinnahmen"
          value={formatCHF(totals.total)}
          subtitle={`${monthCount} Monate`}
          trend={growth !== 0 ? { value: growth, label: 'vs. Vorjahr' } : undefined}
          sourceType="live"
          onClick={() =>
            inspector.inspect({
              label: 'Gesamteinnahmen',
              value: formatCHF(totals.total),
              sourceType: 'live',
              source: 'revamp-Einnahmen-2025.xlsx',
              account: '30-38 (Nettoerlöse Total)',
              description: 'Gesamteinnahmen aus allen Geschäftsbereichen',
            })
          }
        />
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
        <MetricCard
          label="Eigenfinanzierung"
          value={formatPercent(selfFinancingRate)}
          subtitle="Waren + Dienste / Total"
          sourceType="derived"
          onClick={() =>
            inspector.inspect({
              label: 'Eigenfinanzierungsgrad',
              value: formatPercent(selfFinancingRate),
              sourceType: 'derived',
              source: 'Berechnet aus Kategorien',
              formula: `(${formatCHF(totals.warenverkauf)} + ${formatCHF(totals.dienstleistungen)}) / ${formatCHF(totals.total)}`,
              description: 'Anteil der Einnahmen aus eigener Wirtschaftstätigkeit',
            })
          }
        />
        <MetricCard
          label="CO₂ vermieden"
          value={`~${co2Avoided} t`}
          subtitle={`~${deviceCount} Geräte`}
          sourceType="estimated"
          onClick={() =>
            inspector.inspect({
              label: 'CO₂ vermieden',
              value: `~${co2Avoided} Tonnen`,
              sourceType: 'estimated',
              source: 'Schätzung aus Warenverkauf',
              formula: `${formatCHF(totals.warenverkauf)} / CHF 150 pro Gerät × 300 kg CO₂`,
              confidence: 'Mittel',
              description: 'Geschätzte CO₂-Einsparung durch refurbished Geräte',
            })
          }
        />
      </MetricGrid>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <RevenueChart data={monthlyData} title={`Einnahmen ${selectedYear} nach Monat`} />
        <CategoryBreakdown
          warenverkauf={totals.warenverkauf}
          dienstleistungen={totals.dienstleistungen}
          integration={totals.integration}
          spenden={totals.spenden + totals.aufstockung}
          title={`Einnahmen ${selectedYear} nach Kategorie`}
        />
      </div>

      {/* Monthly table */}
      <Card className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-grey-dark">Monatliche Einnahmen {selectedYear}</h3>
        <Table
          columns={[
            { key: 'period', header: 'Monat', render: (row: MonthlyAggregate) => formatMonthShort(row.period) },
            { key: 'warenverkauf', header: 'Warenverkauf', align: 'right', render: (row: MonthlyAggregate) => formatCHF(row.warenverkauf) },
            { key: 'dienstleistungen', header: 'Dienste', align: 'right', render: (row: MonthlyAggregate) => formatCHF(row.dienstleistungen) },
            { key: 'spenden', header: 'Spenden', align: 'right', render: (row: MonthlyAggregate) => formatCHF(row.spenden) },
            { key: 'total', header: 'Total', align: 'right', className: 'font-semibold', render: (row: MonthlyAggregate) => formatCHF(row.total) },
          ]}
          data={monthlyData}
          keyExtractor={(row) => row.period}
          compact
        />
      </Card>

      {/* Quick navigation */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: '/finanzen', icon: '💰', title: 'Finanzen', desc: 'Detaillierte Finanzanalyse' },
          { href: '/kennzahlen', icon: '📊', title: 'Kennzahlen', desc: '28 KPIs über 6 Dimensionen' },
          { href: '/wirkung', icon: '🌱', title: 'Wirkung', desc: 'CO₂, Geräte, Menschen' },
          { href: '/fundraising/stiftungen', icon: '🎯', title: 'Stiftungen', desc: 'Alle Förderstiftungen' },
          { href: '/methodik', icon: '🔬', title: 'Methodik', desc: 'Berechnungen & Quellen' },
          { href: '/dokumente', icon: '📄', title: 'Dokumente', desc: 'Berichte & Vorlagen' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-start gap-3 rounded-lg border border-border bg-white p-4 transition-all hover:border-primary/30 hover:shadow-md hover:no-underline"
          >
            <span className="text-2xl">{link.icon}</span>
            <div>
              <span className="font-semibold text-grey-dark">{link.title}</span>
              <span className="block text-sm text-text-light">{link.desc}</span>
            </div>
          </Link>
        ))}
      </div>

      <NumberInspector isOpen={inspector.isOpen} onClose={inspector.close} data={inspector.data} />
    </div>
  );
}
