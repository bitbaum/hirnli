import { ColumnChart } from '@bitbaum/chartkit/react';
import type { AnnualPLEntry } from '@/app/(tenant)/finanzen/data';
import { FINANCIAL_YEAR_LABEL } from '@/lib/config/financial-constants';
import { formatCHF } from '@/lib/utils/format';
import ChartCard from './ChartCard';

interface AnnualTrendChartProps {
  data: AnnualPLEntry[];
  title?: string;
  className?: string;
}

/**
 * Revenue and expenses per year, side by side, on @bitbaum/chartkit. A year
 * whose expenses are not booked yet has no expense column ("—" in the table)
 * and says so in its note.
 */
export default function AnnualTrendChart({
  data,
  title = `Einnahmen & Aufwand (${FINANCIAL_YEAR_LABEL})`,
  className,
}: AnnualTrendChartProps) {
  const note = (d: AnnualPLEntry) =>
    d.isComplete ? `Ergebnis: ${formatCHF(d.result)}` : 'Aufwände nicht verbucht';
  return (
    <ChartCard title={title} className={`chart-income-expense ${className ?? ''}`}>
      <ColumnChart
        series={[
          {
            id: 'revenue',
            label: 'Einnahmen',
            points: data.map((d) => ({ x: String(d.year), y: d.revenue, note: note(d) })),
          },
          {
            id: 'expenses',
            label: 'Aufwand',
            points: data.map((d) => ({
              x: String(d.year),
              y: d.isComplete ? d.expenses : null,
              note: note(d),
            })),
          },
        ]}
        unit="CHF"
        caption={title}
        locale="de-CH"
        periodLabel="Jahr"
      />
    </ChartCard>
  );
}
