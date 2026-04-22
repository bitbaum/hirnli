import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import {
  TIER_LABELS, TIER_COLORS,
  getQualityTier, tierAtLeast, computeTierCounts,
} from '@/lib/domain/foundation-helpers';
import { hasGesuchPage } from '@/lib/domain/foundation-helpers';
import type { QualityTier } from '@/lib/schemas/foundation';
import { formatNumber } from '@/lib/utils/format';
import { SWISS_FOUNDATIONS_DISPLAY } from '@/lib/config/projections';

export const metadata: Metadata = {
  title: 'Pipeline-Methodik',
  description: `Wie wir aus ${SWISS_FOUNDATIONS_DISPLAY} Schweizer Stiftungen die richtigen finden`,
};

// ---------------------------------------------------------------------------
// Live funnel stats — computed from actual data at build time
// ---------------------------------------------------------------------------

function computeFunnelStats() {
  const total = STIFTUNGEN_DATA.length;
  const tierCounts = computeTierCounts(STIFTUNGEN_DATA);

  // Purpose text: foundations with substantial purposeSummary
  const withPurpose = STIFTUNGEN_DATA.filter(f =>
    f.purposeSummary && f.purposeSummary.length > 30
  ).length;

  // Theme coverage
  const withThemes = STIFTUNGEN_DATA.filter(f => f.themes.length > 0).length;

  // Fit score distribution
  const withFitScore = STIFTUNGEN_DATA.filter(f => f.fitScore > 0).length;
  const highFit = STIFTUNGEN_DATA.filter(f => f.fitScore >= 7).length;
  const mediumFit = STIFTUNGEN_DATA.filter(f => f.fitScore >= 4 && f.fitScore < 7).length;

  // Contact info
  const withContact = STIFTUNGEN_DATA.filter(f =>
    f.contact?.email || f.contact?.phone
  ).length;

  // Website (real, not Zefix/UID)
  const withWebsite = STIFTUNGEN_DATA.filter(f =>
    f.websiteUrl && !f.websiteUrl.includes('zefix.ch') && !f.websiteUrl.includes('uid.admin.ch')
  ).length;

  // Research depth
  const rapid = STIFTUNGEN_DATA.filter(f => (f as Record<string, unknown>).researchDepth === 'rapid').length;
  const standard = STIFTUNGEN_DATA.filter(f => (f as Record<string, unknown>).researchDepth === 'standard').length;
  const deep = STIFTUNGEN_DATA.filter(f => (f as Record<string, unknown>).researchDepth === 'deep').length;

  // Profiliert+ (can show detail page)
  const profiliert = STIFTUNGEN_DATA.filter(f => tierAtLeast(getQualityTier(f), 'profiliert')).length;

  // Recherchiert+ (can potentially get gesuch)
  const recherchiert = STIFTUNGEN_DATA.filter(f => tierAtLeast(getQualityTier(f), 'recherchiert')).length;

  // Gesuch-ready (tier + priority gate)
  const gesuchReady = STIFTUNGEN_DATA.filter(hasGesuchPage).length;

  // Priority distribution among recherchiert+
  const recherchiertFoundations = STIFTUNGEN_DATA.filter(f => tierAtLeast(getQualityTier(f), 'recherchiert'));
  const pCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const f of recherchiertFoundations) {
    pCounts[f.priority as 1 | 2 | 3 | 4]++;
  }

  return {
    total, withPurpose, withThemes, withFitScore, highFit, mediumFit,
    withContact, withWebsite, rapid, standard, deep,
    tierCounts, profiliert, recherchiert, gesuchReady, pCounts,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PipelineMethodikPage() {
  const s = computeFunnelStats();

  return (
    <>
      <PageHeader
        title="Pipeline-Methodik"
        subtitle="Wie wir aus tausenden Schweizer Stiftungen die richtigen finden"
      />

      <p className="mb-8 text-sm text-text-light">
        Die Schweiz hat über {SWISS_FOUNDATIONS_DISPLAY} eingetragene Stiftungen. Wir können nicht alle recherchieren —
        das wäre Jahre an Arbeit. Stattdessen nutzen wir einen mehrstufigen Trichter: jede Stufe ist
        günstiger als die nächste und eliminiert Stiftungen, die eine klare Frage nicht bestehen.
      </p>

      {/* ================================================================= */}
      {/* THE FUNNEL — Visual overview                                       */}
      {/* ================================================================= */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Der Trichter</h2>

        <div className="space-y-3">
          {/* Stage 0: Universe */}
          <FunnelStage
            number={0}
            title="Schweizer Stiftungsuniversum"
            question="Existiert die Stiftung?"
            count={SWISS_FOUNDATIONS_DISPLAY}
            countLabel="im Handelsregister (Zefix)"
            method="Zefix + ESA Register-Import"
            cost="Gratis"
            color="bg-bg-light"
          />

          {/* Stage 1: In our DB */}
          <FunnelStage
            number={1}
            title="In unserer Datenbank"
            question="Haben wir Daten über sie?"
            count={formatNumber(s.total)}
            countLabel="mit Basisdaten importiert"
            method="Automatischer Import aus Zefix und ESA"
            cost="Gratis"
            color="bg-bg-light"
            detail={`${formatNumber(s.withPurpose)} haben einen Stiftungszweck (ESA). ${formatNumber(s.total - s.withPurpose)} haben nur einen Namen (Zefix).`}
          />

          {/* Stage 2: Keyword screen */}
          <FunnelStage
            number={2}
            title="Thematisch relevant"
            question="Hat der Stiftungszweck etwas mit unserer Mission zu tun?"
            count={formatNumber(s.withThemes)}
            countLabel="mit mindestens einem passenden Thema"
            method="Keyword-Matching auf dem offiziellen Stiftungszweck (ESA)"
            cost="Gratis"
            color="bg-primary/5"
            detail="Stiftungszwecke wie «Förderung der medizinischen Grundlagenforschung» werden automatisch aussortiert. Zwecke mit Begriffen wie Arbeitsintegration, Kreislaufwirtschaft, Bildung etc. bleiben."
          />

          {/* Stage 3: Fit assessed */}
          <FunnelStage
            number={3}
            title="Fit bewertet"
            question="Passt diese Stiftung wirklich zu uns?"
            count={formatNumber(s.withFitScore)}
            countLabel="mit berechnetem Fit-Score"
            method="Algorithmisch (Themen × Geografie × Zugang) oder KI-gestützte Analyse"
            cost="Gering (KI) bis gratis (Algorithmus)"
            color="bg-primary/10"
            detail={`${s.highFit} mit exzellentem Fit (★★★), ${s.mediumFit} mit gutem Fit (★★☆). Details: Scoring-Methodik.`}
          />

          {/* Stage 4: Researched */}
          <FunnelStage
            number={4}
            title="Recherchiert"
            question="Können wir ein massgeschneidertes Gesuch schreiben?"
            count={formatNumber(s.recherchiert)}
            countLabel={`Bereitschafts-Tier ≥ Recherchiert`}
            method="Website-Recherche, Kontaktdaten, Förderbereich, Fristen"
            cost="Mittel (Web-Scraping + KI-Analyse)"
            color="bg-primary/10"
            detail={`Voraussetzung: Stiftungszweck dokumentiert, Kontaktdaten vorhanden, Themen zugeordnet, Website verifiziert. Aktuell ${s.withContact} mit Kontaktdaten, ${s.withWebsite} mit eigener Website.`}
          />

          {/* Stage 5: Gesuch-ready */}
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

      {/* ================================================================= */}
      {/* DATA SOURCES                                                       */}
      {/* ================================================================= */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Datenquellen</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="mb-2 font-semibold text-grey-dark">Zefix (Handelsregister)</h3>
            <p className="mb-2 text-sm text-text-light">
              Offizielles Schweizer Handelsregister. Enthält alle eingetragenen Stiftungen
              mit Name, UID und Sitz. Keine Informationen über Stiftungszweck oder Tätigkeit.
            </p>
            <p className="text-xs text-text-muted">{SWISS_FOUNDATIONS_DISPLAY} Stiftungen. Quelle: zefix.ch</p>
          </Card>
          <Card>
            <h3 className="mb-2 font-semibold text-grey-dark">ESA (Eidg. Stiftungsaufsicht)</h3>
            <p className="mb-2 text-sm text-text-light">
              Bundesaufsicht über Stiftungen. Enthält den offiziellen Stiftungszweck —
              die rechtliche Zweckbeschreibung, die bei der Gründung festgelegt wurde.
              Dies ist unser wichtigstes Signal für die Erstbewertung.
            </p>
            <p className="text-xs text-text-muted">~5&apos;400 Stiftungen mit Zwecktext. Quelle: esa.admin.ch</p>
          </Card>
        </div>
      </section>

      {/* ================================================================= */}
      {/* TIER DISTRIBUTION                                                  */}
      {/* ================================================================= */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Aktuelle Verteilung nach Qualitätsstufe</h2>
        <p className="mb-4 text-sm text-text-light">
          Jede Stiftung wird anhand ihrer Datenvollständigkeit einer von fünf Qualitätsstufen zugeordnet.
          Die Stufe bestimmt, was mit der Stiftung möglich ist.
        </p>
        <Card>
          <div className="space-y-2">
            {(['anwendungsbereit', 'recherchiert', 'profiliert', 'erfasst', 'verzeichnet'] as QualityTier[]).map(tier => {
              const count = s.tierCounts[tier];
              const pct = s.total > 0 ? ((count / s.total) * 100).toFixed(1) : '0';
              const capability = {
                anwendungsbereit: 'Gesuch sofort einreichbar',
                recherchiert: 'Gesuch generierbar (wenn Priorität stimmt)',
                profiliert: 'Detail-Seite und Fit-Bewertung sichtbar',
                erfasst: 'Grunddaten vorhanden, weitere Recherche nötig',
                verzeichnet: 'Nur Name bekannt — keine Bewertung möglich',
              }[tier];

              return (
                <div key={tier} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TIER_COLORS[tier]}`}>
                      {TIER_LABELS[tier]}
                    </span>
                    <span className="text-sm text-text-light">{capability}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs tabular-nums text-text-muted">{pct}%</span>
                    <span className="w-16 text-right text-sm font-bold tabular-nums text-grey-dark">
                      {formatNumber(count)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* ================================================================= */}
      {/* HOW EACH STAGE WORKS                                               */}
      {/* ================================================================= */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Was an jeder Stufe passiert</h2>

        <Card className="mb-4">
          <h3 className="mb-2 font-semibold text-grey-dark">Stufe 1-2: Register-Import</h3>
          <p className="mb-2 text-sm text-text-light">
            Automatischer Import aller Stiftungen aus dem Zefix-Handelsregister und dem
            ESA-Stiftungsverzeichnis. Jede Stiftung bekommt einen Datenbankeintrag mit
            Name, UID und — falls von ESA vorhanden — dem offiziellen Stiftungszweck.
          </p>
          <p className="text-xs text-text-muted">
            Vollständig automatisiert. Wird periodisch aktualisiert.
          </p>
        </Card>

        <Card className="mb-4">
          <h3 className="mb-2 font-semibold text-grey-dark">Stufe 2-3: Thematisches Screening</h3>
          <p className="mb-2 text-sm text-text-light">
            Der offizielle Stiftungszweck wird gegen unsere Themenbereiche abgeglichen:
            Arbeitsintegration, Kreislaufwirtschaft, digitale Bildung, soziale Integration,
            Jugendförderung, Klimaschutz, Region Zürich. Parallel wird erkannt, ob die
            Stiftung eine Förderstiftung (vergibt Gelder) oder eine operative Stiftung
            (betreibt eigene Einrichtungen) ist.
          </p>
          <p className="text-xs text-text-muted">
            Keyword-Matching auf dem Stiftungszweck. Keine KI-Kosten.
            Eliminiert Stiftungen ohne thematische Überschneidung (z.B. Medizinforschung, Kunst, Oper).
          </p>
        </Card>

        <Card className="mb-4">
          <h3 className="mb-2 font-semibold text-grey-dark">Stufe 3-4: Fit-Bewertung und Tiefenrecherche</h3>
          <p className="mb-2 text-sm text-text-light">
            Stiftungen mit thematischem Signal werden vertieft analysiert: Passt der Stiftungszweck
            wirklich zu unserer Mission? Dies geschieht durch KI-gestützte Analyse des Zwecktexts
            oder — bei vorhandener Website — durch Scraping und Auswertung der Stiftungs-Website.
            Dabei werden Kontaktdaten, Förderbereiche, Fristen und Bewerbungswege extrahiert.
          </p>
          <p className="text-xs text-text-muted">
            KI-gestützt (LLM-Analyse). Moderate Kosten. Nur für Stiftungen mit positivem Screening.
          </p>
        </Card>

        <Card className="mb-4">
          <h3 className="mb-2 font-semibold text-grey-dark">Stufe 4-5: Prioritäts-Gate</h3>
          <p className="mb-2 text-sm text-text-light">
            Die Kombination aus Fit-Score und Bereitschafts-Score ergibt die Priorität.
            Nur Stiftungen mit Priorität P1-P3 bekommen eine generierte Gesuch-Seite.
            P4-Stiftungen bleiben in der Datenbank für spätere Beziehungspflege,
            erhalten aber kein Gesuch.
          </p>
          <p className="text-xs text-text-muted">
            Algorithmisch berechnet. Details: <a href="/fundraising/scoring-methodik" className="underline">Scoring-Methodik</a>.
          </p>
        </Card>
      </section>

      {/* ================================================================= */}
      {/* THE DARK POOL                                                      */}
      {/* ================================================================= */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Die verbleibende Lücke</h2>
        <Card>
          <p className="mb-3 text-sm text-text-light">
            Von den {formatNumber(s.total)} Stiftungen in unserer Datenbank
            haben {formatNumber(s.total - s.withPurpose)} keinen bekannten Stiftungszweck — sie stammen
            ausschliesslich aus dem Handelsregister (Zefix) und bestehen nur aus einem Namen und einer UID.
          </p>
          <p className="mb-3 text-sm text-text-light">
            Für diese Stiftungen gibt es keine günstige Erstbewertung. Der nächste Schritt ist
            die automatische Website-Erkennung: Über DNS-Abfragen und Namens-Heuristiken
            wird geprüft, ob eine Stiftung eine eigene Website hat. Falls ja, wird diese
            gescrapt und der Stiftungszweck daraus extrahiert — danach greift der reguläre Trichter.
          </p>
          <div className="rounded bg-bg-light p-3 text-xs text-text-muted">
            Bisherige Website-Erkennung: ~555 Websites bei ~16&apos;000 geprüften Stiftungen gefunden (3.4% Trefferquote).
            Die meisten Zefix-Stiftungen haben keine eigene Website.
          </div>
        </Card>
      </section>

      {/* ================================================================= */}
      {/* PRINCIPLES                                                         */}
      {/* ================================================================= */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Prinzipien</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="mb-2 font-semibold text-grey-dark">Günstigstes Signal zuerst</h3>
            <p className="text-sm text-text-light">
              Jede Stufe ist billiger als die nächste. Keyword-Matching kostet nichts,
              KI-Analyse kostet wenig, Tiefenrecherche kostet am meisten. Wir eliminieren
              so viel wie möglich, bevor wir Ressourcen investieren.
            </p>
          </Card>
          <Card>
            <h3 className="mb-2 font-semibold text-grey-dark">Nie verschlechtern</h3>
            <p className="text-sm text-text-light">
              Neue Daten können einen Fit-Score nur verbessern, nie verschlechtern.
              Prioritäten können nur steigen, nie sinken. Bereits recherchierte Stiftungen
              werden nie auf eine niedrigere Stufe zurückgesetzt.
            </p>
          </Card>
          <Card>
            <h3 className="mb-2 font-semibold text-grey-dark">Inspizierbar</h3>
            <p className="text-sm text-text-light">
              Jeder Score und jede Stufe ist auf der Stiftungs-Detailseite einsehbar.
              Welche Checks bestanden haben, welche Felder fehlen, warum die Priorität
              so ist wie sie ist. Keine Black Boxes.
            </p>
          </Card>
          <Card>
            <h3 className="mb-2 font-semibold text-grey-dark">Wiederholbar</h3>
            <p className="text-sm text-text-light">
              Der gesamte Trichter ist idempotent — er kann jederzeit erneut ausgeführt werden,
              ohne bestehende Daten zu beschädigen. Neue Register-Daten werden automatisch
              in den Trichter aufgenommen.
            </p>
          </Card>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// FunnelStage component
// ---------------------------------------------------------------------------

function FunnelStage({ number, title, question, count, countLabel, method, cost, color, detail }: {
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
    <div className={`rounded-lg border border-border/50 p-4 ${color}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-grey-dark text-xs font-bold text-white">
              {number}
            </span>
            <h3 className="font-semibold text-grey-dark">{title}</h3>
          </div>
          <p className="mb-2 text-sm italic text-text-muted">&laquo;{question}&raquo;</p>
          {detail && (
            <p className="mb-2 text-sm text-text-light">{detail}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
            <span>Methode: {method}</span>
            <span>Kosten: {cost}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-2xl font-bold tabular-nums text-grey-dark">{count}</span>
          <span className="text-xs text-text-muted">{countLabel}</span>
        </div>
      </div>
    </div>
  );
}
