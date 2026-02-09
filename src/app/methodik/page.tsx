import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';

export const metadata: Metadata = {
  title: 'Methodik & Datenquellen',
  description: 'Vollständige Transparenz über alle Berechnungen und Annahmen',
};

// ---------------------------------------------------------------------------
// Data types legend
// ---------------------------------------------------------------------------

const DATA_TYPES = [
  {
    label: 'Quelldaten',
    confidence: 'Hohe Konfidenz',
    description: 'Direkt aus Kivitendo-Buchhaltung exportiert. Verifizierbar in Original-Excel.',
    badgeVariant: 'success' as const,
  },
  {
    label: 'Berechnet',
    confidence: 'Mittlere Konfidenz',
    description: 'Aus Quelldaten mathematisch abgeleitet. Formel dokumentiert.',
    badgeVariant: 'derived' as const,
  },
  {
    label: 'Schaetzung',
    confidence: 'Niedrige Konfidenz',
    description: 'Basiert auf Annahmen. Echte Daten fehlen.',
    badgeVariant: 'warning' as const,
  },
];

// ---------------------------------------------------------------------------
// Data pipeline steps
// ---------------------------------------------------------------------------

const PIPELINE_STEPS = [
  { label: 'Kivitendo', icon: 'Buchhaltung' },
  { label: 'Excel Export', icon: 'Datei' },
  { label: 'Python Import', icon: 'Verarbeitung' },
  { label: 'SQLite DB', icon: 'Datenbank' },
  { label: 'JSON Export', icon: 'API' },
  { label: 'Dashboard', icon: 'Anzeige', highlight: true },
];

// ---------------------------------------------------------------------------
// Table of contents
// ---------------------------------------------------------------------------

const TOC_ITEMS = [
  { id: 'income-data', label: '1. Einnahmen-Daten (Quelldaten)' },
  { id: 'self-financing', label: '2. Eigenfinanzierungsgrad (Berechnet)' },
  { id: 'device-estimation', label: '3. Geraeteanzahl-Schaetzung' },
  { id: 'co2-calculation', label: '4. CO\u2082-Berechnung' },
  { id: 'ewaste-calculation', label: '5. E-Waste-Berechnung' },
  { id: 'pricing-model', label: '6. Preismodell-Methodik' },
  { id: 'data-gaps', label: '7. Datenluecken' },
];

// ---------------------------------------------------------------------------
// Kivitendo accounts table data
// ---------------------------------------------------------------------------

interface AccountRow {
  account: string;
  name: string;
  dashboardName: string;
}

const ACCOUNTS: AccountRow[] = [
  { account: '3100', name: 'Produktverkaeufe', dashboardName: 'Warenverkauf' },
  { account: '3400', name: 'Dienstleistungserloese', dashboardName: 'Dienstleistungen' },
  { account: '3450', name: 'Integrations-Arbeitsplaetze', dashboardName: 'Integration' },
  { account: '3500', name: 'Spendenerloese', dashboardName: 'Spenden' },
  { account: '3510', name: 'Aufstockung Richtpreis', dashboardName: 'Aufstockung' },
  { account: '30-38', name: 'Nettoerl\u00f6se Total', dashboardName: 'Total' },
];

const ACCOUNT_COLUMNS = [
  { key: 'account', header: 'Konto' },
  { key: 'name', header: 'Name' },
  { key: 'dashboardName', header: 'Dashboard-Name' },
];

// ---------------------------------------------------------------------------
// CO2 reference data
// ---------------------------------------------------------------------------

interface CO2Row {
  manufacturer: string;
  model: string;
  co2Kg: number;
  source: string;
  sourceUrl: string;
}

