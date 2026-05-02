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
import { APPLICATION_STATUSES, type ApplicationStatusId } from '@/lib/config/application-statuses';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Semantic chart colors keyed by status ID — must cover all 11 statuses
// Colors intentionally match the Tailwind badge colors in APPLICATION_STATUSES
const STATUS_CHART_COLORS: Record<ApplicationStatusId, { bg: string; border: string }> = {
  prospect:  { bg: 'rgba(156, 163, 175, 0.6)', border: 'rgba(156, 163, 175, 1)' }, // gray
  research:  { bg: 'rgba(59, 130, 246, 0.6)',  border: 'rgba(59, 130, 246, 1)'  }, // blue
  draft:     { bg: 'rgba(147, 51, 234, 0.6)',  border: 'rgba(147, 51, 234, 1)'  }, // purple
  review:    { bg: 'rgba(234, 179, 8, 0.6)',   border: 'rgba(234, 179, 8, 1)'   }, // yellow
  submitted: { bg: 'rgba(99, 102, 241, 0.6)',  border: 'rgba(99, 102, 241, 1)'  }, // indigo
  pending:   { bg: 'rgba(249, 115, 22, 0.6)',  border: 'rgba(249, 115, 22, 1)'  }, // orange
  followup:  { bg: 'rgba(236, 72, 153, 0.6)',  border: 'rgba(236, 72, 153, 1)'  }, // pink
  accepted:  { bg: 'rgba(34, 197, 94, 0.6)',   border: 'rgba(34, 197, 94, 1)'   }, // green
  rejected:  { bg: 'rgba(239, 68, 68, 0.6)',   border: 'rgba(239, 68, 68, 1)'   }, // red
  withdrawn: { bg: 'rgba(203, 213, 225, 0.6)', border: 'rgba(203, 213, 225, 1)' }, // slate-light
  onhold:    { bg: 'rgba(100, 116, 139, 0.6)', border: 'rgba(100, 116, 139, 1)' }, // slate
};

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
          (STATUS_CHART_COLORS[item.status as ApplicationStatusId] ?? FALLBACK_COLOR).bg
        ),
        borderColor: data.map(item =>
          (STATUS_CHART_COLORS[item.status as ApplicationStatusId] ?? FALLBACK_COLOR).border
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
