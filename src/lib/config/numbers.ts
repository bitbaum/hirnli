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
 *
 * 9 entries share values with revampit's Neon DB via SHARED_ORG_NUMBERS.
 * To update shared values: edit seed script in revampit, re-seed DB,
 * then run `npm run sync-numbers` here.
 *
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite this file's content.
 * Programmatic org references use ORG_PROFILE (src/lib/config/org-profile.ts).
 */

import { z } from 'zod';
import { SHARED_ORG_NUMBERS } from './shared-org-numbers.generated'
import { SPACE_SUMMARY } from './hub-space-plan'
import { ORG_PROFILE } from './org-profile'

export const NumberConfidence = z.enum(['high', 'medium', 'estimated', 'target', 'unknown']);
export type NumberConfidence = z.infer<typeof NumberConfidence>;

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
    value: SHARED_ORG_NUMBERS.CO2_SAVED_PER_LAPTOP,
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
    value: SHARED_ORG_NUMBERS.REUSE_RATE,
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
    value: SHARED_ORG_NUMBERS.DEVICE_LIFESPAN_EXTENSION,
    label: 'Jahre zusätzliche Nutzungsdauer',
    source: {
      methodology: `Erfahrungswerte aus ${ORG_PROFILE.yearsActive}+ Jahren Refurbishing: Linux verlängert Lebensdauer älterer Hardware signifikant`,
      calculation: 'Durchschnittliche zusätzliche Nutzungsdauer nach Refurbishing mit Linux-Installation',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'impact',
  },

  LAPTOPS_REFURBISHED_TOTAL: {
    value: '1\'200+',
    label: `Laptops refurbished (${ORG_PROFILE.founded}-2025)`,
    source: {
      methodology: `Interne Aufzeichnungen + Schätzung ${ORG_PROFILE.founded}-2018, systematisch erfasst ab 2019`,
      calculation: `2019-2025: 847 dokumentiert (Kivitendo) + ${ORG_PROFILE.founded}-2018: ~350 geschätzt (15/Jahr Durchschnitt)`,
      confidence: 'medium',
      lastVerified: '2026-02-12',
      documentUrl: '/documents/sources/laptop-refurbishment-history-2003-2025.pdf',
    },
    category: 'impact',
  },

  PEOPLE_HELPED: {
    value: SHARED_ORG_NUMBERS.PEOPLE_HELPED,
    label: `Menschen begleitet (${ORG_PROFILE.founded}-2025)`,
    source: {
      methodology: 'Praktikanten + Volunteers + Workshop-Teilnehmer (nicht systematisch erfasst vor 2024)',
      calculation: `Geschätzt basierend auf durchschnittlich 4-5 Personen/Jahr seit ${ORG_PROFILE.founded}`,
      confidence: 'medium',
      lastVerified: '2026-02-01',
    },
    category: 'social',
  },

  YEARS_EXPERIENCE: {
    value: new Date().getFullYear() - SHARED_ORG_NUMBERS.FOUNDING_YEAR,
    label: `Jahre Erfahrung (seit ${SHARED_ORG_NUMBERS.FOUNDING_YEAR})`,
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
    value: SHARED_ORG_NUMBERS.CURRENT_BUDGET,
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
    value: SPACE_SUMMARY.total_usable,
    label: 'm² Community Tech Hub Nutzfläche (Ziel)',
    source: {
      methodology: 'Detaillierter Raumplan (hub-space-plan.ts) — Nutzfläche exkl. Verkehrsfläche (Flure, WC, Garderobe)',
      calculation: `Abgeleitet aus hub-space-plan.ts: ${SPACE_SUMMARY.total_with_circulation}m² Gesamtfläche - ${SPACE_SUMMARY.total_with_circulation - SPACE_SUMMARY.total_usable}m² Verkehrsfläche = ${SPACE_SUMMARY.total_usable}m² Nutzfläche. Miete: CHF 120k/Jahr (~600m² × CHF 200/m²)`,
      confidence: 'medium',
      lastVerified: '2026-02-23',
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
    value: 563_500,
    label: 'CHF Budget Jahr 1 (2026)',
    source: {
      methodology: 'budget-scenarios.ts moderate: einmalig + jaehrlich + eigenleistung',
      calculation: 'Einmalig CHF 119.5k + Jährlich CHF 344k + Eigenleistung CHF 100k = CHF 563.5k',
      confidence: 'estimated',
      lastVerified: '2026-02-23',
    },
    category: 'financial',
  },

  BUDGET_YEAR2_TOTAL: {
    value: 484_000,
    label: 'CHF Budget Jahr 2 (2027)',
    source: {
      methodology: 'budget-scenarios.ts moderate: jaehrlich + eigenleistung',
      calculation: 'Jährlich CHF 344k + Eigenleistung CHF 140k = CHF 484k',
      confidence: 'estimated',
      lastVerified: '2026-02-23',
    },
    category: 'financial',
  },

  BUDGET_YEAR3_TOTAL: {
    value: 539_000,
    label: 'CHF Budget Jahr 3 (2028)',
    source: {
      methodology: 'budget-scenarios.ts moderate: jaehrlich + eigenleistung',
      calculation: 'Jährlich CHF 344k + Eigenleistung CHF 195k = CHF 539k',
      confidence: 'estimated',
      lastVerified: '2026-02-23',
    },
    category: 'financial',
  },

  BUDGET_3YEAR_TOTAL: {
    value: 1_586_500,
    label: 'CHF Gesamtbudget 3 Jahre (2026-2028)',
    source: {
      methodology: 'Summe Jahr 1-3 aus budget-scenarios.ts moderate',
      calculation: 'CHF 563.5k + CHF 484k + CHF 539k = CHF 1\'586.5k',
      confidence: 'estimated',
      lastVerified: '2026-02-23',
    },
    category: 'financial',
  },

  FUNDING_STIFTUNGEN_3YEAR: {
    value: 'derived',
    label: 'CHF Stiftungsgelder (3 Jahre)',
    source: {
      methodology: 'Abgeleitet aus THREE_YEAR_MODEL (fundraising/data.ts) mit degressiver Finanzierung. Exact value computed at runtime.',
      calculation: 'See STIFTUNGEN_3Y_TOTAL in fundraising/data.ts — derived from DEGRESSIVE_CONFIG percentages applied to Y1 stiftungen.',
      confidence: 'estimated',
      lastVerified: '2026-02-23',
    },
    category: 'financial',
  },

  FUNDING_REVENUE_3YEAR: {
    value: 435_000,
    label: 'CHF Eigenleistung/Revenue (3 Jahre)',
    source: {
      methodology: 'Bottom-up Revenue-Modell: 8 Einnahmequellen (REVENUE_STREAMS in fundraising/data.ts)',
      calculation: 'Jahr 1: CHF 100k + Jahr 2: CHF 140k + Jahr 3: CHF 195k = CHF 435k. Aligned to REVENUE_STREAMS bottom-up (honest > optimistic).',
      confidence: 'estimated',
      lastVerified: '2026-02-23',
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

  BPL_DIRECT_TRAINED_PER_YEAR: {
    value: 18,
    label: 'Direkt trainierte Personen pro Jahr (beide BPL)',
    source: {
      methodology: 'Summe der Durchschnittswerte beider Bildungsprogrammleiter:innen',
      calculation: 'Hardware-BPL: 10/Jahr (Mitte von 8-12) + Software-BPL: 8/Jahr (Mitte von 6-10) = 18 direkt trainiert',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
    },
    category: 'social',
  },

  TEAM_CORE_FTE: {
    value: SHARED_ORG_NUMBERS.TEAM_CORE_FTE,
    label: 'Kernteam (aktuell)',
    source: {
      methodology: '2 Angestellte (Dani, Veronica) + 1 ehrenamtlich (Andreas). Aspiration: 2→4 Angestellte durch Stiftungsfinanzierung.',
      calculation: '3 Personen im Kernteam. Weitere ehrenamtliche Mitarbeitende (George, Cem, u.a.) nicht gezählt.',
      confidence: 'high',
      lastVerified: '2026-02-23',
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

  AVG_DEVICE_PRICE: {
    value: SHARED_ORG_NUMBERS.AVG_DEVICE_PRICE,
    label: 'CHF Durchschnittspreis pro Gerät',
    source: {
      methodology: 'Geschätzter Durchschnittspreis aus Warenverkauf / Geräteanzahl über mehrere Jahre',
      calculation: 'Mix aus Laptops (CHF 100-300), Desktops (CHF 50-150), Monitore (CHF 30-80)',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
    },
    category: 'operations',
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
    value: SHARED_ORG_NUMBERS.DEVICES_YEAR_CURRENT,
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

  // Community Platform (revampit.vercel.app)
  PLATFORM_CODEBASE_FILES: {
    value: 1302,
    label: 'TypeScript-Dateien in der Community-Plattform',
    source: {
      methodology: 'Codebase-Analyse (find src -name "*.ts" -o -name "*.tsx" | wc -l)',
      confidence: 'high',
      lastVerified: '2026-03-17',
    },
    category: 'operations',
  },

  PLATFORM_COMPONENTS: {
    value: 636,
    label: 'React-Komponenten (eigenentwickelt)',
    source: {
      methodology: 'Codebase-Analyse (find src -name "*.tsx" | wc -l)',
      confidence: 'high',
      lastVerified: '2026-03-17',
    },
    category: 'operations',
  },

  PLATFORM_PAGES: {
    value: 106,
    label: 'Seiten auf der Community-Plattform',
    source: {
      methodology: 'Next.js App Router page.tsx Dateien',
      confidence: 'high',
      lastVerified: '2026-03-17',
    },
    category: 'operations',
  },

  PLATFORM_DB_MIGRATIONS: {
    value: 67,
    label: 'Datenbank-Migrationen (PostgreSQL)',
    source: {
      methodology: 'Drizzle ORM Migration-Dateien',
      confidence: 'high',
      lastVerified: '2026-03-17',
    },
    category: 'operations',
  },

  PLATFORM_API_ROUTES: {
    value: 235,
    label: 'API-Endpunkte',
    source: {
      methodology: 'Next.js App Router route.ts Dateien',
      confidence: 'high',
      lastVerified: '2026-03-17',
    },
    category: 'operations',
  },

  // Current state (pre-Hub baseline)
  PEOPLE_REACHED_CURRENT: {
    value: '~5',
    label: 'Menschen/Jahr erreicht (aktuell, vor Hub)',
    source: {
      methodology: 'Informelle Schätzung basierend auf gelegentlicher Unterstützung ohne strukturierte Programme',
      calculation: 'Keine systematische Erfassung. Gelegentliche Hilfe für Praktikanten und Freiwillige.',
      confidence: 'estimated',
      lastVerified: '2026-02-23',
    },
    category: 'social',
  },

  DEVICES_PER_MONTH_TARGET: {
    value: 40,
    label: 'Geräte/Monat verkauft (Ziel mit Hub)',
    source: {
      methodology: 'Kapazitätsplanung: 2-3× aktuelle ~15 Geräte/Monat durch bessere Prozesse + mehr Fläche im Hub',
      calculation: 'Konservativ: ~15 aktuell × 2.7 = 40 (bessere Werkstatt, mehr Lager, mehr Personal)',
      confidence: 'estimated',
      lastVerified: '2026-02-23',
    },
    category: 'operations',
  },

  REPAIR_TABLES_CURRENT: {
    value: 4,
    label: 'Reparaturtische vorhanden (aktuell)',
    source: {
      methodology: 'Physische Zählung der vorhandenen Reparatur-Arbeitsplätze am Standort',
      confidence: 'high',
      lastVerified: '2026-02-23',
    },
    category: 'operations',
  },

  // External reference — Swiss foundations universe from Zefix commercial register
  SWISS_FOUNDATIONS_UNIVERSE: {
    value: 16900,
    label: 'Eingetragene Stiftungen in der Schweiz (Zefix)',
    source: {
      methodology: 'Zefix Handelsregister (Abruf 2026-04-22). Umfasst alle im Handelsregister eingetragenen Stiftungen.',
      confidence: 'estimated',
      lastVerified: '2026-04-22',
    },
    category: 'operations',
  },
};

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
export const AVG_DEVICE_PRICE = getNumericValue('AVG_DEVICE_PRICE');
// Fraunhofer IZM 2023 component values: new manufacture vs. refurbishment CO2 cost.
// CO2_PER_LAPTOP = CO2_NEW_LAPTOP_MANUFACTURE - CO2_REFURBISH_COST (350 − 65 = 285).
// If the study is updated, change all three together.
export const CO2_NEW_LAPTOP_MANUFACTURE = 350; // kg CO2, Fraunhofer IZM 2023
export const CO2_REFURBISH_COST = 65; // kg CO2, Fraunhofer IZM 2023
// Numeric total for calculations (NUMBERS_REGISTRY.LAPTOPS_REFURBISHED_TOTAL.value is a
// display string '1\'200+' — this export provides the numeric equivalent for arithmetic)
export const LAPTOPS_REFURBISHED_COUNT = 1200;
// Average CO2 footprint of one economy flight Zürich–Berlin (~1 hour), in kg
// Source: myclimate.org flight calculator (2024). Used to contextualize CO2 savings.
export const CO2_PER_FLIGHT_ZRH_BER = 1500;

