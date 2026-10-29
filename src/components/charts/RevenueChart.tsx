import { ColumnChart } from '@bitbaum/chartkit/react';
import type { MonthlyAggregate } from '@/lib/schemas/financial';
import ChartCard from './ChartCard';

interface RevenueChartProps {
  data: MonthlyAggregate[];
  title?: string;
  className?: string;
}

/** Monthly revenue by category, stacked, on @bitbaum/chartkit. `period` is the ISO month. */
export default function RevenueChart({
  data,
  title = 'Einnahmen nach Monat',
  className,
}: RevenueChartProps) {
  const series = (id: string, label: string, value: (d: MonthlyAggregate) => number) => ({
    id,
    label,
    points: data.map((d) => ({ x: d.period, y: value(d) })),
  });
  return (
    <ChartCard title={title} className={className}>
      <ColumnChart
        series={[
          series('warenverkauf', 'Warenverkauf', (d) => d.warenverkauf),
          series('dienstleistungen', 'Dienstleistungen', (d) => d.dienstleistungen),
          series('spenden', 'Spenden', (d) => d.spenden + d.aufstockung),
        ]}
        stacked
        unit="CHF"
        caption={title}
        locale="de-CH"
        periodLabel="Monat"
      />
    </ChartCard>
  );
}
