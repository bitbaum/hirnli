// ---------------------------------------------------------------------------
// Methodik page data constants
// Pure data — no JSX, no React imports needed.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Data types legend
// ---------------------------------------------------------------------------

export const DATA_TYPES = [
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
    label: 'Schätzung',
    confidence: 'Niedrige Konfidenz',
    description: 'Basiert auf Annahmen. Echte Daten fehlen.',
    badgeVariant: 'warning' as const,
  },
];

// ---------------------------------------------------------------------------
// Data pipeline steps
// ---------------------------------------------------------------------------

export const PIPELINE_STEPS = [
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

export const TOC_ITEMS = [
  { id: 'income-data', label: '1. Einnahmen-Daten (Quelldaten)' },
  { id: 'self-financing', label: '2. Eigenfinanzierungsgrad (Berechnet)' },
  { id: 'device-estimation', label: '3. Geräteanzahl-Schätzung' },
  { id: 'co2-calculation', label: '4. CO\u2082-Berechnung' },
  { id: 'ewaste-calculation', label: '5. E-Waste-Berechnung' },
  { id: 'pricing-model', label: '6. Preismodell-Methodik' },
  { id: 'data-gaps', label: '7. Datenlücken' },
  { id: 'integrity-report', label: '8. Zahlen-Integritäts-Report' },
];

// ---------------------------------------------------------------------------
// Kivitendo accounts table data
// ---------------------------------------------------------------------------

export interface AccountRow {
  account: string;
  name: string;
  dashboardName: string;
}

export const ACCOUNTS: AccountRow[] = [
  { account: '3100', name: 'Produktverkäufe', dashboardName: 'Warenverkauf' },
  { account: '3400', name: 'Dienstleistungserlöse', dashboardName: 'Dienstleistungen' },
  { account: '3450', name: 'Integrations-Arbeitsplätze', dashboardName: 'Integration' },
  { account: '3500', name: 'Spendenerlöse', dashboardName: 'Spenden' },
  { account: '3510', name: 'Aufstockung Richtpreis', dashboardName: 'Aufstockung' },
  { account: '30-38', name: 'Nettoerlöse Total', dashboardName: 'Total' },
];

export const ACCOUNT_COLUMNS = [
  { key: 'account', header: 'Konto' },
  { key: 'name', header: 'Name' },
  { key: 'dashboardName', header: 'Dashboard-Name' },
];

// ---------------------------------------------------------------------------
// CO2 reference data
// ---------------------------------------------------------------------------

export interface CO2Row {
  manufacturer: string;
  model: string;
  co2Kg: number;
  source: string;
  sourceUrl: string;
}

export const CO2_DATA: CO2Row[] = [
  { manufacturer: 'Lenovo', model: 'ThinkPad X13', co2Kg: 377.6, source: 'Lenovo Eco Declaration', sourceUrl: 'https://static.lenovo.com/ww/docs/eco-declaration/thinkpad-x13-gen-2.pdf' },
  { manufacturer: 'Lenovo', model: 'ThinkPad X1 Extreme', co2Kg: 244.6, source: 'Lenovo Eco Declaration', sourceUrl: 'https://static.lenovo.com/ww/docs/eco-declaration/thinkpad-x1-extreme-gen-5.pdf' },
  { manufacturer: 'Dell', model: 'Latitude 9520', co2Kg: 325.5, source: 'Dell PCF', sourceUrl: 'https://www.dell.com/en-us/lp/product-carbon-footprint' },
  { manufacturer: 'Dell', model: 'XPS 15 (9530)', co2Kg: 383.7, source: 'Dell PCF', sourceUrl: 'https://www.dell.com/en-us/lp/product-carbon-footprint' },
  { manufacturer: 'HP', model: 'EliteBook 865 G10', co2Kg: 176.4, source: 'HP PCF', sourceUrl: 'https://h20195.www2.hp.com/v2/getpdf.aspx/c09146959.pdf' },
  { manufacturer: 'Apple', model: 'MacBook Pro 16"', co2Kg: 348.0, source: 'Apple Environmental Report', sourceUrl: 'https://www.apple.com/environment/reports/' },
];

// ---------------------------------------------------------------------------
// Pricing example table
// ---------------------------------------------------------------------------

export interface PricingRow {
  tier: string;
  calculation: string;
  result: string;
  source: string;
}

export const PRICING_EXAMPLE: PricingRow[] = [
  { tier: 'Normal', calculation: 'Marktvergleich Ricardo/Tutti', result: 'CHF 200', source: 'Marktdaten' },
  { tier: 'KulturLegi', calculation: 'CHF 200 x 0.5', result: 'CHF 100', source: 'Vorstand' },
  { tier: 'Supporter +20%', calculation: 'CHF 200 x 1.2', result: 'CHF 240', source: 'Vorstand' },
  { tier: 'Supporter +50%', calculation: 'CHF 200 x 1.5', result: 'CHF 300', source: 'Vorstand' },
];

export const PRICING_COLUMNS = [
  { key: 'tier', header: 'Stufe' },
  { key: 'calculation', header: 'Berechnung' },
  { key: 'result', header: 'Ergebnis' },
  { key: 'source', header: 'Quelle' },
];

// ---------------------------------------------------------------------------
// Data gaps table
// ---------------------------------------------------------------------------

export interface DataGapRow {
  dataPoint: string;
  priority: string;
  priorityColor: string;
  whyImportant: string;
  howToFix: string;
}

export const DATA_GAPS: DataGapRow[] = [
  { dataPoint: 'Geräte-Stückzahlen', priority: 'Kritisch', priorityColor: 'text-danger', whyImportant: 'Alle Impact-Metriken hängen davon ab', howToFix: 'Artikelerfassung in Kivitendo' },
  { dataPoint: 'Ausgaben-Daten', priority: 'Kritisch', priorityColor: 'text-danger', whyImportant: 'Kein Gewinn/Verlust berechenbar', howToFix: 'Ausgaben-Export aus Kivitendo' },
  { dataPoint: 'Gerätetypen', priority: 'Hoch', priorityColor: 'text-warning', whyImportant: 'CO\u2082 und E-Waste variieren stark', howToFix: 'Kategorien definieren' },
  { dataPoint: 'Workshop-Teilnehmer', priority: 'Mittel', priorityColor: 'text-text-muted', whyImportant: 'Soziale Wirkung messen', howToFix: 'Anmeldeliste führen' },
  { dataPoint: 'Freiwilligenstunden', priority: 'Mittel', priorityColor: 'text-text-muted', whyImportant: 'Soziale Wirkung messen', howToFix: 'Zeiterfassung einführen' },
  { dataPoint: 'Linux-Installationen', priority: 'Niedrig', priorityColor: 'text-text-light', whyImportant: 'Software-Wirkung messen', howToFix: 'Bei Verkauf notieren' },
];
