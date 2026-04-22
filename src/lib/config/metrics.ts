/**
 * Number Sources Database (TypeScript port of number-sources.js)
 *
 * Central registry for all numbers displayed in the dashboard.
 * Every number must have: unique ID, source type, confidence level,
 * formula (if derived), validation rules, and documentation link.
 */

import type { Metric, MetricSourceType, Confidence } from '../schemas/metric';
import type { InspectorData, InspectorSourceType } from '../schemas/inspector';
import { ORG_PROFILE } from './org-profile';
import { SHARED_ORG_NUMBERS } from './shared-org-numbers.generated';
import { CO2_NEW_LAPTOP_MANUFACTURE, CO2_REFURBISH_COST } from './numbers';

// ---------------------------------------------------------------------------
// SSOT: All metric definitions
// ---------------------------------------------------------------------------

export const NumberSources: Record<string, Metric> = {
  // ==========================================================================
  // FINANCIAL NUMBERS
  // ==========================================================================

  financial_total_2025: {
    id: 'financial_total_2025',
    name: 'Gesamteinnahmen 2025',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'source',
      confidence: 'high',
      path: '01_Management/B_Finanzen/revamp-Einnahmen-2025.xlsx',
      account: '30-38 (Nettoerlöse Total)',
      lastUpdated: null,
    },
    formula: {
      type: 'sum',
      expression: 'SUM(total) WHERE year = 2025',
    },
    validation: {
      rules: [{ type: 'range', min: 0, max: 200000 }],
    },
    documentation: {
      description:
        'Gesamteinnahmen aus allen Geschäftsbereichen im Jahr 2025',
      drivers: [
        'Anzahl verkaufter Geräte',
        'Durchschnittlicher Verkaufspreis',
        'Dienstleistungsaufträge',
      ],
      improvements: [
        'Mehr Geräte beschaffen',
        'Marketing verstärken',
        'Dienstleistungen erweitern',
      ],
      link: '/methodik#income-data',
    },
  },

  financial_warenverkauf_2025: {
    id: 'financial_warenverkauf_2025',
    name: 'Warenverkauf 2025',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'source',
      confidence: 'high',
      path: '01_Management/B_Finanzen/revamp-Einnahmen-2025.xlsx',
      account: '3100 (Produktverkäufe)',
      lastUpdated: null,
    },
    formula: {
      type: 'sum',
      expression: 'SUM(warenverkauf) WHERE year = 2025',
    },
    validation: {
      rules: [{ type: 'range', min: 0, max: 150000 }],
    },
    documentation: {
      description: 'Einnahmen aus dem Verkauf refurbished IT-Geräte',
      drivers: [
        'Anzahl gespendeter Geräte',
        'Kapazität für Aufbereitung',
        'Nachfrage',
      ],
      improvements: [
        'Partnerschaften mit Unternehmen',
        'Online-Präsenz ausbauen',
      ],
      link: '/methodik#income-data',
    },
  },

  financial_dienstleistungen_2025: {
    id: 'financial_dienstleistungen_2025',
    name: 'Dienstleistungen 2025',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'source',
      confidence: 'high',
      path: '01_Management/B_Finanzen/revamp-Einnahmen-2025.xlsx',
      account: '3400 (Dienstleistungserlöse)',
      lastUpdated: null,
    },
    formula: {
      type: 'sum',
      expression: 'SUM(dienstleistungen) WHERE year = 2025',
    },
    validation: {
      rules: [{ type: 'range', min: 0, max: 100000 }],
    },
    documentation: {
      description:
        'Einnahmen aus IT-Dienstleistungen (Reparaturen, Consulting, Web-Development)',
      drivers: ['Bekanntheitsgrad', 'Verfügbare Fachkräfte', 'Qualität'],
      improvements: [
        'Reparatur-Café bewerben',
        'Web-Development-Aufträge akquirieren',
      ],
      link: '/methodik#income-data',
    },
  },

  financial_monthly_avg_2025: {
    id: 'financial_monthly_avg_2025',
    name: 'Monatsdurchschnitt 2025',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'derived',
      confidence: 'high',
      dependencies: ['financial_total_2025'],
    },
    formula: {
      type: 'custom',
      expression: 'total / monthCount',
      dependencies: ['financial_total_2025'],
    },
    validation: {
      rules: [{ type: 'range', min: 0, max: 20000 }],
    },
    documentation: {
      description: 'Durchschnittliche monatliche Einnahmen im Jahr 2025',
      drivers: ['Gesamteinnahmen', 'Anzahl Monate mit Daten'],
      improvements: ['Konsistente monatliche Einnahmen anstreben'],
      link: '/methodik#income-data',
    },
  },

  financial_self_financing_2025: {
    id: 'financial_self_financing_2025',
    name: 'Eigenfinanzierungsgrad 2025',
    category: 'financial',
    dimension: 'economic',
    format: 'percent',
    source: {
      type: 'derived',
      confidence: 'high',
      dependencies: [
        'financial_total_2025',
        'financial_warenverkauf_2025',
        'financial_dienstleistungen_2025',
      ],
    },
    formula: {
      type: 'custom',
      expression: '(warenverkauf + dienstleistungen) / total * 100',
      dependencies: [
        'financial_warenverkauf_2025',
        'financial_dienstleistungen_2025',
        'financial_total_2025',
      ],
    },
    validation: {
      rules: [
        { type: 'range', min: 0, max: 100 },
        {
          type: 'crosscheck',
          message: 'Sollte mit Summe der Kategorien übereinstimmen',
        },
      ],
    },
    documentation: {
      description:
        'Anteil der Einnahmen aus eigener Wirtschaftstätigkeit (ohne Spenden). Ziel: >70%',
      drivers: ['Warenverkauf', 'Dienstleistungen', 'Gesamteinnahmen'],
      improvements: [
        'Warenverkauf steigern',
        'Dienstleistungen ausbauen',
        'Einnahmen diversifizieren (Fördermittel + Earned Income)',
      ],
      target: 70,
      link: '/methodik#self-financing',
      whyItMatters:
        'Zeigt Anteil eigener Wirtschaftstätigkeit. Historisch ~96% (da nie aktiv Fördermittel gesucht). Diversifizierung durch Fundraising ist der nächste Schritt.',
    },
  },

  financial_earned_2025: {
    id: 'financial_earned_2025',
    name: 'Eigenerwirtschaftet 2025',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'derived',
      confidence: 'high',
      dependencies: [
        'financial_warenverkauf_2025',
        'financial_dienstleistungen_2025',
      ],
    },
    formula: {
      type: 'custom',
      expression: 'warenverkauf + dienstleistungen + integration',
      dependencies: [
        'financial_warenverkauf_2025',
        'financial_dienstleistungen_2025',
      ],
    },
    validation: {
      rules: [{ type: 'range', min: 0, max: 200000 }],
    },
    documentation: {
      description:
        'Summe aller Einnahmen aus eigener Wirtschaftstätigkeit (ohne Spenden)',
      drivers: ['Warenverkauf', 'Dienstleistungen', 'Integration'],
      improvements: [
        'Mehr Geräte verkaufen',
        'Dienstleistungen ausbauen',
      ],
      link: '/methodik#income-data',
    },
  },

  financial_donations_2025: {
    id: 'financial_donations_2025',
    name: 'Spenden & Forderung 2025',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'source',
      confidence: 'high',
      path: '01_Management/B_Finanzen/revamp-Einnahmen-2025.xlsx',
      account: '3500 + 3510',
    },
    formula: {
      type: 'custom',
      expression: 'spenden + aufstockung',
    },
    validation: {
      rules: [{ type: 'range', min: 0, max: 100000 }],
    },
    documentation: {
      description:
        'Einnahmen aus Spenden (Konto 3500) und Aufstockungen (Konto 3510)',
      drivers: ['Fundraising-Aktivitäten', 'Supporter-Aufschläge'],
      improvements: [
        'Fundraising verstärken',
        'Supporter-Programm ausbauen',
      ],
      link: '/methodik#income-data',
    },
  },

  // ==========================================================================
  // ENVIRONMENTAL NUMBERS
  // ==========================================================================

  devices_estimated_2025: {
    id: 'devices_estimated_2025',
    name: 'Geschätzte Geräteanzahl 2025',
    category: 'environmental',
    dimension: 'ecological',
    format: 'integer',
    source: {
      type: 'estimated',
      confidence: 'low',
      path: '01_Management/B_Finanzen/revamp-Einnahmen-2025.xlsx',
      assumption: `Durchschnittspreis CHF ${SHARED_ORG_NUMBERS.AVG_DEVICE_PRICE}/Gerät`,
    },
    formula: {
      type: 'custom',
      expression: `warenverkauf / ${SHARED_ORG_NUMBERS.AVG_DEVICE_PRICE}`,
      dependencies: ['financial_warenverkauf_2025'],
    },
    validation: {
      rules: [
        { type: 'range', min: 0, max: 1000 },
        { type: 'warning', message: 'Schätzung - exakte Stückzahlen fehlen' },
      ],
    },
    documentation: {
      description:
        'Geschätzt aus Warenverkauf-Einnahmen. Exakte Stückzahlen werden nicht in Kivitendo erfasst.',
      limitations: [
        'Zubehör mitgezählt',
        'Grosse Preisvariation (CHF 50-500)',
        'Durchschnittspreis ist Schätzung',
      ],
      improvements: [
        'WICHTIG: Stückzahlen in Kivitendo erfassen',
        'Artikelkategorien einführen',
      ],
      link: '/methodik#device-estimation',
    },
  },

  co2_total_2025: {
    id: 'co2_total_2025',
    name: 'CO2 vermieden 2025',
    category: 'environmental',
    dimension: 'ecological',
    format: 'tonnes',
    source: {
      type: 'calculated',
      confidence: 'medium',
      path: '01_Management/C_Kennzahlen_und_Reporting/KPI_Framework/CO2_und_Gewichtstabelle.csv',
      assumption: `${SHARED_ORG_NUMBERS.CO2_SAVED_PER_LAPTOP} kg CO2 Netto-Einsparung pro Gerät (${CO2_NEW_LAPTOP_MANUFACTURE} kg Neuproduktion − ${CO2_REFURBISH_COST} kg Refurbishment)`,
    },
    formula: {
      type: 'custom',
      expression: `devices * ${SHARED_ORG_NUMBERS.CO2_SAVED_PER_LAPTOP} / 1000`,
      dependencies: ['devices_estimated_2025'],
    },
    validation: {
      rules: [
        { type: 'range', min: 0, max: 300 },
        { type: 'warning', message: 'Basiert auf Geräteschätzung' },
      ],
    },
    documentation: {
      description:
        'Berechnet aus geschätzter Geräteanzahl. Basiert auf wissenschaftlichen LCA-Studien.',
      limitations: [
        'Geräteanzahl ist Schätzung',
        'Durchschnittswert, nicht gerätespezifisch',
      ],
      improvements: [
        'Exakte Gerätezahlen erfassen',
        'Gerätespezifische CO2-Werte verwenden',
      ],
      link: '/methodik#co2-calculation',
    },
  },

  ewaste_total_2025: {
    id: 'ewaste_total_2025',
    name: 'E-Waste vermieden 2025',
    category: 'environmental',
    dimension: 'ecological',
    format: 'kg',
    source: {
      type: 'estimated',
      confidence: 'low',
      assumption: '5 kg pro Gerät (Durchschnitt)',
    },
    formula: {
      type: 'custom',
      expression: 'devices * 5',
      dependencies: ['devices_estimated_2025'],
    },
    validation: {
      rules: [
        { type: 'range', min: 0, max: 5000 },
        { type: 'warning', message: 'Basiert auf Geräteschätzung' },
      ],
    },
    documentation: {
      description:
        'Geschätztes Gewicht der vermiedenen Elektroschrott-Entsorgung',
      limitations: [
        'Gerätegewicht variiert stark (Laptop ~2kg, Desktop ~10kg)',
        'Basiert auf Geräteschätzung',
      ],
      improvements: ['Exakte Gerätezahlen und -gewichte erfassen'],
      link: '/methodik#ewaste-calculation',
    },
  },

  // ==========================================================================
  // SOCIAL NUMBERS
  // ==========================================================================

  erfolgsquote_40: {
    id: 'erfolgsquote_40',
    name: 'Erfolgsquote Reintegration',
    category: 'social',
    dimension: 'social_integration',
    format: 'percent',
    source: {
      type: 'target',
      confidence: 'low',
      path: '01_Management/C_Kennzahlen_und_Reporting/README.md',
    },
    formula: {
      type: 'custom',
      expression:
        'COUNTIF(Reintegration_Erfolg IN ["Ja - Festanstellung", "Ja - Ausbildung", "Ja - Selbständigkeit"]) / COUNT(Follow_up_Datum) * 100',
    },
    validation: {
      rules: [
        { type: 'range', min: 0, max: 100 },
        {
          type: 'warning',
          message: 'Zielwert - aktuell nicht systematisch getrackt',
        },
      ],
    },
    documentation: {
      description:
        'Zielwert für erfolgreiche Wiedereingliederungen. Follow-up 6-12 Monate nach Programmabschluss. Erfolgreich = Festanstellung, Ausbildung oder Selbständigkeit.',
      limitations: [
        'Aktuell nicht systematisch erfasst',
        'Historische Schätzung: ~40%',
      ],
      improvements: [
        'Integrations-Tracking einführen',
        'Follow-up-System etablieren',
      ],
      link: '/methodik',
    },
  },

  praktikanten_100: {
    id: 'praktikanten_100',
    name: `Praktikant:innen seit ${ORG_PROFILE.milestones.integrationProgram}`,
    category: 'social',
    dimension: 'social_integration',
    format: 'integer',
    source: {
      type: 'estimated',
      confidence: 'low',
    },
    formula: undefined,
    validation: {
      rules: [
        {
          type: 'warning',
          message: 'Historische Schätzung, nicht systematisch erfasst',
        },
      ],
    },
    documentation: {
      description:
        `Geschätzte Anzahl Praktikant:innen seit Beginn des Integrationsprogramms ${ORG_PROFILE.milestones.integrationProgram}. Exakte Zahl nicht systematisch erfasst.`,
      limitations: [
        'Nicht systematisch getrackt',
        'Schätzung basierend auf Erinnerungen',
      ],
      improvements: [
        'Rückwirkende Erfassung (wenn möglich)',
        'Systematisches Tracking einführen',
      ],
      link: '/wirkung',
    },
  },

  plaetze_8_10: {
    id: 'plaetze_8_10',
    name: 'Verfügbare Integrationsplätze',
    category: 'social',
    dimension: 'social_integration',
    format: 'range',
    source: {
      type: 'capacity',
      confidence: 'medium',
    },
    formula: undefined,
    validation: {
      rules: [{ type: 'range', min: 5, max: 15 }],
    },
    documentation: {
      description:
        'Anzahl gleichzeitig verfügbarer Integrationsplätze für Praktikant:innen.',
      limitations: ['Abhängig von Raumkapazität und Betreuung'],
      improvements: ['Kapazität dokumentieren', 'Auslastung tracken'],
      link: '/wirkung',
    },
  },

  // ==========================================================================
  // BUDGET & FUNDRAISING NUMBERS
  // ==========================================================================

  budget_total_y1: {
    id: 'budget_total_y1',
    name: 'Gesamtbudget Jahr 1',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'derived',
      confidence: 'high',
      path: 'lib/config/budget-scenarios.ts → BUDGET_LINE_ITEMS (moderate scenario)',
    },
    formula: {
      type: 'sum',
      expression: 'SUM(BUDGET_LINE_ITEMS.amount)',
    },
    validation: {
      rules: [{ type: 'range', min: 400000, max: 800000 }],
    },
    documentation: {
      description: 'Summe aller 7 Budgetmodule (4 einmalig + 3 jährlich) für Jahr 1.',
      drivers: ['Standortgrösse', 'Personalkosten', 'Investitionsbedarf'],
      link: '/fundraising',
    },
  },

  budget_einmalig: {
    id: 'budget_einmalig',
    name: 'Einmalige Investitionen',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'derived',
      confidence: 'high',
      path: 'lib/config/budget-scenarios.ts → BUDGET_LINE_ITEMS (type=einmalig)',
    },
    formula: {
      type: 'sum',
      expression: 'SUM(BUDGET_LINE_ITEMS.amount WHERE type=einmalig)',
    },
    validation: {
      rules: [{ type: 'range', min: 100000, max: 300000 }],
    },
    documentation: {
      description: '4 einmalige Investitionsmodule: Standort-Umzug, Werkstatt/Makerspace, IT-Infrastruktur/AI Lab, Museum/Kulturraum.',
      link: '/fundraising',
    },
  },

  budget_jaehrlich: {
    id: 'budget_jaehrlich',
    name: 'Jährliche Kosten',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'derived',
      confidence: 'high',
      path: 'lib/config/budget-scenarios.ts → BUDGET_LINE_ITEMS (type=jaehrlich)',
    },
    formula: {
      type: 'sum',
      expression: 'SUM(BUDGET_LINE_ITEMS.amount WHERE type=jaehrlich)',
    },
    validation: {
      rules: [{ type: 'range', min: 200000, max: 500000 }],
    },
    documentation: {
      description: '3 jährliche Kostenmodule: Bildungsleitung (2 Stellen), Standort-Betrieb, Bildungs-/Community-Programm.',
      link: '/fundraising',
    },
  },

  budget_eigenleistung: {
    id: 'budget_eigenleistung',
    name: 'Eigenleistung Jahr 1',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'source',
      confidence: 'high',
      path: 'lib/config/budget-scenarios.ts → EIGENLEISTUNG_CONFIG',
    },
    formula: undefined,
    validation: {
      rules: [{ type: 'range', min: 50000, max: 200000 }],
    },
    documentation: {
      description: 'Eigenleistung Revamp-IT: Erlöse Geräteverkauf, IT-Dienstleistungen, bestehende Infrastruktur und Freiwilligenarbeit.',
      link: '/fundraising',
    },
  },

  project_3y_total: {
    id: 'project_3y_total',
    name: 'Gesamtprojekt 3 Jahre',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'derived',
      confidence: 'high',
      path: 'app/fundraising/data.ts → THREE_YEAR_MODEL',
    },
    formula: {
      type: 'sum',
      expression: 'SUM(THREE_YEAR_MODEL[].total)',
    },
    validation: {
      rules: [{ type: 'range', min: 1000000, max: 2500000 }],
    },
    documentation: {
      description: 'Summe aller 3 Jahresbudgets. Jahr 1 = BUDGET_LINE_ITEMS total + Eigenleistung. Jahr 2-3 = degressives Modell.',
      link: '/fundraising',
    },
  },

  stiftungen_3y_total: {
    id: 'stiftungen_3y_total',
    name: 'Stiftungsfinanzierung 3 Jahre',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'derived',
      confidence: 'high',
      path: 'app/fundraising/data.ts → THREE_YEAR_MODEL',
    },
    formula: {
      type: 'sum',
      expression: 'SUM(THREE_YEAR_MODEL[].stiftungen + THREE_YEAR_MODEL[].einmalig)',
    },
    validation: {
      rules: [{ type: 'range', min: 500000, max: 1500000 }],
    },
    documentation: {
      description: 'Gesamte Stiftungsfinanzierung über 3 Jahre (einmalig + jährlich degressiv). Sinkt von ~568k (J1) auf ~180k (J3).',
      link: '/fundraising',
    },
  },

  eigen_3y_total: {
    id: 'eigen_3y_total',
    name: 'Eigenleistung 3 Jahre',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'derived',
      confidence: 'high',
      path: 'app/fundraising/data.ts → THREE_YEAR_MODEL',
    },
    formula: {
      type: 'sum',
      expression: 'SUM(THREE_YEAR_MODEL[].eigen)',
    },
    validation: {
      rules: [{ type: 'range', min: 300000, max: 800000 }],
    },
    documentation: {
      description: 'Eigenleistung über 3 Jahre — wachsend durch neue Einnahmequellen (Kurse, Repair Café, AI Hosting).',
      link: '/fundraising',
    },
  },

  revenue_current: {
    id: 'revenue_current',
    name: 'Einnahmen aktuell',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'estimated',
      confidence: 'medium',
      path: 'Geschäftsplan / Kivitendo 3100+3400',
    },
    formula: {
      type: 'sum',
      expression: 'SUM(REVENUE_STREAMS[].current)',
    },
    validation: {
      rules: [{ type: 'range', min: 100000, max: 300000 }],
    },
    documentation: {
      description: 'Aktuelle jährliche Einnahmen aus allen Quellen (primär Geräteverkauf).',
      link: '/fundraising',
    },
  },

  revenue_year3: {
    id: 'revenue_year3',
    name: 'Einnahmen-Prognose Jahr 3',
    category: 'financial',
    dimension: 'economic',
    format: 'CHF',
    source: {
      type: 'estimated',
      confidence: 'medium',
      path: 'Geschäftsplan / Prognose',
    },
    formula: {
      type: 'sum',
      expression: 'SUM(REVENUE_STREAMS[].year3)',
    },
    validation: {
      rules: [{ type: 'range', min: 200000, max: 500000 }],
    },
    documentation: {
      description: 'Prognostizierte Einnahmen in Jahr 3 — diversifiziert durch 6 Einnahmequellen statt primär Geräteverkauf.',
      link: '/fundraising',
    },
  },

  space_total: {
    id: 'space_total',
    name: 'Gesamtfläche Community Tech Space',
    category: 'operational',
    dimension: 'capacity',
    format: 'integer',
    source: {
      type: 'derived',
      confidence: 'high',
      path: 'app/fundraising/data.ts → SPACE_PLAN',
    },
    formula: {
      type: 'sum',
      expression: 'SPACE_SUMMARY.total_with_circulation (hub-space-plan.ts)',
    },
    validation: {
      rules: [{ type: 'range', min: 500, max: 800 }],
    },
    documentation: {
      description: 'Nutzfläche (~590 m²) plus ~60 m² Verkehrsfläche = ~650 m² Gesamtfläche. Abgeleitet aus hub-space-plan.ts.',
      link: '/fundraising',
    },
  },
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Metric → InspectorData bridge
// ---------------------------------------------------------------------------

const SOURCE_TYPE_MAP: Record<MetricSourceType, InspectorSourceType> = {
  source: 'live',
  derived: 'derived',
  estimated: 'estimated',
  calculated: 'derived',
  target: 'none',
  capacity: 'none',
};

const CONFIDENCE_LABELS: Record<Confidence, string> = {
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Niedrig',
};

/**
 * Convert a NumberSources metric to InspectorData for the NumberInspector modal.
 * Year references ("2025") in name/description/path are auto-replaced when `year` is provided.
 */
export function metricToInspectorData(
  metric: Metric,
  value: string,
  options?: {
    year?: number;
    formula?: string;
  },
): InspectorData {
  const yearReplace = (s: string) =>
    options?.year ? s.replace(/2025/g, String(options.year)) : s;

  return {
    label: yearReplace(metric.name),
    value,
    sourceType: SOURCE_TYPE_MAP[metric.source.type] ?? 'none',
    source: yearReplace(metric.source.path ?? 'Berechnet'),
    account: metric.source.account,
    formula: options?.formula ?? (metric.formula ? yearReplace(metric.formula.expression) : undefined),
    confidence: CONFIDENCE_LABELS[metric.source.confidence],
    description: yearReplace(metric.documentation.description),
  };
}

