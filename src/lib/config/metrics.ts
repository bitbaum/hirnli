/**
 * Number Sources Database (TypeScript port of number-sources.js)
 *
 * Central registry for all numbers displayed in the dashboard.
 * Every number must have: unique ID, source type, confidence level,
 * formula (if derived), validation rules, and documentation link.
 */

import type { Metric, MetricSourceType, Confidence } from '../schemas/metric';
import type { InspectorData, InspectorSourceType } from '../schemas/inspector';

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
      link: '../methodik/index.html#income-data',
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
      link: '../methodik/index.html#income-data',
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
      link: '../methodik/index.html#income-data',
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
      link: '../methodik/index.html#income-data',
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
        'Spendenabhängigkeit reduzieren',
      ],
      target: 70,
      link: '../methodik/index.html#self-financing',
      whyItMatters:
        'Eigenfinanzierung zeigt Unabhängigkeit von Spenden. >70% = nachhaltig, <40% = gefährlich abhängig.',
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
      link: '../methodik/index.html#income-data',
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
      link: '../methodik/index.html#income-data',
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
      assumption: 'Durchschnittspreis CHF 150/Gerät',
    },
    formula: {
      type: 'custom',
      expression: 'warenverkauf / 150',
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
      link: '../methodik/index.html#device-estimation',
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
      assumption: '300 kg CO2 pro Gerät (Durchschnitt)',
    },
    formula: {
      type: 'custom',
      expression: 'devices * 300 / 1000',
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
      link: '../methodik/index.html#co2-calculation',
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
      link: '../methodik/index.html#ewaste-calculation',
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
    name: 'Praktikant:innen seit 2009',
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
        'Geschätzte Anzahl Praktikant:innen seit Gründung 2009. Exakte Zahl nicht systematisch erfasst.',
      limitations: [
        'Nicht systematisch getrackt',
        'Schätzung basierend auf Erinnerungen',
      ],
      improvements: [
        'Rückwirkende Erfassung (wenn möglich)',
        'Systematisches Tracking einführen',
      ],
      link: '../wirkung/index.html',
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
      link: '../wirkung/index.html',
    },
  },
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/** Look up a single metric by key. Returns null if not found. */
export function getNumberSource(key: string): Metric | null {
  return NumberSources[key] ?? null;
}

/** Return all metrics belonging to a given category (e.g. 'financial'). */
export function getNumbersByCategory(category: string): Metric[] {
  return Object.values(NumberSources).filter((m) => m.category === category);
}

/** Return all metrics belonging to a given dimension (e.g. 'ecological'). */
export function getNumbersByDimension(dimension: string): Metric[] {
  return Object.values(NumberSources).filter((m) => m.dimension === dimension);
}

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

/** Validate a numeric value against the rules defined for a metric key. */
export function validateNumber(
  key: string,
  value: number,
): { valid: boolean; warnings: string[]; errors: string[] } {
  const source = NumberSources[key];
  if (!source) {
    return { valid: false, warnings: [], errors: ['Source not found'] };
  }

  const results: { valid: boolean; warnings: string[]; errors: string[] } = {
    valid: true,
    warnings: [],
    errors: [],
  };

  for (const rule of source.validation.rules) {
    if (rule.type === 'range') {
      if (
        rule.min !== undefined &&
        rule.max !== undefined &&
        (value < rule.min || value > rule.max)
      ) {
        results.valid = false;
        results.errors.push(
          `Value ${value} outside range [${rule.min}, ${rule.max}]`,
        );
      }
    }

    if (rule.type === 'warning') {
      results.warnings.push(rule.message ?? 'Warning');
    }
  }

  return results;
}
