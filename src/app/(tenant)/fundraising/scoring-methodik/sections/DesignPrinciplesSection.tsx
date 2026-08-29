import Card from '@/components/ui/Card';

export default function DesignPrinciplesSection() {
  return (
    <section className="mb-10">
      <h2 className="mb-4 heading-subsection">Design-Prinzipien</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="mb-2 heading-item">Fit als Gate, nicht als Summand</h3>
          <p className="text-sm text-text-secondary">
            Eine Stiftung mit perfekten Daten aber schlechtem Fit (z.B. nur Medizinforschung) hat
            Priorität 0. Gute Daten kompensieren keinen fundamentalen Mismatch.
          </p>
        </Card>
        <Card>
          <h3 className="mb-2 heading-item">Dimensionen nach Zweck</h3>
          <p className="text-sm text-text-secondary">
            Bereitschafts-Dimensionen messen konkrete Fähigkeiten: «Können wir die Story
            massschneidern?» statt «Wie viele Felder sind gefüllt?»
          </p>
        </Card>
        <Card>
          <h3 className="mb-2 heading-item">Inspizierbar</h3>
          <p className="text-sm text-text-secondary">
            Jede Stiftungs-Detailseite zeigt den Score-Aufschlüsselung: welche Checks bestanden
            haben und welche fehlen. Keine Black Box.
          </p>
        </Card>
        <Card>
          <h3 className="mb-2 heading-item">Konfigurierbar</h3>
          <p className="text-sm text-text-secondary">
            Alle Gewichte, Schwellenwerte und Abzüge leben in einer einzigen Konfigurationsdatei.
            Pro Organisation anpassbar.
          </p>
        </Card>
      </div>
    </section>
  );
}
