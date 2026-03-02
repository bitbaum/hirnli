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
import {
  EXPENSE_CATEGORIES,
  DATA_QUALITY,
  type AnnualPLEntry,
} from './data';

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
// DataQualityBanner — transparent data quality warning
// ---------------------------------------------------------------------------

export function DataQualityBanner() {
  return (
    <div className="mb-6 rounded-lg border border-warning/30 bg-warning-bg/20 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg text-warning">&#9888;</span>
        <div>
          <h3 className="text-sm font-semibold text-grey-dark">
            Datenqualität & Transparenz
          </h3>
          <p className="mt-1 text-xs text-text-light">
            <strong>Vollständige Erfolgsrechnung:</strong> {DATA_QUALITY.completeRange} (Einnahmen + Aufwände).{' '}
            <strong>Nur Einnahmen:</strong> {DATA_QUALITY.incompleteRange} — Aufwände wurden im Buchhaltungssystem nicht verbucht.
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Quelle: {DATA_QUALITY.source}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProfitLossTable — multi-year P&L comparison
// ---------------------------------------------------------------------------

export function ProfitLossTable({ data }: { data: AnnualPLEntry[] }) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Erfolgsrechnung 2018–2025</CardTitle>
      </CardHeader>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-muted">
              <th className="pb-2 font-medium">Jahr</th>
              <th className="pb-2 text-right font-medium">Einnahmen</th>
              <th className="pb-2 text-right font-medium">Aufwand</th>
              <th className="pb-2 text-right font-medium">Ergebnis</th>
              <th className="pb-2 text-right font-medium">Marge</th>
              <th className="pb-2 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const margin = row.isComplete && row.revenue > 0
                ? row.result / row.revenue
                : null;
              return (
                <tr
                  key={row.year}
                  className={`border-b border-border/50 ${!row.isComplete ? 'opacity-60' : ''}`}
                >
                  <td className="py-2.5 font-medium">
                    {row.year}
                    {row.note && (
                      <span className="ml-1 text-xs text-text-muted" title={row.note}>*</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">{formatCHF(row.revenue)}</td>
                  <td className="py-2.5 text-right">
                    {row.isComplete ? formatCHF(row.expenses) : (
                      <span className="text-text-muted">k.A.</span>
                    )}
                  </td>
                  <td className={`py-2.5 text-right font-semibold ${
                    !row.isComplete ? 'text-text-muted' :
                    row.result > 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {row.isComplete ? formatCHF(row.result) : (
                      <span className="text-text-muted">–</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    {margin !== null ? (
                      <span className={margin >= 0 ? 'text-success' : 'text-danger'}>
                        {margin >= 0 ? '+' : ''}{formatPercent(margin)}
                      </span>
                    ) : (
                      <span className="text-text-muted">–</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.isComplete ? (
                      <Badge variant={row.result >= 0 ? 'success' : 'danger'}>
                        {row.result >= 0 ? 'Gewinn' : 'Verlust'}
                      </Badge>
                    ) : (
                      <Badge variant="warning">Unvollständig</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {data.map((row) => (
          <div
            key={row.year}
            className={`rounded-lg border border-border/50 p-3 ${!row.isComplete ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{row.year}</span>
              {row.isComplete ? (
                <Badge variant={row.result >= 0 ? 'success' : 'danger'}>
                  {row.result >= 0 ? 'Gewinn' : 'Verlust'}
                </Badge>
              ) : (
                <Badge variant="warning">Unvollständig</Badge>
              )}
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <div>
                <span className="text-text-muted">Einnahmen</span>
                <div className="font-medium">{formatCHF(row.revenue)}</div>
              </div>
              <div>
                <span className="text-text-muted">Aufwand</span>
                <div className="font-medium">
                  {row.isComplete ? formatCHF(row.expenses) : 'k.A.'}
                </div>
              </div>
              {row.isComplete && (
                <div className="col-span-2">
                  <span className="text-text-muted">Ergebnis</span>
                  <div className={`font-semibold ${row.result >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCHF(row.result)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footnotes */}
      {data.some((d) => d.note) && (
        <p className="mt-3 text-xs text-text-muted">
          * {data.filter((d) => d.note).map((d) => `${d.year}: ${d.note}`).join(' | ')}
        </p>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// CostStructureCard — expense breakdown for a given year
// ---------------------------------------------------------------------------

export function CostStructureCard({ entry }: { entry: AnnualPLEntry }) {
  if (!entry.expenseDetail || !entry.isComplete) return null;

  const detail = entry.expenseDetail;
  const total = entry.expenses;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Kostenstruktur {entry.year}</CardTitle>
      </CardHeader>

      {/* Stacked bar */}
      <div className="mb-4 flex h-8 overflow-hidden rounded-lg">
        {EXPENSE_CATEGORIES.map((cat) => {
          const amount = detail[cat.key];
          const pct = total > 0 ? (amount / total) * 100 : 0;
          if (pct < 0.5) return null;
          return (
            <div
              key={cat.key}
              className="flex items-center justify-center text-xs font-medium text-white"
              style={{ width: `${pct}%`, backgroundColor: cat.color }}
              title={`${cat.label}: ${formatCHF(amount)} (${pct.toFixed(1)}%)`}
            >
              {pct > 8 ? `${pct.toFixed(0)}%` : ''}
            </div>
          );
        })}
      </div>

      {/* Legend table */}
      <div className="space-y-2">
        {EXPENSE_CATEGORIES.map((cat) => {
          const amount = detail[cat.key];
          const pct = total > 0 ? (amount / total) * 100 : 0;
          return (
            <div key={cat.key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.label}</span>
                <span className="text-xs text-text-muted">({cat.codes})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-text-muted">{pct.toFixed(1)}%</span>
                <span className="font-medium">{formatCHF(amount)}</span>
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
          <span>Total Aufwand</span>
          <span>{formatCHF(total)}</span>
        </div>
      </div>

      {/* Context */}
      <div className="mt-3 rounded-lg bg-danger-bg/20 p-3 text-xs text-text-light">
        <strong>Ergebnis {entry.year}:</strong>{' '}
        <span className={entry.result >= 0 ? 'text-success' : 'text-danger'}>
          {formatCHF(entry.result)}
        </span>
        {' '}bei {formatCHF(entry.revenue)} Einnahmen.
        {entry.year === 2023 && (
          <span className="ml-1">
            Miete macht {((detail.miete / total) * 100).toFixed(0)}% der Kosten aus —
            der grösste Kostentreiber.
          </span>
        )}
      </div>

      {entry.note && (
        <p className="mt-2 text-xs text-text-muted">⚠ {entry.note}</p>
      )}
    </Card>
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
