/**
 * Status Distribution Chart - Pie chart showing applications by status
 *
 * Uses Chart.js for visualization.
 */

'use client';

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
} from 'chart.js';
import { APPLICATION_STATUSES } from '@/lib/config/application-statuses';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const FALLBACK_COLOR = { bg: 'rgba(107, 114, 128, 0.6)', border: 'rgba(107, 114, 128, 1)' };

interface StatusCount {
  status: string;
  count: number;
}

interface StatusDistributionChartProps {
  data: StatusCount[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData: ChartData<'pie'> = {
    labels: data.map(item => {
      const config = APPLICATION_STATUSES.find(s => s.id === item.status);
      return config?.label || item.status;
    }),
    datasets: [
      {
        label: 'Gesuche',
        data: data.map(item => item.count),
        backgroundColor: data.map(item =>
          (APPLICATION_STATUSES.find(s => s.id === item.status)?.chartColor ?? FALLBACK_COLOR).bg
        ),
        borderColor: data.map(item =>
          (APPLICATION_STATUSES.find(s => s.id === item.status)?.chartColor ?? FALLBACK_COLOR).border
        ),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { label?: string; parsed?: number; dataset: { data: number[] } }) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Pie data={chartData} options={options} />
    </div>
  );
}
