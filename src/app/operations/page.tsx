import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import Table from '@/components/ui/Table';

export const metadata: Metadata = {
  title: 'Operations & Prozesse',
  description: 'Refurbishment-Prozess, Standard Operating Procedures und Qualitätskontrolle',
};

/* ────────────────────────────────────────────
   Static data for this page
   ──────────────────────────────────────────── */

const PROCESS_STEPS = [
  { number: 1, name: 'INTAKE', active: false },
  { number: 2, name: 'TRIAGE', active: false },
  { number: 3, name: 'LÖSCHUNG', active: false },
  { number: 4, name: 'REINIGUNG', active: false },
  { number: 5, name: 'UPGRADE', active: false },
  { number: 6, name: 'LINUX', active: true },
  { number: 7, name: 'QA', active: false },
  { number: 8, name: 'VERKAUF', active: false },
] as const;

const INTAKE_CHECKLIST = [
  'Gerät entgegennehmen',
  'Spendenbestätigung ausstellen (falls gewünscht)',
  'Kurze Sichtprüfung: Offensichtliche Schäden?',
  'Intake-Nummer vergeben: JJJJ-MM-NNN',
  'Etikette mit Intake-Nummer anbringen',
  'In Intake-Log eintragen',
] as const;

type IntakeField = { field: string; example: string };

const INTAKE_FIELDS: IntakeField[] = [
  { field: 'Datum', example: '2025-11-15' },
  { field: 'Intake-Nummer', example: '2025-11-042' },
  { field: 'Gerätetyp', example: 'Laptop' },
  { field: 'Marke/Modell', example: 'Lenovo ThinkPad T480' },
  { field: 'Spender', example: '(optional)' },
  { field: 'Zustand', example: 'Gut / Mittel / Schlecht' },
];

const VISUAL_INSPECTION = [
  'Gehäuse-Zustand',
  'Display (bei Laptops/Monitors)',
  'Anschlüsse',
  'Tastatur/Trackpad',
] as const;

const COMPONENT_CHECK = [
  'RAM-Typ & -Grösse',
  'Festplatte/SSD',
  'Prozessor (CPU)',
  'Grafikkarte (falls diskret)',
] as const;

const HARDWARE_TESTS = [
  'BIOS-Zugang testen',
  'Boot-Test (von USB-Stick)',
  'RAM-Test (MemTest86+)',
  'Festplatten-Test (S.M.A.R.T.)',
  'Display-Test (Pixelfehler)',
  'Tastatur-Test',
  'WiFi/Bluetooth',
  'Akku-Test (bei Laptops)',
] as const;

const CATEGORIES = [
  { label: 'Kategorie A', color: 'bg-emerald-100 text-emerald-800', title: 'Ready for Refurbishment', description: 'Voll funktionsfähig' },
  { label: 'Kategorie B', color: 'bg-amber-100 text-amber-800', title: 'Repair Needed', description: 'Kleine Reparaturen' },
  { label: 'Kategorie C', color: 'bg-blue-100 text-blue-800', title: 'Parts Only', description: 'Ersatzteillager' },
  { label: 'Kategorie D', color: 'bg-red-100 text-red-800', title: 'E-Waste', description: 'Fachgerecht recyceln' },
] as const;

const DATA_WIPE_OPTIONS = [
  {
    title: 'Option A: DBAN',
    subtitle: "Darik's Boot and Nuke",
    steps: ['Von DBAN-USB booten', 'DoD Short (3 Pässe) auswählen', 'Löschen starten', 'Protokoll speichern'],
    duration: '2-8 Stunden (passiv)',
  },
  {
    title: 'Option B: ATA Secure Erase',
    subtitle: 'Linux-basiert',
    steps: ['Von Linux Live-System booten', 'hdparm --security-erase', 'Verifizieren'],
    duration: '1-2 Stunden',
  },
  {
    title: 'Option C: Physikalisch',
    subtitle: 'Bei defekten Platten',
    steps: ['Festplatte entfernen', 'Mit Bohrmaschine Löcher bohren', 'Als E-Waste markieren'],
    duration: '5 Minuten',
  },
] as const;

const CLEANING_EXTERNAL = [
  'Gehäuse abwischen (Isopropanol)',
  'Tastatur reinigen',
  'Display reinigen',
  'Anschlüsse ausblasen',
] as const;

const CLEANING_INTERNAL = [
  'Lüfter ausblasen',
  'Kühlrippen reinigen',
  'Wärmeleitpaste erneuern',
] as const;

