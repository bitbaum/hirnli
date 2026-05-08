import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import { READINESS_ENGINE, PRIORITY_FORMULA } from '@/lib/config/fit-scoring';
import { STIFTUNGEN_DATA, PRIORITY_CONFIG } from '@/lib/config/foundations';
import { formatNumber } from '@/lib/utils/format';
import { TIER_LABELS, TIER_COLORS, TIER_DESCRIPTIONS, computeTierCounts, hasGesuchPage } from '@/lib/domain/foundation-helpers';
import { computeReadinessScore, computePriorityScore, TIER_FROM_LEVEL } from '@/lib/domain/foundation-scores';
import type { QualityTier } from '@/lib/schemas/foundation';
import type { AdditiveChecksConfig } from '@/lib/config/fit-scoring';
import Badge from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Scoring-Methodik',
  description: 'Wie Fit, Bereitschaft und Priorität algorithmisch berechnet werden',
};

/** Compute priority distribution from live data */
function computePriorityDistribution() {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const scores: number[] = [];
  for (const f of STIFTUNGEN_DATA) {
    const p = computePriorityScore(f);
    counts[p.level]++;
    scores.push(p.score);
  }
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  return { counts, avg };
}

/** Compute readiness distribution from live data */
function computeReadinessDistribution() {
  const scores: number[] = [];
  for (const f of STIFTUNGEN_DATA) {
    scores.push(computeReadinessScore(f).score);
  }
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  return { avg };
}

