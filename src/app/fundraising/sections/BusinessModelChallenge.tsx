import Link from 'next/link';
import Card from '@/components/ui/Card';
import Callout from '@/components/ui/Callout';

export default function BusinessModelChallenge() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Die Geschäftsmodell-Herausforderung</h2>
      <Card>
        <div className="prose prose-sm max-w-none">
          <p className="text-grey-dark leading-relaxed">
            <strong>Unsere aktuelle Situation:</strong> Wir haben 2 grosse Kivitendo-Kunden verloren. Das hat
            unsere B2B-Einnahmen stark reduziert.
          </p>

          <Callout color="warning" className="my-4">
            <p className="heading-detail text-warning mb-2">Warum wir nicht einfach &bdquo;mehr verkaufen&ldquo; können:</p>
            <ul className="text-warning space-y-2 mb-0">
              <li>Unser Kivitendo-System braucht dringend eine Überarbeitung — aber uns fehlen die Ressourcen</li>
              <li>Web-Design-Praxis ist aus demselben Grund nicht funktionsfähig</li>
              <li>Problem ist nicht fehlende Geräte, sondern fehlende Organisation für Verkauf & Ausführung</li>
              <li>Wir haben bereits zu viel Inventar in 2 Lagern — mehr Geräte helfen nicht</li>
            </ul>
          </Callout>

          <p className="text-grey-dark leading-relaxed">
            <strong>Was wir brauchen:</strong> Nicht mehr Verkauf, sondern <strong>bessere Prozesse</strong> und
            <strong> diversifizierte Einnahmen</strong> (Tech-Bildung, Workshops, AI Lab Services, Corporate Training,
            Community Events).
          </p>

          <p className="text-grey-dark leading-relaxed mb-0">
            Detaillierte Finanzdaten sind verfügbar im{' '}
            <Link href="/finanzen" className="underline">Finanzen-Bereich</Link> — alle Zahlen aus Kivitendo,
            klickbar mit Quellenangabe.
          </p>
        </div>
      </Card>
    </section>
  );
}
