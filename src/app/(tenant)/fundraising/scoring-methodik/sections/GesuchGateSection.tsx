import Card from '@/components/ui/Card';
import { READINESS_ENGINE, PRIORITY_FORMULA } from '@/lib/config/fit-scoring';
import { hasGesuchPage } from '@/lib/domain/foundation-helpers';
import { TIER_FROM_LEVEL } from '@/lib/domain/foundation-scores';
import type { Foundation } from '@/lib/schemas/foundation';

interface Props {
  foundations: Foundation[];
}

export default function GesuchGateSection({ foundations }: Props) {
  const total = foundations.length;
  const gesuchCount = foundations.filter(hasGesuchPage).length;
  const recherchiertMinScore = READINESS_ENGINE.display.thresholds.find(
    (t) => TIER_FROM_LEVEL[t.level] === 'recherchiert',
  )?.minScore;
  const p3MinScore = PRIORITY_FORMULA.display[PRIORITY_FORMULA.display.length - 1].minScore;

  return (
    <section className="mb-10">
      <h2 className="mb-4 heading-subsection">Gesuch-Gate</h2>
      <Card>
        <p className="mb-3 text-sm text-text-secondary">
          Eine Gesuch-Seite wird nur generiert, wenn beide Bedingungen erfüllt sind:
        </p>
        <ol className="mb-3 list-inside list-decimal space-y-1 text-sm text-text-secondary">
          <li>
            Bereitschafts-Stufe ≥ <strong>Recherchiert</strong> (Score ≥{recherchiertMinScore})
          </li>
          <li>
            Prioritätsstufe <strong>P1, P2 oder P3</strong> (Score ≥{p3MinScore})
          </li>
        </ol>
        <p className="text-sm text-text-secondary">
          P3-Stiftungen («Beobachten — bei passendem Timing bewerben») bekommen ein vorbereitetes
          Gesuch, damit wir bei gutem Timing sofort einreichen können. P4-Stiftungen bekommen kein
          Gesuch, da die strategische Priorität zu niedrig ist.
        </p>
        <div className="mt-3 rounded bg-surface-raised p-3 text-sm text-text-muted">
          Aktuell: {gesuchCount} von {total} Stiftungen haben eine Gesuch-Seite.
        </div>
      </Card>
    </section>
  );
}
