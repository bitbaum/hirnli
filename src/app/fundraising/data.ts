import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { CORE_FACTS, SOCIAL_DISPLAY } from '@/lib/config/stories';
import { getScenario, getLineItemsForScenario } from '@/lib/domain/budget-calculations';
import { fitScoreToDisplay } from '@/lib/domain/fit-scoring';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { SPACE_SUMMARY, HUB_SPACE_AREAS } from '@/lib/config/hub-space-plan';
import type { BudgetLineItem } from '@/lib/schemas/budget';
import type { FoundationStatus } from '@/lib/schemas/foundation';

// -- Derived data from STIFTUNGEN_DATA ----------------------------------------

export function computePipelineStats() {
  const statusCounts: Record<FoundationStatus, number> = {
    open: 0,
    closed: 0,
    rolling: 0,
    soon: 0,
  };

  let totalFit = 0;
  let fitCount = 0;
  let upcomingDeadlines = 0;
  const now = new Date();
  const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  for (const f of STIFTUNGEN_DATA) {
    statusCounts[f.status]++;

    // Exclude fitScore=0 (unassessed) from average
    if (f.fitScore > 0) {
      totalFit += f.fitScore;
      fitCount++;
    }

    if (f.deadline) {
      const deadline = new Date(f.deadline);
      if (deadline >= now && deadline <= threeMonths) {
        upcomingDeadlines++;
      }
    }
  }

  const avgFit = fitCount > 0 ? totalFit / fitCount : 0;
  const highFitCount = STIFTUNGEN_DATA.filter((f) => fitScoreToDisplay(f.fitScore, false) === 3).length;

  return {
    total: STIFTUNGEN_DATA.length,
    statusCounts,
    avgFit,
    highFitCount,
    upcomingDeadlines,
  };
}

// -- Static config for the page -----------------------------------------------

export const STATUS_BADGE_VARIANT: Record<FoundationStatus, 'success' | 'warning' | 'danger' | 'primary'> = {
  open: 'success',
  rolling: 'primary',
  soon: 'warning',
  closed: 'danger',
};

// Budget line items grouped by type — derived from SSOT (budget-scenarios.ts)
// Using 'moderate' scenario as the default recommended solution for fundraising dashboard
const MODERATE_SCENARIO = getScenario('moderate');
if (!MODERATE_SCENARIO) {
  throw new Error('Moderate budget scenario not found - check budget-scenarios.ts configuration');
}

const MODERATE_LINE_ITEMS = getLineItemsForScenario('moderate');

export const BUDGET_EINMALIG: BudgetLineItem[] = MODERATE_LINE_ITEMS.filter((m) => m.type === 'einmalig');
export const BUDGET_JAEHRLICH: BudgetLineItem[] = MODERATE_LINE_ITEMS.filter((m) => m.type === 'jaehrlich');
export const BUDGET_EINMALIG_TOTAL = BUDGET_EINMALIG.reduce((sum, m) => sum + m.amount, 0);
export const BUDGET_JAEHRLICH_TOTAL = BUDGET_JAEHRLICH.reduce((sum, m) => sum + m.amount, 0);

export const BUDGET_SUMMARY = {
  total: BUDGET_EINMALIG_TOTAL + BUDGET_JAEHRLICH_TOTAL,
  eigenleistung: MODERATE_SCENARIO.threeYearModel.year1.eigenleistung,
  foerderbedarf: (BUDGET_EINMALIG_TOTAL + BUDGET_JAEHRLICH_TOTAL) - MODERATE_SCENARIO.threeYearModel.year1.eigenleistung,
  selfFinancingPct: Math.round((MODERATE_SCENARIO.threeYearModel.year1.eigenleistung / (BUDGET_EINMALIG_TOTAL + BUDGET_JAEHRLICH_TOTAL)) * 100),
};

// -- 3-Year Budget Summary (the REAL numbers foundations see) -------------------
// Stiftungen-ask = einmalig + stiftungen across all 3 years
// Eigen-total = eigenleistung across all 3 years

export const PROJECT_START = 2026;
export const PROJECT_END = 2028;
export const PROJECT_YEAR_RANGE = `${PROJECT_START}–${PROJECT_END}`;
export const PROJECT_DURATION = `${PROJECT_END - PROJECT_START + 1} Jahre (${PROJECT_YEAR_RANGE})`;
export const PROJECT_DURATION_LABEL = 'Aufbau → Wachstum → Verselbständigung';

