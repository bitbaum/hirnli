'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatCHF } from '@/lib/utils/format';
import { CHART_PALETTE, CHART_COLORS } from '@/lib/config/chart-colors';
import ChartWrapper from './ChartWrapper';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryBreakdownProps {
  warenverkauf: number;
  dienstleistungen: number;
  integration: number;
  spenden: number;
  title?: string;
  className?: string;
}

export default function CategoryBreakdown({
  warenverkauf,
  dienstleistungen,
  integration,
  spenden,
  title = 'Einnahmen nach Kategorie',
  className,
}: CategoryBreakdownProps) {
  const chartData = {
    labels: ['Warenverkauf', 'Dienstleistungen', 'Integration', 'Spenden'],
    datasets: [
      {
        data: [warenverkauf, dienstleistungen, integration, spenden],
        backgroundColor: [CHART_PALETTE[0], CHART_PALETTE[1], CHART_PALETTE[4], CHART_PALETTE[2]],
        borderWidth: 2,
        borderColor: CHART_COLORS.white,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; parsed: number }) =>
            `${ctx.label}: ${formatCHF(ctx.parsed)}`,
        },
      },
    },
  };

  return (
    <ChartWrapper title={title} className={className}>
      <Doughnut data={chartData} options={options} />
    </ChartWrapper>
  );
}
