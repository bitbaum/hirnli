import Card from '@/components/ui/Card';
import type { ApproachStep, ReadinessItem } from '@/lib/domain/foundation-contextualization';

interface ApproachChecklistProps {
  steps: ApproachStep[];
  readiness: ReadinessItem[];
}

const STATUS_STYLES = {
  ready: 'bg-success-bg text-success',
  todo: 'bg-warning-bg text-warning',
  blocked: 'bg-danger-bg text-danger',
} as const;

const STATUS_LABELS = {
  ready: 'Bereit',
  todo: 'Offen',
  blocked: 'Blockiert',
} as const;

export default function ApproachChecklist({ steps, readiness }: ApproachChecklistProps) {
  return (
    <div className="space-y-4">
      {/* Approach Steps Timeline */}
      <Card>
        <h4 className="mb-4 text-sm font-semibold text-grey-dark">Nächste Schritte</h4>
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.order} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${STATUS_STYLES[step.status]}`}
                >
                  {step.order}
                </span>
                {step.order < steps.length && (
                  <div className="mt-1 h-full w-px bg-border" />
                )}
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-grey-dark">{step.action}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[step.status]}`}
                  >
                    {STATUS_LABELS[step.status]}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-light">{step.detail}</p>
                <p className="mt-0.5 text-xs text-text-muted">{step.timing}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Readiness Checklist */}
      <Card>
        <h4 className="mb-3 text-sm font-semibold text-grey-dark">Bewerbungsbereitschaft</h4>
        <div className="space-y-2">
          {readiness.map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <span className={`mt-0.5 text-sm ${item.ready ? 'text-success' : 'text-text-muted'}`}>
                {item.ready ? '✓' : '○'}
              </span>
              <div>
                <span className={`text-sm ${item.ready ? 'font-medium text-grey-dark' : 'text-text-muted'}`}>
                  {item.label}
                </span>
                <p className="text-xs text-text-light">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
