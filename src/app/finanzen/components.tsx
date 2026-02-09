import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import {
  formatCHF,
  formatPercent,
  formatMonthShort,
  calcGrowth,
} from '@/lib/utils/format';
import type { MonthlyAggregate } from '@/lib/schemas/financial';

// ---------------------------------------------------------------------------
// InsightCard — small helper for management insights section
// ---------------------------------------------------------------------------

export function InsightCard({
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

// ---------------------------------------------------------------------------
// YearComparison — year-over-year comparison card
// ---------------------------------------------------------------------------

interface YearTotals {
  total: number;
  warenverkauf: number;
  dienstleistungen: number;
  integration: number;
  spenden: number;
  aufstockung: number;
}

export function YearComparison({
  selectedYear,
  totals,
  prevTotals,
  donations,
  prevDonations,
}: {
  selectedYear: number;
  totals: YearTotals;
  prevTotals: YearTotals;
  donations: number;
  prevDonations: number;
}) {
  if (prevTotals.total <= 0) return null;

  const rows = [
    { label: 'Gesamteinnahmen', current: totals.total, previous: prevTotals.total },
    { label: 'Warenverkauf', current: totals.warenverkauf, previous: prevTotals.warenverkauf },
    { label: 'Dienstleistungen', current: totals.dienstleistungen, previous: prevTotals.dienstleistungen },
    { label: 'Integration', current: totals.integration, previous: prevTotals.integration },
    { label: 'Spenden + Aufstockung', current: donations, previous: prevDonations },
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Jahresvergleich {selectedYear - 1} vs. {selectedYear}</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {rows.map((row) => {
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
  );
}

// ---------------------------------------------------------------------------
// MonthlyBreakdownTable — monthly data table with totals row
// ---------------------------------------------------------------------------

export function MonthlyBreakdownTable({
  selectedYear,
  monthlyData,
  totals,
}: {
  selectedYear: number;
  monthlyData: MonthlyAggregate[];
  totals: YearTotals;
}) {
  return (
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
  );
}