const CO2_DATA: CO2Row[] = [
  { manufacturer: 'Lenovo', model: 'ThinkPad X13', co2Kg: 377.6, source: 'Lenovo Eco Declaration', sourceUrl: 'https://static.lenovo.com/ww/docs/eco-declaration/thinkpad-x13-gen-2.pdf' },
  { manufacturer: 'Lenovo', model: 'ThinkPad X1 Extreme', co2Kg: 244.6, source: 'Lenovo Eco Declaration', sourceUrl: 'https://static.lenovo.com/ww/docs/eco-declaration/thinkpad-x1-extreme-gen-5.pdf' },
  { manufacturer: 'Dell', model: 'Latitude 9520', co2Kg: 325.5, source: 'Dell PCF', sourceUrl: 'https://www.dell.com/en-us/lp/product-carbon-footprint' },
  { manufacturer: 'Dell', model: 'XPS 15 (9530)', co2Kg: 383.7, source: 'Dell PCF', sourceUrl: 'https://www.dell.com/en-us/lp/product-carbon-footprint' },
  { manufacturer: 'HP', model: 'EliteBook 865 G10', co2Kg: 176.4, source: 'HP PCF', sourceUrl: 'https://h20195.www2.hp.com/v2/getpdf.aspx/c09146959.pdf' },
  { manufacturer: 'Apple', model: 'MacBook Pro 16"', co2Kg: 348.0, source: 'Apple Environmental Report', sourceUrl: 'https://www.apple.com/environment/reports/' },
];

const CO2_COLUMNS = [
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

// ---------------------------------------------------------------------------
// Pricing example table
// ---------------------------------------------------------------------------

interface PricingRow {
  tier: string;
  calculation: string;
  result: string;
  source: string;
}

const PRICING_EXAMPLE: PricingRow[] = [
  { tier: 'Normal', calculation: 'Marktvergleich Ricardo/Tutti', result: 'CHF 200', source: 'Marktdaten' },
  { tier: 'KulturLegi', calculation: 'CHF 200 x 0.5', result: 'CHF 100', source: 'Vorstand' },
  { tier: 'Supporter +20%', calculation: 'CHF 200 x 1.2', result: 'CHF 240', source: 'Vorstand' },
  { tier: 'Supporter +50%', calculation: 'CHF 200 x 1.5', result: 'CHF 300', source: 'Vorstand' },
];

const PRICING_COLUMNS = [
  { key: 'tier', header: 'Stufe' },
  { key: 'calculation', header: 'Berechnung' },
  { key: 'result', header: 'Ergebnis' },
  { key: 'source', header: 'Quelle' },
];

// ---------------------------------------------------------------------------
// Data gaps table
// ---------------------------------------------------------------------------

interface DataGapRow {
  dataPoint: string;
  priority: string;
  priorityColor: string;
  whyImportant: string;
  howToFix: string;
}

const DATA_GAPS: DataGapRow[] = [
  { dataPoint: 'Geraete-Stueckzahlen', priority: 'Kritisch', priorityColor: 'text-danger', whyImportant: 'Alle Impact-Metriken haengen davon ab', howToFix: 'Artikelerfassung in Kivitendo' },
  { dataPoint: 'Ausgaben-Daten', priority: 'Kritisch', priorityColor: 'text-danger', whyImportant: 'Kein Gewinn/Verlust berechenbar', howToFix: 'Ausgaben-Export aus Kivitendo' },
  { dataPoint: 'Geraetetypen', priority: 'Hoch', priorityColor: 'text-warning', whyImportant: 'CO\u2082 und E-Waste variieren stark', howToFix: 'Kategorien definieren' },
  { dataPoint: 'Workshop-Teilnehmer', priority: 'Mittel', priorityColor: 'text-text-muted', whyImportant: 'Soziale Wirkung messen', howToFix: 'Anmeldeliste fuehren' },
  { dataPoint: 'Freiwilligenstunden', priority: 'Mittel', priorityColor: 'text-text-muted', whyImportant: 'Soziale Wirkung messen', howToFix: 'Zeiterfassung einfuehren' },
  { dataPoint: 'Linux-Installationen', priority: 'Niedrig', priorityColor: 'text-text-light', whyImportant: 'Software-Wirkung messen', howToFix: 'Bei Verkauf notieren' },
];

const DATA_GAP_COLUMNS = [
  { key: 'dataPoint', header: 'Datenpunkt' },
  {
    key: 'priority',
    header: 'Prioritaet',
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

function FormulaBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-blue-200 bg-blue-50 p-4 font-mono text-sm">
      {children}
    </div>
  );
}

function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { label: 'Konfidenz: Hoch', variant: 'success' as const },
    medium: { label: 'Konfidenz: Mittel', variant: 'warning' as const },
    low: { label: 'Konfidenz: Niedrig', variant: 'danger' as const },
  };
  const { label, variant } = config[level];
  return <Badge variant={variant}>{label}</Badge>;
}

