import type { Metadata } from 'next';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { STIFTUNGEN_DATA, FIT_CONFIG } from '@/lib/config/foundations';
import { TEAM_MEMBERS } from '@/app/team/data';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { DEVICES_PER_YEAR_TARGET_DISPLAY, PEOPLE_REACHED_DISPLAY } from '@/lib/config/projections';

export const metadata: Metadata = {
  title: `${ORG_PROFILE.platform.name} — Transparenz-Hub für ${ORG_PROFILE.name} Fundraising`,
  description: 'Alle Daten, alle Quellen, komplett transparent: Finanzen, Wirkung, Strategie, Fundraising-Pipeline',
};

export default function HomePage() {
  // Top P1/P2 foundations that are open and fully researched — actionable now
  const topActionable = STIFTUNGEN_DATA
    .filter(f => f.priority <= 2 && (f.status === 'open' || f.status === 'rolling') && !f.needsResearch)
    .sort((a, b) => a.priority - b.priority || b.fit - a.fit)
    .slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="mb-12">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-12 text-white">
          <h1 className="text-5xl font-bold mb-6">Willkommen bei {ORG_PROFILE.platform.name}</h1>
          <p className="text-2xl mb-8 leading-relaxed">
            <strong>Transparenz-Hub für {ORG_PROFILE.name}:</strong> Alle Daten, alle Quellen, komplett transparent.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-lg">Quellenangaben</div>
              <div className="text-sm opacity-90 mt-2">Jede Zahl nachvollziehbar</div>
            </div>
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
              <div className="text-4xl font-bold mb-2">8 Jahre</div>
              <div className="text-lg">Finanzdaten</div>
              <div className="text-sm opacity-90 mt-2">2018-2025, direkt aus Kivitendo</div>
            </div>
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
              <div className="text-4xl font-bold mb-2">{STIFTUNGEN_DATA.length}</div>
              <div className="text-lg">Stiftungen</div>
              <div className="text-sm opacity-90 mt-2">Mit Fit-Analyse & Deadlines</div>
            </div>
          </div>
        </div>
      </section>

      {/* Fundraiser quick-start — top actionable foundations right now */}
      {topActionable.length > 0 && (
        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-semibold text-grey-dark">Jetzt beantragbar — P1 & P2</h2>
            <Link href="/fundraising/stiftungen?status=open" className="text-sm text-primary hover:underline">
              Alle Stiftungen →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {topActionable.map(f => (
              <Link
                key={f.slug}
                href={`/fundraising/stiftungen/${f.slug}`}
                className="block rounded-xl border border-border bg-white p-4 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold bg-danger-bg text-danger rounded px-1.5 py-0.5">P{f.priority}</span>
                  <span className="text-xs font-bold text-success">{(FIT_CONFIG[f.fit as keyof typeof FIT_CONFIG])?.stars ?? '☆☆☆'}</span>
                </div>
                <p className="font-semibold text-grey-dark text-sm">{f.name}</p>
                <p className="text-xs text-text-muted mt-1">{f.deadlineText}</p>
                <p className="text-xs text-text-light mt-1 line-clamp-2">{f.tagline}</p>
              </Link>
            ))}
          </div>
          <div className="flex gap-3">
            <Link
              href="/fundraising/applications"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Pipeline öffnen →
            </Link>
            <Link
              href="/fundraising/stiftungen"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-semibold text-grey-dark hover:bg-bg-light"
            >
              Alle {STIFTUNGEN_DATA.length} Stiftungen
            </Link>
          </div>
        </section>
      )}

      {/* What is this site? */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-grey-dark">Was ist {ORG_PROFILE.platform.name}?</h2>
        <Card className="border-l-4 border-l-blue-500 mb-6">
          <p className="text-lg text-text-light mb-4 leading-relaxed">
            <strong>{ORG_PROFILE.platform.name} ist unser Transparenz-Hub</strong> — eine interaktive Plattform, die alle Daten
            über {ORG_PROFILE.name} an einem Ort sammelt und für Stiftungen, Partner und Interessierte zugänglich macht.
          </p>
          <p className="text-base text-text-light leading-relaxed">
            Statt PDF-Berichten mit Zahlen ohne Kontext zeigen wir: <strong>Woher kommt jede Zahl? Wie wurde sie berechnet?
            Was ist die Quelle?</strong> Jede Metrik ist inspizierbar, jede Behauptung ist belegt.
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-emerald-500">
            <h3 className="text-xl font-semibold text-grey-dark mb-3">Für Stiftungen & Förderer</h3>
            <p className="text-sm text-text-light mb-4">
              Fundierte Entscheidungsgrundlage: Finanzen, Wirkung, Strategie, Team — alles nachvollziehbar dokumentiert.
            </p>
            <ul className="text-sm text-text-light space-y-2">
              <li>✓ Finanzhistorie 2018-2025 (inkl. Trendanalyse)</li>
              <li>✓ Wirkungskennzahlen (CO₂, Geräte, Menschen erreicht)</li>
              <li>✓ Team & Kapazität (Rollen, Bereiche, Planung)</li>
              <li>✓ Strategie 2030 (Organisation, Hub, Bildung)</li>
            </ul>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <h3 className="text-xl font-semibold text-grey-dark mb-3">Für uns ({ORG_PROFILE.name})</h3>
            <p className="text-sm text-text-light mb-4">
              Fundraising-Intelligence: Passende Stiftungen finden, Fit analysieren, professionelle Gesuche generieren.
            </p>
            <ul className="text-sm text-text-light space-y-2">
              <li>✓ {STIFTUNGEN_DATA.length} Stiftungen mit Fit-Analyse & Deadlines</li>
              <li>✓ Gesuch-Vorlagen nach Stiftungstyp (A/B/C/D)</li>
              <li>✓ Interaktive Foundation Profiles (Präsentations-Modus)</li>
              <li>✓ Daten-Strategie: Was wir wissen, was fehlt</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-grey-dark">Wohin möchtest du?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Revamp 2030 */}
          <Link href="/revamp-2030" className="block group">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🚀</div>
                  <div>
                    <h3 className="text-lg font-semibold text-grey-dark group-hover:text-blue-600">Revamp 2030</h3>
                    <Badge color="blue">Vision</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-light mb-3">
                Wohin wir gehen: Organisation + Hub + Bildung. {DEVICES_PER_YEAR_TARGET_DISPLAY} Geräte/Jahr + {PEOPLE_REACHED_DISPLAY}.
              </p>
              <div className="text-xs text-blue-600 font-semibold">→ Vision & Strategie ansehen</div>
            </Card>
          </Link>

          {/* Fundraising */}
          <Link href="/fundraising/stiftungen" className="block group">
            <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🎯</div>
                  <div>
                    <h3 className="text-lg font-semibold text-grey-dark group-hover:text-emerald-600">Fundraising</h3>
                    <Badge color="emerald">{STIFTUNGEN_DATA.length} Stiftungen</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-light mb-3">
                Alle Förderstiftungen mit Fit-Analyse, Deadlines und Foundation Profiles.
              </p>
              <div className="text-xs text-emerald-600 font-semibold">→ Stiftungen durchsuchen</div>
            </Card>
          </Link>

          {/* Finanzen */}
          <Link href="/finanzen" className="block group">
            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">💰</div>
                  <div>
                    <h3 className="text-lg font-semibold text-grey-dark group-hover:text-purple-600">Finanzen</h3>
                    <Badge color="purple">8 Jahre</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-light mb-3">
                Einnahmen, Ausgaben, Kategorien: Komplette P&L 2018-2025 aus Kivitendo.
              </p>
              <div className="text-xs text-purple-600 font-semibold">→ Finanzdaten einsehen</div>
            </Card>
          </Link>

          {/* Wirkung */}
          <Link href="/wirkung" className="block group">
            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🌍</div>
                  <div>
                    <h3 className="text-lg font-semibold text-grey-dark group-hover:text-orange-600">Wirkung</h3>
                    <Badge color="orange">Impact</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-light mb-3">
                CO₂-Einsparungen, Geräte, Menschen erreicht — mit Methodik & Quellenangaben.
              </p>
              <div className="text-xs text-orange-600 font-semibold">→ Impact-Metriken ansehen</div>
            </Card>
          </Link>

          {/* Team */}
          <Link href="/team" className="block group">
            <Card className="border-l-4 border-l-pink-500 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">👥</div>
                  <div>
                    <h3 className="text-lg font-semibold text-grey-dark group-hover:text-pink-600">Team</h3>
                    <Badge color="pink">{TEAM_MEMBERS.length} Teammitglieder</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-light mb-3">
                {TEAM_MEMBERS.length} Menschen arbeiten bei uns: Leitung, Techniker, Betrieb — plus geplante Bildungsprogrammleiter.
              </p>
              <div className="text-xs text-pink-600 font-semibold">→ Team kennenlernen</div>
            </Card>
          </Link>

          {/* Methodik */}
          <Link href="/methodik" className="block group">
            <Card className="border-l-4 border-l-teal-500 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">📊</div>
                  <div>
                    <h3 className="text-lg font-semibold text-grey-dark group-hover:text-teal-600">Methodik</h3>
                    <Badge color="teal">Transparenz</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-light mb-3">
                Wie wir Daten erheben, was wir wissen, was fehlt — komplett transparent.
              </p>
              <div className="text-xs text-teal-600 font-semibold">→ Datenquellen einsehen</div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Philosophy */}
      <section className="mb-12">
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-l-4 border-l-gray-500">
          <h2 className="text-2xl font-bold mb-4 text-grey-dark">Warum Transparenz?</h2>
          <p className="text-base text-text-light mb-4 leading-relaxed">
            Stiftungen müssen fundierte Entscheidungen treffen. <strong>Vertrauen entsteht durch Nachvollziehbarkeit</strong>,
            nicht durch Marketing-Sprech.
          </p>
          <p className="text-sm text-text-light leading-relaxed">
            Deshalb zeigen wir nicht nur "Was" (Zahlen), sondern auch "Woher" (Quellen), "Wie" (Methodik) und
            "Wo fehlt noch was" (Data Quality Notes). Jede Metrik ist inspizierbar. Jede Behauptung belegt.
          </p>
        </Card>
      </section>

      {/* CTA */}
      <section className="mb-12">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Bereit für den Deep Dive?</h2>
          <p className="text-lg mb-8 leading-relaxed max-w-3xl mx-auto">
            Erkunde unsere Finanzen, Wirkung, Strategie — oder finde die passende Stiftung für dein Projekt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/revamp-2030"
              className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              🚀 Vision 2030 ansehen
            </Link>
            <Link
              href="/fundraising/stiftungen"
              className="px-8 py-4 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors duration-200 border-2 border-white"
            >
              🏛️ Stiftungen durchsuchen
            </Link>
            <Link
              href="/finanzen"
              className="px-8 py-4 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors duration-200 border-2 border-white"
            >
              💰 Finanzen deep dive
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
