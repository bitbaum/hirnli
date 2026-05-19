'use client';

/**
 * GesuchReadinessChecklist — Compact checklist showing how ready a gesuch is to submit.
 */

import type { GesuchReadiness } from '@/lib/domain/gesuch-readiness';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

const GESUCH_SCORE_WARNING = 40;

interface GesuchReadinessChecklistProps {
  readiness: GesuchReadiness;
}

export default function GesuchReadinessChecklist({ readiness }: GesuchReadinessChecklistProps) {
  const { score, checks, ready } = readiness;

  return (
    <Card variant="muted" padding={false} className="p-4 print:hidden">
      <div className="flex items-center justify-between mb-3">
        <p className="heading-detail">Bereitschaft</p>
        <Badge variant="raw" className={
          ready
            ? 'bg-success/10 text-success-text'
            : score >= GESUCH_SCORE_WARNING
              ? 'bg-warning/10 text-warning-text'
              : 'bg-danger/10 text-danger-text'
        }>
          {score}%
        </Badge>
      </div>

      <div className="space-y-1.5">
        {checks.map((check) => (
          <div key={check.id} className="flex items-start gap-2">
            <span className={`mt-0.5 text-xs ${check.passed ? 'text-success-text' : 'text-text-secondary'}`}>
              {check.passed ? '✓' : '○'}
            </span>
            <div className="min-w-0">
              <p className={`text-sm ${check.passed ? 'text-text-primary' : 'text-text-muted'}`}>
                {check.label}
              </p>
              {!check.passed && (
                <p className="text-sm text-text-secondary mt-0.5">{check.hint}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
