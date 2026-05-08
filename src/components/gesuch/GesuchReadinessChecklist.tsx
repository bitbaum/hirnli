'use client';

/**
 * GesuchReadinessChecklist — Compact checklist showing how ready a gesuch is to submit.
 */

import type { GesuchReadiness } from '@/lib/domain/gesuch-readiness';
import Badge from '@/components/ui/Badge';

const GESUCH_SCORE_WARNING = 40;

interface GesuchReadinessChecklistProps {
  readiness: GesuchReadiness;
}

export default function GesuchReadinessChecklist({ readiness }: GesuchReadinessChecklistProps) {
  const { score, checks, ready } = readiness;

  return (
    <div className="rounded-xl border border-border bg-bg-light p-4 print:hidden">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-grey-dark">Bereitschaft</p>
        <Badge variant="raw" className={
          ready
            ? 'bg-success/10 text-success'
            : score >= GESUCH_SCORE_WARNING
              ? 'bg-warning/10 text-warning'
              : 'bg-danger/10 text-danger'
        }>
          {score}%
        </Badge>
      </div>

      <div className="space-y-1.5">
        {checks.map((check) => (
          <div key={check.id} className="flex items-start gap-2">
            <span className={`mt-0.5 text-xs ${check.passed ? 'text-success' : 'text-text-light'}`}>
              {check.passed ? '✓' : '○'}
            </span>
            <div className="min-w-0">
              <p className={`text-sm ${check.passed ? 'text-grey-dark' : 'text-text-muted'}`}>
                {check.label}
              </p>
              {!check.passed && (
                <p className="text-sm text-text-light mt-0.5">{check.hint}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
