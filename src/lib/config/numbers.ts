/**
 * Central Number Registry - SSOT for all metrics
 *
 * Every number on the site must be defined here with:
 * - value: The actual number
 * - label: Display label
 * - source: Where it comes from (methodology, calculation, study)
 * - confidence: How reliable (high/medium/estimated/target/unknown)
 * - documentUrl: Link to downloadable source document (if available)
 * - lastVerified: When we last checked this
 *
 * AUDIT 2026-02-16: Reconciled all values for launch readiness.
 * Removed unverifiable multipliers and aspirational projections.
 * All values now match budget-scenarios.ts and fundraising/data.ts.
 */

export type NumberConfidence = 'high' | 'medium' | 'estimated' | 'target' | 'unknown';

export interface NumberSource {
  value: string | number;
  label: string;
  source: {
    methodology: string;
    calculation?: string;
    confidence: NumberConfidence;
    lastVerified: string; // ISO date
    documentUrl?: string; // Path to public/documents/
    externalLink?: string;
  };
  category: 'impact' | 'operations' | 'financial' | 'social';
}

export const NUMBERS_REGISTRY: Record<string, NumberSource> = {
  // Impact Metrics
  CO2_SAVED_PER_LAPTOP: {
    value: 285,
    label: 'kg CO2 gespart pro Laptop',
    source: {
      methodology: 'Fraunhofer IZM Studie 2023: Refurbishing vs. Neuproduktion',
      calculation: 'Neuproduktion: 350kg CO2 - Refurbishing: 65kg CO2 = 285kg gespart',
      confidence: 'high',
      lastVerified: '2026-02-16',
      documentUrl: '/documents/sources/fraunhofer-izm-2023-co2-lifecycle.pdf',
      externalLink: 'https://www.izm.fraunhofer.de/de/abteilungen/umwelt_energiemanagement.html',
    },
    category: 'impact',
  },

  REUSE_RATE: {
    value: 75,
    label: '% Reuse-Rate',
    source: {
      methodology: 'Interne Auswertung: Anteil der eingegangenen Geräte, die als funktionierende Geräte wieder in Umlauf gebracht werden',
      calculation: '~75% der eingegangenen Geräte werden refurbished und verkauft/gespendet, ~25% gehen in Ersatzteilgewinnung oder Recycling',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'impact',
  },

  DEVICE_LIFESPAN_EXTENSION: {
    value: 5,
    label: 'Jahre zusätzliche Nutzungsdauer',
    source: {
      methodology: 'Erfahrungswerte aus 20+ Jahren Refurbishing: Linux verlängert Lebensdauer älterer Hardware signifikant',
      calculation: 'Durchschnittliche zusätzliche Nutzungsdauer nach Refurbishing mit Linux-Installation',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'impact',
  },

  LAPTOPS_REFURBISHED_TOTAL: {
    value: '1\'200+',
    label: 'Laptops refurbished (2003-2025)',
    source: {
      methodology: 'Interne Aufzeichnungen + Schätzung 2003-2018, systematisch erfasst ab 2019',
      calculation: '2019-2025: 847 dokumentiert (Kivitendo) + 2003-2018: ~350 geschätzt (15/Jahr Durchschnitt)',
      confidence: 'medium',
      lastVerified: '2026-02-12',
      documentUrl: '/documents/sources/laptop-refurbishment-history-2003-2025.pdf',
    },
    category: 'impact',
  },

  PEOPLE_HELPED: {
    value: '100+',
    label: 'Menschen begleitet (2003-2025)',
    source: {
      methodology: 'Praktikanten + Volunteers + Workshop-Teilnehmer (nicht systematisch erfasst vor 2024)',
      calculation: 'Geschätzt basierend auf durchschnittlich 4-5 Personen/Jahr seit 2003',
      confidence: 'medium',
      lastVerified: '2026-02-01',
    },
    category: 'social',
  },

  YEARS_EXPERIENCE: {
    value: 23,
    label: 'Jahre Erfahrung (seit 2003)',
    source: {
      methodology: 'Handelsregister Eintrag, Gründungsjahr verifiziert',
      confidence: 'high',
      lastVerified: '2026-02-01',
      externalLink: 'https://www.zefix.ch/',
    },
    category: 'operations',
  },

  // Current Operations (2025)
  CURRENT_BUDGET: {
    value: 60_000,
    label: 'Aktuelles Jahresbudget (2025)',
    source: {
      methodology: 'Kivitendo Erfolgsrechnung 2025 (Volljahr)',
      calculation: 'Gesamteinnahmen 2025: CHF 60\'402 (Warenverkauf 22k + Dienstleistungen 28k + Rest)',
      confidence: 'high',
      lastVerified: '2026-02-16',
      documentUrl: '/documents/financials/budget-2025-estimate.pdf',
    },
    category: 'financial',
  },

  CURRENT_WORKSHOP_SPACE: {
    value: 250,
    label: 'm² aktueller Gesamtstandort (Laden + Lager)',
    source: {
      methodology: 'Mietverträge: Laden Birmensdorferstrasse 379 (120m²) + Lager Badenerstrasse 816 (130m²)',
      calculation: 'Laden 120m² + Lager 130m² = 250m² Gesamtfläche',
      confidence: 'high',
      lastVerified: '2026-02-12',
    },
    category: 'operations',
  },

  // Hub Target (Year 3 - 2028)
  HUB_SPACE_TOTAL: {
    value: 550,
    label: 'm² Community Tech Hub (Ziel)',
    source: {
      methodology: 'Detaillierter Raumplan (fundraising/data.ts SPACE_PLAN) + Mietkalkulation budget-scenarios.ts',
      calculation: 'Lager 120m² + Werkstatt 90m² + Event/Café 80m² + Makerspace 45m² + Museum 45m² + Schulung 40m² + Shop 35m² + Küche 25m² + Büro 20m² + AI Lab 15m² + Nebenräume 35m² = 550m²',
      confidence: 'medium',
      lastVerified: '2026-02-16',
      documentUrl: '/documents/hub/space-requirements-analysis.pdf',
    },
    category: 'operations',
  },

  // Revenue Year 3 (2028) — matches itemized 8-stream model in fundraising/data.ts
  YEAR3_REVENUE_TOTAL: {
    value: 195_000,
    label: 'CHF Target Revenue Jahr 3 (2028)',
    source: {
      methodology: 'Bottom-up Kalkulation aus 8 Revenue-Streams (fundraising/data.ts REVENUE_STREAMS)',
      calculation: 'Geräteverkauf 45k + Dienstleistungen 55k + Corporate Placements 30k + Kurse 20k + Integration 15k + Repair Café 15k + AI Hosting 10k + Spenden 5k = 195k',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'financial',
  },

  // 3-Year Budget — derived from budget-scenarios.ts moderate scenario
  BUDGET_YEAR1_TOTAL: {
    value: 553_500,
    label: 'CHF Budget Jahr 1 (2026)',
    source: {
      methodology: 'budget-scenarios.ts moderate: einmalig + jaehrlich + eigenleistung',
      calculation: 'Einmalig CHF 119.5k + Jährlich CHF 334k + Eigenleistung CHF 100k = CHF 553.5k',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'financial',
  },

  BUDGET_YEAR2_TOTAL: {
    value: 514_000,
    label: 'CHF Budget Jahr 2 (2027)',
    source: {
      methodology: 'budget-scenarios.ts moderate: jaehrlich + eigenleistung',
      calculation: 'Jährlich CHF 334k + Eigenleistung CHF 180k = CHF 514k',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'financial',
  },

  BUDGET_YEAR3_TOTAL: {
    value: 614_000,
    label: 'CHF Budget Jahr 3 (2028)',
    source: {
      methodology: 'budget-scenarios.ts moderate: jaehrlich + eigenleistung',
      calculation: 'Jährlich CHF 334k + Eigenleistung CHF 280k = CHF 614k',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'financial',
  },

  BUDGET_3YEAR_TOTAL: {
    value: 1_681_500,
    label: 'CHF Gesamtbudget 3 Jahre (2026-2028)',
    source: {
      methodology: 'Summe Jahr 1-3 aus budget-scenarios.ts moderate',
      calculation: 'CHF 553.5k + CHF 514k + CHF 614k = CHF 1\'681.5k',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'financial',
  },

  FUNDING_STIFTUNGEN_3YEAR: {
    value: 862_000,
    label: 'CHF Stiftungsgelder (3 Jahre)',
    source: {
      methodology: 'Abgeleitet aus THREE_YEAR_MODEL (fundraising/data.ts) mit degressiver Finanzierung',
      calculation: 'Jahr 1: CHF 453.5k (einmalig + jaehrlich) + Jahr 2: CHF 249k (74.5%) + Jahr 3: CHF 160k (47.8%) ≈ CHF 862k',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'financial',
  },

  FUNDING_REVENUE_3YEAR: {
    value: 592_000,
    label: 'CHF Eigenleistung/Revenue (3 Jahre)',
    source: {
      methodology: 'Abgeleitet aus THREE_YEAR_MODEL (fundraising/data.ts)',
      calculation: 'Jahr 1: CHF 100k + Jahr 2: CHF 196k + Jahr 3: CHF 296k = CHF 592k',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'financial',
  },

  // Team — Bildungsprogrammleiter
  BPL_HARDWARE_TECHNICIANS_PER_YEAR: {
    value: '8-12',
    label: 'Techniker pro Jahr (Hardware-Bildungsprogrammleiter)',
    source: {
      methodology: 'Kapazitätsplanung basierend auf Train-the-Trainer + Praktikanten + Reintegrations-Programme',
      calculation: '4 Praktikanten (3-6 Monate) + 4 Reintegrations-Personen (IV/Burnout, 6-12 Monate) + 2 Freiwillige (laufend) = 10 Personen/Jahr durchschnittlich',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
      documentUrl: '/documents/team/hardware-bpl-capacity.pdf',
    },
    category: 'social',
  },

  BPL_SOFTWARE_DEVELOPERS_PER_YEAR: {
    value: '6-10',
    label: 'Entwickler pro Jahr (Software/AI-Bildungsprogrammleiter)',
    source: {
      methodology: 'Kapazitätsplanung basierend auf AI-Literacy Programme + Software-Training',
      calculation: '3 Junior Developers (Bootcamp-Absolventen, 6-12 Monate) + 3 AI-Literacy Trainer (ausgebildet zu Trainern) + 2 Open-Source Contributors (laufend) = 8 Personen/Jahr durchschnittlich',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
      documentUrl: '/documents/team/software-bpl-capacity.pdf',
    },
    category: 'social',
  },

  TEAM_CORE_FTE: {
    value: 3,
    label: 'FTE Kernteam (aktuell)',
    source: {
      methodology: 'Vero (Geschäftsleitung) + Dani (Operations) + Andreas (Strategie/Entwicklung)',
      calculation: '3 Vollzeitstellen',
      confidence: 'high',
      lastVerified: '2026-02-12',
    },
    category: 'operations',
  },

  TEAM_TARGET_FTE_WITH_BPL: {
    value: 5,
    label: 'FTE Total mit 2× Bildungsprogrammleiter (Ziel)',
    source: {
      methodology: 'Kernteam 3 FTE + 2× Bildungsprogrammleiter',
      calculation: '3 (Kern) + 1 (Hardware-BPL) + 1 (Software/AI-BPL) = 5 FTE',
      confidence: 'high',
      lastVerified: '2026-02-12',
    },
    category: 'operations',
  },

  PEOPLE_REACHED_PER_YEAR_WITH_2BPL: {
    value: '40-60',
    label: 'Menschen erreicht pro Jahr mit 2× BPL (Ziel, konservativ)',
    source: {
      methodology: 'Konservative Schätzung: direkte Trainings durch 2× BPL',
      calculation: 'Hardware-BPL: 10 direkt trainiert/Jahr + Software-BPL: 8 direkt trainiert/Jahr + Workshops: 20-40 Teilnehmer = 40-60 Menschen/Jahr',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'social',
  },

  // Operations KPIs (current state)
  DEVICES_PER_MONTH_CURRENT: {
    value: '~12-15',
    label: 'Geräte/Monat verkauft (geschätzt aus Umsatzdaten)',
    source: {
      methodology: 'Abgeleitet aus Warenverkauf-Umsatz (Kivitendo Konto 3100)',
      calculation: 'CHF 22k Warenverkauf (2025) ÷ ~CHF 150 Durchschnittspreis ÷ 12 Monate ≈ 12 Geräte/Monat',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'operations',
  },

  DEVICES_YEAR_CURRENT: {
    value: 150,
    label: 'Geräte/Jahr verkauft (2025, geschätzt)',
    source: {
      methodology: 'Abgeleitet aus Warenverkauf-Umsatz (Kivitendo Konto 3100)',
      calculation: 'CHF 22k Warenverkauf (2025) ÷ ~CHF 150 Durchschnittspreis ≈ 147, gerundet auf 150',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'operations',
  },

  DEVICES_YEAR_CURRENT_NOTE: {
    value: 'Hinweis',
    label: 'Methodik Geräte-Schätzung',
    source: {
      methodology: 'Die Geräteanzahl wird aus dem Warenverkauf-Umsatz abgeleitet (Umsatz ÷ Durchschnittspreis). Die tatsächliche Anzahl verarbeiteter Geräte (inkl. Gratis-Abgaben, Recycling, Ersatzteilgewinnung) ist höher, wird aber nicht systematisch erfasst. Systematische Erfassung ab 2026 geplant.',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'operations',
  },

  TIME_PER_DEVICE: {
    value: '2-3',
    label: 'Stunden aktive Arbeit pro Gerät (Durchschnitt)',
    source: {
      methodology: 'Zeiterfassung Refurbishment-Prozess (Intake + Triage + Wipe + Refurb + QA + Listing)',
      calculation: 'Intake 5-10min + Data Wipe 30-45min + Refurb 60-90min + QA 10-15min + Listing 15-20min = 120-180min',
      confidence: 'estimated',
      lastVerified: '2026-02-01',
      documentUrl: '/documents/operations/process-time-breakdown.pdf',
    },
    category: 'operations',
  },

  STORAGE_DAYS_TARGET: {
    value: 30,
    label: 'Tage maximale Lagerdauer (Ziel)',
    source: {
      methodology: 'KMS Framework (C_Kennzahlen_und_Reporting)',
      confidence: 'high',
      lastVerified: '2025-12-15',
    },
    category: 'operations',
  },

  RECYCLING_RATE_TARGET: {
    value: 80,
    label: '% Wiederverwertungsquote (Ziel)',
    source: {
      methodology: 'KMS Framework (C_Kennzahlen_und_Reporting)',
      calculation: 'Ziel: 80% der Komponenten von unbrauchbaren Geräten wiederverwertet',
      confidence: 'high',
      lastVerified: '2025-12-15',
    },
    category: 'operations',
  },

  // Pricing Model Targets
  GRATIS_QUOTE_TARGET: {
    value: '5-15',
    label: '% Gratis-Quote (Ziel)',
    source: {
      methodology: 'Vorstandsentscheidung Januar 2025',
      calculation: 'Ziel: 5-15% der Geräte kostenlos an Organisationen (AOZ, Caritas, etc.)',
      confidence: 'estimated',
      lastVerified: '2025-01-15',
    },
    category: 'financial',
  },

  KULTURLEGI_QUOTE_TARGET: {
    value: '10-20',
    label: '% KulturLegi-Quote (Ziel)',
    source: {
      methodology: 'Vorstandsentscheidung Januar 2025',
      calculation: 'Ziel: 10-20% der Verkäufe zu KulturLegi-Preisen (50% Rabatt)',
      confidence: 'estimated',
      lastVerified: '2025-01-15',
    },
    category: 'financial',
  },

  SUPPORTER_QUOTE_TARGET: {
    value: '10-20',
    label: '% Supporter-Quote (Ziel)',
    source: {
      methodology: 'Vorstandsentscheidung Januar 2025',
      calculation: 'Ziel: 10-20% der Verkäufe zu Supporter-Preisen (+20% Aufschlag)',
      confidence: 'estimated',
      lastVerified: '2025-01-15',
    },
    category: 'financial',
  },

  // Process Time Estimates (for Operations page)
  INTAKE_TIME: {
    value: '5-10',
    label: 'Minuten Intake pro Gerät',
    source: {
      methodology: 'Prozess-Zeiterfassung 2024-2025',
      calculation: 'Annahme + Sichtprüfung + Label + Lagereinlagerung',
      confidence: 'estimated',
      lastVerified: '2026-02-01',
    },
    category: 'operations',
  },

  QA_TIME: {
    value: '10-15',
    label: 'Minuten QA pro Gerät',
    source: {
      methodology: 'Prozess-Zeiterfassung 2024-2025',
      calculation: 'Funktionstest + Kosmetische Prüfung + Dokumentation',
      confidence: 'estimated',
      lastVerified: '2026-02-01',
    },
    category: 'operations',
  },

  LISTING_TIME: {
    value: '15-20',
    label: 'Minuten Listing pro Gerät',
    source: {
      methodology: 'Prozess-Zeiterfassung 2024-2025',
      calculation: 'Fotos + Beschreibung + Kivitendo-Eintrag + Online-Publikation',
      confidence: 'estimated',
      lastVerified: '2026-02-01',
    },
    category: 'operations',
  },

  // Team Budget & Salaries
  TEAM_SALARY_CORE_TOTAL: {
    value: 220_000,
    label: 'CHF Kernteam-Gehälter (3 Personen, Budget-Ziel)',
    source: {
      methodology: 'Budget-Ziel für faire Entlöhnung. Aktuelle Gehälter sind NICHT bekannt.',
      calculation: 'Zielgehälter für 3 Personen basierend auf Schweizer Non-Profit Niveau. Kivitendo zeigt historisch nur CHF 30-48k/Jahr TOTAL Personal (2020-2023) — weit unter Markt für Zürich. Aktuelle Löhne von Dani und Veronica sind uns nicht bekannt.',
      confidence: 'unknown',
      lastVerified: '2026-02-16',
    },
    category: 'financial',
  },

  TEAM_SALARY_HARDWARE_BPL: {
    value: 90_000,
    label: 'CHF Gehalt Hardware-Bildungsprogrammleiter (Budget-Ziel)',
    source: {
      methodology: 'Budget-Ziel: ~60% von CHF 150k Vollzeit-Äquivalent (Schweizer Non-Profit Niveau)',
      calculation: 'Konsistent mit budget-scenarios.ts personnel_education_leaders_2: 2× CHF 90k/Jahr. Position noch nicht besetzt.',
      confidence: 'target',
      lastVerified: '2026-02-16',
    },
    category: 'financial',
  },

  TEAM_SALARY_SOFTWARE_BPL: {
    value: 90_000,
    label: 'CHF Gehalt Software/AI-Bildungsprogrammleiter (Budget-Ziel)',
    source: {
      methodology: 'Budget-Ziel: ~60% von CHF 150k Vollzeit-Äquivalent (Schweizer Non-Profit Niveau)',
      calculation: 'Konsistent mit budget-scenarios.ts personnel_education_leaders_2: 2× CHF 90k/Jahr. Position noch nicht besetzt.',
      confidence: 'target',
      lastVerified: '2026-02-16',
    },
    category: 'financial',
  },

  TEAM_TOTAL_SALARY_WITH_BPL: {
    value: 400_000,
    label: 'CHF Total Gehälter mit 2× BPL (5 Personen, Budget-Ziel)',
    source: {
      methodology: 'Summe Kernteam-Ziel + 2× Bildungsprogrammleiter-Ziel',
      calculation: 'Kernteam CHF 220k (Ziel) + Hardware-BPL CHF 90k (Ziel) + Software-BPL CHF 90k (Ziel) = CHF 400k. Achtung: Aktuelle Kernteam-Gehälter sind nicht bekannt und historisch deutlich tiefer.',
      confidence: 'target',
      lastVerified: '2026-02-16',
    },
    category: 'financial',
  },

  TEAM_COST_TOTAL_WITH_OVERHEAD: {
    value: 480_000,
    label: 'CHF Total Personalkosten inkl. Sozialleistungen (Budget-Ziel)',
    source: {
      methodology: 'Ziel-Gehälter + Schweizer Sozialabgaben (AHV, ALV, Pensionskasse, etc.)',
      calculation: 'Ziel-Gehälter CHF 400k × 1.20 (20% Arbeitgeberanteil Sozialversicherungen) = CHF 480k',
      confidence: 'target',
      lastVerified: '2026-02-16',
    },
    category: 'financial',
  },

  TEAM_ROI_REVENUE_PER_FTE: {
    value: 39_000,
    label: 'CHF Revenue pro FTE (Jahr 3)',
    source: {
      methodology: 'Geplanter Revenue Jahr 3 ÷ Team-Grösse',
      calculation: 'CHF 195k Revenue (Jahr 3) ÷ 5 FTE = CHF 39k/FTE',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'financial',
  },

  // Team Size Projections (kept as reasonable planning numbers)
  TEAM_SIZE_YEAR5: {
    value: 9,
    label: 'FTE Team-Grösse Jahr 5 (2030)',
    source: {
      methodology: 'Kernteam 3 + BPL 4 + Operations 2',
      calculation: 'Kernteam 3 (Vero, Dani, Andreas) + 4× BPL (Hardware×2, Software×2) + 2× Operations-Manager = 9 FTE',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
    },
    category: 'operations',
  },

  TEAM_SIZE_VISION_2030: {
    value: 15,
    label: 'FTE Team-Grösse Vision 2030 (Jahr 7+)',
    source: {
      methodology: 'Haupt-Hub + Satellit-Standort',
      calculation: 'Haupt-Hub (9 FTE) + Satellit-Werkstatt (4 FTE) + Zentrale Services (2 FTE Marketing/Fundraising) = 15 FTE',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
    },
    category: 'operations',
  },
};

/**
 * Helper function to get a number by key
 */
export function getNumber(key: keyof typeof NUMBERS_REGISTRY): NumberSource {
  return NUMBERS_REGISTRY[key];
}

/** Extract numeric value from a registry entry. Throws if not numeric. */
export function getNumericValue(key: keyof typeof NUMBERS_REGISTRY): number {
  const entry = NUMBERS_REGISTRY[key];
  if (typeof entry.value !== 'number') {
    throw new Error(`NUMBERS_REGISTRY.${key} is not numeric: ${entry.value}`);
  }
  return entry.value;
}

// Convenience exports for the most commonly referenced constants
export const CO2_PER_LAPTOP = getNumericValue('CO2_SAVED_PER_LAPTOP');

/**
 * Helper function to get all numbers by category
 */
export function getNumbersByCategory(category: NumberSource['category']): Record<string, NumberSource> {
  return Object.fromEntries(
    Object.entries(NUMBERS_REGISTRY).filter(([_, value]) => value.category === category)
  );
}
