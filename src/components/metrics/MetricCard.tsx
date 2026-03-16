import Badge from '@/components/ui/Badge';
import { formatPercent } from '@/lib/utils/format';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: { value: number; label?: string };
  sourceType?: 'live' | 'derived' | 'estimated' | 'none';
  onClick?: () => void;
  className?: string;
}

const SOURCE_ICONS = {
  live: '●',
  derived: '◐',
  estimated: '○',
  none: '?',
} as const;

export default function MetricCard({
  label,
  value,
  subtitle,
  trend,
  sourceType,
  onClick,
  className = '',
}: MetricCardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-white p-4 ${
        onClick ? 'cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2' : ''
      } ${className}`}
      onClick={onClick}
      {...(onClick ? { tabIndex: 0, role: 'button', onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } } : {})}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</span>
        {sourceType && (
          <Badge variant={sourceType}>
            {SOURCE_ICONS[sourceType]}
          </Badge>
        )}
      </div>
      <div className="text-2xl font-bold text-grey-dark">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-text-light">{subtitle}</div>}
      {trend && (
        <div
          className={`mt-2 text-sm font-medium ${
            trend.value > 0 ? 'text-success' : trend.value < 0 ? 'text-danger' : 'text-text-muted'
          }`}
        >
          {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'}{' '}
          {formatPercent(Math.abs(trend.value))}
          {trend.label && <span className="ml-1 text-xs text-text-muted">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}