const LINUX_DISTROS = [
  { target: 'Anfänger', distro: 'Linux Mint' },
  { target: 'Leichtgewichtig', distro: 'Lubuntu/Xubuntu' },
  { target: 'Power-User', distro: 'Debian/Fedora' },
  { target: 'Spezial', distro: 'Nach Kundenwunsch' },
] as const;

const QA_TESTS = [
  'System bootet korrekt',
  'Display funktioniert',
  'Tastatur funktioniert',
  'Trackpad/Maus funktioniert',
  'WiFi verbindet',
  'Sound funktioniert',
  'USB-Ports funktionieren',
  'Webcam (falls vorhanden)',
  'Software installiert & funktioniert',
  'Keine Fehlermeldungen',
  'Performance akzeptabel',
] as const;

const QA_COSMETIC = [
  'Gerät sauber',
  'Keine losen Teile',
  'Display ohne Kratzer',
  'Tastatur vollständig',
] as const;

type TimeRow = { step: string; duration: string; type: string };

const TIME_DATA: TimeRow[] = [
  { step: '1. Intake', duration: '5-10 Min', type: 'Aktiv' },
  { step: '2. Triage & Testing', duration: '25-45 Min', type: 'Aktiv' },
  { step: '3. Datenlöschung', duration: '2-8 Stunden', type: 'Passiv' },
  { step: '4. Reinigung', duration: '15-30 Min', type: 'Aktiv' },
  { step: '5. Hardware-Upgrade', duration: '10-30 Min', type: 'Aktiv' },
  { step: '6. Linux-Installation', duration: '35-50 Min', type: 'Semi-Aktiv' },
  { step: '7. Qualitätskontrolle', duration: '10-15 Min', type: 'Aktiv' },
  { step: '8. Pricing & Listing', duration: '15-20 Min', type: 'Aktiv' },
];

const TOOLS = [
  {
    icon: '🔧',
    title: 'Werkzeuge',
    items: ['Schraubendreher-Set (Kreuz, Torx)', 'Antistatik-Armband', 'Multimeter', 'USB-Sticks (Boot-Tools)', 'Etiketten-Drucker'],
  },
  {
    icon: '🧴',
    title: 'Verbrauchsmaterial',
    items: ['Isopropanol', 'Mikrofaser-Tücher', 'Druckluft-Dosen', 'Bubble-Wrap', 'Versand-Kartons', 'Etiketten'],
  },
  {
    icon: '💾',
    title: 'Software',
    items: ['MemTest86+', 'DBAN', 'Linux Mint ISO', 'GParted', 'hwinfo'],
  },
] as const;

/* ────────────────────────────────────────────
   Reusable checklist component (inline)
   ──────────────────────────────────────────── */

function Checklist({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 border-b border-border pb-2 text-sm last:border-0">
          <span className="text-text-muted">☐</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TimeBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
      {children}
    </span>
  );
}

/* ────────────────────────────────────────────
   Page Component
   ──────────────────────────────────────────── */

