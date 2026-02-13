import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';

export const metadata: Metadata = {
  title: 'Strategie 2030 — Zukunftspläne',
  description: 'Unsere Vision für 2030: Hub-Infrastruktur + Train-the-Trainer Bildungsprogramm',
};

export default function Strategie2030Page() {
  return (
    <>
      <PageHeader
        title="Strategie 2030"
        subtitle="Vom 3-Personen-Team zum Impact-Hub — mit Infrastruktur & Bildung"
        badge="Zukunftsvision"
      />

      <WhyThisMatters
        purpose="Strategie 2030 zeigt WOHIN wir gehen und WIE wir dorthin kommen: durch zwei strategische Investitionen (Hub + Bildung)."
        connection="Diese Seite erklärt die Gesamtstrategie. Details zu Budget und Umsetzung findest du unter Fundraising → Hub und Fundraising → Bildung."
      />

      {/* Vision 2030 */}
      <section className="mb-8">
        <div className="gradient-hero-vision rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Vision 2030</h2>
          <p className="text-xl mb-6 leading-relaxed">
            <strong>Jedes IT-Gerät schöpft sein volles Potenzial aus. Niemand wird aufgrund mangelnder Technologie ausgeschlossen.</strong>
          </p>
          <p className="text-lg mb-6 leading-relaxed opacity-90">
            Bis 2030 wollen wir die Kapazität von heute <strong>30 Geräte/Monat</strong> auf <strong>180+ Geräte/Monat</strong> steigern
            und gleichzeitig von <strong>5 Menschen/Jahr</strong> auf <strong>160+ Menschen/Jahr</strong> erreichen — eine <strong>32×</strong> Steigerung des sozialen Impacts.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-4xl font-bold">180+</div>
              <div className="text-sm opacity-90">Geräte/Monat (6× mehr)</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-4xl font-bold">2'160+</div>
              <div className="text-sm opacity-90">Geräte/Jahr</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-4xl font-bold">160+</div>
              <div className="text-sm opacity-90">Menschen/Jahr erreicht (32×)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Die Strategie: Zwei Säulen */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Die Strategie: Zwei Investitionen, exponentieller Impact</h2>
        <Card>
          <p className="mb-6 text-sm text-text-light">
            Um diese Vision zu erreichen, brauchen wir zwei strategische Investitionen, die sich gegenseitig verstärken:
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🏢</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-grey-dark mb-2">1. Hub — Infrastruktur &amp; Kapazität (6× Skalierung)</h3>
                <p className="text-sm text-text-light mb-3">
                  Ein <strong>500-1000 m² Community Tech Space</strong> mit professioneller Werkstatt, Schulungsräumen, Makerspace und Event-Fläche.
                  Ersetzt unser aktuelles 120 m² Lokal (müssen Ende 2026 raus).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-900">6×</div>
                    <div className="text-xs text-blue-700">Geräte-Kapazität (30 → 180/Monat)</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-900">CHF 500k-1M</div>
                    <div className="text-xs text-blue-700">Einrichtung + 1. Jahr</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-900">10'000+</div>
                    <div className="text-xs text-blue-700">Geräte/Jahr Ziel</div>
                  </div>
                </div>
                <Link
                  href="/fundraising/hub"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                >
                  📊 Hub-Budget & Umsetzungsplan ansehen →
                </Link>
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex items-start gap-4">
              <div className="text-4xl">🎓</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-grey-dark mb-2">2. Bildung — Train-the-Trainer (32× Social Impact)</h3>
                <p className="text-sm text-text-light mb-3">
                  Zwei <strong>Bildungsprogrammleiter:innen</strong> (Hardware + Software/AI) bilden Techniker und Trainer aus, die wiederum andere trainieren.
                  Von 5 Menschen/Jahr direkt erreicht auf <strong>160+ Menschen/Jahr</strong> (direkt + indirekt).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-violet-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-violet-900">32×</div>
                    <div className="text-xs text-violet-700">Social Impact (5 → 160 Menschen/Jahr)</div>
                  </div>
                  <div className="bg-violet-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-violet-900">2 VZÄ</div>
                    <div className="text-xs text-violet-700">Bildungsprogrammleiter:innen</div>
                  </div>
                  <div className="bg-violet-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-violet-900">CHF 175k</div>
                    <div className="text-xs text-violet-700">Pro Jahr (Löhne + Sozialabgaben)</div>
                  </div>
                </div>
                <Link
                  href="/fundraising/bildung"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                >
                  📊 Bildung-Budget & Multiplikationseffekt ansehen →
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Warum diese Kombination? */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Warum beide Investitionen zusammen?</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <h3 className="text-lg font-semibold text-grey-dark mb-3">🏢 Hub ohne Bildung = nur Kapazität</h3>
            <p className="text-sm text-text-light mb-4">
              Mit einem grösseren Raum können wir mehr Geräte refurbishen — aber wir bleiben ein 3-Personen-Team.
              Die soziale Wirkung bleibt begrenzt auf unsere eigene Arbeit.
            </p>
            <Badge variant="warning">Skaliert nur Geräte, nicht Menschen</Badge>
          </Card>

          <Card className="border-l-4 border-l-violet-500">
            <h3 className="text-lg font-semibold text-grey-dark mb-3">🎓 Bildung ohne Hub = begrenzter Raum</h3>
            <p className="text-sm text-text-light mb-4">
              Bildungsprogrammleiter:innen können trainieren — aber ohne grösseren Raum fehlen Werkstattplätze,
              Schulungsräume und Infrastruktur für mehr Teilnehmende.
            </p>
            <Badge variant="warning">Limitiert durch Raumkapazität</Badge>
          </Card>

          <Card className="col-span-1 lg:col-span-2 border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100">
            <h3 className="text-lg font-semibold text-emerald-800 mb-3">✨ Hub + Bildung = Exponentielles Wachstum</h3>
            <p className="text-sm text-emerald-900 mb-4">
              Mit dem Hub haben wir die <strong>Infrastruktur</strong> (Werkstatt, Schulungsräume, Equipment).
              Mit den Bildungsprogrammleiter:innen haben wir das <strong>Know-how-Multiplier</strong> (Train-the-Trainer).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-3xl font-bold text-emerald-900 mb-1">6× Geräte</div>
                <div className="text-xs text-emerald-700">30 → 180 Geräte/Monat dank Hub-Infrastruktur</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-3xl font-bold text-emerald-900 mb-1">32× Menschen</div>
                <div className="text-xs text-emerald-700">5 → 160 Menschen/Jahr dank Train-the-Trainer</div>
              </div>
            </div>
            <Badge variant="success">Beide Dimensionen skalieren gleichzeitig</Badge>
          </Card>
        </div>
      </section>

      {/* Zeitplan */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Zeitplan: 3 Jahre bis 2030-Niveau</h2>
        <Card>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Badge variant="info" className="mt-1">2026</Badge>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-grey-dark mb-2">Phase 1: Standortsuche & Finanzierung</h3>
                <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
                  <li>Standortsuche: 500-1000 m² in Zürich oder Agglomeration</li>
                  <li>Fundraising: CHF 500k-1M für Hub (Stiftungen, Crowdfunding, Corporate Sponsors)</li>
                  <li>Planung: Raumkonzept, Einrichtung, Betriebsmodell</li>
                  <li>Aktuelles Lokal: Müssen Ende 2026 raus (Deadline)</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge variant="info" className="mt-1">2027</Badge>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-grey-dark mb-2">Phase 2: Hub-Aufbau + erste:r Bildungsprogrammleiter:in</h3>
                <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
                  <li>Hub-Umbau & Einrichtung (Werkstatt, Makerspace, Schulungsräume)</li>
                  <li>Erste:r Bildungsprogrammleiter:in eingestellt (Hardware oder Software/AI)</li>
                  <li>Kapazität: 60-80 Geräte/Monat (2× aktuelle Kapazität)</li>
                  <li>Social Impact: 30-40 Menschen/Jahr (8× aktuelle Reichweite)</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge variant="success" className="mt-1">2028</Badge>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-grey-dark mb-2">Phase 3: Volle Kapazität erreicht</h3>
                <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
                  <li>Zweite:r Bildungsprogrammleiter:in eingestellt</li>
                  <li>Hub-Betrieb optimiert, alle Bereiche aktiv</li>
                  <li>Kapazität: 180+ Geräte/Monat (6× aktuelle Kapazität)</li>
                  <li>Social Impact: 160+ Menschen/Jahr (32× aktuelle Reichweite)</li>
                  <li>Train-the-Trainer voll etabliert: Ausgebildete trainieren andere</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Finanzierung */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Wie finanzieren wir das?</h2>
        <Card>
          <p className="text-sm text-text-light mb-6">
            Die Gesamtinvestition über 3 Jahre beträgt ca. <strong>CHF 1.5-2M</strong>.
            Wir setzen auf einen Mix aus Stiftungsgeldern, Crowdfunding, Corporate Sponsoring und öffentlichen Mitteln.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Hub-Infrastruktur</h3>
              <div className="text-3xl font-bold text-blue-900 mb-2">CHF 500k-1M</div>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Umbau, Einrichtung, Equipment</li>
                <li>• Erstes Jahr Miete & Betriebskosten</li>
                <li>• Reserve für Unvorhergesehenes</li>
              </ul>
            </div>
            <div className="bg-violet-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-violet-900 mb-2">Bildung (3 Jahre)</h3>
              <div className="text-3xl font-bold text-violet-900 mb-2">CHF 525k</div>
              <ul className="text-xs text-violet-700 space-y-1">
                <li>• 2× Bildungsprogrammleiter:innen</li>
                <li>• CHF 175k/Jahr Personalkosten</li>
                <li>• 3 Jahre bis Selbsttragung</li>
              </ul>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 text-center">
            <p className="text-sm text-emerald-900 mb-4">
              Wir suchen aktiv nach Stiftungen, die unsere Vision teilen. Siehe detaillierte Budgets und Umsetzungspläne:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/fundraising/hub"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                🏢 Hub-Fundraising-Plan
              </Link>
              <Link
                href="/fundraising/bildung"
                className="px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors"
              >
                🎓 Bildung-Fundraising-Plan
              </Link>
              <Link
                href="/fundraising/stiftungen"
                className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                🏛️ Passende Stiftungen finden
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* Warum jetzt? */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Warum jetzt?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-red-500">
            <h3 className="text-md font-semibold text-grey-dark mb-2">⏰ Deadline: Ende 2026</h3>
            <p className="text-sm text-text-light">
              Wir müssen unser aktuelles 120 m² Lokal verlassen. Das ist keine Krise — es ist die perfekte Gelegenheit,
              etwas Grösseres zu schaffen.
            </p>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <h3 className="text-md font-semibold text-grey-dark mb-2">📈 Nachfrage wächst</h3>
            <p className="text-sm text-text-light">
              Wartelisten für refurbishte Geräte. Anfragen für Workshops übersteigen unsere Kapazität.
              Der Bedarf ist da — wir müssen nur skalieren.
            </p>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <h3 className="text-md font-semibold text-grey-dark mb-2">💪 Wir sind bereit</h3>
            <p className="text-sm text-text-light">
              22 Jahre Erfahrung (seit 2003). Prozesse etabliert. Netzwerk aufgebaut. Team eingespielt.
              Wir wissen, wie es geht — wir brauchen nur die Infrastruktur.
            </p>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Hilf uns, diese Vision zu verwirklichen</h3>
          <p className="text-lg mb-6 leading-relaxed max-w-3xl mx-auto">
            Strategie 2030 ist mehr als ein Plan — es ist eine Plattform für <strong>digitale Teilhabe, nachhaltige Technologie und soziale Innovation</strong>.
            Mit deiner Unterstützung können wir vom 3-Personen-Team zum Impact-Hub wachsen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fundraising"
              className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              📊 Fundraising-Übersicht ansehen
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

      <StoryBridge bridges={STORY_BRIDGES['strategie-2030']} />
    </>
  );
}
