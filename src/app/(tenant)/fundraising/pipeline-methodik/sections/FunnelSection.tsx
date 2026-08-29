import { formatNumber } from '@/lib/utils/format';
import { SWISS_FOUNDATIONS_DISPLAY } from '@/lib/config/projections';
import type { FunnelStats } from '@/lib/domain/pipeline-stats';

interface Props {
  s: FunnelStats;
}

function FunnelStage({
  number,
  title,
  question,
  count,
  countLabel,
  method,
  cost,
  color,
  detail,
}: {
  number: number;
  title: string;
  question: string;
  count: string;
  countLabel: string;
  method: string;
  cost: string;
  color: string;
  detail?: string;
}) {
  return (
    <div className={`rounded-lg border border-border-default/50 p-4 ${color}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-grey-dark text-xs font-bold text-white">
              {number}
            </span>
            <h3 className="heading-item">{title}</h3>
          </div>
          <p className="mb-2 text-sm italic text-text-muted">&laquo;{question}&raquo;</p>
          {detail && <p className="mb-2 text-sm text-text-secondary">{detail}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
            <span>Methode: {method}</span>
            <span>Kosten: {cost}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="block heading-section tabular-nums">{count}</span>
          <span className="text-xs text-text-muted">{countLabel}</span>
        </div>
      </div>
    </div>
  );
}

export default function FunnelSection({ s }: Props) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 heading-subsection">Der Trichter</h2>
      <div className="space-y-3">
        <FunnelStage
          number={0}
          title="Schweizer Stiftungsuniversum"
          question="Existiert die Stiftung?"
          count={SWISS_FOUNDATIONS_DISPLAY}
          countLabel="im Handelsregister (Zefix)"
          method="Zefix + ESA Register-Import"
          cost="Gratis"
          color="bg-surface-raised"
        />
        <FunnelStage
          number={1}
          title="In unserer Datenbank"
          question="Haben wir Daten über sie?"
          count={formatNumber(s.total)}
          countLabel="mit Basisdaten importiert"
          method="Automatischer Import aus Zefix und ESA"
          cost="Gratis"
          color="bg-surface-raised"
          detail={`${formatNumber(s.withPurpose)} haben einen Stiftungszweck (ESA). ${formatNumber(s.total - s.withPurpose)} haben nur einen Namen (Zefix).`}
        />
        <FunnelStage
          number={2}
          title="Thematisch relevant"
          question="Hat der Stiftungszweck etwas mit unserer Mission zu tun?"
          count={formatNumber(s.withThemes)}
          countLabel="mit mindestens einem passenden Thema"
          method="Keyword-Matching auf dem offiziellen Stiftungszweck (ESA)"
          cost="Gratis"
          color="bg-accent-soft"
          detail="Stiftungszwecke wie «Förderung der medizinischen Grundlagenforschung» werden automatisch aussortiert. Zwecke mit Begriffen wie Arbeitsintegration, Kreislaufwirtschaft, Bildung etc. bleiben."
        />
        <FunnelStage
          number={3}
          title="Fit bewertet"
          question="Passt diese Stiftung wirklich zu uns?"
          count={formatNumber(s.withFitScore)}
          countLabel="mit berechnetem Fit-Score"
          method="Algorithmisch (Themen × Geografie × Zugang) oder KI-gestützte Analyse"
          cost="Gering (KI) bis gratis (Algorithmus)"
          color="bg-accent-muted"
          detail={`${s.highFit} mit exzellentem Fit (★★★), ${s.mediumFit} mit gutem Fit (★★☆). Details: Scoring-Methodik.`}
        />
        <FunnelStage
          number={4}
          title="Recherchiert"
          question="Können wir ein massgeschneidertes Gesuch schreiben?"
          count={formatNumber(s.recherchiert)}
          countLabel="Bereitschafts-Tier ≥ Recherchiert"
          method="Website-Recherche, Kontaktdaten, Förderbereich, Fristen"
          cost="Mittel (Web-Scraping + KI-Analyse)"
          color="bg-accent-muted"
          detail={`Voraussetzung: Stiftungszweck dokumentiert, Kontaktdaten vorhanden, Themen zugeordnet, Website verifiziert. Aktuell ${s.withContact} mit Kontaktdaten, ${s.withWebsite} mit eigener Website.`}
        />
        <FunnelStage
          number={5}
          title="Gesuch-bereit"
          question="Lohnt sich der Aufwand jetzt?"
          count={formatNumber(s.gesuchReady)}
          countLabel="mit generierter Gesuch-Seite"
          method="Prioritäts-Gate: Fit × Bereitschaft → P1-P3"
          cost="Gratis (berechnet)"
          color="bg-success-bg"
          detail={`P1 (Erstpriorität): ${s.pCounts[1]}, P2 (hohe Priorität): ${s.pCounts[2]}, P3 (bei passendem Timing): ${s.pCounts[3]}. P4-Stiftungen (${s.pCounts[4]}) bekommen kein Gesuch.`}
        />
      </div>
    </section>
  );
}
