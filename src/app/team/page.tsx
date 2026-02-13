import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import { TEAM_MEMBERS, DEPARTMENTS, LOCATIONS, MISSING_DATA, HR_COLUMNS } from './data';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';

export const metadata: Metadata = {
  title: 'Team',
  description: 'Team-Struktur, Kapazität und Standorte von Revamp-IT',
};

function getMembersByBereich(bereich: string) {
  return TEAM_MEMBERS.filter((m) => m.bereich === bereich);
}

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="Team"
        subtitle="Mitarbeitende, Kapazität und Standorte"
        badge="HR_Roster.csv"
      />

      <WhyThisMatters
        purpose="Zeigt, wer hinter Revamp-IT steht und welche Kapazität wir haben."
        connection="Team-Kapazität bestimmt Operations-Volumen (siehe Operations-Seite)."
      />

      {/* Key metrics */}
      <MetricGrid columns={3} className="mb-8">
        <MetricCard label="Team-Mitglieder" value={String(TEAM_MEMBERS.length)} subtitle="in HR_Roster.csv" sourceType="live" />
        <MetricCard label="Bereiche" value="3" subtitle="Leitung, Technik, Betrieb" sourceType="live" />
        <MetricCard label="VZÄ erfasst" value="1 von 7" subtitle="Georgie: 60%" sourceType="live" />
      </MetricGrid>

      {/* Zusammenfassung */}
      <section className="mb-8">
        <Card className="border-l-4 border-l-amber-400 bg-amber-50">
          <div className="flex items-start gap-3">
            <span className="text-xl">👥</span>
            <div>
              <strong>Kernaussage:</strong>{' '}
              <span className="text-sm text-text-light">
                {TEAM_MEMBERS.length} Teammitglieder erfasst, aber nur 1 Person hat Vollzeitäquivalent (VZÄ) angegeben.
              </span>
            </div>
          </div>
          <ul className="mt-3 space-y-1 pl-8 text-sm text-text-light">
            <li className="flex items-center gap-2">
              <Badge variant="success">+</Badge>
              Vollständige Namensliste mit Fachgebieten und Bereichen
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="warning">!</Badge>
              Nur 1 von {TEAM_MEMBERS.length} Personen hat Kapazität angegeben (Georgie: 60%)
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="warning">!</Badge>
              Keine Skills, Stundensätze oder Verfügbarkeiten erfasst
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="primary">&rarr;</Badge>
              HR_Roster.csv um capacity_pct und skills ergänzen für Kapazitätsplanung
            </li>
          </ul>
        </Card>
      </section>

      {/* Datenqualität-Hinweis */}
      <section className="mb-8">
        <div className="rounded-lg border-l-4 border-l-amber-400 bg-amber-50 p-4">
          <strong>Hinweis zur Datenqualität:</strong>
          <p className="mt-1 text-sm text-text-light">
            Die HR_Roster.csv enthält nur Namen, Fachgebiete und Bereiche.
            Kapazitäten, VZÄ-Werte (Vollzeitäquivalente) und Auslastung werden aktuell nicht systematisch erfasst.
          </p>
          <p className="mt-2 text-xs text-text-light">
            <em>VZÄ = Vollzeitäquivalent (auch bekannt als "FTE" im internationalen Kontext)</em>
          </p>
        </div>
      </section>

      {/* ========== OPERATIVE REALITÄT ========== */}
      <section className="mb-8">
        <Card className="bg-emerald-50 border-l-4 border-emerald-500">
          <h3 className="font-semibold mb-2 text-emerald-900">Operative Realität (2026)</h3>
          <p className="text-sm text-emerald-800">
            <strong>Aktuelles Kernteam:</strong> 3 Vollzeitäquivalente (VZÄ) — Vero (Geschäftsleitung), Dani (Operations), Andreas (Strategie)
          </p>
          <p className="text-xs text-emerald-700 mt-2">
            <em>Hinweis: Diese Angabe basiert auf operativer Praxis. HR_Roster.csv erfasst diese Kapazitäten noch nicht systematisch.</em>
          </p>
        </Card>
      </section>

      {/* ========== STRATEGISCHE TEAM-STRUKTUR ========== */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Strategische Team-Struktur 2026-2028</h2>
        <p className="mb-6 text-sm text-text-light">
          Unser Wachstum basiert auf <strong>Hub + Menschen</strong>. Neben dem 1000m² Hub fundraisen wir für 2 neue Schlüsselpositionen,
          die durch das <strong>Train-the-Trainer Modell</strong> unsere Kapazität und Impact multiplizieren.
        </p>

        <Card className="mb-6 bg-amber-50 border-l-4 border-amber-500">
          <h3 className="font-semibold mb-2">Warum planen wir so gross?</h3>
          <p className="text-sm">
            <strong>Heute:</strong> 3 VZÄ schaffen ~360 Geräte/Jahr (30/Monat). Das ist unsere aktuelle Kapazität.<br />
            <strong>Problem:</strong> Mit nur 3 Personen können wir nicht mehr wachsen — wir sind am Limit.<br />
            <strong>Lösung:</strong> Hub + Menschen (Raum + 2 Bildungsprogrammleiter) ermöglichen Train-the-Trainer Skalierung.
          </p>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Current Core Team */}
          <Card className="border-l-4 border-l-emerald-500">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <h3 className="text-lg font-bold text-grey-dark">Kernteam (aktuell)</h3>
                <p className="text-sm text-emerald-600">3 VZÄ — Geschäftsleitung, Operations, Strategie</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-lg">👤</span>
                <div className="flex-1 text-sm">
                  <div className="font-semibold text-gray-900">Vero</div>
                  <div className="text-gray-600">Geschäftsleitung & Koordination</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">👤</span>
                <div className="flex-1 text-sm">
                  <div className="font-semibold text-gray-900">Dani</div>
                  <div className="text-gray-600">Operations & Refurbishment</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">👤</span>
                <div className="flex-1 text-sm">
                  <div className="font-semibold text-gray-900">Andreas</div>
                  <div className="text-gray-600">Strategie & Entwicklung</div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Aktuelle Kapazität</span>
                <span className="font-semibold text-gray-900">25-35 Geräte/Monat</span>
              </div>
            </div>
          </Card>

          {/* Planned Hires: Bildungsprogrammleiter */}
          <Card className="border-l-4 border-l-violet-500">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <h3 className="text-lg font-bold text-grey-dark">Bildungsprogrammleiter (geplant)</h3>
                <p className="text-sm text-violet-600">+2 VZÄ — Train-the-Trainer Multiplikator</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-lg">🔧</span>
                <div className="flex-1 text-sm">
                  <div className="font-semibold text-gray-900">Hardware-Bildungsprogrammleiter</div>
                  <div className="text-gray-600">Freiwillige/Praktikant:innen ausbilden & managen</div>
                  <div className="mt-1 text-xs text-gray-500">
                    → 8-12 Freiwillige/Praktikant:innen/Jahr trainiert<br />
                    → 2.5× Geräte-Kapazität (durch unbezahlte Arbeit)<br />
                    <span className="text-gray-400">
                      Annahme: 1 BPL trainiert 4-6 Freiwillige/Jahr. Jeder: ~15 Geräte/Monat.
                      Konfidenz: Mittel (abhängig von Programm-Rekrutierung)
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">💻</span>
                <div className="flex-1 text-sm">
                  <div className="font-semibold text-gray-900">Software/AI-Bildungsprogrammleiter</div>
                  <div className="text-gray-600">Entwickler & AI-Literacy Programme</div>
                  <div className="mt-1 text-xs text-gray-500">
                    → 6-10 Entwickler/Jahr trainiert<br />
                    → AI-Tools & Open Source Projects
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ziel-Kapazität (Jahr 3)</span>
                <span className="font-semibold text-gray-900">150-200 Geräte/Monat</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Multiplier Explanation */}
        <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 bg-white p-6">
          <h4 className="mb-3 text-sm font-bold text-gray-900 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Train-the-Trainer Multiplikator-Effekt (Nonprofit-Modell)
          </h4>
          <p className="mb-4 text-sm text-gray-600">
            <strong>2 bezahlte BPL</strong> trainieren und managen <strong>Freiwillige, Praktikant:innen, Zivis, Corporate Placements und Integrationsprogramm-Teilnehmende</strong> (unbezahlte/subventionierte Arbeit).
            So multiplizieren wir Kapazität ohne massive Lohnkosten — das ist der Kern des sozialen Unternehmensmodells.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="font-semibold text-blue-900 mb-2">Geräte-Kapazität</div>
              <div className="text-blue-800">
                <strong>Heute:</strong> 30 Geräte/Monat (3 VZÄ Kernteam)<br />
                <strong>Mit 2× BPL:</strong> 180 Geräte/Monat (6× von heute)<br />
                <div className="text-xs text-blue-600 mt-2 border-t border-blue-200 pt-2">
                  <strong>Annahmen:</strong> Jeder BPL trainiert 4-6 Freiwillige/Praktikant:innen/Zivis pro Jahr.
                  Bei 2× BPL = 8-12 unbezahlte Techniker:innen = ~150 Geräte/Monat zusätzlich.<br />
                  <strong>Konfidenz:</strong> Mittel (abhängig von Programm-Rekrutierung + Hub-Raumkapazität)
                </div>
              </div>
            </div>
            <div className="bg-violet-50 rounded-lg p-4">
              <div className="font-semibold text-violet-900 mb-2">Soziale Wirkung</div>
              <div className="text-violet-800">
                <strong>Heute:</strong> ~5 Menschen/Jahr begleitet<br />
                <strong>Mit 2× BPL:</strong> 150-200 Menschen/Jahr (32× von heute)<br />
                <div className="text-xs text-violet-600 mt-2 border-t border-violet-200 pt-2">
                  <strong>Annahmen:</strong> Jeder BPL begleitet direkt 10-15 Menschen/Jahr.
                  Zusätzlich: Trainierte Techniker begleiten weitere 50-75 Menschen/Jahr.<br />
                  <strong>Konfidenz:</strong> Mittel (abhängig von Programm-Aufnahmekapazität)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SCALING ROADMAP ========== */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Wachstumsplan: Primäres Ziel Jahr 3 (2'160 Geräte/Jahr)</h2>
        <p className="mb-6 text-sm text-text-light">
          <strong>Fundraising-Ziel: Jahr 3 (Hub + 2 BPL).</strong> Jahr 5 und Vision 2030 sind aspirational — zeigen langfristiges Potenzial, aber hängen von erfolgreicher Jahr-3-Finanzierung ab.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Phase 1: Heute */}
          <Card className="border-l-4 border-l-gray-400">
            <div className="text-center mb-3">
              <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full mb-2">
                HEUTE (2025)
              </div>
              <div className="text-3xl font-bold text-gray-900">360</div>
              <div className="text-sm text-gray-600">Geräte/Jahr</div>
            </div>
            <div className="pt-3 border-t border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Team:</span>
                <span className="font-semibold">3 VZÄ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Raum:</span>
                <span className="font-semibold">250m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kapazität:</span>
                <span className="font-semibold">30/Monat</span>
              </div>
            </div>
          </Card>

          {/* Phase 2: Jahr 3 (Hub + 2× BPL) */}
          <Card className="border-l-4 border-l-blue-500 bg-blue-50/30">
            <div className="text-center mb-3">
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-2">
                JAHR 3 (2028)
              </div>
              <div className="text-3xl font-bold text-blue-900">2'160</div>
              <div className="text-sm text-blue-700">Geräte/Jahr</div>
            </div>
            <div className="pt-3 border-t border-blue-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-blue-700">Team:</span>
                <span className="font-semibold text-blue-900">5 VZÄ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Raum:</span>
                <span className="font-semibold text-blue-900">1000m² Hub</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Kapazität:</span>
                <span className="font-semibold text-blue-900">180/Monat</span>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200">
                <div className="text-blue-600 font-semibold">6× Wachstum</div>
                <div className="text-blue-500 text-[10px] mt-1">
                  Basis: Hub-Raum + 2× BPL trainieren 8-12 Freiwillige/Praktikant:innen
                </div>
              </div>
            </div>
          </Card>

          {/* Phase 3: Jahr 5 (4× BPL + Automation) - ASPIRATIONAL */}
          <Card className="border-l-4 border-l-violet-500 bg-violet-50/30 opacity-75">
            <div className="text-center mb-3">
              <div className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full mb-2">
                JAHR 5 (2030) — Aspirational
              </div>
              <div className="text-3xl font-bold text-violet-900">5'000</div>
              <div className="text-sm text-violet-700">Geräte/Jahr</div>
            </div>
            <div className="pt-3 border-t border-violet-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-violet-700">Team:</span>
                <span className="font-semibold text-violet-900">~7-9 VZÄ (bezahlt)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-violet-700">BPL:</span>
                <span className="font-semibold text-violet-900">4× (Hw×2, Sw×2)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-violet-700">Automation:</span>
                <span className="font-semibold text-violet-900">Falls AI/DevOps gesichert</span>
              </div>
              <div className="mt-2 pt-2 border-t border-violet-200">
                <div className="text-violet-600 font-semibold">14× Wachstum</div>
                <div className="text-violet-500 text-[10px] mt-1">
                  Erfordert: AI/DevOps-Kapazität + erweiterte BPL-Programme
                </div>
              </div>
            </div>
          </Card>

          {/* Phase 4: Vision 2030 (Multi-Standort) - HIGHLY ASPIRATIONAL */}
          <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/30 opacity-60">
            <div className="text-center mb-3">
              <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-2">
                VISION 2030 (J7+) — Hochgradig aspirational
              </div>
              <div className="text-3xl font-bold text-emerald-900">10'000</div>
              <div className="text-sm text-emerald-700">Geräte/Jahr</div>
            </div>
            <div className="pt-3 border-t border-emerald-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-emerald-700">Team:</span>
                <span className="font-semibold text-emerald-900">~12-15 VZÄ (bezahlt)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700">Standorte:</span>
                <span className="font-semibold text-emerald-900">Hub + Satellit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700">Automation:</span>
                <span className="font-semibold text-emerald-900">Falls möglich</span>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-200">
                <div className="text-emerald-600 font-semibold">28× Wachstum</div>
                <div className="text-emerald-500 text-[10px] mt-1">
                  Erfordert: Multi-Standort + massive BPL-Expansion + Vollautomation
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Key Enablers */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6">
          <h4 className="mb-4 text-sm font-bold text-gray-900">Wie KÖNNTEN wir 10'000 Geräte/Jahr erreichen? (Aspirational)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🏢</span>
              <div>
                <div className="font-semibold text-gray-900">Raum-Skalierung</div>
                <div className="text-gray-600 text-xs mt-1">
                  Jahr 3: 1000m² Hub voll auslasten<br />
                  Jahr 7+: 2. Standort (Satellit-Werkstatt)
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">👥</span>
              <div>
                <div className="font-semibold text-gray-900">Team-Multiplikation</div>
                <div className="text-gray-600 text-xs mt-1">
                  Jahr 3: 2× BPL (5 VZÄ total)<br />
                  Jahr 5: 4× BPL (9 VZÄ total)<br />
                  Jahr 7+: 6× BPL (15 VZÄ total)
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🤖</span>
              <div>
                <div className="font-semibold text-gray-900">Automatisierung</div>
                <div className="text-gray-600 text-xs mt-1">
                  Jahr 5: AI-Triage + Auto-Listing<br />
                  Jahr 7+: Robot-assisted Testing + Vollautomation
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Realistic Note */}
        <div className="mt-4 rounded-lg bg-amber-50 border-l-4 border-amber-500 p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div className="text-sm text-amber-900">
              <div className="font-semibold">Realistische Einschätzung</div>
              <div className="mt-1 text-amber-800">
                <strong>Jahr 3 (2'160 Geräte/Jahr) ist das primäre Fundraising-Ziel.</strong> Erreichbar mit Hub + 2 bezahlten BPL,
                die Freiwillige/Praktikant:innen trainieren (Nonprofit-Multiplikator-Modell).<br /><br />
                Jahr 5 und Vision 2030 sind <strong>hochgradig aspirational</strong> und hängen ab von:
                erfolgreicher Jahr-3-Finanzierung, Hub-Eröffnung, BPL-Rekrutierung, AI/DevOps-Kapazität (aktuell nicht gesichert),
                und Multi-Standort-Expansion. <strong>Fokus: Jahr 3 erreichen, dann neu evaluieren.</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team-Mitglieder nach Abteilung */}
      <section className="mb-8">
        <h2 className="mb-6 text-xl font-semibold text-grey-dark">Team-Mitglieder</h2>
        {DEPARTMENTS.map((dept) => {
          const members = getMembersByBereich(dept.name);
          return (
            <div key={dept.name} className="mb-8">
              <div className="mb-4 flex items-center gap-3 border-b-2 border-primary pb-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${dept.color} text-sm`}>
                  {dept.icon}
                </div>
                <h3 className="text-base font-semibold">{dept.name}</h3>
                <span className="ml-auto text-sm text-text-muted">{members.length} {members.length === 1 ? 'Person' : 'Personen'}</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                  <Card key={member.id} className={`border-l-4 ${dept.borderColor}`}>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-lg font-bold text-white">
                      {member.name[0]}
                    </div>
                    <h4 className="text-base font-semibold">{member.name}</h4>
                    <p className="text-sm text-text-muted">{member.fachgebiete.join(', ')}</p>
                    <div className="mt-2">
                      <Badge variant="default">
                        {member.bereich}{member.capacity ? ` · ${member.capacity}` : ''}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Handlungsempfehlungen */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Handlungsempfehlungen</h2>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <CardTitle>Kapazitätsplanung</CardTitle>
            </div>
          </CardHeader>
          <p className="mb-2 text-sm text-text-light">
            <strong>Ziel:</strong> Transparente VZÄ-Kapazität für Ressourcenplanung und Bottleneck-Erkennung.
          </p>
          <p className="mb-4 text-sm text-text-muted">
            <strong>Constraints:</strong> Datenschutz, Teilzeit-Variabilität, freiwillige Angaben.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
              <Badge variant="danger">HOCH</Badge>
              <div className="text-sm">
                <span>capacity_pct in HR_Roster.csv für alle Mitarbeitenden erfassen</span>
                <p className="mt-1 text-text-muted">&rarr; Ermöglicht VZÄ-Berechnung und Auslastungsanalyse</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
              <Badge variant="warning">MITTEL</Badge>
              <div className="text-sm">
                <span>Skills-Spalte mit Kernkompetenzen befüllen</span>
                <p className="mt-1 text-text-muted">&rarr; Skill-Matrix für Projektbesetzung</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
              <Badge variant="primary">NIEDRIG</Badge>
              <div className="text-sm">
                <span>Stundensätze erfassen (falls relevant für Projektkalkulationen)</span>
                <p className="mt-1 text-text-muted">&rarr; Kostenbasierte Ressourcenplanung</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Nicht erfasste Daten */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Nicht erfasste Daten</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {MISSING_DATA.map((item) => (
            <div key={item.title} className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <h3 className="text-base font-semibold text-gray-500">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{item.description}</p>
              {'detail' in item && item.detail && (
                <p className="mt-1 text-xs text-gray-400">{item.detail}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Standorte */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Standorte</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {LOCATIONS.map((loc) => (
            <Card key={loc.title} className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-2xl">
                {loc.icon}
              </div>
              <div>
                <h4 className="text-base font-semibold">{loc.title}</h4>
                <p className="text-sm text-text-muted">{loc.address}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Insights & HR_Roster Spalten */}
      <section className="mb-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6">
            <h3 className="mb-4 text-base font-semibold text-violet-700">Was sagen diese Daten?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs">📊</span>
                <span><strong>Quelle:</strong> HR_Roster.csv aus dem Revamp-Hirn Repository.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs">⚠️</span>
                <span><strong>Unvollständig:</strong> Kapazitäten, Skills und Kosten werden nicht erfasst.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs">⚠️</span>
                <span><strong>Keine Analyse möglich:</strong> Ohne Kapazitätsdaten können keine Bottlenecks oder Auslastung berechnet werden.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs">💡</span>
                <span><strong>Empfehlung:</strong> HR_Roster.csv um capacity_pct, skills und cost_rate ergänzen.</span>
              </div>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>HR_Roster.csv Spalten</CardTitle>
            </CardHeader>
            <ul className="space-y-2 text-sm">
              {HR_COLUMNS.map((col) => (
                <li key={col.field}>
                  <strong className="font-mono text-xs">{col.field}</strong>
                  <span className="text-text-muted"> – {col.description}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Datenquelle */}
      <section className="mb-8">
        <div className="rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50 p-4">
          <strong>Datenquelle:</strong> HR_Roster.csv
          <p className="mt-1 text-sm text-text-muted">
            Alle Namen und Fachgebiete auf dieser Seite stammen direkt aus HR_Roster.csv.
            Keine Schätzungen, keine Placeholder-Daten.
          </p>
        </div>
      </section>

      <StoryBridge bridges={STORY_BRIDGES.team} />
    </>
  );
}
