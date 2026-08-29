'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { MonthlyAggregate } from '@/lib/schemas/financial';
import { formatCHF, formatMonthShort } from '@/lib/utils/format';
import { CHART_COLORS } from '@/lib/config/chart-colors';
import ChartWrapper from './ChartWrapper';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

interface RevenueChartProps {
  data: MonthlyAggregate[];
  title?: string;
  className?: string;
}

export default function RevenueChart({
  data,
  title = 'Einnahmen nach Monat',
  className,
}: RevenueChartProps) {
  const labels = data.map((d) => formatMonthShort(d.period));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Warenverkauf',
        data: data.map((d) => d.warenverkauf),
        backgroundColor: CHART_COLORS.blue,
      },
      {
        label: 'Dienstleistungen',
        data: data.map((d) => d.dienstleistungen),
        backgroundColor: CHART_COLORS.green,
      },
      {
        label: 'Spenden',
        data: data.map((d) => d.spenden + d.aufstockung),
        backgroundColor: CHART_COLORS.orange,
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
          label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
            `${ctx.dataset.label}: ${formatCHF(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        ticks: {
          callback: (value: string | number) => formatCHF(Number(value)),
        },
      },
    },
  };

  return (
    <ChartWrapper title={title} className={className}>
      <Bar data={chartData} options={options} />
    </ChartWrapper>
  );
}