export const RESOURCES = [
  { href: '/api/documents/pitch-deck', label: 'Pitch Deck (PDF)', description: '8-Folien-Präsentation für Stiftungen', external: true },
  { href: '/api/documents/impact-report', label: 'Wirkungsbericht (PDF)', description: 'Jährlicher Impact-Report, 2 Seiten', external: true },
  { href: '/wirkung', label: 'Impact-Zahlen', description: 'Interaktive Wirkungsseite mit Quellen', external: false },
  { href: '/fundraising/stiftungen', label: 'Stiftungen', description: `${STIFTUNGEN_DATA.length} Förderer mit Fit-Score`, external: false },
  { href: '/finanzen', label: 'Finanzdaten', description: 'Kivitendo-Daten visualisiert', external: false },
  { href: '/dokumente', label: 'Alle Dokumente', description: 'Gesuche, Vorlagen, Exporte', external: false },
] as const;

// -- HERO_STATS — derived from CORE_FACTS (SSOT) -----------------------------

export const HERO_STATS = [
  { label: 'Ökologie', value: `${CORE_FACTS.metrics.environmental.co2_per_laptop} kg`, sub: 'CO2 pro Laptop gespart' },
  { label: 'Soziales', value: SOCIAL_DISPLAY.practitioners_total, sub: 'Menschen begleitet' },
  { label: 'Bildung', value: `${ORG_PROFILE.yearsActive}+`, sub: 'Jahre Erfahrung' },
] as const;

// -- Space Plan: derived from hub-space-plan.ts (SSOT) ----------------------------
// Maps HUB_SPACE_AREAS → display-friendly German names, combining related areas.
// Excludes circulation (corridors, bathrooms) — shown separately as note.

const SPACE_AREA_MAP: Record<string, { area: string; description: string }> = {
  'Shop & Customer Area': { area: 'Shop & Empfang', description: 'Verkauf, Geräte-Annahme, Beratung, Wartebereich' },
  'Refurbishment Workshop': { area: 'Werkstatt & Reparatur', description: '6-8 Arbeitsplätze, Test & Datenlöschung, QA, Ersatzteile' },
  'Office & Meeting Spaces': { area: 'Büro & Besprechung', description: '5 Arbeitsplätze (Kern + BPL), Sitzungszimmer' },
  'Makerspace & Hackerspace': { area: 'Makerspace & Hackerspace', description: '3D-Drucker, Lötstationen, Laser Cutter, Tool Library' },
  'AI Lab (Server Room)': { area: 'AI Lab / Serverraum', description: 'GPU-Cluster, klimatisiert, Netzwerk-Infrastruktur' },
  'Training & Course Room': { area: 'Schulungsraum', description: '20 Plätze, Beamer, Übungsrechner, Corporate Training' },
  'Event Space + Community Café (MULTI-PURPOSE)': { area: 'Event-/Kulturraum & Café', description: 'Tags: Café. Abends: Konzerte, Talks, Filmabende. Repair Café 2×/Monat' },
};

// Storage & Logistics + Loading & Delivery Zone → combined as one display area
const STORAGE_AREA = HUB_SPACE_AREAS.find(a => a.name === 'Storage & Logistics');
const LOADING_AREA = HUB_SPACE_AREAS.find(a => a.name === 'Loading & Delivery Zone');
const STORAGE_COMBINED_SQM = (STORAGE_AREA?.sqm_recommended ?? 0) + (LOADING_AREA?.sqm_recommended ?? 0);

export const SPACE_PLAN = [
  // Combined storage area first (as it was in the original layout)
  { area: 'Lager & Logistik', sqm: STORAGE_COMBINED_SQM, description: 'Eingang/Triage, Ersatzteile, Fertigware, Laderampe, Recycling-Staging' },
  // Individual areas from SSOT
  ...HUB_SPACE_AREAS
    .filter(a => a.name in SPACE_AREA_MAP)
    .map(a => ({
      area: SPACE_AREA_MAP[a.name].area,
      sqm: a.sqm_recommended,
      description: SPACE_AREA_MAP[a.name].description,
    })),
];

export const SPACE_PLAN_TOTAL = SPACE_SUMMARY.total_usable; // ~590m² — derived from hub-space-plan.ts (excludes circulation)
export const SPACE_TOTAL_WITH_CIRCULATION = SPACE_SUMMARY.total_with_circulation; // ~650m² — full lease footprint

