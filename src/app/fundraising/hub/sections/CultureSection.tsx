import Card from '@/components/ui/Card';
import HubCardHeader from './HubCardHeader';
import HubCardFooter from './HubCardFooter';
import { CULTURE_ASPIRATIONAL_COSTS } from '@/lib/config/hub-space-plan';
import { formatCHF } from '@/lib/utils/format';

export default function CultureSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">🎨 Kultur, Kunst & Gemeinschaft</h2>
      <p className="text-sm text-text-light mb-6">
        <strong>Warum Kultur?</strong> Weil Menschen nicht zu einer &bdquo;Werkstatt&ldquo; kommen — aber zu einem Konzert, einer Ausstellung, einem Filmabend.
        Kultur ist der Einstiegspunkt. Und dann sehen sie: Alte Synths machen Musik. Computer sind Geschichte. Reparatur ist Kultur, nicht Pflicht.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-danger">
          <HubCardHeader icon="🏛️" title="Computer History Museum" subtitle="60 m² — Technik-Geschichte zum Anfassen" subtitleClassName="text-danger" badgeColor="pink" badgeText={formatCHF(CULTURE_ASPIRATIONAL_COSTS.computer_museum)} />
          <p className="text-sm text-text-light mb-4">
            Von Commodore 64 bis zur ersten Cray: Computergeschichte als lebendiges Archiv.
            Zeigt, dass alte Hardware wertvoll ist — nicht Müll.
          </p>
          <div className="text-sm mb-3">
            <h4 className="heading-detail mb-2">Ausstellungsflächen & Inhalte</h4>
            <ul className="space-y-1 text-text-light text-sm">
              <li>• <strong>40 m² Permanent-Ausstellung</strong> (Commodore, Amiga, NeXT, Cray)</li>
              <li>• <strong>20 m² Wechselausstellungen</strong> (E-Waste-Kunst, Tech-Fotografie)</li>
              <li>• Führungen für Schulklassen (CHF 200/Klasse, 2×/Monat)</li>
              <li>• Depot für historische Hardware (Schenkungen)</li>
              <li>• Tech-Nostalgie-Events: &bdquo;Deine erste Konsole?&ldquo; (4×/Jahr)</li>
            </ul>
          </div>
          <HubCardFooter items={[
            { label: 'Kapazität', value: '30-40 Besucher gleichzeitig' },
            { label: 'Zielgruppe', value: 'Schulklassen, Tech-Nostalgiker, Kulturinteressierte' },
          ]} />
        </Card>

        <Card className="border-l-4 border-l-chart-5">
          <HubCardHeader icon="🎹" title="Elektronische Musik & Synth-Labor" subtitle="50 m² — Alte Elektronik wird Musik" subtitleClassName="text-chart-5" badgeColor="purple" badgeText={formatCHF(CULTURE_ASPIRATIONAL_COSTS.synth_lab)} />
          <p className="text-sm text-text-light mb-4">
            Vintage-Synths restaurieren, Circuit-Bending lernen, Live-Konzerte veranstalten.
            Musik als Zugang zu Technologie.
          </p>
          <div className="text-sm mb-3">
            <h4 className="heading-detail mb-2">Arbeitsplätze & Ausstattung</h4>
            <ul className="space-y-1 text-text-light text-sm">
              <li>• <strong>6× Synth-Restaurierungs-Arbeitsplätze</strong> (Lötkolben, Oszilloskop)</li>
              <li>• <strong>10-15× Vintage-Synths</strong> (Roland, Korg, Moog aus 70er/80er)</li>
              <li>• <strong>Modular-Synthese-Setup</strong> für Workshops</li>
              <li>• <strong>20m² Performance-Bereich</strong> für Konzerte (20-30 Besucher)</li>
              <li>• Circuit-Bending-Workshops (Spielzeug-Elektronik zu Instrumenten)</li>
            </ul>
          </div>
          <HubCardFooter items={[
            { label: 'Kapazität', value: '20-30 Konzertbesucher, 10 Workshop-Teilnehmer' },
            { label: 'Zielgruppe', value: 'Musiker, Elektronik-Fans, Experimentelle Szene' },
          ]} />
        </Card>

        <Card className="border-l-4 border-l-warning">
          <HubCardHeader icon="🎨" title="E-Waste-Art Studio" subtitle="40 m² — Elektroschrott wird Kunst" subtitleClassName="text-warning" badgeColor="orange" badgeText={formatCHF(CULTURE_ASPIRATIONAL_COSTS.ewaste_art_studio)} />
          <p className="text-sm text-text-light mb-4">
            Künstler:innen schaffen aus Platinen, Gehäusen, Komponenten Skulpturen & Installationen.
            Zeigt: Schrott = Ressource.
          </p>
          <div className="text-sm mb-3">
            <h4 className="heading-detail mb-2">Arbeitsplätze & Programm</h4>
            <ul className="space-y-1 text-text-light text-sm">
              <li>• <strong>3× Resident Artists-Atelierplätze</strong> (je 10-12m², 3-6 Monate)</li>
              <li>• Werkzeuge für E-Waste-Verarbeitung (Sägen, Kleber, Löten)</li>
              <li>• Wechselausstellungen im Hub (4×/Jahr)</li>
              <li>• E-Waste-Art-Workshops für Schulen (2×/Monat)</li>
              <li>• Verkauf: 50% Künstler, 50% Hub (Revenue-Modell)</li>
            </ul>
          </div>
          <HubCardFooter items={[
            { label: 'Kapazität', value: '3 Resident Artists, 20 Workshop-Teilnehmer' },
            { label: 'Zielgruppe', value: 'Künstler, Schulen, Kunstinteressierte' },
          ]} />
        </Card>

        <Card className="border-l-4 border-l-pillar-social">
          <HubCardHeader icon="🎤" title="Event- & Multifunktionsraum" subtitle="100 m² — Tags Workshops, abends Events" subtitleClassName="text-theme-arbeit" badgeColor="teal" badgeText={formatCHF(CULTURE_ASPIRATIONAL_COSTS.event_multifunction)} />
          <p className="text-sm text-text-light mb-4">
            Flexibler Raum für 50-80 Personen. Tags: Workshops, Co-Working. Abends: Konzerte, Film, Talks.
          </p>
          <div className="text-sm mb-3">
            <h4 className="heading-detail mb-2">Ausstattung & Nutzung</h4>
            <ul className="space-y-1 text-text-light text-sm">
              <li>• <strong>Bestuhlung für 50-80 Personen</strong> (flexibel)</li>
              <li>• Beamer, Sound-System, Bühne (kleinere Konzerte)</li>
              <li>• Film Nights (1×/Monat, Dokumentarfilme zu Tech & Gesellschaft)</li>
              <li>• Tech-Talks & Panels (Nachhaltigkeit, KI, Open Source)</li>
              <li>• Repair-Partys: Social + Reparatur + Musik (2×/Monat)</li>
              <li>• Corporate Events & Team-Buildings (Revenue)</li>
            </ul>
          </div>
          <HubCardFooter items={[
            { label: 'Kapazität', value: '50-80 Personen (Events), 20 Personen (Workshops)' },
            { label: 'Zielgruppe', value: 'Tech-Community, Nachbarschaft, Unternehmen' },
          ]} />
        </Card>

        <Card className="border-l-4 border-l-success">
          <HubCardHeader icon="☕" title="Zero-Waste Community Kitchen" subtitle="50 m² — Gemeinsam essen, gemeinsam lernen" subtitleClassName="text-success" badgeColor="green" badgeText={formatCHF(CULTURE_ASPIRATIONAL_COSTS.community_kitchen)} />
          <p className="text-sm text-text-light mb-4">
            Fair-Trade-Café tags, Community-Kitchen abends. Niederschwelliger Treffpunkt — keine Konsumpflicht.
          </p>
          <div className="text-sm mb-3">
            <h4 className="heading-detail mb-2">Ausstattung & Angebot</h4>
            <ul className="space-y-1 text-text-light text-sm">
              <li>• <strong>15-20 Sitzplätze</strong> (Café-Bereich)</li>
              <li>• <strong>30 Plätze beim Community-Dinner</strong> (1×/Woche)</li>
              <li>• Fair-Trade-Kaffee & Snacks (kostendeckend, keine Gewinnmarge)</li>
              <li>• Zero-Waste-Prinzip: Kompostierung, Mehrweg, lokal</li>
              <li>• Tech-Support-Sprechstunde (Di + Do 14-17 Uhr, kostenlos)</li>
            </ul>
          </div>
          <HubCardFooter items={[
            { label: 'Kapazität', value: '15-20 Sitzplätze (Café), 30 (Community-Dinner)' },
            { label: 'Zielgruppe', value: 'Alle — niederschwelliger Zugang' },
          ]} />
        </Card>

        <Card className="border-l-4 border-l-warning">
          <HubCardHeader icon="🔧" title="Repair Café" subtitle="30 m² — Community-Reparatur, 2×/Monat" subtitleClassName="text-warning" badgeColor="yellow" badgeText={formatCHF(CULTURE_ASPIRATIONAL_COSTS.repair_cafe)} />
          <p className="text-sm text-text-light mb-4">
            Öffentliche Reparatur-Events: Bring dein kaputtes Gerät, wir helfen dir es zu reparieren.
            Lernen durch Tun.
          </p>
          <div className="text-sm mb-3">
            <h4 className="heading-detail mb-2">Arbeitsplätze & Format</h4>
            <ul className="space-y-1 text-text-light text-sm">
              <li>• <strong>6× Reparatur-Arbeitsplätze</strong> (Werkzeuge & Material vor Ort)</li>
              <li>• Jeden 1. & 3. Samstag im Monat (10-16 Uhr)</li>
              <li>• Freiwillige Techniker helfen bei Reparatur</li>
              <li>• Spende nach eigenem Ermessen (kostenlos für KulturLegi)</li>
              <li>• Lernen durch Tun: Du reparierst, wir unterstützen</li>
            </ul>
          </div>
          <HubCardFooter items={[
            { label: 'Kapazität', value: '30-40 Besucher/Event, 60-80 Menschen/Monat' },
            { label: 'Zielgruppe', value: 'Jede:r mit kaputtem Gerät' },
          ]} />
        </Card>
      </div>
    </section>
  );
}
