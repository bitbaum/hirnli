'use client';

import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import NumberInspector from '@/components/metrics/NumberInspector';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useNumberInspector } from '@/hooks/useNumberInspector';
import { formatCHF, formatPercent, calcGrowth } from '@/lib/utils/format';
import { estimateDeviceCount, estimateCO2Avoided } from '@/lib/domain/calculations';
import { NumberSources, metricToInspectorData } from '@/lib/config/metrics';
import { DASHBOARD_QUICKLINKS } from './data';

export default function DashboardClient() {
  const {
    selectedYear,
    totals,
    monthCount,
    monthlyAvg,
    selfFinancingRate,
  } = useFinancialData(2025);

  const inspector = useNumberInspector();

  const deviceCount = estimateDeviceCount(totals.warenverkauf);
  const co2Avoided = estimateCO2Avoided(deviceCount);

  const prevYearData = useFinancialData(selectedYear - 1);
  const growth = prevYearData.totals.total > 0
    ? calcGrowth(prevYearData.totals.total, totals.total)
    : 0;

  return (
    <div>
      <PageHeader
        title="Revamp-IT"
        subtitle="Fundraising Intelligence & Organisationsdaten"
      />

      {/* Key numbers — click for detail, or navigate to dedicated pages */}
      <MetricGrid columns={4} className="mb-8">
        <MetricCard
          label="Einnahmen 2025"
          value={formatCHF(totals.total)}
          subtitle={`${monthCount} Monate`}
          trend={growth !== 0 ? { value: growth, label: 'vs. Vorjahr' } : undefined}
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
        <MetricCard
          label="Eigenfinanzierung"
          value={formatPercent(selfFinancingRate)}
          subtitle="Waren + Dienste / Total"
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
        <MetricCard
          label="CO₂ vermieden"
          value={`~${co2Avoided} t`}
          subtitle={`~${deviceCount} Geräte`}
          sourceType="estimated"
          onClick={() =>
            inspector.inspect(metricToInspectorData(
              NumberSources.co2_total_2025,
              `~${co2Avoided} Tonnen`,
              { year: selectedYear, formula: `${formatCHF(totals.warenverkauf)} / CHF 150 pro Gerät × 300 kg CO₂` },
            ))
          }
        />
      </MetricGrid>

      {/* Navigation */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARD_QUICKLINKS.map((link) => (
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