function MethodologySection({
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
// Page
// ---------------------------------------------------------------------------

export default function MethodikPage() {
  return (
    <>
      <PageHeader
        title="Methodik & Datenquellen"
        subtitle="Vollstaendige Transparenz ueber alle Berechnungen und Annahmen"
      />
      <p className="mb-8 text-sm text-text-light">
        Jede Zahl im Dashboard ist hier erklaert und nachvollziehbar dokumentiert.
      </p>

      {/* Datentypen-Legende */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Datentypen</h2>
        <Card>
          <MetricGrid columns={3}>
            {DATA_TYPES.map((dt) => (
              <div key={dt.label} className="text-center">
                <Badge variant={dt.badgeVariant} className="text-sm">{dt.label}</Badge>
                <p className="mt-2 text-sm font-medium">{dt.confidence}</p>
                <p className="mt-1 text-xs text-text-muted">{dt.description}</p>
              </div>
            ))}
          </MetricGrid>
        </Card>
      </section>

      {/* Datenfluss */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Datenfluss</h2>
        <Card>
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg bg-bg-light p-4">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div
                  className={`min-w-[80px] rounded-lg p-3 text-center text-xs ${
                    step.highlight
                      ? 'bg-primary font-semibold text-white'
                      : 'bg-white'
                  }`}
                >
                  <span className="mb-1 block text-xs text-text-muted">{step.icon}</span>
                  {step.label}
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <span className="text-lg text-text-muted">&rarr;</span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-text-muted">
            Quelldatei: <code className="rounded bg-bg-light px-1">revamp-Einnahmen-2025.xlsx</code> |
            Dokumentation: <code className="rounded bg-bg-light px-1">DATA_ARCHITECTURE.md</code> im{' '}
            <a href="https://cloud.revamp-it.ch" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Nextcloud
            </a>
          </p>
        </Card>
      </section>

      {/* Inhaltsverzeichnis */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Inhaltsverzeichnis</h2>
        <Card>
          <nav>
            <ul className="divide-y divide-border">
              {TOC_ITEMS.map((item) => (
                <li key={item.id} className="py-2">
                  <a href={`#${item.id}`} className="text-sm text-primary hover:underline">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Card>
      </section>

      {/* 1. Einnahmen-Daten */}
      <div className="space-y-8">
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
            keyExtractor={(row) => row.account}
            compact
            className="mb-4"
          />

          <h4 className="mb-2 text-sm font-medium">Verifizierung:</h4>
          <p className="text-sm text-text-muted">
            Jeder Wert kann direkt in{' '}
            <code className="rounded bg-bg-light px-1">revamp-Einnahmen-2025.xlsx</code>{' '}
            nachgeschlagen werden. Die Datei enthaelt monatliche Werte fuer jedes Konto.
          </p>
        </MethodologySection>

        {/* 2. Eigenfinanzierungsgrad */}
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
            Wirtschaftstaetigkeit erwirtschaftet wird (ohne Spenden).
          </p>

          <FormulaBox>
            <strong>Formel:</strong><br />
            Eigenfinanzierungsgrad = (Warenverkauf + Dienstleistungen + Integration) / Gesamteinnahmen &times; 100%
          </FormulaBox>

          <h4 className="mb-2 text-sm font-medium">Bedeutung:</h4>
          <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
            <li><strong>&gt;60%:</strong> Hohe Unabhaengigkeit von Spenden (Ziel)</li>
            <li><strong>40-60%:</strong> Mischfinanzierung</li>
            <li><strong>&lt;40%:</strong> Starke Spendenabhaengigkeit</li>
          </ul>

          <h4 className="mb-2 text-sm font-medium">Treiber:</h4>
          <ul className="list-disc space-y-1 pl-6 text-sm">
            <li>Anzahl verkaufter Geraete</li>
            <li>Durchschnittlicher Verkaufspreis</li>
            <li>Anzahl Dienstleistungsauftraege</li>
          </ul>
        </MethodologySection>

        {/* 3. Geraeteanzahl-Schaetzung */}
        <MethodologySection
          id="device-estimation"
          title="3. Geraeteanzahl-Schaetzung"
          badgeLabel="Schaetzung"
          badgeVariant="estimated"
          confidence="low"
        >
          <p className="mb-4 text-sm text-text-light">
            Da keine Stueckzahlen in Kivitendo erfasst werden, schaetzen wir die
            Geraeteanzahl aus den Einnahmen.
          </p>

          <FormulaBox>
            <strong>Formel:</strong><br />
            Geschaetzte Geraete = Warenverkauf (CHF) / Durchschnittspreis (CHF 150)
          </FormulaBox>

          <h4 className="mb-2 text-sm font-medium">Annahmen:</h4>
          <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
            <li>Durchschnittspreis pro Geraet: <strong>CHF 150</strong></li>
            <li>Alle Einnahmen auf Konto 3100 sind Geraeteverkaeufe</li>
            <li>Keine Unterscheidung nach Geraetetyp</li>
          </ul>

          <h4 className="mb-2 text-sm font-medium">Limitationen:</h4>
          <ul className="mb-4 list-disc space-y-1 pl-6 text-sm text-danger">
            <li>Zubehoer (Kabel, Tastaturen, Maeuse) ist mitgezaehlt</li>
            <li>Grosse Preisvariation (CHF 50 - 500)</li>
            <li>Keine Unterscheidung Laptop/Desktop/Tablet</li>
            <li>Durchschnittspreis ist Schaetzung, nicht berechnet</li>
          </ul>

          <div className="rounded-lg border-l-4 border-danger bg-danger-bg p-4">
            <p className="text-sm font-medium text-danger">
              KRITISCH: Stueckzahlen sollten in Kivitendo erfasst werden.
              Das wuerde diese Schaetzung ueberfluessig machen.
            </p>
          </div>
        </MethodologySection>

        {/* 4. CO2-Berechnung */}
        <MethodologySection
          id="co2-calculation"
          title="4. CO\u2082-Berechnung"
          badgeLabel="Berechnet"
          badgeVariant="derived"
          confidence="high"
          confidenceNote="(Hersteller-LCA-Reports fuer bekannte Modelle)"
        >
          <p className="mb-4 text-sm text-text-light">
            Die CO&#x2082;-Ersparnis wird basierend auf <strong>Hersteller-spezifischen Life Cycle Assessment (LCA) Reports</strong> berechnet.
          </p>

          <FormulaBox>
            <strong>Formel (fuer bekannte Modelle):</strong><br />
            CO&#x2082; vermieden = SUM(CO2_LCA_Total_kg pro Geraet)
          </FormulaBox>
          <FormulaBox>
            <strong>Formel (fuer unbekannte Modelle):</strong><br />
            CO&#x2082; vermieden = SUM(Gewicht_kg &times; CO2_Faktor_kg_per_kg)
          </FormulaBox>

          <h4 className="mb-2 mt-4 text-sm font-medium">Hersteller-spezifische CO&#x2082;-Werte (High Confidence):</h4>
          <Table
            columns={CO2_COLUMNS}
            data={CO2_DATA}
            keyExtractor={(row) => `${row.manufacturer}-${row.model}`}
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
            <li><strong>Fuer bekannte Modelle:</strong> Direkte CO&#x2082;-Werte aus Hersteller-LCA-Reports (High Confidence)</li>
            <li><strong>Fuer unbekannte Modelle:</strong> Hersteller-Durchschnitt oder Kategorie-Durchschnitt (Medium Confidence)</li>
            <li><strong>Alle verkauften Geraete ersetzen Neukaeufe</strong> (Avoided Burden Ansatz nach ISO 14040/14044)</li>
            <li>Alle Quellen sind direkt verlinkt und nachpruefbar</li>
          </ul>

          <h4 className="mb-2 text-sm font-medium">Limitationen:</h4>
          <ul className="list-disc space-y-1 pl-6 text-sm text-danger">
            <li>Falls Geraeteanzahl geschaetzt wird, entsteht Unsicherheit (siehe Geraete-Berechnung)</li>
            <li>Nicht alle Kaeufer haetten neu gekauft (konservative Annahme)</li>
            <li>Lebensdauerverlaengerung durch Refurbishment wird separat gemessen (LIFETIME_YEARS)</li>
          </ul>
        </MethodologySection>

        {/* 5. E-Waste-Berechnung */}
        <MethodologySection
          id="ewaste-calculation"
          title="5. E-Waste-Berechnung"
          badgeLabel="Schaetzung"
          badgeVariant="estimated"
          confidence="low"
        >
          <p className="mb-4 text-sm text-text-light">
            Die E-Waste-Ersparnis wird ebenfalls aus der geschaetzten Geraeteanzahl abgeleitet.
          </p>

          <FormulaBox>
            <strong>Formel:</strong><br />
            E-Waste vermieden = Geschaetzte Geraete &times; 10 kg/Geraet
          </FormulaBox>

          <h4 className="mb-2 text-sm font-medium">Annahmen:</h4>
          <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
            <li>Durchschnittliches Geraetegewicht: 10 kg</li>
            <li>Jedes wiederverwendete Geraet vermeidet Entsorgung</li>
          </ul>

          <h4 className="mb-2 text-sm font-medium">Limitationen:</h4>
          <ul className="list-disc space-y-1 pl-6 text-sm text-danger">
            <li>Geraetegewicht variiert stark (Laptop ~2kg, Desktop ~10kg)</li>
            <li>Nur das Geraet selbst, nicht Verpackung/Zubehoer</li>
            <li>Basiert auf Geraeteschaetzung</li>
          </ul>
        </MethodologySection>

        {/* 6. Preismodell-Methodik */}
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
            Vergleich mit aehnlichen Angeboten auf Ricardo, Tutti, Revendo, eBay Kleinanzeigen
          </FormulaBox>
          <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
            <li><strong>Quelle:</strong> Manuelle Marktbeobachtung</li>
            <li><strong>Konfidenz:</strong> Mittel (variiert je nach Geraet)</li>
            <li><strong>Beispiel:</strong> ThinkPad X270 i5/8GB &rarr; Ricardo CHF 180-250 &rarr; Normalpreis CHF 200</li>
          </ul>

          <h4 className="mb-2 text-sm font-medium">6.2 KulturLegi-Rabatt (50%)</h4>
          <FormulaBox>
            <strong>Formel:</strong><br />
            KulturLegi-Preis = Normalpreis &times; 0.5
          </FormulaBox>
          <ul className="mb-4 list-disc space-y-1 pl-6 text-sm">
            <li><strong>Quelle:</strong> Vorstandsentscheidung (Januar 2025)</li>
            <li><strong>Begruendung:</strong> Einheitlicher, leicht kommunizierbarer Rabatt</li>
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
            <li><strong>Begruendung +20%:</strong> Niedrige Einstiegshuerde (CHF 40 bei CHF 200 Geraet)</li>
            <li><strong>Begruendung +50%:</strong> Signifikanter Impact ohne zu hohe Abschreckung</li>
            <li><strong>Buchung:</strong> Aufschlag wird separat auf Konto 3510 verbucht</li>
          </ul>

          <h4 className="mb-2 text-sm font-medium">Preis-Beispiel vollstaendig nachvollziehbar:</h4>
          <Table
            columns={PRICING_COLUMNS}
            data={PRICING_EXAMPLE}
            keyExtractor={(row) => row.tier}
            compact
          />
        </MethodologySection>

        {/* 7. Datenluecken */}
        <section id="data-gaps" className="scroll-mt-8">
          <Card>
            <CardHeader>
              <CardTitle>7. Datenluecken</CardTitle>
            </CardHeader>
            <p className="mb-4 text-sm text-text-light">
              Folgende Daten fehlen komplett und koennen nicht einmal geschaetzt werden:
            </p>
            <Table
              columns={DATA_GAP_COLUMNS}
              data={DATA_GAPS}
              keyExtractor={(row) => row.dataPoint}
              compact
            />
          </Card>
        </section>
      </div>

      {/* Transparenz-Prinzipien */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Unsere Transparenz-Prinzipien</h2>
        <Card>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h4 className="mb-3 font-medium">Was wir tun</h4>
              <ul className="list-disc space-y-1 pl-6 text-sm">
                <li>Nur echte Daten aus Kivitendo verwenden</li>
                <li>Jede Berechnung dokumentieren</li>
                <li>Annahmen offenlegen</li>
                <li>Limitationen klar benennen</li>
                <li>Datenluecken dokumentieren</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-medium">Was wir nicht tun</h4>
              <ul className="list-disc space-y-1 pl-6 text-sm">
                <li>Keine erfundenen Zahlen</li>
                <li>Keine Schoenfaerberei</li>
                <li>Keine versteckten Annahmen</li>
                <li>Keine Pseudo-Praezision</li>
                <li>Keine unbelegten Behauptungen</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}
