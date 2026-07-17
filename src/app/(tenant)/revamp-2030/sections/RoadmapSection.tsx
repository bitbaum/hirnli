import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  HUB_SPACE_DISPLAY,
  DEVICES_PER_MONTH_TARGET,
  PEOPLE_REACHED_DISPLAY,
} from '@/lib/config/projections';

export default function RoadmapSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Roadmap 2026-2030: Wie wir hinkommen</h2>
      <p className="text-sm text-text-secondary mb-6">
        <strong>Phase 1 (2026-2028):</strong> Foundation - Hub aufbauen + Bildungsprogramm starten.
        <strong> Phase 2 (2029-2030):</strong> Skalierung - volle Kapazität, zusätzliche Programme, nachhaltige Selbsttragung.
      </p>
      <Card>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <Badge variant="info" className="mt-1">2026</Badge>
            <div className="flex-1">
              <h3 className="heading-item mb-2">Phase 1: Fundraising & Standortsuche</h3>
              <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                <li>Standortsuche: {HUB_SPACE_DISPLAY} in Zürich Agglomeration</li>
                <li>Fundraising für Hub + Bildungsprogramm (3 Jahre)</li>
                <li>Planung: Raumkonzept, Prozesse, Betriebsmodell</li>
                <li><strong>Data-Strategie:</strong> Systematische KPI-Erfassung etablieren (Geräte/Monat, Menschen/Jahr, Wartezeiten)</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Badge variant="info" className="mt-1">2027</Badge>
            <div className="flex-1">
              <h3 className="heading-item mb-2">Phase 2: Hub-Aufbau + erste:r BPL</h3>
              <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                <li>Hub-Umbau & Einrichtung (Werkstatt, Schulungsräume, Event-/Kulturraum)</li>
                <li>Erste:r Bildungsprogrammleiter:in eingestellt (Hardware oder Software/AI)</li>
                <li>Strukturierte Programme starten: Zeitpläne, Trainings, Qualitätssicherung</li>
                <li>Erste Kunst-/Musik-Events & Ausstellungen</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Badge variant="success" className="mt-1">2028</Badge>
            <div className="flex-1">
              <h3 className="heading-item mb-2">Phase 1 abgeschlossen: Grundlagen stehen</h3>
              <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                <li>Zweite:r Bildungsprogrammleiter:in eingestellt (beide BPL aktiv)</li>
                <li>Hub-Betrieb läuft: Werkstatt, Schulungsräume, Event-/Kulturraum etabliert</li>
                <li>Train-the-Trainer etabliert: Erste Multiplikatoren arbeiten</li>
                <li>Kapazität: ~{DEVICES_PER_MONTH_TARGET} Geräte/Monat, {PEOPLE_REACHED_DISPLAY} trainiert</li>
                <li>Kultur-Programm aktiv: Regelmässige Events & Ausstellungen</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Badge variant="warning" className="mt-1">2029-2030</Badge>
            <div className="flex-1">
              <h3 className="heading-item mb-2">Phase 2: Skalierung & Vollausbau</h3>
              <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                <li>Weitere Optimierung der Prozesse und Kapazitäten</li>
                <li>Train-the-Trainer-Programme voll etabliert und selbsttragend</li>
                <li>Zusätzliche Programme: AI Lab vollständig aktiv, Makerspace/Hackerspace ausgebaut</li>
                <li>Nachhaltige Selbsttragung: Betriebskosten gedeckt, reinvestierbare Überschüsse</li>
                <li>Community etabliert: Hub ist bekannter Ort für digitale Teilhabe & Kultur</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
