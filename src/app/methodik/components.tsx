// ---------------------------------------------------------------------------
// Methodik page helper components and column configs with render functions.
// ---------------------------------------------------------------------------

import Badge from '@/components/ui/Badge';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import type { CO2Row, DataGapRow, AccountRow, PricingRow } from './data';
import {
  ACCOUNTS,
  ACCOUNT_COLUMNS,
  CO2_DATA,
  PRICING_EXAMPLE,
  PRICING_COLUMNS,
  DATA_GAPS,
} from './data';

// ---------------------------------------------------------------------------
// Column configs that contain JSX render functions
// ---------------------------------------------------------------------------

export const CO2_COLUMNS = [
  { key: 'manufacturer', header: 'Hersteller' },
  { key: 'model', header: 'Modell' },
  {
    key: 'co2Kg',
    header: 'CO\u2082 (kg)',
    align: 'right' as const,
    render: (row: CO2Row) => <span className="font-semibold">{row.co2Kg.toFixed(1)}</span>,
  },
  {
    key: 'source',
    header: 'Quelle',
    render: (row: CO2Row) => (
      <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
        {row.source}
      </a>
    ),
  },
];

export const DATA_GAP_COLUMNS = [
  { key: 'dataPoint', header: 'Datenpunkt' },
  {
    key: 'priority',
    header: 'Priorität',
    render: (row: DataGapRow) => (
      <span className={`font-semibold ${row.priorityColor}`}>{row.priority}</span>
    ),
  },
  { key: 'whyImportant', header: 'Warum wichtig' },
  { key: 'howToFix', header: 'Wie beheben' },
];

// ---------------------------------------------------------------------------
// Reusable sub-components
// ---------------------------------------------------------------------------

export function FormulaBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-blue-200 bg-blue-50 p-4 font-mono text-sm">
      {children}
    </div>
  );
}

export function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { label: 'Konfidenz: Hoch', variant: 'success' as const },
    medium: { label: 'Konfidenz: Mittel', variant: 'warning' as const },
    low: { label: 'Konfidenz: Niedrig', variant: 'danger' as const },
  };
  const { label, variant } = config[level];
  return <Badge variant={variant}>{label}</Badge>;
}

