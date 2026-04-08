'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { AnnualPLEntry } from '@/app/finanzen/data';
import { FINANCIAL_YEAR_LABEL } from '@/lib/config/financial-constants';
import { formatCHF } from '@/lib/utils/format';
import { CHART_COLORS } from '@/lib/config/chart-colors';
import ChartWrapper from './ChartWrapper';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AnnualTrendChartProps {
  data: AnnualPLEntry[];
  title?: string;
  className?: string;
}

export default function AnnualTrendChart({
  data,
  title = `Einnahmen & Aufwand (${FINANCIAL_YEAR_LABEL})`,
  className,
}: AnnualTrendChartProps) {
  const labels = data.map((d) => String(d.year));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Einnahmen',
        data: data.map((d) => d.revenue),
        backgroundColor: data.map((d) =>
          d.isComplete ? CHART_COLORS.green : `${CHART_COLORS.green}AA`,
        ),
        borderRadius: 3,
      },
      {
        label: 'Aufwand',
        data: data.map((d) => (d.isComplete ? d.expenses : null)),
        backgroundColor: CHART_COLORS.red,
        borderRadius: 3,
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
          label: (ctx: {
            dataset: { label?: string };
            parsed: { y: number | null };
          }) => {
            if (ctx.parsed.y === null) return `${ctx.dataset.label}: k.A.`;
            return `${ctx.dataset.label}: ${formatCHF(ctx.parsed.y)}`;
          },
          afterBody: (contexts: { dataIndex: number }[]) => {
            const idx = contexts[0]?.dataIndex;
            if (idx === undefined) return '';
            const entry = data[idx];
            if (!entry) return '';
            if (!entry.isComplete) return '⚠ Aufwände nicht verbucht';
            return `Ergebnis: ${formatCHF(entry.result)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => {
            const n = Number(value);
            if (n >= 1000) return `${Math.round(n / 1000)}k`;
            return String(n);
          },
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
