import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function InnovationSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-grey-dark">🚀 Innovation, Makerspace & Bildung</h2>
      <p className="text-sm text-text-light mb-6">
        Nächste Stufe: Nicht nur reparieren, sondern <strong>experimentieren, prototypen, lernen</strong>.
        Makerspace, Robotik, Schulungen. Hier entsteht Know-how.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl" aria-hidden="true">🛠️</div>
              <div>
                <h3 className="text-lg font-semibold text-grey-dark">Makerspace & Hackerspace</h3>
                <p className="text-sm text-purple-700 font-medium">80 m² — Prototyping & Tüfteln</p>
              </div>
            </div>
            <Badge color="purple">CHF 70&apos;000</Badge>
          </div>
          <p className="text-sm text-text-light mb-4">
            Offene Werkstatt: 3D-Drucker, Laser-Cutter, Lötarbeitsplätze. Vom Prototyp zum Produkt.
          </p>
          <div className="text-sm mb-3">
            <p className="font-semibold text-grey-dark mb-2">Arbeitsplätze & Ausstattung:</p>
            <ul className="space-y-1 text-text-light text-xs">
              <li>• <strong>12× Werkbänke</strong> (je 6m²) für Elektronik-Projekte</li>
              <li>• <strong>6× Lötarbeitsplätze</strong> mit Absaugung</li>
              <li>• <strong>4× 3D-Drucker</strong> (FDM & Resin)</li>
              <li>• <strong>1× Laser-Cutter</strong> & CNC-Fräse</li>
              <li>• Tool Library: Werkzeugverleih (CHF 20/Tag)</li>
            </ul>
          </div>
          <div className="text-xs text-text-light pt-3 border-t border-border">
            <strong>Kapazität:</strong> 20-30 Menschen gleichzeitig, 100+ Menschen/Monat<br />
            <strong>Zielgruppe:</strong> Maker, Hobbyisten, Startups, Schüler
          </div>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl" aria-hidden="true">🤖</div>
              <div>
                <h3 className="text-lg font-semibold text-grey-dark">Robotik-Labor</h3>
                <p className="text-sm text-indigo-700 font-medium">60 m² — Arduino, Raspberry Pi, autonome Systeme</p>
              </div>
            </div>
            <Badge color="indigo">CHF 50&apos;000</Badge>
          </div>
          <p className="text-sm text-text-light mb-4">
            Robotik-Kits für Schulen, Arduino-Workshops, autonome Roboter bauen. MINT-Bildung hands-on.
          </p>
          <div className="text-sm mb-3">
            <p className="font-semibold text-grey-dark mb-2">Arbeitsplätze & Ausstattung:</p>
            <ul className="space-y-1 text-text-light text-xs">
              <li>• <strong>10× Robotik-Arbeitsplätze</strong> (je 6m²)</li>
              <li>• <strong>30× Arduino/Raspberry Pi Kits</strong> (Leihgabe an Schulen)</li>
              <li>• <strong>8× Roboter-Chassis</strong> für autonome Projekte</li>
              <li>• Sensoren, Motoren, Mikrocontroller (Lager)</li>
              <li>• Testfläche für autonome Navigation (20m²)</li>
            </ul>
          </div>
          <div className="text-xs text-text-light pt-3 border-t border-border">
            <strong>Kapazität:</strong> 20 Kursplätze, 200+ Schüler/Jahr<br />
            <strong>Zielgruppe:</strong> Schulklassen, Jugendliche, MINT-Interessierte
          </div>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl" aria-hidden="true">🎓</div>
              <div>
                <h3 className="text-lg font-semibold text-grey-dark">Schulungs- & Kursräume</h3>
                <p className="text-sm text-blue-700 font-medium">70 m² — Linux, AI, Coding für alle</p>
              </div>
            </div>
            <Badge color="blue">CHF 45&apos;000</Badge>
          </div>
          <p className="text-sm text-text-light mb-4">
            Strukturierte Bildung: Linux-Kurse, AI Literacy, Programmieren lernen. Digital Literacy für alle.
          </p>
          <div className="text-sm mb-3">
            <p className="font-semibold text-grey-dark mb-2">Arbeitsplätze & Ausstattung:</p>
            <ul className="space-y-1 text-text-light text-xs">
              <li>• <strong>20× Kursarbeitsplätze</strong> (Laptops, Monitore)</li>
              <li>• Whiteboard, Beamer, Präsentations-Setup</li>
              <li>• Flexible Tische (Gruppen- oder Einzelarbeit)</li>
              <li>• Netzwerk-Infrastruktur (Gigabit, VPN-Zugang)</li>
            </ul>
          </div>
          <div className="text-xs text-text-light pt-3 border-t border-border">
            <strong>Kapazität:</strong> 20 Kursplätze, 500+ Teilnehmer/Jahr<br />
            <strong>Zielgruppe:</strong> Geflüchtete, Arbeitslose, Quereinsteiger, Unternehmen (Corporate Training)
          </div>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl" aria-hidden="true">🤖</div>
              <div>
                <h3 className="text-lg font-semibold text-grey-dark">AI Lab — Verschiedene Setups möglich</h3>
                <p className="text-sm text-cyan-700 font-medium">20-40 m² — Eigene GPUs, digitale Souveränität</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-text-light mb-4">
            <strong>Vision:</strong> Nicht Cloud-abhängig. Eigene GPU-Infrastruktur für AI-Modelle trainieren, hosten, nutzen.
            GPUs können gekauft oder gespendet werden — <strong>verschiedene Setups möglich</strong>, je nach Budget & Spenden.
          </p>

          <div className="text-sm mb-4">
            <p className="font-semibold text-grey-dark mb-3">Mögliche Setups (aufsteigend):</p>

            <div className="space-y-3">
              <div className="bg-cyan-50 p-3 rounded-lg">
                <p className="font-semibold text-cyan-900 mb-1">Setup A — Starter (CHF 15&apos;000-20&apos;000)</p>
                <ul className="text-xs text-cyan-800 space-y-1">
                  <li>• 2-4× Consumer GPUs (NVIDIA RTX 3090/4090, gebraucht oder gespendet)</li>
                  <li>• 1× Server-Rack mit Basis-Kühlung</li>
                  <li>• <strong>Wirkung:</strong> AI Literacy Workshops (20-30 Teilnehmer/Monat), kleine Modelle fine-tunen</li>
                </ul>
              </div>

              <div className="bg-cyan-100 p-3 rounded-lg">
                <p className="font-semibold text-cyan-900 mb-1">Setup B — Professional (CHF 40&apos;000-60&apos;000)</p>
                <ul className="text-xs text-cyan-800 space-y-1">
                  <li>• 4-6× Professional GPUs (NVIDIA A40, teilweise gespendet von Unternehmen)</li>
                  <li>• 2× Server-Racks mit professioneller Kühlung</li>
                  <li>• <strong>Wirkung:</strong> AI-gestützte Hardware-Diagnostik, AI Hosting für NGOs/KMUs, grössere Modelle trainieren</li>
                </ul>
              </div>

              <div className="bg-cyan-200 p-3 rounded-lg">
                <p className="font-semibold text-cyan-900 mb-1">Setup C — Enterprise (CHF 100&apos;000-150&apos;000)</p>
                <ul className="text-xs text-cyan-800 space-y-1">
                  <li>• 8-12× NVIDIA A100 GPUs (Corporate-Spenden + Teilkauf, je CHF 10-15k)</li>
                  <li>• ODER 4-6× NVIDIA H100 GPUs (falls verfügbar, je CHF 25-35k)</li>
                  <li>• 2-3× Server-Racks mit Klimatisierung & Redundanz</li>
                  <li>• <strong>Wirkung:</strong> Alle oben + Open-Source-Modelle hosten, AI-Forschung für NGO-Sektor, Data Sovereignty für sensible Daten</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-xs text-amber-900 mb-3">
            <strong>Wichtig:</strong> Wir starten nicht mit Setup C. Wir bauen modular auf, basierend auf Spenden + verfügbarem Budget.
            Jedes Setup ist nützlich — auch Setup A ermöglicht AI Literacy Workshops und kleine Modelle.
            <br /><br />
            <strong>Realität:</strong> Enterprise GPUs sind teuer (A100: CHF 10-15k, H100: CHF 25-35k pro Stück).
            Setup C erfordert massive Corporate-Spenden oder schrittweisen Aufbau über mehrere Jahre.
          </div>

          <div className="text-xs text-text-light pt-3 border-t border-border">
            <strong>Potenzielle Wirkung (je nach Setup):</strong> 20-60 Workshop-Teilnehmer/Monat, AI Hosting für 5-20 NGOs/KMUs, Hardware-Diagnostik-Automatisierung<br />
            <strong>Zielgruppe:</strong> NGOs, KMUs, Entwickler, AI-Interessierte, Studierende
          </div>
        </Card>
      </div>
    </section>
  );
}
