// ---------------------------------------------------------------------------
// MonthlyBreakdownTable — monthly data table with totals row
// ---------------------------------------------------------------------------

import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import { formatCHF, formatMonthShort } from '@/lib/utils/format';
import type { MonthlyAggregate } from '@/lib/schemas/financial';
import type { YearTotals } from './YearComparison';

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
        <div className="mt-2 flex items-center justify-between border-t-2 border-border-default bg-surface-raised px-3 py-2 text-sm font-bold">
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
