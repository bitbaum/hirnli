import Card from '@/components/ui/Card';
import HubCardHeader from './HubCardHeader';
import HubCardFooter from './HubCardFooter';
import { SHOP_AREA, WORKSHOP_AREA } from '@/lib/config/hub-space-plan';
import { formatCHF } from '@/lib/utils/format';

export default function CoreBusinessSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">🏪 Das Kerngeschäft: Shop & Refurbishment</h2>
      <p className="text-sm text-text-secondary mb-6">
        Wo alles beginnt: Kunden bringen Geräte, wir reparieren & verkaufen sie. Das ist unser Fundament.
      </p>
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-l-4 border-l-success">
          <HubCardHeader icon="🏪" title="Shop & Kundenbereich" subtitle="80 m² — Verkauf, Beratung, Annahme" subtitleClassName="text-success" badgeColor="emerald" badgeText={formatCHF(SHOP_AREA.cost_estimate_chf)} />
          <p className="text-sm text-text-secondary mb-4">
            Erste Anlaufstelle für Kunden: Geräte kaufen, zur Reparatur bringen, beraten lassen.
            Heute: Kein dedizierter Verkaufsraum. Neu: Professioneller Shop mit Ausstellungsfläche.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="heading-detail mb-2">Flächen:</h4>
              <ul className="space-y-1 text-text-secondary">
                <li>• 50 m² Verkaufsfläche (20-30 Geräte ausgestellt)</li>
                <li>• 15 m² Beratungs- & Kassenbereich</li>
                <li>• 15 m² Annahme & Triage (Geräte-Eingang)</li>
              </ul>
            </div>
            <div>
              <h4 className="heading-detail mb-2">Ausstattung:</h4>
              <ul className="space-y-1 text-text-secondary">
                <li>• Ausstellungsregale & Vitrinen</li>
                <li>• Testgeräte für Kunden (Laptops ausprobieren)</li>
                <li>• Kassensystem & Inventarverwaltung</li>
                <li>• Annahme-Protokoll für Reparaturen</li>
              </ul>
            </div>
          </div>
          <HubCardFooter items={[
            { label: 'Zielgruppe', value: 'Privatkunden, KulturLegi, NGOs, Schulen' },
          ]} />
        </Card>

        <Card className="border-l-4 border-l-primary">
          <HubCardHeader icon="🔧" title="Refurbishment-Werkstatt" subtitle="~150 m² — Effiziente Reparatur, Test & QA (ENTWURF)" subtitleClassName="text-primary" badgeColor="blue" badgeText={formatCHF(WORKSHOP_AREA.cost_estimate_chf)} />
          <p className="text-sm text-text-secondary mb-4">
            Das Herzstück: Hier entstehen refurbishte Geräte. <strong>Heute:</strong> 4 Tische, chaotisch, nur 1-2 in Nutzung.
            <strong> Neu:</strong> Strukturierte Prozesse (Triage → Data Wipe → Repair → Test → QA), nicht endlos Platz.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <h4 className="heading-detail mb-2">Flächen & Zonen (ENTWURF):</h4>
              <ul className="space-y-1 text-text-secondary">
                <li>• <strong>70 m²</strong> Haupt-Werkstatt (6-8× Reparaturtische)</li>
                <li>• <strong>30 m²</strong> Test & Data Wipe (10× Plätze parallel)</li>
                <li>• <strong>30 m²</strong> Quality Assurance & Verpackung</li>
                <li>• <strong>20 m²</strong> Ersatzteile & Werkzeug-Lager</li>
              </ul>
            </div>
            <div>
              <h4 className="heading-detail mb-2">Arbeitsplätze & Kapazität:</h4>
              <ul className="space-y-1 text-text-secondary">
                <li>• <strong>6-8× Reparaturtische</strong> (kompakt, effizient)</li>
                <li>• <strong>10× Test/Data-Wipe-Plätze</strong> (parallel)</li>
                <li>• <strong>Personal:</strong> 2-4 Techniker gleichzeitig</li>
                <li>• <strong>Kapazität:</strong> ~40 Geräte/Monat (durch bessere Prozesse + strukturiertes Team)</li>
              </ul>
            </div>
          </div>
          <div className="bg-primary/10 rounded-lg p-4 text-sm">
            <p className="heading-detail text-primary mb-2">Effizienz durch Prozesse, nicht durch Platz</p>
            <p className="text-primary text-sm">
              Nicht 600m² Werkstatt, sondern <strong>klare Prozesse</strong> mit 2× Bildungsprogrammleitern.
              Sie organisieren Workflows, bilden Techniker aus, koordinieren Freiwillige & Reintegrations-Teilnehmer.
              Plus: Sozialpädagogische Begleitung (Veronica) für nachhaltige Arbeitsintegration.
            </p>
          </div>
          <HubCardFooter items={[
            { label: 'Zielgruppe', value: 'Techniker (fest & Praktikanten), Reintegrations-Programme, Freiwillige, Schulungs-Teilnehmer' },
          ]} />
        </Card>
      </div>
    </section>
  );
}
