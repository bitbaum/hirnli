// ---------------------------------------------------------------------------
// Methodik: Transparenz-Prinzipien section
// ---------------------------------------------------------------------------

import Card from '@/components/ui/Card';

export function TransparencyPrinciplesSection() {
  return (
    <section className="mt-8">
      <h2 className="mb-4 heading-subsection">Transparenz-Prinzipien</h2>
      <Card>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h4 className="mb-3 font-medium">Was wir tun</h4>
            <ul className="list-disc space-y-1 pl-6 text-sm">
              <li>Nur echte Daten aus Kivitendo verwenden</li>
              <li>Jede Berechnung dokumentieren</li>
              <li>Annahmen offenlegen</li>
              <li>Limitationen klar benennen</li>
              <li>Datenlücken dokumentieren</li>
              <li>Cross-Validierungen durchführen</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-medium">Was wir nicht tun</h4>
            <ul className="list-disc space-y-1 pl-6 text-sm">
              <li>Keine erfundenen Zahlen</li>
              <li>Keine Schönfärberei</li>
              <li>Keine versteckten Annahmen</li>
              <li>Keine Pseudo-Präzision</li>
              <li>Keine unbelegten Behauptungen</li>
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
}
