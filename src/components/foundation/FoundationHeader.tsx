import Badge from '@/components/ui/Badge';
import CountdownTimer from '@/components/ui/CountdownTimer';
import type { Foundation } from '@/lib/schemas/foundation';
import { TYPE_LABELS, STATUS_LABELS, STATUS_BADGE_VARIANT } from '@/lib/config/foundations';
import ThemeBadgeList from './ThemeBadgeList';

interface FoundationHeaderProps {
  foundation: Foundation;
}

export default function FoundationHeader({ foundation: f }: FoundationHeaderProps) {
  const statusLabel = STATUS_LABELS[f.status];
  const typeLabel = TYPE_LABELS[f.type];

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="heading-section md:text-3xl">{f.name}</h1>
            <Badge variant={STATUS_BADGE_VARIANT[f.status]}>
              {statusLabel.text}
            </Badge>
          </div>
          <p className="mt-2 text-lg text-text-secondary">{f.tagline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="default">{typeLabel.short}: {typeLabel.long}</Badge>
            <span className="text-sm text-text-muted">{f.region}</span>
            {f.founded && <span className="text-sm text-text-muted">Gegründet {f.founded}</span>}
          </div>
        </div>

        {f.deadline && (
          <div className="shrink-0">
            <CountdownTimer deadline={f.deadline} label="Nächste Deadline" />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ThemeBadgeList themeIds={f.themes} size="md" />
      </div>
    </div>
  );
}
