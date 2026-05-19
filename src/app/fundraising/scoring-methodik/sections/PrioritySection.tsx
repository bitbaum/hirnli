import Card from '@/components/ui/Card';
import { PRIORITY_FORMULA } from '@/lib/config/fit-scoring';
import { STIFTUNGEN_DATA, PRIORITY_CONFIG } from '@/lib/config/foundations';
import { formatNumber } from '@/lib/utils/format';

interface Props {
  priorityCounts: Record<1 | 2 | 3 | 4, number>;
  priorityAvg: number;
}

export default function PrioritySection({ priorityCounts, priorityAvg }: Props) {
  const total = STIFTUNGEN_DATA.length;

  return (
    <section className="mb-10">
      <h2 className="mb-4 heading-subsection">Ebene 3: Prioritäts-Score</h2>
      <Card>
        <p className="mb-4 text-sm text-text-secondary">
          Die Priorität kombiniert Fit und Bereitschaft zu einer handlungsorientierten
          Empfehlung. Fit wirkt als <strong>Multiplikator</strong> (Gate), nicht als Summand —
          eine Stiftung ohne thematischen Fit hat immer Priorität 0, unabhängig von der Datenlage.
        </p>

        <div className="mb-4 rounded-lg bg-surface-raised p-4">
          <h4 className="mb-2 heading-detail">Formel</h4>
          <div className="space-y-1 font-mono text-sm text-text-secondary">
            <p>basis = fit_normiert × ({PRIORITY_FORMULA.baseFitFloor} + {PRIORITY_FORMULA.readinessScale} × bereitschaft / 100)</p>
            <p>priorität = min(100, basis × min(anwendbare_abzüge) + förder_bonus)</p>
          </div>
          <p className="mt-2 text-sm text-text-muted">
            fit_normiert = fitScore / 10 (0-1). Bei Fit 10 + Bereitschaft 100 → Priorität 100.
            Bei Fit 10 + Bereitschaft 0 → Priorität {PRIORITY_FORMULA.baseFitFloor}. Bei Fit 0 → immer 0.
          </p>
        </div>

        <div className="mb-4">
          <h4 className="mb-2 heading-detail">Abzüge (härtester gilt)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-left">
                  <th scope="col" className="pb-2 pr-4 font-medium text-text-muted">Bedingung</th>
                  <th scope="col" className="pb-2 text-right font-medium text-text-muted">Multiplikator</th>
                  <th scope="col" className="pb-2 text-right font-medium text-text-muted">Effekt</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                {([
                  ['Operative Stiftung', PRIORITY_FORMULA.penalties.operative],
                  ['Keine Gesuche angenommen', PRIORITY_FORMULA.penalties.noApplications],
                  ['Geschlossen', PRIORITY_FORMULA.penalties.closed],
                  ['Nur auf Einladung', PRIORITY_FORMULA.penalties.invitationOnly],
                ] as [string, number][]).map(([label, mult]) => (
                  <tr key={label} className="border-b border-border-default/30">
                    <td className="py-1.5 pr-4">{label}</td>
                    <td className="py-1.5 text-right tabular-nums">×{mult}</td>
                    <td className="py-1.5 text-right tabular-nums text-warning">−{Math.round((1 - mult) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-text-muted">
            Wenn mehrere Abzüge zutreffen, gilt nur der härteste (min). Keine Mehrfachbestrafung.
          </p>
        </div>

        <div className="mb-4">
          <h4 className="mb-2 heading-detail">Förder-Bonus</h4>
          <p className="mb-2 text-sm text-text-secondary">
            Wenn der Förderbereich der Stiftung mit unserem Zielbetrag
            (CHF {formatNumber(PRIORITY_FORMULA.grantMatch.targetMin)}–{formatNumber(PRIORITY_FORMULA.grantMatch.targetMax)}) übereinstimmt:
          </p>
          <div className="space-y-1 text-sm text-text-secondary">
            <p>Perfekte Überlappung: <span className="font-medium text-primary">+{PRIORITY_FORMULA.grantMatch.perfectBonus}</span></p>
            <p>Nahe dran (max ≥ Hälfte unseres Minimums): <span className="font-medium text-primary">+{PRIORITY_FORMULA.grantMatch.closeBonus}</span></p>
            <p>Betrag bekannt aber klein: <span className="font-medium text-primary">+{PRIORITY_FORMULA.grantMatch.smallBonus}</span></p>
          </div>
        </div>

        <div>
          <h4 className="mb-2 heading-detail">Prioritätsstufen (aktuell über {total} Stiftungen)</h4>
          <div className="space-y-2">
            {PRIORITY_FORMULA.display.map((d) => {
              const pc = PRIORITY_CONFIG[d.level];
              return (
                <div key={d.level} className="flex items-center justify-between rounded-lg border border-border-default/50 p-3">
                  <div className="flex items-center gap-3">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${pc.color}`}>{pc.label}</span>
                    <span className="text-sm text-text-secondary">{pc.description}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs tabular-nums text-text-muted">≥{d.minScore}</span>
                    <span className="w-10 text-right text-sm font-bold tabular-nums text-text-primary">{priorityCounts[d.level]}</span>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between rounded-lg border border-border-default/50 p-3">
              <div className="flex items-center gap-3">
                <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${PRIORITY_CONFIG[4].color}`}>{PRIORITY_CONFIG[4].label}</span>
                <span className="text-sm text-text-secondary">{PRIORITY_CONFIG[4].description}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs tabular-nums text-text-muted">&lt;{PRIORITY_FORMULA.display[PRIORITY_FORMULA.display.length - 1].minScore}</span>
                <span className="w-10 text-right text-sm font-bold tabular-nums text-text-primary">{priorityCounts[4]}</span>
              </div>
            </div>
          </div>
          <p className="mt-2 text-sm text-text-muted">
            Durchschnittlicher Prioritäts-Score: {priorityAvg}/100.
            Manuell überschriebene Prioritäten sind mit «manuell» gekennzeichnet.
          </p>
        </div>
      </Card>
    </section>
  );
}
