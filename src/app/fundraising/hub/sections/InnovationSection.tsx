import Card from '@/components/ui/Card';
import Callout from '@/components/ui/Callout';
import HubCardHeader from './HubCardHeader';
import HubCardFooter from './HubCardFooter';
import { MAKERSPACE_AREA, ROBOTIK_LAB_COST_CHF, TRAINING_AREA } from '@/lib/config/hub-space-plan';
import { formatCHF } from '@/lib/utils/format';

export default function InnovationSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">🚀 Innovation, Makerspace & Bildung</h2>
      <p className="text-sm text-text-secondary mb-6">
        Nächste Stufe: Nicht nur reparieren, sondern <strong>experimentieren, prototypen, lernen</strong>.
        Makerspace, Robotik, Schulungen. Hier entsteht Know-how.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-pillar-vision">
          <HubCardHeader icon="🛠️" title="Makerspace & Hackerspace" subtitle={`${MAKERSPACE_AREA.sqm_recommended} m² — Prototyping & Tüfteln`} subtitleClassName="text-chart-5" badgeColor="purple" badgeText={formatCHF(MAKERSPACE_AREA.cost_estimate_chf)} />
          <p className="text-sm text-text-secondary mb-4">
            Offene Werkstatt: 3D-Drucker, Laser-Cutter, Lötarbeitsplätze. Vom Prototyp zum Produkt.
          </p>
          <div className="text-sm mb-3">
            <h4 className="heading-detail mb-2">Arbeitsplätze & Ausstattung</h4>
            <ul className="space-y-1 text-text-secondary text-sm">
              <li>• <strong>12× Werkbänke</strong> (je 6m²) für Elektronik-Projekte</li>
              <li>• <strong>6× Lötarbeitsplätze</strong> mit Absaugung</li>
              <li>• <strong>4× 3D-Drucker</strong> (FDM & Resin)</li>
              <li>• <strong>1× Laser-Cutter</strong> & CNC-Fräse</li>
              <li>• Tool Library: Werkzeugverleih (CHF 20/Tag)</li>
            </ul>
          </div>
          <HubCardFooter items={[
            { label: 'Kapazität', value: '20-30 Menschen gleichzeitig, 100+ Menschen/Monat' },
            { label: 'Zielgruppe', value: 'Maker, Hobbyisten, Startups, Schüler' },
          ]} />
        </Card>

        <Card className="border-l-4 border-l-pillar-digital">
          <HubCardHeader icon="🤖" title="Robotik-Labor" subtitle="60 m² — Arduino, Raspberry Pi, autonome Systeme" subtitleClassName="text-pillar-digital" badgeColor="indigo" badgeText={formatCHF(ROBOTIK_LAB_COST_CHF)} />
          <p className="text-sm text-text-secondary mb-4">
            Robotik-Kits für Schulen, Arduino-Workshops, autonome Roboter bauen. MINT-Bildung hands-on.
          </p>
          <div className="text-sm mb-3">
            <h4 className="heading-detail mb-2">Arbeitsplätze & Ausstattung</h4>
            <ul className="space-y-1 text-text-secondary text-sm">
              <li>• <strong>10× Robotik-Arbeitsplätze</strong> (je 6m²)</li>
              <li>• <strong>30× Arduino/Raspberry Pi Kits</strong> (Leihgabe an Schulen)</li>
              <li>• <strong>8× Roboter-Chassis</strong> für autonome Projekte</li>
              <li>• Sensoren, Motoren, Mikrocontroller (Lager)</li>
              <li>• Testfläche für autonome Navigation (20m²)</li>
            </ul>
          </div>
          <HubCardFooter items={[
            { label: 'Kapazität', value: '20 Kursplätze, 200+ Schüler/Jahr' },
            { label: 'Zielgruppe', value: 'Schulklassen, Jugendliche, MINT-Interessierte' },
          ]} />
        </Card>

        <Card className="border-l-4 border-l-primary">
          <HubCardHeader icon="🎓" title="Schulungs- & Kursräume" subtitle={`${TRAINING_AREA.sqm_recommended} m² — Linux, AI, Coding für alle`} subtitleClassName="text-primary" badgeColor="blue" badgeText={formatCHF(TRAINING_AREA.cost_estimate_chf)} />
          <p className="text-sm text-text-secondary mb-4">
            Strukturierte Bildung: Linux-Kurse, AI Literacy, Programmieren lernen. Digital Literacy für alle.
          </p>
          <div className="text-sm mb-3">
            <h4 className="heading-detail mb-2">Arbeitsplätze & Ausstattung</h4>
            <ul className="space-y-1 text-text-secondary text-sm">
              <li>• <strong>20× Kursarbeitsplätze</strong> (Laptops, Monitore)</li>
              <li>• Whiteboard, Beamer, Präsentations-Setup</li>
              <li>• Flexible Tische (Gruppen- oder Einzelarbeit)</li>
              <li>• Netzwerk-Infrastruktur (Gigabit, VPN-Zugang)</li>
            </ul>
          </div>
          <HubCardFooter items={[
            { label: 'Kapazität', value: '20 Kursplätze, 500+ Teilnehmer/Jahr' },
            { label: 'Zielgruppe', value: 'Geflüchtete, Arbeitslose, Quereinsteiger, Unternehmen (Corporate Training)' },
          ]} />
        </Card>

        <Card className="border-l-4 border-l-cyan">
          <HubCardHeader icon="🤖" title="AI Lab — Verschiedene Setups möglich" subtitle="20-40 m² — Eigene GPUs, digitale Souveränität" subtitleClassName="text-chart-6" />
          <p className="text-sm text-text-secondary mb-4">
            <strong>Vision:</strong> Nicht Cloud-abhängig. Eigene GPU-Infrastruktur für AI-Modelle trainieren, hosten, nutzen.
            GPUs können gekauft oder gespendet werden — <strong>verschiedene Setups möglich</strong>, je nach Budget & Spenden.
          </p>

          <div className="text-sm mb-4">
            <h4 className="heading-detail mb-3">Mögliche Setups (aufsteigend)</h4>

            <div className="space-y-3">
              <div className="bg-chart-6/10 p-3 rounded-lg">
                <p className="heading-detail text-chart-6 mb-1">Setup A — Starter (CHF 15&apos;000-20&apos;000)</p>
                <ul className="text-sm text-chart-6 space-y-1">
                  <li>• 2-4× Consumer GPUs (NVIDIA RTX 3090/4090, gebraucht oder gespendet)</li>
                  <li>• 1× Server-Rack mit Basis-Kühlung</li>
                  <li>• <strong>Wirkung:</strong> AI Literacy Workshops (20-30 Teilnehmer/Monat), kleine Modelle fine-tunen</li>
                </ul>
              </div>

              <div className="bg-chart-6/15 p-3 rounded-lg">
                <p className="heading-detail text-chart-6 mb-1">Setup B — Professional (CHF 40&apos;000-60&apos;000)</p>
                <ul className="text-sm text-chart-6 space-y-1">
                  <li>• 4-6× Professional GPUs (NVIDIA A40, teilweise gespendet von Unternehmen)</li>
                  <li>• 2× Server-Racks mit professioneller Kühlung</li>
                  <li>• <strong>Wirkung:</strong> AI-gestützte Hardware-Diagnostik, AI Hosting für NGOs/KMUs, grössere Modelle trainieren</li>
                </ul>
              </div>

              <div className="bg-chart-6/20 p-3 rounded-lg">
                <p className="heading-detail text-chart-6 mb-1">Setup C — Enterprise (CHF 100&apos;000-150&apos;000)</p>
                <ul className="text-sm text-chart-6 space-y-1">
                  <li>• 8-12× NVIDIA A100 GPUs (Corporate-Spenden + Teilkauf, je CHF 10-15k)</li>
                  <li>• ODER 4-6× NVIDIA H100 GPUs (falls verfügbar, je CHF 25-35k)</li>
                  <li>• 2-3× Server-Racks mit Klimatisierung & Redundanz</li>
                  <li>• <strong>Wirkung:</strong> Alle oben + Open-Source-Modelle hosten, AI-Forschung für NGO-Sektor, Data Sovereignty für sensible Daten</li>
                </ul>
              </div>
            </div>
          </div>

          <Callout color="warning" className="text-sm text-warning mb-3">
            <strong>Wichtig:</strong> Wir starten nicht mit Setup C. Wir bauen modular auf, basierend auf Spenden + verfügbarem Budget.
            Jedes Setup ist nützlich — auch Setup A ermöglicht AI Literacy Workshops und kleine Modelle.
            <br /><br />
            <strong>Realität:</strong> Enterprise GPUs sind teuer (A100: CHF 10-15k, H100: CHF 25-35k pro Stück).
            Setup C erfordert massive Corporate-Spenden oder schrittweisen Aufbau über mehrere Jahre.
          </Callout>

          <HubCardFooter items={[
            { label: 'Potenzielle Wirkung (je nach Setup)', value: '20-60 Workshop-Teilnehmer/Monat, AI Hosting für 5-20 NGOs/KMUs, Hardware-Diagnostik-Automatisierung' },
            { label: 'Zielgruppe', value: 'NGOs, KMUs, Entwickler, AI-Interessierte, Studierende' },
          ]} />
        </Card>
      </div>
    </section>
  );
}
