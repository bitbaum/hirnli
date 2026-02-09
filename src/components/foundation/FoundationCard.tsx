import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import type { Foundation } from '@/lib/schemas/foundation';
import { THEMES, TYPE_LABELS, STATUS_LABELS } from '@/lib/config/foundations';

interface FoundationCardProps {
  foundation: Foundation;
}

const FIT_COLORS = {
  3: 'text-success',
  2: 'text-warning',
  1: 'text-text-muted',
} as const;

const PRIORITY_BADGE: Record<number, string> = {
  1: 'bg-red-100 text-red-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-blue-100 text-blue-700',
  4: 'bg-gray-100 text-gray-500',
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
            <span className={`text-xs font-bold ${FIT_COLORS[f.fit as keyof typeof FIT_COLORS] || 'text-text-muted'}`}>
              {'★'.repeat(f.fit)}{'☆'.repeat(3 - f.fit)}
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
        {f.themes.map((themeId) => {
          const theme = THEMES[themeId];
          if (!theme) return null;
          return (
            <span
              key={themeId}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
              style={{ backgroundColor: theme.color + '20', color: theme.color }}
            >
              {theme.icon} {theme.label}
            </span>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
        <span>{f.deadlineText}</span>
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
