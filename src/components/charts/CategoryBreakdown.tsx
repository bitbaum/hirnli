import { DoughnutChart } from '@bitbaum/chartkit/react';
import ChartCard from './ChartCard';

interface CategoryBreakdownProps {
  warenverkauf: number;
  dienstleistungen: number;
  integration: number;
  spenden: number;
  title?: string;
  className?: string;
}

/** Revenue for the year split by category. */
export default function CategoryBreakdown({
  warenverkauf,
  dienstleistungen,
  integration,
  spenden,
  title = 'Einnahmen nach Kategorie',
  className,
}: CategoryBreakdownProps) {
  return (
    <ChartCard title={title} className={className}>
      <DoughnutChart
        rows={[
          { label: 'Warenverkauf', value: warenverkauf },
          { label: 'Dienstleistungen', value: dienstleistungen },
          { label: 'Integration', value: integration },
          { label: 'Spenden', value: spenden },
        ]}
        unit="CHF"
        caption={title}
        locale="de-CH"
        labelHeading="Kategorie"
        valueHeading="Betrag"
      />
    </ChartCard>
  );
}
