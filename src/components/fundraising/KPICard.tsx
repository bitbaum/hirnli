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
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>

      <div className="text-3xl font-bold mb-1">{value}</div>

      {subtitle && (
        <p className="text-sm text-gray-600">{subtitle}</p>
      )}

      {trend && (
        <div className={`flex items-center text-sm mt-2 ${
          trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
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
