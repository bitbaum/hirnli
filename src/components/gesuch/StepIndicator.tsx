/**
 * StepIndicator — 3-step wizard progress bar for the Gesuch workflow
 *
 * Steps: 1 Fokus wählen → 2 Entwurf prüfen → 3 Einreichen
 * All steps are always clickable (free navigation).
 */

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
  onNavigate: (step: 1 | 2 | 3) => void;
}

const STEPS = [
  { n: 1 as const, label: 'Fokus wählen' },
  { n: 2 as const, label: 'Entwurf prüfen' },
  { n: 3 as const, label: 'Einreichen' },
];

export default function StepIndicator({ currentStep, onNavigate }: StepIndicatorProps) {
  return (
    <nav aria-label="Gesuch-Workflow" className="print:hidden">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map((step, idx) => {
          const isCurrent = currentStep === step.n;
          const isDone = currentStep > step.n;

          return (
            <li key={step.n} className="flex items-center">
              {/* Connector line before step (not before first) */}
              {idx > 0 && (
                <div
                  className={`h-px w-8 sm:w-16 ${isDone ? 'bg-primary' : 'bg-border'}`}
                />
              )}

              <button
                type="button"
                onClick={() => onNavigate(step.n)}
                className="flex flex-col items-center gap-1.5 px-2 group"
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Circle */}
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    isCurrent
                      ? 'border-primary bg-primary text-white'
                      : isDone
                        ? 'border-primary bg-primary/10 text-primary-text'
                        : 'border-border bg-bg text-text-muted group-hover:border-primary/40 group-hover:text-primary'
                  }`}
                >
                  {isDone ? '✓' : step.n}
                </span>

                {/* Label */}
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isCurrent
                      ? 'text-primary-text'
                      : isDone
                        ? 'text-primary-text/70'
                        : 'text-text-muted group-hover:text-primary'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
