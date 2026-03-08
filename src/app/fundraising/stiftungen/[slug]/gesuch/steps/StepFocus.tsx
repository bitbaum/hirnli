import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { ThemeId } from '@/lib/schemas/foundation';
import SchwerpunktSelector from '@/components/gesuch/SchwerpunktSelector';

interface StepFocusProps {
  foundationName: string;
  foundationType: string;
  fitScore: number | null | undefined;
  heroDescription: string;
  tagline?: string;
  foundationBridge: string;
  foundationThemes: ThemeId[];
  activeSchwerpunkt: SchwerpunktId | null;
  onSelectSchwerpunkt: (id: SchwerpunktId | null) => void;
  onNext: () => void;
}

export default function StepFocus({
  foundationName,
  foundationType,
  fitScore,
  heroDescription,
  tagline,
  foundationBridge,
  foundationThemes,
  activeSchwerpunkt,
  onSelectSchwerpunkt,
  onNext,
}: StepFocusProps) {
  return (
    <div className="space-y-8">
      {/* Foundation overview card */}
      <div className="rounded-xl border border-border bg-bg-light p-6">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Stiftung</p>
            <h2 className="mt-1 text-xl font-bold text-grey-dark">{foundationName}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-bg px-2.5 py-0.5 text-xs font-medium text-text-muted">
              Typ {foundationType}
            </span>
            {fitScore != null && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Fit {fitScore}/10
              </span>
            )}
          </div>
        </div>
        {heroDescription && (
          <p className="text-sm text-text-muted leading-relaxed line-clamp-3">{heroDescription}</p>
        )}
        {tagline && (
          <p className="mt-2 text-sm italic text-text-muted">&bdquo;{tagline}&ldquo;</p>
        )}
      </div>

      {/* Schwerpunkt selector */}
      <div>
        <h3 className="mb-3 text-base font-semibold text-grey-dark">Welcher Schwerpunkt passt am besten?</h3>
        <SchwerpunktSelector
          active={activeSchwerpunkt}
          foundationThemes={foundationThemes}
          onSelect={onSelectSchwerpunkt}
          disabled={false}
        />
      </div>

      {/* Bridge preview */}
      {foundationBridge && (
        <div className="rounded-lg border-l-4 border-primary bg-primary/5 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Partnerschafts-Brücke</p>
          <p className="text-sm text-text leading-relaxed">
            {foundationBridge.split(/\.\s+/).slice(0, 2).join('. ') + (foundationBridge.includes('. ') ? '.' : '')}
          </p>
        </div>
      )}

      {/* Weiter CTA */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          Weiter — Entwurf prüfen →
        </button>
      </div>
    </div>
  );
}
