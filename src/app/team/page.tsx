import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import { TEAM_MEMBERS, DEPARTMENTS, LOCATIONS, MISSING_DATA, HR_COLUMNS } from './data';

export const metadata: Metadata = {
  title: 'Team',
  description: 'Team-Struktur, Kapazität und Standorte von Revamp-IT',
};

function getMembersByDepartment(department: string) {
  return TEAM_MEMBERS.filter((m) => m.department === department);
}

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="Team"
        subtitle="Mitarbeitende, Kapazität und Standorte"
        badge="HR_Roster.csv"
      />

      {/* Key metrics */}
      <MetricGrid columns={3} className="mb-8">
        <MetricCard label="Team-Mitglieder" value="13" subtitle="in HR_Roster.csv" sourceType="live" />
        <MetricCard label="Abteilungen" value="3" subtitle="Management, Tech, Operations" sourceType="live" />
        <MetricCard label="FTE Kapazität" value="?" subtitle="Nicht erfasst" sourceType="none" />
      </MetricGrid>

      {/* Zusammenfassung */}
      <section className="mb-10">
        <Card className="border-l-4 border-l-amber-400 bg-amber-50">
          <div className="flex items-start gap-3">
            <span className="text-xl">👥</span>
            <div>
              <strong>Kernaussage:</strong>{' '}
              <span className="text-sm text-text-light">
                13 Teammitglieder erfasst, aber keine Kapazitäts- oder FTE-Daten vorhanden.
              </span>
            </div>
          </div>
          <ul className="mt-3 space-y-1 pl-8 text-sm text-text-light">
            <li className="flex items-center gap-2">
              <Badge variant="success">+</Badge>
              Vollständige Namensliste mit Rollen und Abteilungen
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="warning">!</Badge>
              Nur 1 von 13 Personen hat Kapazität angegeben (Georgie: 60%)
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
      <section className="mb-10">
        <div className="rounded-lg border-l-4 border-l-amber-400 bg-amber-50 p-4">
          <strong>Hinweis zur Datenqualität:</strong>
          <p className="mt-1 text-sm text-text-light">
            Die HR_Roster.csv enthält nur Namen, Rollen und Abteilungen.
            Kapazitäten, FTE-Werte und Auslastung werden aktuell nicht systematisch erfasst.
          </p>
        </div>
      </section>

      {/* Team-Mitglieder nach Abteilung */}
      <section className="mb-10">
        <h2 className="mb-6 text-xl font-semibold text-grey-dark">Team-Mitglieder</h2>
        {DEPARTMENTS.map((dept) => {
          const members = getMembersByDepartment(dept.name);
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
                    <p className="text-sm text-text-muted">{member.role}</p>
                    <div className="mt-2">
                      <Badge variant="default">
                        {member.department}{member.capacity ? ` · ${member.capacity}` : ''}
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
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Handlungsempfehlungen</h2>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <CardTitle>Kapazitätsplanung</CardTitle>
            </div>
          </CardHeader>
          <p className="mb-2 text-sm text-text-light">
            <strong>Ziel:</strong> Transparente FTE-Kapazität für Ressourcenplanung und Bottleneck-Erkennung.
          </p>
          <p className="mb-4 text-sm text-text-muted">
            <strong>Constraints:</strong> Datenschutz, Teilzeit-Variabilität, freiwillige Angaben.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
              <Badge variant="danger">HOCH</Badge>
              <div className="text-sm">
                <span>capacity_pct in HR_Roster.csv für alle Mitarbeitenden erfassen</span>
                <p className="mt-1 text-text-muted">&rarr; Ermöglicht FTE-Berechnung und Auslastungsanalyse</p>
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
      <section className="mb-10">
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
      <section className="mb-10">
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
      <section className="mb-10">
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
      <section className="mb-10">
        <div className="rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50 p-4">
          <strong>Datenquelle:</strong> HR_Roster.csv
          <p className="mt-1 text-sm text-text-muted">
            Alle Namen und Rollen auf dieser Seite stammen direkt aus HR_Roster.csv.
            Keine Schätzungen, keine Placeholder-Daten.
          </p>
        </div>
      </section>
    </>
  );
}
