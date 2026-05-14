import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { ThemeId } from '@/lib/schemas/foundation';
import SchwerpunktSelector from '@/components/gesuch/SchwerpunktSelector';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Callout from '@/components/ui/Callout';
import { Button } from '@/components/ui/Button';

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
      <Card variant="muted">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="heading-xs-label">Stiftung</p>
            <h2 className="mt-1 heading-subsection">{foundationName}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-bg px-2.5 py-0.5 text-xs font-medium text-text-muted">
              Typ {foundationType}
            </span>
            {fitScore != null && (
              <Badge variant="primary" className="font-semibold">Fit {fitScore}/10</Badge>
            )}
          </div>
        </div>
        {heroDescription && (
          <p className="text-sm text-text-muted leading-relaxed line-clamp-3">{heroDescription}</p>
        )}
        {tagline && (
          <p className="mt-2 text-sm italic text-text-muted">&bdquo;{tagline}&ldquo;</p>
        )}
      </Card>

      {/* Schwerpunkt selector */}
      <div>
        <h3 className="mb-3 heading-item">Welcher Schwerpunkt passt am besten?</h3>
        <SchwerpunktSelector
          active={activeSchwerpunkt}
          foundationThemes={foundationThemes}
          onSelect={onSelectSchwerpunkt}
          disabled={false}
        />
      </div>

      {/* Bridge preview */}
      {foundationBridge && (
        <Callout color="primary" className="px-5">
          <p className="heading-xs-label text-primary mb-2">Partnerschafts-Brücke</p>
          <p className="text-sm text-text leading-relaxed">
            {foundationBridge.split(/\.\s+/).slice(0, 2).join('. ') + (foundationBridge.includes('. ') ? '.' : '')}
          </p>
        </Callout>
      )}

      {/* Weiter CTA */}
      <div className="flex justify-end">
        <Button variant="soft" size="lg" onClick={onNext}>
          Weiter — Entwurf prüfen →
        </Button>
      </div>
    </div>
  );
}