export default function ScoringMethodikPage() {
  const total = STIFTUNGEN_DATA.length;
  const tierCounts = computeTierCounts(STIFTUNGEN_DATA);
  const priorityDist = computePriorityDistribution();
  const readinessDist = computeReadinessDistribution();

  return (
    <>
      <PageHeader
        title="Scoring-Methodik"
        subtitle="Algorithmische Bewertung von Stiftungen — drei Ebenen, komplett inspizierbar"
      />

      <p className="mb-8 text-sm text-text-light">
        Jeder Score wird algorithmisch aus den vorhandenen Stiftungsdaten berechnet.
        Keine manuellen Noten, keine Black Boxes. Alle Gewichte und Schwellenwerte
        sind konfigurierbar und hier vollständig dokumentiert.
      </p>

      {/* Architecture Overview */}
      <section className="mb-10">
        <h2 className="mb-4 heading-subsection">Drei Scoring-Ebenen</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <div className="mb-2 text-2xl">🎯</div>
            <h3 className="mb-1 heading-item">Fit-Score (0-10)</h3>
            <p className="text-sm text-text-light">
              Passt diese Stiftung zu unserer Mission? Thematische, geografische und
              Zugangs-Übereinstimmung.
            </p>
            <p className="mt-2 text-sm text-text-muted">Berechnet bei der Recherche, gespeichert pro Stiftung.</p>
          </Card>
          <Card>
            <div className="mb-2 text-2xl">📊</div>
            <h3 className="mb-1 heading-item">Bereitschaft (0-100)</h3>
            <p className="text-sm text-text-light">
              Können wir ein massgeschneidertes Gesuch schreiben? Misst die
              Vollständigkeit unserer Recherche-Daten.
            </p>
            <p className="mt-2 text-sm text-text-muted">Berechnet in Echtzeit aus Stiftungsfeldern.</p>
          </Card>
          <Card>
            <div className="mb-2 text-2xl">⚡</div>
            <h3 className="mb-1 heading-item">Priorität (0-100)</h3>
            <p className="text-sm text-text-light">
              Sollten wir jetzt Aufwand investieren? Kombiniert Fit und Bereitschaft
              zu einer handlungsorientierten Empfehlung.
            </p>
            <p className="mt-2 text-sm text-text-muted">Berechnet in Echtzeit. Fit ist Multiplikator.</p>
          </Card>
        </div>
      </section>

      {/* Layer 1: Fit */}
      <section className="mb-10">
        <h2 className="mb-4 heading-subsection">Ebene 1: Fit-Score</h2>
        <Card>
          <p className="mb-4 text-sm text-text-light">
            Der Fit-Score bewertet die inhaltliche Übereinstimmung zwischen Stiftungszweck
            und unserer Mission auf drei Dimensionen:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 heading-item">Dimension</th>
                  <th className="pb-2 pr-4 heading-item">Bereich</th>
                  <th className="pb-2 heading-item">Beschreibung</th>
                </tr>
              </thead>
              <tbody className="text-text-light">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-grey-dark">Thematisch</td>
                  <td className="py-2 pr-4 tabular-nums">0-4</td>
                  <td className="py-2">Gewichtete Übereinstimmung der Förderthemen mit unseren Schwerpunkten</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-grey-dark">Geografisch</td>
                  <td className="py-2 pr-4 tabular-nums">0-3</td>
                  <td className="py-2">Zürich → Schweiz → DACH → International (Stufenmodell)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-grey-dark">Zugang</td>
                  <td className="py-2 pr-4 tabular-nums">0-3</td>
                  <td className="py-2">Bewerbungsweg, Annahmestatus und Vereinbarkeit</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded bg-bg-light p-3 text-sm text-text-muted">
            <strong>Dimensionsfloors:</strong> Wenn der geografische Score unter 1 liegt
            (z.B. Stiftung fördert nur in Mexiko), wird der Gesamt-Fit auf maximal 3
            begrenzt. Bei thematischem Score 0 auf maximal 2. Dies verhindert, dass
            ein guter Zugang einen fundamentalen Mismatch kompensiert.
          </div>
          <p className="mt-3 text-sm text-text-muted">
            Anzeige: 0-3 Sterne (≥7 → 3 Sterne, ≥4 → 2 Sterne, ≥1 → 1 Stern, 0 → 0 Sterne). Stiftungen unter Tier «Profiliert» → 0 Sterne (ungenügende Datengrundlage).
          </p>
          <div className="mt-3 rounded bg-bg-light p-3 text-sm text-text-muted">
            <strong>Vertrauensgate:</strong> Stiftungen mit Bereitschafts-Tier unter «Profiliert» zeigen keine
            Sterne-Bewertung, da die Datengrundlage für eine belastbare Einschätzung nicht ausreicht.
          </div>
        </Card>
      </section>

      {/* Layer 2: Readiness */}
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
                      <th className="pb-2 pr-4 font-medium text-text-muted">Check</th>
                      <th className="pb-2 text-right font-medium text-text-muted">Punkte</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-light">
                    {checks.map((check) => (
                      <tr key={check.label} className="border-b border-border/30">
                        <td className="py-1.5 pr-4">{check.label}</td>
                        <td className="py-1.5 text-right tabular-nums font-medium text-primary">
                          +{check.score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}

        {/* Tier mapping */}
        <Card>
          <h3 className="mb-3 heading-item">Score → Qualitätsstufe</h3>
          <p className="mb-3 text-sm text-text-light">
            Der Bereitschafts-Score wird in fünf Qualitätsstufen übersetzt.
            Aktueller Durchschnitt: <strong>{readinessDist.avg}/100</strong> über {total} Stiftungen.
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
                  <Badge variant="raw" className={TIER_COLORS[tier]}>
                    {TIER_LABELS[tier]}
                  </Badge>
                  <span className="text-sm text-text-light">{TIER_DESCRIPTIONS[tier]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs tabular-nums text-text-muted">
                    ≥{minScore}
                  </span>
                  <span className="w-10 text-right text-sm font-bold tabular-nums text-grey-dark">
                    {tierCounts[tier]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Layer 3: Priority */}
      <section className="mb-10">
        <h2 className="mb-4 heading-subsection">Ebene 3: Prioritäts-Score</h2>
        <Card>
          <p className="mb-4 text-sm text-text-light">
            Die Priorität kombiniert Fit und Bereitschaft zu einer handlungsorientierten
            Empfehlung. Fit wirkt als <strong>Multiplikator</strong> (Gate), nicht als Summand —
            eine Stiftung ohne thematischen Fit hat immer Priorität 0, unabhängig von der Datenlage.
          </p>

          {/* Formula */}
          <div className="mb-4 rounded-lg bg-bg-light p-4">
            <h4 className="mb-2 heading-detail">Formel</h4>
            <div className="space-y-1 font-mono text-sm text-text-light">
              <p>basis = fit_normiert × ({PRIORITY_FORMULA.baseFitFloor} + {PRIORITY_FORMULA.readinessScale} × bereitschaft / 100)</p>
              <p>priorität = min(100, basis × min(anwendbare_abzüge) + förder_bonus)</p>
            </div>
            <p className="mt-2 text-sm text-text-muted">
              fit_normiert = fitScore / 10 (0-1). Bei Fit 10 + Bereitschaft 100 → Priorität 100.
              Bei Fit 10 + Bereitschaft 0 → Priorität {PRIORITY_FORMULA.baseFitFloor}. Bei Fit 0 → immer 0.
            </p>
          </div>

          {/* Penalties */}
          <div className="mb-4">
            <h4 className="mb-2 heading-detail">Abzüge (härtester gilt)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 pr-4 font-medium text-text-muted">Bedingung</th>
                    <th className="pb-2 text-right font-medium text-text-muted">Multiplikator</th>
                    <th className="pb-2 text-right font-medium text-text-muted">Effekt</th>
                  </tr>
                </thead>
                <tbody className="text-text-light">
                  {([
                    ['Operative Stiftung', PRIORITY_FORMULA.penalties.operative],
                    ['Keine Gesuche angenommen', PRIORITY_FORMULA.penalties.noApplications],
                    ['Geschlossen', PRIORITY_FORMULA.penalties.closed],
                    ['Nur auf Einladung', PRIORITY_FORMULA.penalties.invitationOnly],
                  ] as [string, number][]).map(([label, mult]) => (
                    <tr key={label} className="border-b border-border/30">
                      <td className="py-1.5 pr-4">{label}</td>
                      <td className="py-1.5 text-right tabular-nums">×{mult}</td>
                      <td className="py-1.5 text-right tabular-nums text-warning">
                        −{Math.round((1 - mult) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-text-muted">
              Wenn mehrere Abzüge zutreffen, gilt nur der härteste (min). Keine Mehrfachbestrafung.
            </p>
          </div>

          {/* Grant bonus */}
          <div className="mb-4">
            <h4 className="mb-2 heading-detail">Förder-Bonus</h4>
            <p className="mb-2 text-sm text-text-light">
              Wenn der Förderbereich der Stiftung mit unserem Zielbetrag
              (CHF {formatNumber(PRIORITY_FORMULA.grantMatch.targetMin)}–{formatNumber(PRIORITY_FORMULA.grantMatch.targetMax)}) übereinstimmt:
            </p>
            <div className="space-y-1 text-sm text-text-light">
              <p>Perfekte Überlappung: <span className="font-medium text-primary">+{PRIORITY_FORMULA.grantMatch.perfectBonus}</span></p>
              <p>Nahe dran (max ≥ Hälfte unseres Minimums): <span className="font-medium text-primary">+{PRIORITY_FORMULA.grantMatch.closeBonus}</span></p>
              <p>Betrag bekannt aber klein: <span className="font-medium text-primary">+{PRIORITY_FORMULA.grantMatch.smallBonus}</span></p>
            </div>
          </div>

          {/* P-levels */}
          <div>
            <h4 className="mb-2 heading-detail">
              Prioritätsstufen (aktuell über {total} Stiftungen)
            </h4>
            <div className="space-y-2">
              {PRIORITY_FORMULA.display.map((d) => {
                const pc = PRIORITY_CONFIG[d.level];
                return (
                  <div key={d.level} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-3">
                      <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${pc.color}`}>
                        {pc.label}
                      </span>
                      <span className="text-sm text-text-light">{pc.description}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs tabular-nums text-text-muted">
                        ≥{d.minScore}
                      </span>
                      <span className="w-10 text-right text-sm font-bold tabular-nums text-grey-dark">
                        {priorityDist.counts[d.level]}
                      </span>
                    </div>
                  </div>
                );
              })}
              {/* P4 — default level (below all thresholds) */}
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div className="flex items-center gap-3">
                  <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${PRIORITY_CONFIG[4].color}`}>
                    {PRIORITY_CONFIG[4].label}
                  </span>
                  <span className="text-sm text-text-light">{PRIORITY_CONFIG[4].description}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs tabular-nums text-text-muted">
                    &lt;{PRIORITY_FORMULA.display[PRIORITY_FORMULA.display.length - 1].minScore}
                  </span>
                  <span className="w-10 text-right text-sm font-bold tabular-nums text-grey-dark">
                    {priorityDist.counts[4]}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-text-muted">
              Durchschnittlicher Prioritäts-Score: {priorityDist.avg}/100.
              Manuell überschriebene Prioritäten sind mit «manuell» gekennzeichnet.
            </p>
          </div>
        </Card>
      </section>

      {/* Gesuch Gate */}
      <section className="mb-10">
        <h2 className="mb-4 heading-subsection">Gesuch-Gate</h2>
        <Card>
          <p className="mb-3 text-sm text-text-light">
            Eine Gesuch-Seite wird nur generiert, wenn beide Bedingungen erfüllt sind:
          </p>
          <ol className="mb-3 list-inside list-decimal space-y-1 text-sm text-text-light">
            <li>Bereitschafts-Stufe ≥ <strong>Recherchiert</strong> (Score ≥{READINESS_ENGINE.display.thresholds.find(t => TIER_FROM_LEVEL[t.level] === 'recherchiert')?.minScore})</li>
            <li>Prioritätsstufe <strong>P1, P2 oder P3</strong> (Score ≥{PRIORITY_FORMULA.display[PRIORITY_FORMULA.display.length - 1].minScore})</li>
          </ol>
          <p className="text-sm text-text-light">
            P3-Stiftungen («Beobachten — bei passendem Timing bewerben») bekommen ein
            vorbereitetes Gesuch, damit wir bei gutem Timing sofort einreichen können.
            P4-Stiftungen bekommen kein Gesuch, da die strategische Priorität zu niedrig ist.
          </p>
          <div className="mt-3 rounded bg-bg-light p-3 text-sm text-text-muted">
            Aktuell: {STIFTUNGEN_DATA.filter(hasGesuchPage).length} von {total} Stiftungen haben eine Gesuch-Seite.
          </div>
        </Card>
      </section>

      {/* Design Principles */}
      <section className="mb-10">
        <h2 className="mb-4 heading-subsection">Design-Prinzipien</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="mb-2 heading-item">Fit als Gate, nicht als Summand</h3>
            <p className="text-sm text-text-light">
              Eine Stiftung mit perfekten Daten aber schlechtem Fit (z.B. nur Medizinforschung)
              hat Priorität 0. Gute Daten kompensieren keinen fundamentalen Mismatch.
            </p>
          </Card>
          <Card>
            <h3 className="mb-2 heading-item">Dimensionen nach Zweck</h3>
            <p className="text-sm text-text-light">
              Bereitschafts-Dimensionen messen konkrete Fähigkeiten: «Können wir die Story
              massschneidern?» statt «Wie viele Felder sind gefüllt?»
            </p>
          </Card>
          <Card>
            <h3 className="mb-2 heading-item">Inspizierbar</h3>
            <p className="text-sm text-text-light">
              Jede Stiftungs-Detailseite zeigt den Score-Aufschlüsselung:
              welche Checks bestanden haben und welche fehlen. Keine Black Box.
            </p>
          </Card>
          <Card>
            <h3 className="mb-2 heading-item">Konfigurierbar</h3>
            <p className="text-sm text-text-light">
              Alle Gewichte, Schwellenwerte und Abzüge leben in einer einzigen
              Konfigurationsdatei. Pro Organisation anpassbar.
            </p>
          </Card>
        </div>
      </section>
    </>
  );
}
