import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Callout from '@/components/ui/Callout';
import {
  DEVICES_PER_MONTH_CURRENT_DISPLAY,
  DEVICES_PER_MONTH_TARGET,
  PEOPLE_REACHED_DISPLAY,
  BPL_HARDWARE_PER_YEAR_DISPLAY,
  BPL_SOFTWARE_PER_YEAR_DISPLAY,
  PEOPLE_REACHED_CURRENT_DISPLAY,
  REPAIR_TABLES_CURRENT,
} from '@/lib/config/projections';

export default function ReachSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Wie wir mehr Menschen erreichen</h2>
      <Card>
        <Callout color="primary" className="mb-6">
          <p className="text-sm text-primary">
            <strong>Transparenz-Hinweis:</strong> Die Zahlen unten ({BPL_HARDWARE_PER_YEAR_DISPLAY} Techniker/Jahr, etc.) sind <strong>Projektionen</strong>,
            basierend auf Train-the-Trainer Konzept (etablierte Bildungsstrategie) und unserer informellen Erfahrung.
            <strong> Nicht empirisch gemessen.</strong> Wir werden diese ab 2026 systematisch erfassen (Data-Strategie).
          </p>
        </Callout>
        <p className="text-sm text-text-light mb-6">
          Der Schlüssel: <strong>Organisation + Train-the-Trainer + Online-Content</strong>. Nicht einfach mehr Mitarbeitende einstellen.
        </p>
        <div className="space-y-6">
          {/* Heute */}
          <div>
            <h3 className="heading-item mb-3 flex items-center gap-2">
              <Badge variant="warning">Heute</Badge>
              Unstrukturiert, ineffizient
            </h3>
            <div className="bg-warning/10 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="heading-detail text-warning mb-2">Hardware:</p>
                  <ul className="text-sm text-warning space-y-1">
                    <li>• {REPAIR_TABLES_CURRENT} Tische vorhanden, aber nur 1-2 genutzt (Reza + manchmal Freiwillige)</li>
                    <li>• Keine strukturierten Trainings, kein Zeitplan</li>
                    <li>• Lange Wartezeiten, Backlog wächst</li>
                    <li>• <strong>{DEVICES_PER_MONTH_CURRENT_DISPLAY} Geräte/Monat</strong> (geschätzt aus Umsatzdaten)</li>
                  </ul>
                </div>
                <div>
                  <p className="heading-detail text-warning mb-2">Software/AI:</p>
                  <ul className="text-sm text-warning space-y-1">
                    <li>• Kernteam zu beschäftigt für systematische Bildung</li>
                    <li>• Keine Workshops, keine strukturierten Kurse</li>
                    <li>• Gelegentliche Unterstützung, aber nicht systematisch</li>
                    <li>• <strong>{PEOPLE_REACHED_CURRENT_DISPLAY} Menschen/Jahr</strong> erreicht (Schätzung)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Mit Hub + BPL */}
          <div>
            <h3 className="heading-item mb-3 flex items-center gap-2">
              <Badge variant="success">Mit Hub + Bildungsprogrammleiter:innen</Badge>
              Strukturiert, organisiert, skalierbar
            </h3>
            <div className="bg-success/10 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="heading-detail text-success mb-2">Hardware (organisiert):</p>
                  <ul className="text-sm text-success space-y-1">
                    <li>• <strong>Hardware-BPL organisiert:</strong> Zeitpläne, Qualität, Prozesse</li>
                    <li>• Alle Tische genutzt (strukturierte Schichten, klare Verantwortlichkeiten)</li>
                    <li>• <strong>{BPL_HARDWARE_PER_YEAR_DISPLAY} Techniker/Jahr</strong> ausgebildet (Train-the-Trainer)</li>
                    <li>• <strong>~{DEVICES_PER_MONTH_TARGET} Geräte/Monat</strong> (durch bessere Prozesse + mehr Kapazität)</li>
                  </ul>
                </div>
                <div>
                  <p className="heading-detail text-success mb-2">Software/AI (strukturiert):</p>
                  <ul className="text-sm text-success space-y-1">
                    <li>• <strong>Software/AI-BPL organisiert:</strong> Curricula, Workshops, Events</li>
                    <li>• <strong>{BPL_SOFTWARE_PER_YEAR_DISPLAY} Entwickler/Jahr</strong> ausgebildet (Train-the-Trainer)</li>
                    <li>• Plus Workshops, Events, Repair Cafés</li>
                    <li>• <strong>{PEOPLE_REACHED_DISPLAY}</strong> total erreicht (konservative Schätzung)</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-success/20">
                <p className="heading-detail text-success mb-2">Warum das funktioniert:</p>
                <p className="text-sm text-success">
                  <strong>Organisation + bezahlte Fachleute</strong> bedeuten: verlässliche Zeitpläne, strukturierte Programme,
                  systematisches Training. Freiwillige können kommen und gehen — aber die Struktur bleibt stabil.
                  Trainierte geben ihr Wissen weiter — jede:r kann 10+ Menschen/Jahr erreichen. <strong>Das ist der eigentliche Game-Changer</strong>,
                  nicht nur mehr m².
                </p>
              </div>
            </div>
          </div>

          {/* Online Content & Skalierung */}
          <div>
            <h3 className="heading-item mb-3 flex items-center gap-2">
              <Badge variant="info">Bonus: Online Content</Badge>
              Noch mehr Reichweite ohne zusätzliche Personalkosten
            </h3>
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-primary mb-3">
                <strong>Hub + Bildungsprogrammleiter:innen ermöglichen auch Online-Content-Produktion:</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="heading-detail text-primary mb-2">Hub bietet Infrastruktur:</p>
                  <ul className="text-sm text-primary space-y-1">
                    <li>• Professioneller Schulungsraum = Video-Studio</li>
                    <li>• Werkstatt = Praxis-Aufnahmen für Tutorials</li>
                    <li>• Event-Raum = Live-Streaming von Workshops</li>
                    <li>• AI Lab = Content-Entwicklung & -Bearbeitung</li>
                  </ul>
                </div>
                <div>
                  <p className="heading-detail text-primary mb-2">BPL produzieren Content:</p>
                  <ul className="text-sm text-primary space-y-1">
                    <li>• Video-Tutorials (Laptop-Reparatur Schritt-für-Schritt)</li>
                    <li>• Online-Kurse (AI Literacy, Linux-Grundlagen)</li>
                    <li>• Dokumentation & Guides (Open-Source-Wissen)</li>
                    <li>• Webinare & Live-Sessions (Fragen & Antworten)</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="heading-detail text-primary mb-2">Zusätzliche Reichweite:</p>
                <p className="text-sm text-primary mb-2">
                  Ein gut produziertes Tutorial-Video kann <strong>100-1000+ Menschen erreichen</strong> — ohne zusätzlichen Zeitaufwand.
                  Online-Kurse skalieren unbegrenzt: 1× produzieren, 100× nutzen.
                </p>
                <p className="text-sm text-primary">
                  <strong>Beispiel:</strong> &bdquo;Wie repariere ich meinen Laptop?&ldquo; Video → 500 Views/Jahr = 500 Menschen erreicht,
                  für 0 zusätzliche Kosten nach Produktion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
