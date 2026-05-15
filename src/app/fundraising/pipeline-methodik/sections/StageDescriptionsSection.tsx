import Link from 'next/link';
import Card from '@/components/ui/Card';

export default function StageDescriptionsSection() {
  return (
    <section className="mb-10">
      <h2 className="mb-4 heading-subsection">Was an jeder Stufe passiert</h2>

      <Card className="mb-4">
        <h3 className="mb-2 heading-item">Stufe 1-2: Register-Import</h3>
        <p className="mb-2 text-sm text-text-light">
          Automatischer Import aller Stiftungen aus dem Zefix-Handelsregister und dem
          ESA-Stiftungsverzeichnis. Jede Stiftung bekommt einen Datenbankeintrag mit
          Name, UID und — falls von ESA vorhanden — dem offiziellen Stiftungszweck.
        </p>
        <p className="text-sm text-text-muted">
          Vollständig automatisiert. Wird periodisch aktualisiert.
        </p>
      </Card>

      <Card className="mb-4">
        <h3 className="mb-2 heading-item">Stufe 2-3: Thematisches Screening</h3>
        <p className="mb-2 text-sm text-text-light">
          Der offizielle Stiftungszweck wird gegen unsere Themenbereiche abgeglichen:
          Arbeitsintegration, Kreislaufwirtschaft, digitale Bildung, soziale Integration,
          Jugendförderung, Klimaschutz, Region Zürich. Parallel wird erkannt, ob die
          Stiftung eine Förderstiftung (vergibt Gelder) oder eine operative Stiftung
          (betreibt eigene Einrichtungen) ist.
        </p>
        <p className="text-sm text-text-muted">
          Keyword-Matching auf dem Stiftungszweck. Keine KI-Kosten.
          Eliminiert Stiftungen ohne thematische Überschneidung (z.B. Medizinforschung, Kunst, Oper).
        </p>
      </Card>

      <Card className="mb-4">
        <h3 className="mb-2 heading-item">Stufe 3-4: Fit-Bewertung und Tiefenrecherche</h3>
        <p className="mb-2 text-sm text-text-light">
          Stiftungen mit thematischem Signal werden vertieft analysiert: Passt der Stiftungszweck
          wirklich zu unserer Mission? Dies geschieht durch KI-gestützte Analyse des Zwecktexts
          oder — bei vorhandener Website — durch Scraping und Auswertung der Stiftungs-Website.
          Dabei werden Kontaktdaten, Förderbereiche, Fristen und Bewerbungswege extrahiert.
        </p>
        <p className="text-sm text-text-muted">
          KI-gestützt (LLM-Analyse). Moderate Kosten. Nur für Stiftungen mit positivem Screening.
        </p>
      </Card>

      <Card className="mb-4">
        <h3 className="mb-2 heading-item">Stufe 4-5: Prioritäts-Gate</h3>
        <p className="mb-2 text-sm text-text-light">
          Die Kombination aus Fit-Score und Bereitschafts-Score ergibt die Priorität.
          Nur Stiftungen mit Priorität P1-P3 bekommen eine generierte Gesuch-Seite.
          P4-Stiftungen bleiben in der Datenbank für spätere Beziehungspflege,
          erhalten aber kein Gesuch.
        </p>
        <p className="text-sm text-text-muted">
          Algorithmisch berechnet. Details: <Link href="/fundraising/scoring-methodik" className="underline">Scoring-Methodik</Link>.
        </p>
      </Card>
    </section>
  );
}