export default function OperationsPage() {
  return (
    <>
      <PageHeader
        title="Operations & Prozesse"
        subtitle="Refurbishment-Prozess, Standard Operating Procedures und Qualitätskontrolle"
      />

      {/* Operative Kennzahlen */}
      <section className="mb-10">
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
      <section className="mb-10">
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
                  <span className="text-lg text-text-muted">→</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Step 1: Intake */}
      <section className="mb-10">
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

      {/* Step 2: Triage & Testing */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">2. Triage & Testing</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Erstbewertung</CardTitle>
                <TimeBadge>10-15 Min</TimeBadge>
              </div>
            </CardHeader>
            <p className="mb-3 text-xs text-text-muted">
              <strong>Wer:</strong> Techniker/in
            </p>
            <h4 className="mb-2 text-sm font-semibold">Visuelle Inspektion:</h4>
            <Checklist items={VISUAL_INSPECTION} />
            <h4 className="mb-2 mt-4 text-sm font-semibold">Komponenten prüfen:</h4>
            <Checklist items={COMPONENT_CHECK} />
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Funktionstest</CardTitle>
                <TimeBadge>15-30 Min</TimeBadge>
              </div>
            </CardHeader>
            <h4 className="mb-2 text-sm font-semibold">Hardware-Tests:</h4>
            <Checklist items={HARDWARE_TESTS} />
          </Card>
        </div>

        {/* Kategorisierung */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Kategorisierung – Entscheidungsbaum</CardTitle>
          </CardHeader>
          <pre className="overflow-x-auto rounded-lg bg-bg-light p-4 font-mono text-sm">
{`Gerät funktioniert vollständig?
├─ JA → Kategorie A (Refurbishment)
│
├─ TEILWEISE → Reparatur möglich & wirtschaftlich?
│  ├─ JA → Kategorie B (Reparatur nötig)
│  └─ NEIN → Kategorie C (Ersatzteile)
│
└─ NEIN → Kategorie D (Recycling)`}
          </pre>
          <MetricGrid columns={4} className="mt-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.label} className="text-center">
                <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${cat.color}`}>
                  {cat.label}
                </span>
                <p className="mt-2 text-xs text-text-muted">
                  {cat.title}<br />{cat.description}
                </p>
              </div>
            ))}
          </MetricGrid>
        </Card>
      </section>

      {/* Step 3: Datenlöschung */}
      <section className="mb-10">
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

      {/* Steps 4-6: Reinigung, Upgrade, Linux */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">4-6. Reinigung, Upgrade & Linux-Installation</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Reinigung */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>4. Reinigung</CardTitle>
                <TimeBadge>15-30 Min</TimeBadge>
              </div>
            </CardHeader>
            <h4 className="mb-2 text-sm font-semibold">Extern:</h4>
            <Checklist items={CLEANING_EXTERNAL} />
            <h4 className="mb-2 mt-4 text-sm font-semibold">Intern (bei Bedarf):</h4>
            <Checklist items={CLEANING_INTERNAL} />
          </Card>

          {/* Hardware-Upgrade */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>5. Hardware-Upgrade</CardTitle>
                <TimeBadge>10-30 Min</TimeBadge>
              </div>
            </CardHeader>
            <h4 className="mb-1 text-sm font-semibold">RAM-Upgrade:</h4>
            <p className="mb-3 text-sm text-text-light">Minimum: 4 GB (besser 8 GB)</p>
            <h4 className="mb-1 text-sm font-semibold">SSD-Upgrade:</h4>
            <p className="mb-3 text-sm text-text-light">Wenn Festplatte &lt; 250 GB oder defekt</p>
            <h4 className="mb-1 text-sm font-semibold">Weitere:</h4>
            <ul className="list-disc pl-5 text-sm text-text-light">
              <li>WiFi-Karte (wenn fehlend)</li>
              <li>Akku (wenn verfügbar)</li>
            </ul>
          </Card>

          {/* Linux-Installation */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>6. Linux-Installation</CardTitle>
                <TimeBadge>35-50 Min</TimeBadge>
              </div>
            </CardHeader>
            <h4 className="mb-2 text-sm font-semibold">Standard-Distributionen:</h4>
            <div className="space-y-2">
              {LINUX_DISTROS.map((d) => (
                <div key={d.target} className="flex justify-between rounded bg-bg-light px-3 py-2 text-sm">
                  <span className="text-text-muted">{d.target}</span>
                  <span className="font-medium">{d.distro}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-text-light">
              <strong>Default:</strong> Linux Mint (Cinnamon)
            </p>
          </Card>
        </div>
      </section>

      {/* Step 7: QA */}
      <section className="mb-10">
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
      <section className="mb-10">
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
      <section className="mb-10">
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
      <section className="mb-10">
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

      {/* Lager-Management */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Lager-Management Regeln</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Lagerdauer-Regeln</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded bg-bg-light px-4 py-3 text-sm">
                <strong>&lt; 30 Tage</strong>
                <span className="text-emerald-600">Ziel: Normaler Umschlag</span>
              </div>
              <div className="flex items-center justify-between rounded bg-bg-light px-4 py-3 text-sm">
                <strong>&gt; 3 Monate</strong>
                <span className="text-amber-600">Preis reduzieren</span>
              </div>
              <div className="flex items-center justify-between rounded bg-bg-light px-4 py-3 text-sm">
                <strong>&gt; 6 Monate</strong>
                <span className="text-red-600">Spenden oder Recyclen</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kapazitäts-Regeln</CardTitle>
            </CardHeader>
            <div className="mb-4 rounded-lg border-l-4 border-l-amber-400 bg-amber-50 p-3">
              <strong className="text-sm">Wenn Lager &gt; 200 Geräte:</strong>
            </div>
            <ul className="list-disc space-y-2 pl-5 text-sm text-text-light">
              <li>Annahmestopp für &ldquo;Low Quality&rdquo;</li>
              <li>Sofortiger &ldquo;Sale&rdquo; (Rabattaktion)</li>
              <li>Geräte spenden an Partner</li>
            </ul>
          </Card>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          <Badge variant="live">Quelldokument</Badge>{' '}
          Finanzstrategie_2025.md, Operative Kennzahlen
        </p>
      </section>
    </>
  );
}
