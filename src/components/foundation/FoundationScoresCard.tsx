import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import type { Foundation } from '@/lib/schemas/foundation';
import { READINESS_ENGINE } from '@/lib/config/fit-scoring';
import { getTierPromotionSteps, TIER_LABELS } from '@/lib/domain/foundation-helpers';
import { getFoundationPresentation } from '@/lib/domain/foundation-presenter';

const DIM_LABELS = Object.fromEntries(READINESS_ENGINE.dimensions.map((d) => [d.id, d.label]));

export default function FoundationScoresCard({ foundation: f }: { foundation: Foundation }) {
  const { tier, tierColor, readiness, priority } = getFoundationPresentation(f);
  const promotion = getTierPromotionSteps(f);

  return (
    <Card>
      <h3 className="heading-label mb-3">Scores</h3>

      {/* Priority */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">Priorität</span>
          <span className="text-xs font-bold tabular-nums">
            {priority.label}
            {priority.isOverride && (
              <span className="ml-1 rounded bg-warning/10 px-1 py-0.5 text-xs font-medium text-warning">manuell</span>
            )}
          </span>
        </div>
        <ProgressBar percent={priority.score} size="sm" color="bg-primary" label={`Priorität: ${priority.score}%`} />
        <p className="mt-1 text-sm text-text-muted">{priority.description}</p>
        {priority.components.penaltyReason && (
          <p className="mt-0.5 text-sm text-warning">{priority.components.penaltyReason}</p>
        )}
      </div>

      {/* Readiness */}
      <div className="mb-3 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">Bereitschaft</span>
          <div className="flex items-center gap-1.5">
            <Badge variant="raw" size="sm" className={tierColor}>
              {TIER_LABELS[tier]}
            </Badge>
            <span className="text-xs tabular-nums text-text-muted">{readiness.score}/100</span>
          </div>
        </div>

        <div className="mt-2 space-y-1.5">
          {Object.entries(readiness.dimensions).map(([id, { score, max }]) => (
            <div key={id}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">{DIM_LABELS[id] ?? id}</span>
                <span className="tabular-nums text-text-muted">{score}/{max}</span>
              </div>
              <ProgressBar
                percent={max > 0 ? (score / max) * 100 : 0}
                size="xs"
                color="bg-primary/60"
                label={`${DIM_LABELS[id] ?? id}: ${score} von ${max}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Top improvements */}
      {promotion.improvements.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="heading-xs-label">
            {promotion.nextTier ? `Nächste Stufe: ${TIER_LABELS[promotion.nextTier]}` : 'Nächste Verbesserungen'}
          </p>
          <ul className="mt-1 space-y-0.5">
            {promotion.improvements.slice(0, 3).map((imp) => (
              <li key={imp.label} className="flex items-center justify-between text-sm text-text-muted">
                <span>{imp.label}</span>
                <span className="tabular-nums text-primary">+{imp.points}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
