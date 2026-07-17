// ---------------------------------------------------------------------------
// YearComparison — year-over-year comparison card
// ---------------------------------------------------------------------------

import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCHF, formatPercent, calcGrowth } from '@/lib/utils/format';

export interface YearTotals {
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
            <div key={row.label} className="flex items-center justify-between border-b border-border-default pb-3 last:border-0">
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