export function MethodologySection({
  id,
  title,
  badgeLabel,
  badgeVariant,
  confidence,
  confidenceNote,
  children,
}: {
  id: string;
  title: string;
  badgeLabel?: string;
  badgeVariant?: 'success' | 'derived' | 'warning' | 'estimated';
  confidence: 'high' | 'medium' | 'low';
  confidenceNote?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {badgeLabel && <Badge variant={badgeVariant}>{badgeLabel}</Badge>}
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        {children}
        <div className="mt-6 flex items-center gap-2">
          <ConfidenceBadge level={confidence} />
          {confidenceNote && (
            <span className="text-xs text-text-muted">{confidenceNote}</span>
          )}
        </div>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section components — extracted to keep page.tsx under 300 lines
// ---------------------------------------------------------------------------

export function IncomeDataSection() {
  return (
    <MethodologySection
      id="income-data"
      title="1. Einnahmen-Daten"
      badgeLabel="Quelldaten"
      badgeVariant="success"
      confidence="high"
    >
      <p className="mb-4 text-sm text-text-light">
        Die Einnahmen-Daten sind die einzigen direkten Quelldaten im Dashboard.
        Sie werden direkt aus der Kivitendo-Buchhaltung exportiert.
      </p>

      <h4 className="mb-2 text-sm font-medium">Kivitendo-Konten:</h4>
      <Table
        columns={ACCOUNT_COLUMNS}
        data={ACCOUNTS}
        keyExtractor={(row: AccountRow) => row.account}
        compact
        className="mb-4"
      />

      <h4 className="mb-2 text-sm font-medium">Verifizierung:</h4>
      <p className="text-sm text-text-muted">
        Jeder Wert kann direkt in{' '}
        <code className="rounded bg-bg-light px-1">revamp-Einnahmen-2025.xlsx</code>{' '}
        nachgeschlagen werden. Die Datei enthält monatliche Werte für jedes Konto.
      </p>
    </MethodologySection>
  );
}

export function SelfFinancingSection() {
  return (
    <MethodologySection
      id="self-financing"
      title="2. Eigenfinanzierungsgrad"
      badgeLabel="Berechnet"
      badgeVariant="derived"
      confidence="high"
      confidenceNote="(Berechnung aus Quelldaten)"
    >
      <p className="mb-4 text-sm text-text-light">
        Der Eigenfinanzierungsgrad zeigt, wie viel der Einnahmen durch eigene
        Wirtschaftstätigkeit erwirtschaftet wird (ohne Spenden).
      </p>

      <FormulaBox>
        <strong>Formel:</strong><br />
        Eigenfinanzierungsgrad = (Warenverkauf + Dienstleistungen + Integration) / Gesamteinnahmen &times; 100%
      </FormulaBox>

      <h4 className="mb-2 text-sm font-medium">Bedeutung:</h4>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li><strong>&gt;60%:</strong> Hohe Unabhängigkeit von Spenden (Ziel)</li>
        <li><strong>40-60%:</strong> Mischfinanzierung</li>
        <li><strong>&lt;40%:</strong> Starke Spendenabhängigkeit</li>
      </ul>

      <h4 className="mb-2 text-sm font-medium">Treiber:</h4>
      <ul className="list-disc space-y-1 pl-6 text-sm">
        <li>Anzahl verkaufter Geräte</li>
        <li>Durchschnittlicher Verkaufspreis</li>
        <li>Anzahl Dienstleistungsaufträge</li>
      </ul>
    </MethodologySection>
  );
}

export function DeviceEstimationSection() {
  return (
    <MethodologySection
      id="device-estimation"
      title="3. Geräteanzahl-Schätzung"
      badgeLabel="Schätzung"
      badgeVariant="estimated"
      confidence="low"
    >
      <p className="mb-4 text-sm text-text-light">
        Da keine Stückzahlen in Kivitendo erfasst werden, schätzen wir die
        Geräteanzahl aus den Einnahmen.
      </p>

      <FormulaBox>
        <strong>Formel:</strong><br />
        Geschätzte Geräte = Warenverkauf (CHF) / Durchschnittspreis (CHF 150)
      </FormulaBox>

      <h4 className="mb-2 text-sm font-medium">Annahmen:</h4>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li>Durchschnittspreis pro Gerät: <strong>CHF 150</strong></li>
        <li>Alle Einnahmen auf Konto 3100 sind Geräteverkäufe</li>
        <li>Keine Unterscheidung nach Gerätetyp</li>
      </ul>

      <h4 className="mb-2 text-sm font-medium">Limitationen:</h4>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm text-danger">
        <li>Zubehör (Kabel, Tastaturen, Mäuse) ist mitgezählt</li>
        <li>Grosse Preisvariation (CHF 50 - 500)</li>
        <li>Keine Unterscheidung Laptop/Desktop/Tablet</li>
        <li>Durchschnittspreis ist Schätzung, nicht berechnet</li>
      </ul>

      <div className="rounded-lg border-l-4 border-danger bg-danger-bg p-4">
        <p className="text-sm font-medium text-danger">
          KRITISCH: Stückzahlen sollten in Kivitendo erfasst werden.
          Das würde diese Schätzung überflüssig machen.
        </p>
      </div>
    </MethodologySection>
  );
}

export function CO2CalculationSection() {
  return (
    <MethodologySection
      id="co2-calculation"
      title="4. CO&#x2082;-Berechnung"
      badgeLabel="Berechnet"
      badgeVariant="derived"
      confidence="high"
      confidenceNote="(Hersteller-LCA-Reports für bekannte Modelle)"
    >
      <p className="mb-4 text-sm text-text-light">
        Die CO&#x2082;-Ersparnis wird basierend auf <strong>Hersteller-spezifischen Life Cycle Assessment (LCA) Reports</strong> berechnet.
      </p>

      <FormulaBox>
        <strong>Formel (für bekannte Modelle):</strong><br />
        CO&#x2082; vermieden = SUM(CO2_LCA_Total_kg pro Gerät)
      </FormulaBox>
      <FormulaBox>
        <strong>Formel (für unbekannte Modelle):</strong><br />
        CO&#x2082; vermieden = SUM(Gewicht_kg &times; CO2_Faktor_kg_per_kg)
      </FormulaBox>

      <h4 className="mb-2 mt-4 text-sm font-medium">Hersteller-spezifische CO&#x2082;-Werte (High Confidence):</h4>
      <Table
        columns={CO2_COLUMNS}
        data={CO2_DATA}
        keyExtractor={(row: CO2Row) => `${row.manufacturer}-${row.model}`}
        compact
        className="mb-4"
      />

      <h4 className="mb-2 mt-4 text-sm font-medium">Datenquellen (Peer-Reviewed Studien):</h4>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li>
          <strong>MDPI Sustainability (2025):</strong>{' '}
          <a href="https://www.mdpi.com/2071-1050/17/10/4455" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Environmental and Economic Assessment Desktop vs. Laptop
          </a>{' '}
          - Business Laptop Durchschnitt: 300 kg CO&#x2082;
        </li>
        <li>
          <strong>ScienceDirect (2023):</strong>{' '}
          <a href="https://www.sciencedirect.com/science/article/pii/S1364032123002794" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Assessing embodied carbon emissions
          </a>{' '}
          - Monitore: 200-250 kg CO&#x2082;
        </li>
        <li>
          <strong>Circular Computing:</strong>{' '}
          <a href="https://circularcomputing.com/news/carbon-footprint-laptop/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Analysis of 231 Laptops
          </a>{' '}
          - Consumer Laptop Durchschnitt: 250 kg CO&#x2082;
        </li>
      </ul>

      <h4 className="mb-2 mt-4 text-sm font-medium">Methodik:</h4>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li><strong>Für bekannte Modelle:</strong> Direkte CO&#x2082;-Werte aus Hersteller-LCA-Reports (High Confidence)</li>
        <li><strong>Für unbekannte Modelle:</strong> Hersteller-Durchschnitt oder Kategorie-Durchschnitt (Medium Confidence)</li>
        <li><strong>Alle verkauften Geräte ersetzen Neukäufe</strong> (Avoided Burden Ansatz nach ISO 14040/14044)</li>
        <li>Alle Quellen sind direkt verlinkt und nachprüfbar</li>
      </ul>

      <h4 className="mb-2 text-sm font-medium">Limitationen:</h4>
      <ul className="list-disc space-y-1 pl-6 text-sm text-danger">
        <li>Falls Geräteanzahl geschätzt wird, entsteht Unsicherheit (siehe Geräte-Berechnung)</li>
        <li>Nicht alle Käufer hätten neu gekauft (konservative Annahme)</li>
        <li>Lebensdauerverlängerung durch Refurbishment wird separat gemessen (LIFETIME_YEARS)</li>
      </ul>
    </MethodologySection>
  );
}

export function EWasteSection() {
  return (
    <MethodologySection
      id="ewaste-calculation"
      title="5. E-Waste-Berechnung"
      badgeLabel="Schätzung"
      badgeVariant="estimated"
      confidence="low"
    >
      <p className="mb-4 text-sm text-text-light">
        Die E-Waste-Ersparnis wird ebenfalls aus der geschätzten Geräteanzahl abgeleitet.
      </p>

      <FormulaBox>
        <strong>Formel:</strong><br />
        E-Waste vermieden = Geschätzte Geräte &times; 10 kg/Gerät
      </FormulaBox>

      <h4 className="mb-2 text-sm font-medium">Annahmen:</h4>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li>Durchschnittliches Gerätegewicht: 10 kg</li>
        <li>Jedes wiederverwendete Gerät vermeidet Entsorgung</li>
      </ul>

      <h4 className="mb-2 text-sm font-medium">Limitationen:</h4>
      <ul className="list-disc space-y-1 pl-6 text-sm text-danger">
        <li>Gerätegewicht variiert stark (Laptop ~2kg, Desktop ~10kg)</li>
        <li>Nur das Gerät selbst, nicht Verpackung/Zubehör</li>
        <li>Basiert auf Geräteschätzung</li>
      </ul>
    </MethodologySection>
  );
}

export function PricingModelSection() {
  return (
    <MethodologySection
      id="pricing-model"
      title="6. Preismodell-Methodik"
      badgeLabel="Berechnet / Entscheidung"
      badgeVariant="derived"
      confidence="medium"
      confidenceNote="(Entscheidungen dokumentiert, Marktvergleich nicht automatisiert)"
    >
      <p className="mb-4 text-sm text-text-light">
        Das solidarische Preismodell basiert auf einer Kombination aus Marktdaten,
        externen Standards und Vorstandsentscheidungen.
      </p>

      <h4 className="mb-2 text-sm font-medium">6.1 Normalpreis (Marktvergleich)</h4>
      <FormulaBox>
        <strong>Methode:</strong><br />
        Vergleich mit ähnlichen Angeboten auf Ricardo, Tutti, Revendo, eBay Kleinanzeigen
      </FormulaBox>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li><strong>Quelle:</strong> Manuelle Marktbeobachtung</li>
        <li><strong>Konfidenz:</strong> Mittel (variiert je nach Gerät)</li>
        <li><strong>Beispiel:</strong> ThinkPad X270 i5/8GB &rarr; Ricardo CHF 180-250 &rarr; Normalpreis CHF 200</li>
      </ul>

      <h4 className="mb-2 text-sm font-medium">6.2 KulturLegi-Rabatt (50%)</h4>
      <FormulaBox>
        <strong>Formel:</strong><br />
        KulturLegi-Preis = Normalpreis &times; 0.5
      </FormulaBox>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li><strong>Quelle:</strong> Vorstandsentscheidung (Januar 2025)</li>
        <li><strong>Begründung:</strong> Einheitlicher, leicht kommunizierbarer Rabatt</li>
        <li><strong>KulturLegi-Einkommensgrenze:</strong> ca. CHF 2&apos;600/Monat (Einzelperson)</li>
        <li><strong>Externe Quelle:</strong>{' '}
          <a href="https://www.kulturlegi.ch" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            kulturlegi.ch
          </a>
        </li>
      </ul>

      <h4 className="mb-2 text-sm font-medium">6.3 Supporter-Aufschlag (+20% bis +50%)</h4>
      <FormulaBox>
        <strong>Formel:</strong><br />
        Supporter-Preis = Normalpreis &times; (1 + Aufschlag)<br />
        <span className="text-xs">wobei Aufschlag = 0.2 bis 0.5 (empfohlen)</span>
      </FormulaBox>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
        <li><strong>Quelle:</strong> Vorstandsentscheidung (Januar 2025)</li>
        <li><strong>Begründung +20%:</strong> Niedrige Einstiegshürde (CHF 40 bei CHF 200 Gerät)</li>
        <li><strong>Begründung +50%:</strong> Signifikanter Impact ohne zu hohe Abschreckung</li>
        <li><strong>Buchung:</strong> Aufschlag wird separat auf Konto 3510 verbucht</li>
      </ul>

      <h4 className="mb-2 text-sm font-medium">Preis-Beispiel vollständig nachvollziehbar:</h4>
      <Table
        columns={PRICING_COLUMNS}
        data={PRICING_EXAMPLE}
        keyExtractor={(row: PricingRow) => row.tier}
        compact
      />
    </MethodologySection>
  );
}

export function DataGapsSection() {
  return (
    <section id="data-gaps" className="scroll-mt-8">
      <Card>
        <CardHeader>
          <CardTitle>7. Datenlücken</CardTitle>
        </CardHeader>
        <p className="mb-4 text-sm text-text-light">
          Folgende Daten fehlen komplett und können nicht einmal geschätzt werden:
        </p>
        <Table
          columns={DATA_GAP_COLUMNS}
          data={DATA_GAPS}
          keyExtractor={(row: DataGapRow) => row.dataPoint}
          compact
        />
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Integrity Report — merged from former /transparenz page
// ---------------------------------------------------------------------------

interface IntegrityRow {
  id: string;
  name: string;
  category: string;
  sourceType: string;
  confidence: string;
  isClickable: boolean;
  isVerifiable: boolean;
}

function computeTransparencyStats(NumberSources: Record<string, { name: string; category: string; source?: { type?: string; confidence?: string; path?: string; account?: string }; formula?: { dependencies?: string[] } }>) {
  const metrics = Object.values(NumberSources);
  const total = metrics.length;
  const clickable = metrics.filter((m) => m.source?.path || m.formula).length;
  const verifiable = metrics.filter((m) => {
    if (m.source?.path) return true;
    if (m.source?.account) return true;
    if (m.formula?.dependencies?.every((dep: string) => NumberSources[dep] !== undefined)) return true;
    return false;
  }).length;
  const highConfidence = metrics.filter((m) => m.source?.confidence === 'high').length;
  return { total, clickable, verifiable, highConfidence };
}

function buildIntegrityRows(NumberSources: Record<string, { name: string; category: string; source?: { type?: string; confidence?: string; path?: string; account?: string }; formula?: { dependencies?: string[] } }>): IntegrityRow[] {
  return Object.entries(NumberSources).map(([key, m]) => ({
    id: key,
    name: m.name,
    category: m.category,
    sourceType: m.source?.type ?? '--',
    confidence: m.source?.confidence ?? 'unknown',
    isClickable: !!(m.source?.path || m.formula),
    isVerifiable: !!m.source?.path || !!m.source?.account || !!(m.formula?.dependencies?.every((dep: string) => NumberSources[dep] !== undefined)),
  }));
}

const CONFIDENCE_BADGE_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  high: { label: 'High', variant: 'success' },
  medium: { label: 'Medium', variant: 'warning' },
  low: { label: 'Low', variant: 'danger' },
  unknown: { label: 'Unbekannt', variant: 'default' },
};

const INTEGRITY_COLUMNS = [
  {
    key: 'name',
    header: 'Zahl',
    render: (row: IntegrityRow) => <span className="font-medium">{row.name}</span>,
  },
  { key: 'category', header: 'Kategorie' },
  { key: 'sourceType', header: 'Type' },
  {
    key: 'confidence',
    header: 'Confidence',
    render: (row: IntegrityRow) => {
      const conf = CONFIDENCE_BADGE_MAP[row.confidence] ?? CONFIDENCE_BADGE_MAP.unknown;
      return <Badge variant={conf.variant}>{conf.label}</Badge>;
    },
  },
  {
    key: 'isClickable',
    header: 'Klickbar',
    align: 'center' as const,
    render: (row: IntegrityRow) => (
      <span className={row.isClickable ? 'text-success' : 'text-danger'}>
        {row.isClickable ? 'Ja' : 'Nein'}
      </span>
    ),
  },
  {
    key: 'isVerifiable',
    header: 'Verifizierbar',
    align: 'center' as const,
    render: (row: IntegrityRow) => (
      <span className={row.isVerifiable ? 'text-success' : 'text-danger'}>
        {row.isVerifiable ? 'Ja' : 'Nein'}
      </span>
    ),
  },
];

export function IntegrityReportSection({ NumberSources }: { NumberSources: Record<string, { name: string; category: string; source?: { type?: string; confidence?: string; path?: string; account?: string }; formula?: { dependencies?: string[] } }> }) {
  const stats = computeTransparencyStats(NumberSources);
  const rows = buildIntegrityRows(NumberSources);

  return (
    <section id="integrity-report" className="scroll-mt-8">
      <Card>
        <CardHeader>
          <CardTitle>8. Zahlen-Integritäts-Report</CardTitle>
        </CardHeader>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-bg-light p-3 text-center">
            <span className="block text-2xl font-bold">{stats.total}</span>
            <span className="text-xs text-text-muted">Total Zahlen</span>
          </div>
          <div className="rounded-lg bg-bg-light p-3 text-center">
            <span className="block text-2xl font-bold">{stats.clickable}</span>
            <span className="text-xs text-text-muted">Klickbar</span>
          </div>
          <div className="rounded-lg bg-bg-light p-3 text-center">
            <span className="block text-2xl font-bold">{stats.verifiable}</span>
            <span className="text-xs text-text-muted">Verifizierbar</span>
          </div>
          <div className="rounded-lg bg-bg-light p-3 text-center">
            <span className="block text-2xl font-bold">{stats.highConfidence}</span>
            <span className="text-xs text-text-muted">High Confidence</span>
          </div>
        </div>

        <Table
          columns={INTEGRITY_COLUMNS}
          data={rows}
          keyExtractor={(row) => row.id}
          compact
        />
      </Card>
    </section>
  );
}

export function TransparencyPrinciplesSection() {
  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-semibold text-grey-dark">Transparenz-Prinzipien</h2>
      <Card>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h4 className="mb-3 font-medium">Was wir tun</h4>
            <ul className="list-disc space-y-1 pl-6 text-sm">
              <li>Nur echte Daten aus Kivitendo verwenden</li>
              <li>Jede Berechnung dokumentieren</li>
              <li>Annahmen offenlegen</li>
              <li>Limitationen klar benennen</li>
              <li>Datenlücken dokumentieren</li>
              <li>Cross-Validierungen durchführen</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-medium">Was wir nicht tun</h4>
            <ul className="list-disc space-y-1 pl-6 text-sm">
              <li>Keine erfundenen Zahlen</li>
              <li>Keine Schönfärberei</li>
              <li>Keine versteckten Annahmen</li>
              <li>Keine Pseudo-Präzision</li>
              <li>Keine unbelegten Behauptungen</li>
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
}
