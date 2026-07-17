import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { formatPercent } from '@/lib/utils/format';
import { INSPECTOR_SOURCE_ICONS } from '@/lib/schemas/inspector';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: { value: number; label?: string };
  sourceType?: 'live' | 'derived' | 'estimated' | 'none';
  onClick?: () => void;
  /** Navigates instead of firing a handler — renders as a real link, same interactive styling as onClick */
  href?: string;
  className?: string;
}

const INTERACTIVE_TILE =
  'rounded-lg border border-border-default bg-surface-base shadow-panel p-4 cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

export default function MetricCard({
  label,
  value,
  subtitle,
  trend,
  sourceType,
  onClick,
  href,
  className = '',
}: MetricCardProps) {
  const content = (
    <>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</span>
        {sourceType && (
          <Badge variant={sourceType}>
            {INSPECTOR_SOURCE_ICONS[sourceType]}
          </Badge>
        )}
      </div>
      <div className="heading-section">{value}</div>
      {subtitle && <div className="mt-1 text-sm text-text-secondary">{subtitle}</div>}
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
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`block ${INTERACTIVE_TILE} ${className}`}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div
        className={`${INTERACTIVE_TILE} ${className}`}
        onClick={onClick}
        tabIndex={0}
        role="button"
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      >
        {content}
      </div>
    );
  }

  return (
    <Card padding={false} className={`p-4 ${className}`}>
      {content}
    </Card>
  );
}
