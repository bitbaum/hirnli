import Badge from '@/components/ui/Badge';
import type { ComponentProps } from 'react';

type BadgeColor = ComponentProps<typeof Badge>['color'];

interface HubCardHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
  subtitleClassName: string;
  badgeColor?: BadgeColor;
  badgeText?: string;
}

export default function HubCardHeader({
  icon,
  title,
  subtitle,
  subtitleClassName,
  badgeColor,
  badgeText,
}: HubCardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="text-3xl" aria-hidden="true">
          {icon}
        </div>
        <div>
          <h3 className="heading-card">{title}</h3>
          <p className={`text-sm font-medium ${subtitleClassName}`}>{subtitle}</p>
        </div>
      </div>
      {badgeColor && badgeText && <Badge color={badgeColor}>{badgeText}</Badge>}
    </div>
  );
}
