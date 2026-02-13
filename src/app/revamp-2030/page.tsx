import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';

export const metadata: Metadata = {
  title: 'Revamp 2030 — Zukunftsvision',
  description: 'Von unorganisiertem 3-Personen-Team zu strukturiertem Impact-Hub: Organisation + Raum + Kultur',
};

export default function Revamp2030Page() {
  return (
    <>
      <PageHeader
        title="Revamp 2030"
        subtitle="Das eigentliche Problem ist nicht Raum — es ist Organisation, Struktur und fehlende professionelle Leitung"
        badge="Vision"
      />

      <WhyThisMatters
        purpose="Revamp 2030 zeigt die ehrliche Diagnose unserer Engpässe und wie wir sie durch zwei strategische Investitionen lösen: Hub (Infrastruktur) + Bildungsprogrammleiter:innen (Organisation & Multiplikation)."
        connection="Diese Seite erklärt das WARUM hinter der Strategie. Details zu Budget und Umsetzung: Fundraising → Hub und Fundraising → Bildung."
      />

      {/* Vision 2030 */}
      <section className="mb-8">
        <div className="gradient-hero-vision rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Vision 2030</h2>
          <p className="text-xl mb-6 leading-relaxed">
            <strong>Jedes IT-Gerät schöpft sein volles Potenzial aus. Niemand wird aufgrund mangelnder Technologie ausgeschlossen.</strong>
          </p>
          <p className="text-lg mb-6 leading-relaxed opacity-90">
            Bis 2030 wollen wir von heute <strong>~30 Geräte/Monat</strong> auf <strong>180+ Geräte/Monat</strong> skalieren
            und gleichzeitig von geschätzt <strong>~5 Menschen/Jahr</strong> auf <strong>160+ Menschen/Jahr</strong> wachsen.
          </p>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur mb-4">
            <p className="text-sm opacity-90">
              <strong>Transparenz-Hinweis:</strong> Die aktuellen Zahlen (30 Geräte/Monat, 5 Menschen/Jahr) sind Schätzungen.
              Wir erfassen diese Metriken nicht systematisch, weil uns die Kapazität fehlt. Teil unserer Data-Strategie
              (in Entwicklung) ist die strukturierte Erfassung dieser KPIs ab 2026.
            </p>
          </div>
        </div>
      </section>

      {/* Das eigentliche Problem */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Das eigentliche Problem: Nicht Raum, sondern Organisation</h2>
        <Card className="border-l-4 border-l-red-500 bg-red-50/50">
          <div className="flex items-start gap-4">
            <span className="text-4xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-3">Warum wir langsam sind (ehrliche Diagnose)</h3>
              <div className="space-y-4 text-sm text-red-800">
                <div>
                  <p className="font-semibold mb-2">Hardware-Refurbishment: Unstrukturiert & ineffizient</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>4 Reparaturtische vorhanden</strong> — aber meist nur 1-2 in Nutzung</li>
                    <li><strong>1 Intern (Reza)</strong> kommt zuverlässig, <strong>2 Freiwillige (Romeo, Sili)</strong> kommen manchmal</li>
                    <li>Wenn Freiwillige nicht da sind: <strong>Tische bleiben leer</strong>, Geräte-Backlog wächst</li>
                    <li>Viel Raum für <strong>Lagerung</strong> genutzt (nicht optimal organisiert)</li>
                    <li><strong>Niemand leitet Training</strong> oder organisiert Reparaturen systematisch</li>
                    <li>Menschen kommen, "wenn sie sich danach fühlen" — <strong>keine Struktur, kein Zeitplan</strong></li>
                    <li>Reparatur-Leute machen auch Kundenservice, Telefon, etc. (aus Notwendigkeit, nicht by Design)</li>
                    <li><strong>Resultat: Lange Wartezeiten, langsamer Output</strong></li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">Software/AI: Besser, aber auch Kapazitätsgrenzen</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Andreas macht Web-Entwicklung mit Sili und Cem (die auch mit Kivitendo beschäftigt sind)</li>
                    <li>Dani entwickelt Effizienz-Systeme (automatische Erfassung)</li>
                    <li>George baut Website + Fundraising-Plattform</li>
                    <li><strong>Aber:</strong> Keine Zeit für Workshops, AI-Bildung, Coding-Kurse, Open-Source-Education</li>
                    <li><strong>Keine Organisation, keine Ressourcen, keine Struktur für systematische Bildung</strong></li>
                  </ul>
                </div>

                <div className="bg-red-100 border-l-4 border-red-600 p-3 my-3">
                  <p className="font-bold text-red-900 mb-1">Das Problem in einem Satz:</p>
                  <p className="text-red-800">
                    Wir haben <strong>ungenutzte Kapazität</strong> (leere Tische, unstrukturierte Arbeit),
                    aber <strong>niemanden, der professionell organisiert, trainiert und Programme leitet</strong>.
                    Mehr Raum allein löst das nicht — wir brauchen <strong>bezahlte Fachleute für Organisation & Ausbildung</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Die Lösung: Hub + Menschen */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Die Lösung: Hub (Infrastruktur) + Menschen (Organisation)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🏢</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-grey-dark mb-2">1. Revamp Hub — Infrastruktur & Raum</h3>
                <p className="text-sm text-text-light mb-3">
                  <strong>Was wir heute haben:</strong> Laden + Lager (genaue Quadratmeter werden im Rahmen unserer Data-Strategie dokumentiert).
                  Verteilt auf 2 Standorte, suboptimal organisiert.
                </p>
                <p className="text-sm text-text-light mb-3">
                  <strong>Was wir brauchen:</strong> ~1000 m² zentraler Hub mit:
                </p>
                <ul className="text-sm text-text-light space-y-1 list-disc list-inside mb-4">
                  <li>Professionelle Werkstatt (mehr Tische, Testinfrastruktur, bessere Organisation)</li>
                  <li>Schulungsräume für strukturierte Trainings</li>
                  <li>Event-/Kulturraum (Kunst, Musik, Community)</li>
                  <li>Makerspace & AI Lab</li>
                  <li>Besser organisiertes Lager</li>
                </ul>
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-blue-800">
                    <strong>Warum das hilft:</strong> Mehr Raum bedeutet mehr parallele Arbeitsstationen, bessere Trennung
                    (Verkauf/Werkstatt/Schulung), weniger Chaos. <strong>Aber:</strong> Raum allein reicht nicht — siehe Punkt 2.
                  </p>
                </div>
                <Link
                  href="/fundraising/hub"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                >
                  📊 Hub-Details & Budget →
                </Link>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-violet-500">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🎓</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-grey-dark mb-2">2. Bildungsprogrammleiter:innen — Organisation & Multiplikation</h3>
                <p className="text-sm text-text-light mb-3">
                  <strong>Das ist der eigentliche Game-Changer:</strong> Zwei <strong>bezahlte Fachleute</strong>, die
                  professionell organisieren, trainieren und Programme leiten.
                </p>
                <div className="space-y-3 mb-4">
                  <div className="bg-violet-50 rounded-lg p-3">
                    <p className="text-sm font-semibold text-violet-900 mb-1">Hardware-Bildungsprogrammleiter:in</p>
                    <ul className="text-xs text-violet-800 space-y-1 list-disc list-inside">
                      <li>Organisiert Reparatur-Tische: Zeitpläne, Qualitätssicherung, Prozesse</li>
                      <li>Bildet Techniker aus (nicht nur reparieren, sondern auch trainieren lernen)</li>
                      <li>Strukturierte Programme statt "komm, wenn du willst"</li>
                      <li>Train-the-Trainer: Trainierte geben ihr Wissen an andere weiter</li>
                    </ul>
                  </div>
                  <div className="bg-violet-50 rounded-lg p-3">
                    <p className="text-sm font-semibold text-violet-900 mb-1">Software/AI-Bildungsprogrammleiter:in</p>
                    <ul className="text-xs text-violet-800 space-y-1 list-disc list-inside">
                      <li>Organisiert Workshops: AI Literacy, Coding, Open Source</li>
                      <li>Bildet Entwickler aus, die dann selbst trainieren</li>
                      <li>Strukturierte Curricula für verschiedene Niveaus</li>
                      <li>Entlastet Kernteam (Andreas, Dani, George) von Bildungsarbeit</li>
                    </ul>
                  </div>
                </div>
                <Link
                  href="/fundraising/bildung"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900 transition-colors"
                >
                  📊 Bildung-Details & Reach-Strategie →
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Wie wir mehr Menschen erreichen */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Wie wir von 5 auf 160+ Menschen/Jahr skalieren</h2>
        <Card>
          <p className="text-sm text-text-light mb-6">
            Der Schlüssel: <strong>Organisation + Train-the-Trainer + Online-Content</strong>. Nicht einfach mehr Mitarbeitende einstellen.
          </p>
          <div className="space-y-6">
            {/* Heute */}
            <div>
              <h3 className="text-md font-semibold text-grey-dark mb-3 flex items-center gap-2">
                <Badge variant="warning">Heute</Badge>
                Unstrukturiert, ineffizient
              </h3>
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-2">Hardware:</p>
                    <ul className="text-xs text-amber-800 space-y-1">
                      <li>• 4 Tische vorhanden, aber nur 1-2 genutzt (Reza + manchmal Freiwillige)</li>
                      <li>• Keine strukturierten Trainings, kein Zeitplan</li>
                      <li>• Lange Wartezeiten, Backlog wächst</li>
                      <li>• <strong>~30 Geräte/Monat</strong> (Schätzung)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-2">Software/AI:</p>
                    <ul className="text-xs text-amber-800 space-y-1">
                      <li>• Kernteam zu beschäftigt für systematische Bildung</li>
                      <li>• Keine Workshops, keine strukturierten Kurse</li>
                      <li>• Gelegentliche Unterstützung, aber nicht systematisch</li>
                      <li>• <strong>~5 Menschen/Jahr</strong> erreicht (Schätzung)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Mit Hub + BPL */}
            <div>
              <h3 className="text-md font-semibold text-grey-dark mb-3 flex items-center gap-2">
                <Badge variant="success">Mit Hub + Bildungsprogrammleiter:innen</Badge>
                Strukturiert, organisiert, skalierbar
              </h3>
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-900 mb-2">Hardware (organisiert):</p>
                    <ul className="text-xs text-emerald-800 space-y-1">
                      <li>• <strong>Hardware-BPL organisiert:</strong> Zeitpläne, Qualität, Prozesse</li>
                      <li>• Alle Tische genutzt (strukturierte Schichten, klare Verantwortlichkeiten)</li>
                      <li>• <strong>10 Techniker/Jahr</strong> ausgebildet (Train-the-Trainer)</li>
                      <li>• <strong>5 ausgebildete Techniker</strong> trainieren parallel → je 10 Menschen = 50 indirekt</li>
                      <li>• <strong>6× Geräte-Kapazität: ~180 Geräte/Monat</strong> (effizientere Nutzung + mehr Raum)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-900 mb-2">Software/AI (strukturiert):</p>
                    <ul className="text-xs text-emerald-800 space-y-1">
                      <li>• <strong>Software/AI-BPL organisiert:</strong> Curricula, Workshops, Events</li>
                      <li>• <strong>8 Entwickler/Jahr</strong> ausgebildet (Train-the-Trainer)</li>
                      <li>• <strong>3 AI-Literacy-Trainer</strong> ausgebildet → je ~13 Menschen = 40 indirekt</li>
                      <li>• Plus Workshops, Events, Repair Cafés: 50-80 zusätzlich</li>
                      <li>• <strong>32× Social Impact: ~160 Menschen/Jahr</strong> total erreicht</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-emerald-300">
                  <p className="text-sm font-bold text-emerald-900 mb-2">Warum das funktioniert:</p>
                  <p className="text-xs text-emerald-800">
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
              <h3 className="text-md font-semibold text-grey-dark mb-3 flex items-center gap-2">
                <Badge variant="info">Bonus: Online Content</Badge>
                Noch mehr Reichweite ohne zusätzliche Personalkosten
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-3">
                  <strong>Hub + Bildungsprogrammleiter:innen ermöglichen auch Online-Content-Produktion:</strong>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-2">Hub bietet Infrastruktur:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Professioneller Schulungsraum = Video-Studio</li>
                      <li>• Werkstatt = Praxis-Aufnahmen für Tutorials</li>
                      <li>• Event-Raum = Live-Streaming von Workshops</li>
                      <li>• AI Lab = Content-Entwicklung & -Bearbeitung</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-2">BPL produzieren Content:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Video-Tutorials (Laptop-Reparatur Schritt-für-Schritt)</li>
                      <li>• Online-Kurse (AI Literacy, Linux-Grundlagen)</li>
                      <li>• Dokumentation & Guides (Open-Source-Wissen)</li>
                      <li>• Webinare & Live-Sessions (Fragen & Antworten)</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-bold text-blue-900 mb-2">Zusätzliche Reichweite:</p>
                  <p className="text-xs text-blue-800 mb-2">
                    Ein gut produziertes Tutorial-Video kann <strong>100-1000+ Menschen erreichen</strong> — ohne zusätzlichen Zeitaufwand.
                    Online-Kurse skalieren unbegrenzt: 1× produzieren, 100× nutzen.
                  </p>
                  <p className="text-xs text-blue-800">
                    <strong>Beispiel:</strong> "Wie repariere ich meinen Laptop?" Video → 500 Views/Jahr = 500 Menschen erreicht,
                    für 0 zusätzliche Kosten nach Produktion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Kunst, Kultur & Verhaltensänderung */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Kunst, Kultur & Musik: Elektroschrott neu denken</h2>
        <Card className="border-l-4 border-l-pink-500">
          <p className="text-sm text-text-light mb-4">
            Revamp 2030 ist nicht nur Technik — <strong>Kunst und Kultur sind zentral</strong>, um
            unsere Beziehung zu Elektronik zu verändern und weggeworfene Geräte neu zu bewerten.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-pink-50 rounded-lg p-4">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="text-sm font-semibold text-pink-900 mb-2">E-Waste-Kunst</h3>
              <p className="text-xs text-pink-800 mb-2">
                Künstler:innen schaffen aus Platinen, Gehäusen und Komponenten Skulpturen und Installationen.
              </p>
              <ul className="text-xs text-pink-800 space-y-1 list-disc list-inside">
                <li>Resident Artists (3-6 Monate Atelierplatz)</li>
                <li>Workshops für Schulen</li>
                <li>Ausstellungen im Hub</li>
              </ul>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <div className="text-2xl mb-2">🎹</div>
              <h3 className="text-sm font-semibold text-pink-900 mb-2">Elektronische Musik</h3>
              <p className="text-xs text-pink-800 mb-2">
                Vintage-Synths restaurieren, Circuit-Bending, Modular-Synthese — alte Elektronik wird Musik.
              </p>
              <ul className="text-xs text-pink-800 space-y-1 list-disc list-inside">
                <li>Synth-Restaurierung (Roland, Korg, Moog)</li>
                <li>Circuit-Bending-Workshops</li>
                <li>Live-Konzerte & DJ-Sets im Event-Raum</li>
              </ul>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <div className="text-2xl mb-2">🏛️</div>
              <h3 className="text-sm font-semibold text-pink-900 mb-2">Museum & Geschichte</h3>
              <p className="text-xs text-pink-800 mb-2">
                Computergeschichte zum Anfassen: Von Commodore 64 bis zur ersten Cray.
              </p>
              <ul className="text-xs text-pink-800 space-y-1 list-disc list-inside">
                <li>Permanent-Ausstellung (Commodore, Amiga, NeXT)</li>
                <li>Wechselausstellungen: E-Waste-Kunst, Tech-Fotografie</li>
                <li>Führungen für Schulklassen</li>
              </ul>
            </div>
          </div>
          <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg p-4">
            <p className="text-sm font-bold text-purple-900 mb-2">Warum Kunst & Kultur zentral sind:</p>
            <p className="text-xs text-purple-800 mb-3">
              Technik allein ändert kein Verhalten. <strong>Kunst macht Elektroschrott sichtbar, berührbar, wertvoll</strong>.
              Konzerte, Ausstellungen und Workshops erreichen Menschen, die nie zu einem Repair-Workshop kämen.
              Sie beeinflussen Kultur und Wahrnehmung: "Elektroschrott ist nicht Müll — es ist Ressource, Geschichte, Potenzial."
            </p>
            <p className="text-xs text-purple-800">
              <strong>Das ist Impact auf einer anderen Ebene:</strong> Nicht nur Geräte retten, sondern
              <strong> wie Menschen über Technologie denken verändern</strong>.
            </p>
          </div>
        </Card>
      </section>

      {/* Zeitplan */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Zeitplan: 3 Jahre bis 2030-Niveau</h2>
        <Card>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Badge variant="info" className="mt-1">2026</Badge>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-grey-dark mb-2">Phase 1: Fundraising & Standortsuche</h3>
                <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
                  <li>Standortsuche: ~1000 m² in Zürich oder Agglomeration</li>
                  <li>Fundraising: CHF 500k-1M für Hub, CHF 525k für Bildung (3 Jahre)</li>
                  <li>Planung: Raumkonzept, Prozesse, Betriebsmodell</li>
                  <li><strong>Data-Strategie:</strong> Systematische KPI-Erfassung etablieren (Geräte/Monat, Menschen/Jahr, Wartezeiten)</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge variant="info" className="mt-1">2027</Badge>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-grey-dark mb-2">Phase 2: Hub-Aufbau + erste:r BPL</h3>
                <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
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
                <h3 className="text-md font-semibold text-grey-dark mb-2">Phase 3: Volle Kapazität & Selbsttragung</h3>
                <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
                  <li>Zweite:r Bildungsprogrammleiter:in eingestellt</li>
                  <li>Hub-Betrieb optimiert, alle Bereiche aktiv (Werkstatt, AI Lab, Event-Raum, Museum)</li>
                  <li>Train-the-Trainer voll etabliert: Multiplikatoren arbeiten eigenständig</li>
                  <li>Kultur-Programm läuft: Konzerte, Ausstellungen, Workshops beeinflussen öffentliche Wahrnehmung</li>
                  <li>Ziele erreicht: 180+ Geräte/Monat, 160+ Menschen/Jahr, Selbsttragung operativ</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Warum jetzt? */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Warum jetzt?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-amber-500">
            <h3 className="text-md font-semibold text-grey-dark mb-2">📉 Revenue-Rückgang</h3>
            <p className="text-sm text-text-light">
              Von CHF 140k (2021) auf CHF 60k (2025) — unser altes Geschäftsmodell funktioniert nicht mehr.
              Wir müssen uns neu erfinden oder verschwinden.
            </p>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <h3 className="text-md font-semibold text-grey-dark mb-2">📈 Nachfrage steigt</h3>
            <p className="text-sm text-text-light">
              AOZ, Caritas, Schulen fragen regelmässig nach Laptops. Wartelisten wachsen.
              Der Bedarf ist da — wir können ihn nur nicht decken (fehlende Struktur, nicht Raum).
            </p>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <h3 className="text-md font-semibold text-grey-dark mb-2">💪 Wir sind bereit</h3>
            <p className="text-sm text-text-light">
              22 Jahre Erfahrung (seit 2003). Wir wissen, was fehlt: <strong>Organisation, Struktur, bezahlte Fachleute</strong>.
              Nicht mehr, nicht weniger.
            </p>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Hilf uns, Revamp 2030 zu verwirklichen</h3>
          <p className="text-lg mb-6 leading-relaxed max-w-3xl mx-auto">
            Es geht nicht nur um Geräte oder Workshops — es geht darum, <strong>wie Menschen über Technologie denken</strong>.
            Durch Organisation, Bildung, Kunst und Kultur schaffen wir eine Plattform für <strong>digitale Teilhabe und nachhaltige Innovation</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fundraising"
              className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              📊 Fundraising-Übersicht
            </Link>
            <Link
              href="/fundraising/stiftungen"
              className="px-8 py-4 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors duration-200 border-2 border-white"
            >
              🏛️ Passende Stiftungen finden
            </Link>
          </div>
        </div>
      </section>

      <StoryBridge bridges={STORY_BRIDGES['revamp-2030'] || STORY_BRIDGES['strategie-2030'] || []} />
    </>
  );
}
