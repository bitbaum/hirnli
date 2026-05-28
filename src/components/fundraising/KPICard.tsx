/**
 * KPI Card - Display single metric with optional trend
 *
 * Used on fundraising dashboard for key statistics.
 */

interface KPICardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'gray';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  subtitle?: string;
}

export function KPICard({ label, value, icon, color = 'blue', trend, subtitle }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-accent-muted border-accent-border text-primary-text',
    green: 'bg-success/10 border-success/20 text-success-text',
    orange: 'bg-warning/10 border-warning/20 text-warning-text',
    red: 'bg-danger/10 border-danger/20 text-danger-text',
    gray: 'bg-surface-raised border-border-default text-text-primary',
  };

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>

      <div className="text-3xl font-bold mb-1">{value}</div>

      {subtitle && (
        <p className="text-sm text-text-secondary">{subtitle}</p>
      )}

      {trend && (
        <div className={`flex items-center text-sm mt-2 ${
          trend.direction === 'up' ? 'text-success-text' : 'text-danger-text'
        }`}>
          <span className="mr-1">
            {trend.direction === 'up' ? '↑' : '↓'}
          </span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  );
}
