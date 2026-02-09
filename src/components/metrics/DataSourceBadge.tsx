import Badge from '@/components/ui/Badge';

const BADGES = {
  source: { label: 'Quelldaten', variant: 'live' as const, icon: '●' },
  derived: { label: 'Berechnet', variant: 'derived' as const, icon: '◐' },
  estimated: { label: 'Schätzung', variant: 'estimated' as const, icon: '○' },
  calculated: { label: 'Berechnet', variant: 'derived' as const, icon: '◐' },
  target: { label: 'Zielwert', variant: 'primary' as const, icon: '◎' },
  capacity: { label: 'Kapazität', variant: 'primary' as const, icon: '▣' },
};

interface DataSourceBadgeProps {
  type: keyof typeof BADGES;
  className?: string;
}

export default function DataSourceBadge({ type, className }: DataSourceBadgeProps) {
  const badge = BADGES[type] || BADGES.estimated;
  return (
    <Badge variant={badge.variant} className={className}>
      {badge.icon} {badge.label}
    </Badge>
  );
}
