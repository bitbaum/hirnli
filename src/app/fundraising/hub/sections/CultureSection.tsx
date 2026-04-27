import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function CultureSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-grey-dark">🎨 Kultur, Kunst & Gemeinschaft</h2>
      <p className="text-sm text-text-light mb-6">
        <strong>Warum Kultur?</strong> Weil Menschen nicht zu einer &bdquo;Werkstatt&ldquo; kommen — aber zu einem Konzert, einer Ausstellung, einem Filmabend.
        Kultur ist der Einstiegspunkt. Und dann sehen sie: Alte Synths machen Musik. Computer sind Geschichte. Reparatur ist Kultur, nicht Pflicht.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-danger">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl" aria-hidden="true">🏛️</div>
              <div>
                <h3 className="text-lg font-semibold text-grey-dark">Computer History Museum</h3>
                <p className="text-sm text-danger font-medium">60 m² — Technik-Geschichte zum Anfassen</p>
              </div>
            </div>
            <Badge color="pink">CHF 50&apos;000</Badge>
          </div>
          <p className="text-sm text-text-light mb-4">
            Von Commodore 64 bis zur ersten Cray: Computergeschichte als lebendiges Archiv.
            Zeigt, dass alte Hardware wertvoll ist — nicht Müll.
          </p>
          <div className="text-sm mb-3">
            <p className="font-semibold text-grey-dark mb-2">Ausstellungsflächen & Inhalte:</p>
            <ul className="space-y-1 text-text-light text-sm">
              <li>• <strong>40 m² Permanent-Ausstellung</strong> (Commodore, Amiga, NeXT, Cray)</li>
              <li>• <strong>20 m² Wechselausstellungen</strong> (E-Waste-Kunst, Tech-Fotografie)</li>
              <li>• Führungen für Schulklassen (CHF 200/Klasse, 2×/Monat)</li>
              <li>• Depot für historische Hardware (Schenkungen)</li>
              <li>• Tech-Nostalgie-Events: &bdquo;Deine erste Konsole?&ldquo; (4×/Jahr)</li>
            </ul>
          </div>
          <div className="text-sm text-text-light pt-3 border-t border-border">
            <strong>Kapazität:</strong> 30-40 Besucher gleichzeitig<br />
            <strong>Zielgruppe:</strong> Schulklassen, Tech-Nostalgiker, Kulturinteressierte
          </div>
        </Card>

        <Card className="border-l-4 border-l-chart-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl" aria-hidden="true">🎹</div>
              <div>
                <h3 className="text-lg font-semibold text-grey-dark">Elektronische Musik & Synth-Labor</h3>
                <p className="text-sm text-chart-5 font-medium">50 m² — Alte Elektronik wird Musik</p>
              </div>
            </div>
            <Badge color="purple">CHF 40&apos;000</Badge>
          </div>
          <p className="text-sm text-text-light mb-4">
            Vintage-Synths restaurieren, Circuit-Bending lernen, Live-Konzerte veranstalten.
            Musik als Zugang zu Technologie.
          </p>
          <div className="text-sm mb-3">
            <p className="font-semibold text-grey-dark mb-2">Arbeitsplätze & Ausstattung:</p>
            <ul className="space-y-1 text-text-light text-sm">
              <li>• <strong>6× Synth-Restaurierungs-Arbeitsplätze</strong> (Lötkolben, Oszilloskop)</li>
              <li>• <strong>10-15× Vintage-Synths</strong> (Roland, Korg, Moog aus 70er/80er)</li>
              <li>• <strong>Modular-Synthese-Setup</strong> für Workshops</li>
              <li>• <strong>20m² Performance-Bereich</strong> für Konzerte (20-30 Besucher)</li>
              <li>• Circuit-Bending-Workshops (Spielzeug-Elektronik zu Instrumenten)</li>
            </ul>
          </div>
          <div className="text-sm text-text-light pt-3 border-t border-border">
            <strong>Kapazität:</strong> 20-30 Konzertbesucher, 10 Workshop-Teilnehmer<br />
            <strong>Zielgruppe:</strong> Musiker, Elektronik-Fans, Experimentelle Szene
          </div>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl" aria-hidden="true">🎨</div>
              <div>
                <h3 className="text-lg font-semibold text-grey-dark">E-Waste-Art Studio</h3>
                <p className="text-sm text-warning font-medium">40 m² — Elektroschrott wird Kunst</p>
              </div>
            </div>
            <Badge color="orange">CHF 30&apos;000</Badge>
          </div>
          <p className="text-sm text-text-light mb-4">
            Künstler:innen schaffen aus Platinen, Gehäusen, Komponenten Skulpturen & Installationen.
            Zeigt: Schrott = Ressource.
          </p>
          <div className="text-sm mb-3">
            <p className="font-semibold text-grey-dark mb-2">Arbeitsplätze & Programm:</p>
            <ul className="space-y-1 text-text-light text-sm">
              <li>• <strong>3× Resident Artists-Atelierplätze</strong> (je 10-12m², 3-6 Monate)</li>
              <li>• Werkzeuge für E-Waste-Verarbeitung (Sägen, Kleber, Löten)</li>
              <li>• Wechselausstellungen im Hub (4×/Jahr)</li>
              <li>• E-Waste-Art-Workshops für Schulen (2×/Monat)</li>
              <li>• Verkauf: 50% Künstler, 50% Hub (Revenue-Modell)</li>
            </ul>
          </div>
          <div className="text-sm text-text-light pt-3 border-t border-border">
            <strong>Kapazität:</strong> 3 Resident Artists, 20 Workshop-Teilnehmer<br />
            <strong>Zielgruppe:</strong> Künstler, Schulen, Kunstinteressierte
          </div>
        </Card>

        <Card className="border-l-4 border-l-teal-500">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl" aria-hidden="true">🎤</div>
              <div>
                <h3 className="text-lg font-semibold text-grey-dark">Event- & Multifunktionsraum</h3>
                <p className="text-sm text-teal-700 font-medium">100 m² — Tags Workshops, abends Events</p>
              </div>
            </div>
            <Badge color="teal">CHF 60&apos;000</Badge>
          </div>
          <p className="text-sm text-text-light mb-4">
            Flexibler Raum für 50-80 Personen. Tags: Workshops, Co-Working. Abends: Konzerte, Film, Talks.
          </p>
          <div className="text-sm mb-3">
            <p className="font-semibold text-grey-dark mb-2">Ausstattung & Nutzung:</p>
            <ul className="space-y-1 text-text-light text-sm">
              <li>• <strong>Bestuhlung für 50-80 Personen</strong> (flexibel)</li>
              <li>• Beamer, Sound-System, Bühne (kleinere Konzerte)</li>
              <li>• Film Nights (1×/Monat, Dokumentarfilme zu Tech & Gesellschaft)</li>
              <li>• Tech-Talks & Panels (Nachhaltigkeit, KI, Open Source)</li>
              <li>• Repair-Partys: Social + Reparatur + Musik (2×/Monat)</li>
              <li>• Corporate Events & Team-Buildings (Revenue)</li>
            </ul>
          </div>
          <div className="text-sm text-text-light pt-3 border-t border-border">
            <strong>Kapazität:</strong> 50-80 Personen (Events), 20 Personen (Workshops)<br />
            <strong>Zielgruppe:</strong> Tech-Community, Nachbarschaft, Unternehmen
          </div>
        </Card>

        <Card className="border-l-4 border-l-success">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl" aria-hidden="true">☕</div>
              <div>
                <h3 className="text-lg font-semibold text-grey-dark">Zero-Waste Community Kitchen</h3>
                <p className="text-sm text-success font-medium">50 m² — Gemeinsam essen, gemeinsam lernen</p>
              </div>
            </div>
            <Badge color="green">CHF 40&apos;000</Badge>
          </div>
          <p className="text-sm text-text-light mb-4">
            Fair-Trade-Café tags, Community-Kitchen abends. Niederschwelliger Treffpunkt — keine Konsumpflicht.
          </p>
          <div className="text-sm mb-3">
            <p className="font-semibold text-grey-dark mb-2">Ausstattung & Angebot:</p>
            <ul className="space-y-1 text-text-light text-sm">
              <li>• <strong>15-20 Sitzplätze</strong> (Café-Bereich)</li>
              <li>• <strong>30 Plätze beim Community-Dinner</strong> (1×/Woche)</li>
              <li>• Fair-Trade-Kaffee & Snacks (kostendeckend, keine Gewinnmarge)</li>
              <li>• Zero-Waste-Prinzip: Kompostierung, Mehrweg, lokal</li>
              <li>• Tech-Support-Sprechstunde (Di + Do 14-17 Uhr, kostenlos)</li>
            </ul>
          </div>
          <div className="text-sm text-text-light pt-3 border-t border-border">
            <strong>Kapazität:</strong> 15-20 Sitzplätze (Café), 30 (Community-Dinner)<br />
            <strong>Zielgruppe:</strong> Alle — niederschwelliger Zugang
          </div>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl" aria-hidden="true">🔧</div>
              <div>
                <h3 className="text-lg font-semibold text-grey-dark">Repair Café</h3>
                <p className="text-sm text-warning font-medium">30 m² — Community-Reparatur, 2×/Monat</p>
              </div>
            </div>
            <Badge color="yellow">CHF 20&apos;000</Badge>
          </div>
          <p className="text-sm text-text-light mb-4">
            Öffentliche Reparatur-Events: Bring dein kaputtes Gerät, wir helfen dir es zu reparieren.
            Lernen durch Tun.
          </p>
          <div className="text-sm mb-3">
            <p className="font-semibold text-grey-dark mb-2">Arbeitsplätze & Format:</p>
            <ul className="space-y-1 text-text-light text-sm">
              <li>• <strong>6× Reparatur-Arbeitsplätze</strong> (Werkzeuge & Material vor Ort)</li>
              <li>• Jeden 1. & 3. Samstag im Monat (10-16 Uhr)</li>
              <li>• Freiwillige Techniker helfen bei Reparatur</li>
              <li>• Spende nach eigenem Ermessen (kostenlos für KulturLegi)</li>
              <li>• Lernen durch Tun: Du reparierst, wir unterstützen</li>
            </ul>
          </div>
          <div className="text-sm text-text-light pt-3 border-t border-border">
            <strong>Kapazität:</strong> 30-40 Besucher/Event, 60-80 Menschen/Monat<br />
            <strong>Zielgruppe:</strong> Jede:r mit kaputtem Gerät
          </div>
        </Card>
      </div>
    </section>
  );
}
