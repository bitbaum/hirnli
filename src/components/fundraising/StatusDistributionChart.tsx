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

interface StatusCount {
  status: string;
  count: number;
}

interface StatusDistributionChartProps {
  data: StatusCount[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  // Map status IDs to labels and colors
  const chartData: ChartData<'pie'> = {
    labels: data.map(item => {
      const config = APPLICATION_STATUSES.find(s => s.id === item.status);
      return config?.label || item.status;
    }),
    datasets: [
      {
        label: 'Gesuche',
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',   // blue
          'rgba(147, 51, 234, 0.6)',   // purple
          'rgba(99, 102, 241, 0.6)',   // indigo
          'rgba(249, 115, 22, 0.6)',   // orange
          'rgba(34, 197, 94, 0.6)',    // green
          'rgba(239, 68, 68, 0.6)',    // red
          'rgba(107, 114, 128, 0.6)',  // gray
          'rgba(251, 191, 36, 0.6)',   // yellow
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(147, 51, 234, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(107, 114, 128, 1)',
          'rgba(251, 191, 36, 1)',
        ],
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
