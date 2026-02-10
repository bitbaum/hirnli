import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import Table from '@/components/ui/Table';
import {
  Checklist, TimeBadge,
  TriageSection, RefurbishmentStepsSection, WarehouseSection,
} from './components';
import {
  PROCESS_STEPS, INTAKE_CHECKLIST, INTAKE_FIELDS,
  DATA_WIPE_OPTIONS, QA_TESTS, QA_COSMETIC, TIME_DATA, TOOLS,
  type IntakeField, type TimeRow,
} from './data';

export const metadata: Metadata = {
  title: 'Operations & Prozesse',
  description: 'Refurbishment-Prozess, Standard Operating Procedures und Qualitätskontrolle',
};

export default function OperationsPage() {
  return (
    <>
      <PageHeader
        title="Operations & Prozesse"
        subtitle="Refurbishment-Prozess, Standard Operating Procedures und Qualitätskontrolle"
      />

      {/* Operative Kennzahlen */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Operative Kennzahlen</h2>
        <MetricGrid columns={4}>
          <MetricCard label="Geräte/Monat refurbished" value="25-35" subtitle="Aktuelle Kapazität" />
          <MetricCard label="Aktive Zeit pro Gerät" value="~2-3h" subtitle="Durchschnitt" />
          <MetricCard label="Ziel: Lagerdauer" value="<30 Tage" subtitle="STORAGE_DAYS" />
          <MetricCard label="Ziel: Wiederverwertung" value=">80%" subtitle="PROC_RATE" />
        </MetricGrid>
        <p className="mt-2 text-xs text-text-muted">
          <Badge variant="estimated">KPI</Badge>{' '}
          Definiert in KMS Framework (C_Kennzahlen_und_Reporting)
        </p>
      </section>

      {/* Refurbishment-Prozess Übersicht */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Refurbishment-Prozess Übersicht</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Von Spende bis Verkauf</CardTitle>
          </CardHeader>
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg bg-bg-light p-6">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.number} className="flex items-center gap-2">
                <div className={`rounded-lg p-3 text-center shadow-sm ${
                  step.active ? 'bg-primary text-white' : 'bg-white'
                }`}>
                  <span className="block text-xl font-bold">{step.number}</span>
                  <span className="text-xs">{step.name}</span>
                </div>
                {i < PROCESS_STEPS.length - 1 && (
                  <span className="text-lg text-text-muted">&rarr;</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Step 1: Intake */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">1. Geräte-Intake</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Annahme-Prozess</CardTitle>
                <TimeBadge>5-10 Min/Gerät</TimeBadge>
              </div>
            </CardHeader>
            <p className="mb-3 text-xs text-text-muted">
              <strong>Wer:</strong> Empfangsmitarbeiter/in oder Werkstattleitung
            </p>
            <Checklist items={INTAKE_CHECKLIST} />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intake-Log Felder</CardTitle>
            </CardHeader>
            <Table<IntakeField>
              columns={[
                { key: 'field', header: 'Feld', render: (r) => <span className="font-medium">{r.field}</span> },
                { key: 'example', header: 'Beispiel' },
              ]}
              data={INTAKE_FIELDS}
              keyExtractor={(r) => r.field}
              compact
            />
          </Card>
        </div>
      </section>

      <TriageSection />

      {/* Step 3: Datenlöschung */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">3. Datenlöschung</h2>
        <div className="mb-4 rounded-lg border-l-4 border-l-red-500 bg-red-50 p-4">
          <strong>WICHTIG:</strong> Dieser Schritt ist OBLIGATORISCH für alle Geräte mit Festplatten!
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DATA_WIPE_OPTIONS.map((opt) => (
            <Card key={opt.title}>
              <CardHeader>
                <CardTitle>{opt.title}</CardTitle>
              </CardHeader>
              <p className="mb-3 text-xs text-text-muted">{opt.subtitle}</p>
              <Checklist items={opt.steps} />
              <div className="mt-3">
                <TimeBadge>{opt.duration}</TimeBadge>
              </div>
            </Card>
          ))}
        </div>
        <Card className="mt-4 bg-emerald-50">
          <h4 className="text-sm font-semibold">Dokumentation:</h4>
          <p className="mt-1 text-sm text-text-light">
            Lösch-Zertifikat ausdrucken und bei Gerät archivieren. Wichtig für Corporate Spender!
          </p>
        </Card>
      </section>

      <RefurbishmentStepsSection />

      {/* Step 7: QA */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">7. Qualitätskontrolle</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Finale Tests</CardTitle>
                <TimeBadge>10-15 Min</TimeBadge>
              </div>
            </CardHeader>
            <Checklist items={QA_TESTS} />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kosmetische Prüfung</CardTitle>
            </CardHeader>
            <Checklist items={QA_COSMETIC} />
            <h4 className="mb-2 mt-4 text-sm font-semibold">Dokumentation:</h4>
            <div className="space-y-2 text-sm">
              {['QA-Status → Pass / Fail', 'QA-Datum → [Datum]', 'QA-Techniker → [Name]', 'Bemerkungen → [Notizen]'].map((item) => (
                <div key={item} className="flex justify-between rounded bg-bg-light px-3 py-2">
                  <span className="text-text-muted">{item.split(' → ')[0]}</span>
                  <span>{item.split(' → ')[1]}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm font-medium text-red-600">
              Bei FAIL: Zurück zu entsprechendem Schritt, Problem beheben, erneut testen.
            </p>
          </Card>
        </div>
      </section>

      {/* Step 8: Pricing & Listing */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">8. Pricing & Listing</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Preisbestimmung</CardTitle>
            </CardHeader>
            <p className="mb-3 text-sm text-text-muted">
              Basierend auf unserem <a href="/preismodell">Solidarischen 4-Stufen-Preismodell</a>
            </p>
            <h4 className="mb-2 text-sm font-semibold">Faktoren:</h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-text-light">
              <li>Alter des Geräts</li>
              <li>CPU-Performance</li>
              <li>RAM-Grösse</li>
              <li>SSD vs. HDD</li>
              <li>Display-Qualität</li>
              <li>Zustand</li>
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Webshop-Listing</CardTitle>
                <TimeBadge>15-20 Min</TimeBadge>
              </div>
            </CardHeader>
            <Checklist items={[
              'Fotos machen (min. 3: Front, Keyboard, Anschlüsse)',
              'Specs auflisten (CPU, RAM, Storage, Display)',
              'Beschreibung schreiben (Template)',
              'Preis festlegen (Normal + andere Stufen)',
              'In Webshop hochladen',
            ]} />
          </Card>
        </div>
      </section>

      {/* Zeitaufwand-Übersicht */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Zeitaufwand-Übersicht</h2>
        <Card>
          <Table<TimeRow>
            columns={[
              { key: 'step', header: 'Schritt' },
              { key: 'duration', header: 'Dauer (Durchschnitt)' },
              { key: 'type', header: 'Art', render: (r) => (
                <span className={r.type === 'Passiv' ? 'text-text-muted' : ''}>
                  {r.type}
                </span>
              )},
            ]}
            data={TIME_DATA}
            keyExtractor={(r) => r.step}
            compact
          />
          {/* Summary row */}
          <div className="mt-2 flex justify-between rounded bg-bg-light px-3 py-3 text-sm font-bold">
            <span>TOTAL (aktiv)</span>
            <span>~2-3 Stunden</span>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            <Badge variant="derived">SOP</Badge>{' '}
            Standard_Operating_Procedure.md, Version 1.0
          </p>
        </Card>
      </section>

      {/* Werkzeuge & Materialien */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Werkzeuge & Materialien</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Card key={tool.title} className="border-l-4 border-l-primary">
              <h4 className="mb-3 text-base font-semibold">{tool.icon} {tool.title}</h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-text-light">
                {tool.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <WarehouseSection />
    </>
  );
}
