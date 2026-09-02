import Card from '@/components/ui/Card';
import Callout from '@/components/ui/Callout';
import {
  BPL_HARDWARE_PER_YEAR_DISPLAY,
  BPL_SOFTWARE_PER_YEAR_DISPLAY,
  BPL_DIRECT_TRAINED_PER_YEAR_DISPLAY,
  PEOPLE_REACHED_PER_YEAR,
} from '@/lib/config/projections';

export default function TrainTheTrainerMechanismSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Wie funktioniert Train-the-Trainer?</h2>
      <Card>
        <Callout color="primary" className="mb-6">
          <p className="text-sm text-primary mb-2">
            <strong>Transparenz-Hinweis:</strong> Train-the-Trainer ist ein etabliertes Konzept in
            Bildung und Capacity Building (z.B. WHO, viele NGOs nutzen diesen Ansatz).
          </p>
          <p className="text-sm text-primary">
            Die spezifischen Zahlen unten ({BPL_HARDWARE_PER_YEAR_DISPLAY} Techniker/Jahr, etc.)
            sind <strong>Projektionen</strong>
            basierend auf unserer informellen Erfahrung und Schätzungen.{' '}
            <strong>Nicht empirisch gemessen.</strong>
            Wir werden diese ab 2026 systematisch erfassen (Data-Strategie).
          </p>
        </Callout>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pillar-vision/15 flex items-center justify-center text-pillar-vision font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="heading-item mb-2">
                Bildungsprogrammleiter:innen trainieren Trainer:innen
              </h3>
              <p className="text-sm text-text-secondary mb-3">
                Hardware-BPL bildet <strong>{BPL_HARDWARE_PER_YEAR_DISPLAY} Techniker/Jahr</strong>{' '}
                aus. Software/AI-BPL trainiert{' '}
                <strong>{BPL_SOFTWARE_PER_YEAR_DISPLAY} Entwickler/Jahr</strong>. Total:{' '}
                <strong>{BPL_DIRECT_TRAINED_PER_YEAR_DISPLAY} Menschen/Jahr direkt</strong> (vs. 5
                heute).
              </p>
              <div className="bg-pillar-vision/10 rounded-lg p-3 text-sm text-pillar-vision">
                <strong>Beispiel Hardware:</strong> Ein:e Teilnehmer:in lernt nicht nur
                Laptop-Reparatur, sondern auch, wie man dieses Wissen weitervermittelt (Didaktik,
                Curricula, Praxisanleitung).
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pillar-vision/20 flex items-center justify-center text-pillar-vision font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="heading-item mb-2">Trainer:innen trainieren andere</h3>
              <p className="text-sm text-text-secondary mb-3">
                Hardware: <strong>5 gleichzeitig aktive Techniker</strong> → je 10 Menschen/Jahr ={' '}
                <strong>50 indirekt</strong>. Software/AI: <strong>3 AI-Literacy-Trainer</strong> →
                je ~13 Menschen/Jahr = <strong>40 indirekt</strong>.
              </p>
              <div className="bg-pillar-vision/10 rounded-lg p-3 text-sm text-pillar-vision">
                <strong>Beispiel Software:</strong> Ein:e trainierte Entwickler:in gibt
                AI-Literacy-Workshops in Asylorganisationen, Bibliotheken oder Schulen → erreicht
                40+ Menschen/Jahr ohne dass wir direkt involviert sind.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pillar-vision/30 flex items-center justify-center text-pillar-vision font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="heading-item mb-2">Community-Effekte & Workshops</h3>
              <p className="text-sm text-text-secondary mb-3">
                Zusätzlich zu direktem und indirektem Training:{' '}
                <strong>Workshops, Events, Repair Cafés</strong> im Hub erreichen weitere 50-80
                Menschen/Jahr.
              </p>
              <div className="bg-success/10 rounded-lg p-3 text-sm text-success">
                <strong>Gesamt-Reichweite (konservativ):</strong>{' '}
                {BPL_DIRECT_TRAINED_PER_YEAR_DISPLAY} (direkt trainiert) + 20-40
                (Workshop-Teilnehmer) = <strong>{PEOPLE_REACHED_PER_YEAR} Menschen/Jahr</strong>.
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