// -- 3-Year Degressive Funding Model (derived from SSOT) ----------------------
// Year 1 is fully derived from moderate scenario (budget-scenarios.ts)
const Y1_EINMALIG = BUDGET_EINMALIG_TOTAL;
const Y1_STIFTUNGEN = BUDGET_JAEHRLICH_TOTAL;
const Y1_EIGEN = MODERATE_SCENARIO.threeYearModel.year1.eigenleistung;

// Year 2-3: degressive assumptions — explicit config with rationale
// Standard Swiss 3-year model: foundations expect 25-50% reduction/year
// Eigenleistung aligned to bottom-up revenue model (REVENUE_STREAMS): 100k→140k→195k = 435k/3yr
//
// Methodology for percentages:
//   Eigen grows from 100k → 140k → 195k (aligned to REVENUE_STREAMS bottom-up).
//   Stiftungen share = (Jährlich - Eigen) / Jährlich for each year:
//     Year 2: Eigen 140k, remaining stiftungen need = Jährlich × 0.745
//     Year 3: Eigen 195k, remaining stiftungen need = Jährlich × 0.478
//   Total budget (stiftungen + eigen) decreases each year as eigen grows,
//   modelling progressive self-sufficiency. This is the standard Swiss
//   degressive funding model for 3-year foundation grants.
export const DEGRESSIVE_CONFIG = {
  year2: { stiftungenPct: 0.745, eigenGrowth: 40_000 },   // 74.5% of Y1 stiftungen; eigen: 100k + 40k = 140k
  year3: { stiftungenPct: 0.478, eigenGrowth: 95_000 },   // 47.8% of Y1 stiftungen; eigen: 100k + 95k = 195k
} as const;

export const THREE_YEAR_MODEL = [
  {
    year: 'Jahr 1' as const,
    einmalig: Y1_EINMALIG,
    stiftungen: Y1_STIFTUNGEN,
    eigen: Y1_EIGEN,
    total: Y1_EINMALIG + Y1_STIFTUNGEN + Y1_EIGEN,
    label: 'Aufbau' as const,
  },
  {
    year: 'Jahr 2' as const,
    einmalig: 0,
    stiftungen: Math.round(Y1_STIFTUNGEN * DEGRESSIVE_CONFIG.year2.stiftungenPct),
    eigen: Y1_EIGEN + DEGRESSIVE_CONFIG.year2.eigenGrowth,
    total: Math.round(Y1_STIFTUNGEN * DEGRESSIVE_CONFIG.year2.stiftungenPct) + Y1_EIGEN + DEGRESSIVE_CONFIG.year2.eigenGrowth,
    label: 'Wachstum' as const,
  },
  {
    year: 'Jahr 3' as const,
    einmalig: 0,
    stiftungen: Math.round(Y1_STIFTUNGEN * DEGRESSIVE_CONFIG.year3.stiftungenPct),
    eigen: Y1_EIGEN + DEGRESSIVE_CONFIG.year3.eigenGrowth,
    total: Math.round(Y1_STIFTUNGEN * DEGRESSIVE_CONFIG.year3.stiftungenPct) + Y1_EIGEN + DEGRESSIVE_CONFIG.year3.eigenGrowth,
    label: 'Verselbständigung' as const,
  },
];

// Derived 3-year totals — unambiguous headline numbers
export const STIFTUNGEN_3Y_TOTAL = THREE_YEAR_MODEL.reduce((sum, y) => sum + y.stiftungen + y.einmalig, 0);
export const EIGEN_3Y_TOTAL = THREE_YEAR_MODEL.reduce((sum, y) => sum + y.eigen, 0);
export const PROJECT_3Y_TOTAL = THREE_YEAR_MODEL.reduce((sum, y) => sum + y.total, 0);
export const STIFTUNGEN_Y1 = THREE_YEAR_MODEL[0].stiftungen + THREE_YEAR_MODEL[0].einmalig;
export const STIFTUNGEN_Y3 = THREE_YEAR_MODEL[2].stiftungen;
export const REDUCTION_PCT = Math.round((1 - STIFTUNGEN_Y3 / STIFTUNGEN_Y1) * 100);

