import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { READINESS_ENGINE } from '@/lib/config/fit-scoring';
import { TIER_LABELS, TIER_COLORS, TIER_DESCRIPTIONS, computeTierCounts } from '@/lib/domain/foundation-helpers';
import { TIER_FROM_LEVEL } from '@/lib/domain/foundation-scores';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import type { QualityTier } from '@/lib/schemas/foundation';
import type { AdditiveChecksConfig } from '@/lib/config/fit-scoring';

interface Props {
  readinessAvg: number;
}

export default function ReadinessSection({ readinessAvg }: Props) {
  const total = STIFTUNGEN_DATA.length;
  const tierCounts = computeTierCounts(STIFTUNGEN_DATA);

  return (
    <section className="mb-10">
      <h2 className="mb-4 heading-subsection">Ebene 2: Bereitschafts-Score</h2>
      <p className="mb-4 text-sm text-text-light">
        Der Bereitschafts-Score misst, wie gut unsere Datenlage ist, um ein überzeugendes,
        auf die Stiftung massgeschneidertes Gesuch zu erstellen. Er besteht aus vier
        Dimensionen, die jeweils eine konkrete Frage beantworten:
      </p>

      {READINESS_ENGINE.dimensions.map((dim) => {
        const checks = (dim.config as AdditiveChecksConfig).checks;
        return (
          <Card key={dim.id} className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="heading-item">{dim.label}</h3>
              <Badge variant="primary" className="font-bold tabular-nums">max {dim.maxScore}</Badge>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th scope="col" className="pb-2 pr-4 font-medium text-text-muted">Check</th>
                    <th scope="col" className="pb-2 text-right font-medium text-text-muted">Punkte</th>
                  </tr>
                </thead>
                <tbody className="text-text-light">
                  {checks.map((check) => (
                    <tr key={check.label} className="border-b border-border/30">
                      <td className="py-1.5 pr-4">{check.label}</td>
                      <td className="py-1.5 text-right tabular-nums font-medium text-primary">+{check.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}

      <Card>
        <h3 className="mb-3 heading-item">Score → Qualitätsstufe</h3>
        <p className="mb-3 text-sm text-text-light">
          Der Bereitschafts-Score wird in fünf Qualitätsstufen übersetzt.
          Aktueller Durchschnitt: <strong>{readinessAvg}/100</strong> über {total} Stiftungen.
        </p>
        <div className="space-y-2">
          {[
            ...READINESS_ENGINE.display.thresholds.map((t) => [
              TIER_FROM_LEVEL[t.level] ?? ('verzeichnet' as QualityTier),
              t.minScore,
            ] as [QualityTier, number]),
            ['verzeichnet' as QualityTier, 0] as [QualityTier, number],
          ].map(([tier, minScore]) => (
            <div key={tier} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div className="flex items-center gap-3">
                <Badge variant="raw" className={TIER_COLORS[tier]}>{TIER_LABELS[tier]}</Badge>
                <span className="text-sm text-text-light">{TIER_DESCRIPTIONS[tier]}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs tabular-nums text-text-muted">≥{minScore}</span>
                <span className="w-10 text-right text-sm font-bold tabular-nums text-grey-dark">{tierCounts[tier]}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
