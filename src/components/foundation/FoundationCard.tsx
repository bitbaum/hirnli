import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import type { Foundation } from '@/lib/schemas/foundation';
import { UNKNOWN_FIELD } from '@/lib/schemas/foundation';
import { TYPE_LABELS, STATUS_LABELS, STATUS_BADGE_VARIANT, FIT_CONFIG, PRIORITY_CONFIG } from '@/lib/config/foundations';
import { getFoundationPresentation } from '@/lib/domain/foundation-presenter';
import { hasGesuchPage } from '@/lib/domain/foundation-helpers';
import { QUALITY_THRESHOLDS } from '@/lib/config/fit-scoring';
import { isRegistryUrl } from '@/lib/config/registry-domains';
import ThemeBadgeList from './ThemeBadgeList';

interface FoundationCardProps {
  foundation: Foundation;
  inPipeline?: boolean;
  /** Relevance score (0-1) shown during search */
  score?: number;
}

export default function FoundationCard({ foundation: f, inPipeline, score }: FoundationCardProps) {
  const statusLabel = STATUS_LABELS[f.status];
  const typeLabel = TYPE_LABELS[f.type];
  const { tierLabel, tierColor, fitLevel, trustDisplay } = getFoundationPresentation(f);
  // Use stored priority (SSOT) — label/color from config, override flag from field
  const priorityConfig = PRIORITY_CONFIG[f.priority];
  const priorityLabel = priorityConfig.label;
  const priorityIsOverride = f.priorityOverride ?? false;

  const gapItems: string[] = [];
  if (hasGesuchPage(f)) {
    const purposeLen = f.purposeSummary?.length ?? 0;
    const notesLen = f.researchNotes?.length ?? 0;
    if (purposeLen < QUALITY_THRESHOLDS.purposeSummaryMinChars)
      gapItems.push(`Zweck ${purposeLen}/${QUALITY_THRESHOLDS.purposeSummaryMinChars}`);
    if (notesLen < QUALITY_THRESHOLDS.researchNotesMinChars)
      gapItems.push(`Notizen ${notesLen}/${QUALITY_THRESHOLDS.researchNotesMinChars}`);
    if (!f.contact?.email && !f.contact?.phone)
      gapItems.push('Kontakt fehlt');
    if (!f.websiteUrl || isRegistryUrl(f.websiteUrl))
      gapItems.push('Website fehlt');
  }

  return (
    <Link
      href={`/fundraising/stiftungen/${f.slug}`}
      className="block rounded-lg border border-border-default bg-surface-base p-4 transition-all hover:border-primary/30 hover:shadow-md hover:no-underline"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className={`text-xs ${trustDisplay.dotColor}`} title={trustDisplay.label}>●</span>
              <span
                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-bold leading-none ${priorityConfig.color}`}
              >
                {priorityLabel}
                {priorityIsOverride && (
                  <span className="rounded bg-warning/10 px-0.5 text-xs font-medium text-warning-text">M</span>
                )}
              </span>
            </span>
            <h3 className="heading-item">{f.name}</h3>
            <span className={`text-xs font-bold ${FIT_CONFIG[fitLevel].color}`} aria-hidden="true">
              {FIT_CONFIG[fitLevel].stars}
            </span>
            <span className="sr-only">Fit: {f.fitScore}/10</span>
            {score != null && (
              <Badge variant="primary" className="font-semibold">
                {Math.round(score * 100)}% Relevanz
              </Badge>
            )}
            {inPipeline && (
              <Badge variant="raw" className="bg-pillar-vision/15 text-pillar-vision font-semibold">
                In Pipeline
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-text-secondary">{f.tagline}</p>
        </div>
        <div className="flex items-center gap-2 sm:ml-4 sm:flex-col sm:items-end sm:gap-1">
          <Badge variant={STATUS_BADGE_VARIANT[f.status]}>
            {statusLabel.text}
          </Badge>
          <span className="text-sm text-text-muted">{typeLabel.short}: {typeLabel.long}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <ThemeBadgeList themeIds={f.themes} size="sm" />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-text-muted">
        <div className="flex items-center gap-2">
          {f.deadlineText && f.deadlineText !== UNKNOWN_FIELD && (
            <span>{f.deadlineText}</span>
          )}
          <Badge variant="raw" size="sm" className={tierColor}>
            {tierLabel}
          </Badge>
        </div>
        {f.amount.text && f.amount.text !== UNKNOWN_FIELD && (
          <span>{f.amount.text}</span>
        )}
      </div>

      {f.isOperative && (
        <div className="mt-2 rounded bg-warning-bg px-2 py-1 text-sm text-warning-text">
          Operative Stiftung — vergibt keine Fördergelder
        </div>
      )}

      {gapItems.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 border-t border-border-default pt-2">
          {gapItems.map(item => (
            <span key={item} className="rounded bg-amber-bg px-1.5 py-0.5 text-xs text-amber-text">
              {item}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