// -- Financial context — verified against Kivitendo Erfolgsrechnung 2026-02-11 --
// Source: Erfolgsrechnung per account (Kivitendo rp.pl → generate_income_statement)
export const FINANCIAL_CONTEXT = {
  // Dienstleistungen (3400) — the category that crashed
  services_2022: 80080,       // Erfolgsrechnung 3400 (2022): 80'080.10
  services_2023: 75342,       // Erfolgsrechnung 3400 (2023): 75'341.70
  services_2024: 84974,       // Erfolgsrechnung 3400 (2024): 84'973.55
  services_2025: 27573,       // Erfolgsrechnung 3400 (2025): 27'572.97 — FULL YEAR
  services_avg_2022_23: 77711, // (80080 + 75342) / 2
  decline_pct: 65,            // (77711 - 27573) / 77711 × 100 ≈ 64.5% → round to 65%
  // Warenverkauf (3100)
  warenverkauf_2022: 35441,   // Erfolgsrechnung 3100 (2022): 35'441.03
  warenverkauf_2023: 36997,   // Erfolgsrechnung 3100 (2023): 36'997.19
  warenverkauf_2024: 23135,   // Erfolgsrechnung 3100 (2024): 23'135.36
  warenverkauf_2025: 22086,   // Erfolgsrechnung 3100 (2025): 22'086.27
  // Totals (from Erfolgsrechnung — includes ALL revenue accounts)
  total_2022: 129920,         // Erfolgsrechnung 2022: 129'919.96
  total_2023: 134450,         // Erfolgsrechnung 2023: 134'450.11
  total_2024: 119274,         // Erfolgsrechnung 2024: 119'274.13
  total_2025: 60402,          // Erfolgsrechnung 2025:  60'401.93 — FULL YEAR
} as const;

// Display helpers for services revenue drop narrative
export const SERVICES_PEAK_DISPLAY = `CHF ${Math.round(FINANCIAL_CONTEXT.services_2022 / 1000)}k`; // 'CHF 80k'
export const SERVICES_CURRENT_DISPLAY = `CHF ${Math.round(FINANCIAL_CONTEXT.services_2025 / 1000)}k`; // 'CHF 28k'

// -- Revenue History (verified Erfolgsrechnung, 2018-2025) --------------------
// Source: Kivitendo Erfolgsrechnung per year, extracted 2026-02-11
export const REVENUE_HISTORY = [
  { year: 2018, total: 107135, warenverkauf: 23689, dienstleistungen: 57472 },
  { year: 2019, total: 79842, warenverkauf: 30925, dienstleistungen: 67137 },
  { year: 2020, total: 93715, warenverkauf: 17815, dienstleistungen: 67592 },
  { year: 2021, total: 140191, warenverkauf: 48221, dienstleistungen: 69020 },
  { year: 2022, total: 129920, warenverkauf: 35441, dienstleistungen: 80080 },
  { year: 2023, total: 134450, warenverkauf: 36997, dienstleistungen: 75342 },
  { year: 2024, total: 119274, warenverkauf: 23135, dienstleistungen: 84974 },
  { year: 2025, total: 60402, warenverkauf: 22086, dienstleistungen: 27573 },
] as const;

// -- Cost Structure 2023 (last complete year, verified Erfolgsrechnung) -------
// Source: Kivitendo Erfolgsrechnung 2023 — the only year with complete expenses
export const COST_STRUCTURE_2023 = {
  year: 2023,
  totalRevenue: 134450,
  totalExpenses: 159667,
  result: -25217,
  categories: [
    { label: 'Miete', amount: 76934, color: 'bg-red-500', pctOfExpenses: 48.2 },
    { label: 'Personal (Löhne, Sozial, Bildung)', amount: 48075, color: 'bg-blue-500', pctOfExpenses: 30.1 },
    { label: 'Abschreibungen', amount: 10000, color: 'bg-grey-medium', pctOfExpenses: 6.3 },
    { label: 'IT & Kommunikation', amount: 8584, color: 'bg-violet-500', pctOfExpenses: 5.4 },
    { label: 'Material & Dienstleistungen', amount: 8857, color: 'bg-amber-500', pctOfExpenses: 5.5 },
    { label: 'Übriger Betriebsaufwand', amount: 7217, color: 'bg-grey-light', pctOfExpenses: 4.5 },
  ],
  source: 'Kivitendo Erfolgsrechnung 2023 (letztes vollständiges Geschäftsjahr)',
} as const;

