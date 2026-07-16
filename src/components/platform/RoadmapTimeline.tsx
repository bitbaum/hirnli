/**
 * Roadmap timeline — vertical phase list with status badges.
 *
 * Mobile-first: single column, generous spacing; the connector line and
 * markers scale up slightly at md+. Status semantics: live (shipped),
 * progress (happening now), target (planned, explicitly a goal not a
 * promise — the page shows a disclaimer below).
 */

import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import type { PlatformContent, RoadmapStatus } from '@/lib/config/platform-content';

const STATUS_DOT: Record<RoadmapStatus, string> = {
  live: 'bg-success',
  progress: 'bg-primary',
  target: 'bg-border-default',
};

const STATUS_BADGE_VARIANT: Record<RoadmapStatus, 'success' | 'primary' | 'default'> = {
  live: 'success',
  progress: 'primary',
  target: 'default',
};

export function RoadmapTimeline({ roadmap }: { roadmap: PlatformContent['roadmap'] }) {
  return (
    <ol className="relative space-y-5 border-l border-border-default pl-6 md:pl-8">
      {roadmap.phases.map((phase) => (
        <li key={phase.name} className="relative">
          <span
            aria-hidden="true"
            className={`absolute -left-[30px] top-2 h-3.5 w-3.5 rounded-full ring-4 ring-surface-base md:-left-[39px] ${STATUS_DOT[phase.status]}`}
          />
          <Card>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="heading-card">{phase.name}</h3>
              <Badge variant={STATUS_BADGE_VARIANT[phase.status]} size="sm">
                {roadmap.statusLabels[phase.status]}
              </Badge>
              <span className="text-xs text-text-muted">{phase.timeframe}</span>
            </div>
            <p className="mb-2 text-sm leading-relaxed text-text-secondary">{phase.description}</p>
            <p className="text-sm leading-relaxed text-text-primary">
              <span className="font-semibold">{roadmap.valueLabel}:</span> {phase.value}
            </p>
          </Card>
        </li>
      ))}
    </ol>
  );
}
