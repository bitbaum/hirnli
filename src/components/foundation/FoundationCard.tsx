import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import type { Foundation } from '@/lib/schemas/foundation';
import { TYPE_LABELS, STATUS_LABELS, FIT_CONFIG } from '@/lib/config/foundations';
import ThemeBadgeList from './ThemeBadgeList';

interface FoundationCardProps {
  foundation: Foundation;
}

const PRIORITY_BADGE: Record<number, string> = {
  1: 'bg-danger-bg text-danger',
  2: 'bg-warning-bg text-warning',
  3: 'bg-primary/10 text-primary',
  4: 'bg-grey-light text-text-muted',
};

export default function FoundationCard({ foundation: f }: FoundationCardProps) {
  const statusLabel = STATUS_LABELS[f.status];
  const typeLabel = TYPE_LABELS[f.type];

  return (
    <Link
      href={`/fundraising/stiftungen/${f.slug}`}
      className="block rounded-lg border border-border bg-white p-4 transition-all hover:border-primary/30 hover:shadow-md hover:no-underline"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold leading-none ${PRIORITY_BADGE[f.priority] || PRIORITY_BADGE[4]}`}
            >
              P{f.priority}
            </span>
            <h3 className="font-semibold text-grey-dark">{f.name}</h3>
            <span className={`text-xs font-bold ${FIT_CONFIG[f.fit as keyof typeof FIT_CONFIG]?.color ?? 'text-text-muted'}`}>
              {FIT_CONFIG[f.fit as keyof typeof FIT_CONFIG]?.stars ?? '☆☆☆'}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-light">{f.tagline}</p>
        </div>
        <div className="flex items-center gap-2 sm:ml-4 sm:flex-col sm:items-end sm:gap-1">
          <Badge
            variant={
              f.status === 'open' ? 'success' : f.status === 'rolling' ? 'primary' : f.status === 'soon' ? 'warning' : 'default'
            }
          >
            {statusLabel.text}
          </Badge>
          <span className="text-xs text-text-muted">{typeLabel.short}: {typeLabel.long}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <ThemeBadgeList themeIds={f.themes} size="sm" />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <span>{f.deadlineText}</span>
          {f.purposeSummary && !f.needsResearch && (
            <span className="rounded-full bg-success-bg px-1.5 py-0.5 text-[10px] font-medium text-success">
              Recherchiert
            </span>
          )}
        </div>
        <span>{f.amount.text}</span>
      </div>

      {f.isOperative && (
        <div className="mt-2 rounded bg-warning-bg px-2 py-1 text-xs text-warning">
          Operative Stiftung — vergibt keine Fördergelder
        </div>
      )}
    </Link>
  );
}