// -- Track Record (verified from Kivitendo operational data) ------------------
export const TRACK_RECORD = {
  yearsActive: new Date().getFullYear() - CORE_FACTS.organization.founded,
  totalInvoices: 2777,      // rechnungen_ar_invoices.csv
  totalCustomers: 5803,     // kunden_customers.csv
  productsInCatalog: 4134,  // artikel_products.csv
  deliveryNotes: 1012,      // lieferscheine_delivery_notes.csv
  quoteConversion: 92.6,    // angebote_quotes.csv (162/175 converted)
  source: 'Kivitendo ERP, verifiziert 11.02.2026',
} as const;

// -- Revenue Streams (current = 2025 actual, year3 = projection) --------------
// "current" = 2025 Kivitendo actuals (Erfolgsrechnung, full year).
// HONEST BASELINE: Revenue crashed from 134k (2023) to 60k (2025).
// Year 3 projections assume Hub exists with 650 m², new programs, and diversified income.

export const REVENUE_STREAMS = [
  { source: 'Geräteverkauf', current: 22000, year3: 45000,
    rationale: 'Kivitendo 3100: CHF 22k (2025), 23k (2024), 37k (2023). Grösserer Shop im Hub mit mehr Laufkundschaft. Ziel: Rückkehr auf 2023-Niveau + 20%.' },
  { source: 'Dienstleistungen & IT-Services', current: 28000, year3: 55000,
    rationale: 'Kivitendo 3400: Einbruch von 80k (2022) auf 28k (2025) durch Verlust von B2B-Hosting-Kunden. Diversifizierung: KMU-Support, Reparaturen, IT-Beratung statt Grosskundenabhängigkeit.' },
  { source: 'Corporate Placements', current: 0, year3: 30000,
    rationale: 'Neu. 2-3 Firmen-Platzierungen à CHF 10-15k/Jahr. Modell: Outplacement/Reintegration für Unternehmen.' },
  { source: 'Kursgebühren & Workshops', current: 0, year3: 20000,
    rationale: 'Neu. Schulungsraum (40 m², 15-20 Plätze) ermöglicht 2-3 Kurse/Monat à CHF 50-100. Hardware-Repair, Linux, Digital Literacy.' },
  { source: 'Integration (RAV/IV)', current: 0, year3: 15000,
    rationale: 'Kivitendo 3450: CHF 10.5k (2023), 4.5k (2024), 0 (2025). Hub bietet 5-8 statt 2-3 Plätze. RAV/IV-Beiträge steigen proportional.' },
  { source: 'Repair Café & Raumvermietung', current: 0, year3: 15000,
    rationale: 'Neu. Event-/Kulturraum 80 m²: monatliches Repair Café + Raumvermietung für externe Veranstaltungen.' },
  { source: 'AI Hosting & Digitale Souveränität', current: 0, year3: 10000,
    rationale: 'Neu. GPU-Cluster für souveränes KI-Hosting. Start mit 2-3 Schweizer KMU-Pilotkunden über bestehendes Netzwerk.' },
  { source: 'Spenden & Mitgliederbeiträge', current: 800, year3: 5000,
    rationale: 'Kivitendo 3500: CHF 762 (2025), 10k (2023). Community-Hub mit Events und Sichtbarkeit soll Spendenbereitschaft auf 2023-Niveau heben.' },
] as const;

export const REVENUE_CURRENT_TOTAL = REVENUE_STREAMS.reduce((sum, r) => sum + r.current, 0);
export const REVENUE_YEAR3_TOTAL = REVENUE_STREAMS.reduce((sum, r) => sum + r.year3, 0);

export const NEXT_STEPS = [
  {
    step: '1. Stiftung auswählen',
    description: 'Priorisierte Liste mit Deadlines und Anforderungen.',
    href: '/fundraising/stiftungen',
    linkLabel: 'Stiftungen-Übersicht öffnen',
  },
  {
    step: '2. Gesuch vorbereiten',
    description: 'Templates und Bausteine für schnellere Anträge.',
    href: '/fundraising/gesuch-vorlagen',
    linkLabel: 'Gesuch-Vorlagen öffnen',
  },
  {
    step: '3. Wirkung belegen',
    description: 'Zahlen mit Quellenangaben für Glaubwürdigkeit.',
    href: '/wirkung',
    linkLabel: 'Impact-Daten ansehen',
  },
];
