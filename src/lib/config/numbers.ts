/**
 * Central Number Registry - SSOT for all metrics
 *
 * Every number on the site must be defined here with:
 * - value: The actual number
 * - label: Display label
 * - source: Where it comes from (methodology, calculation, study)
 * - confidence: How reliable (high/medium/estimated)
 * - documentUrl: Link to downloadable source document (if available)
 * - lastVerified: When we last checked this
 */

export type NumberConfidence = 'high' | 'medium' | 'estimated';

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
      lastVerified: '2026-01-15',
      documentUrl: '/documents/sources/fraunhofer-izm-2023-co2-lifecycle.pdf',
      externalLink: 'https://www.izm.fraunhofer.de/de/abteilungen/umwelt_energiemanagement.html',
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
    value: 80_000,
    label: 'Aktuelles Jahresbudget (2025, geschätzt)',
    source: {
      methodology: 'Basierend auf Kivitendo Daten + Hochrechnung',
      calculation: 'Durchschnitt 2022-2024 Revenue + bekannte 2025 Aufträge',
      confidence: 'medium',
      lastVerified: '2026-02-10',
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
    value: 1_000,
    label: 'm² Community Tech Hub (Gesamt-Hub, alle Räume)',
    source: {
      methodology: 'Konzept basierend auf vergleichbaren Makerspaces in Zürich',
      calculation: 'Werkstatt 600m² + AI Lab 150m² + Event Space 100m² + Shop 50m² + Offices 100m² = 1000m² Gesamt-Hub',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
      documentUrl: '/documents/hub/space-requirements-analysis.pdf',
    },
    category: 'operations',
  },

  // Revenue Year 3 (2028)
  YEAR3_REVENUE_TOTAL: {
    value: 290_000,
    label: 'CHF Target Revenue Jahr 3 (2028)',
    source: {
      methodology: 'Bottom-up Kalkulation aller Revenue-Quellen',
      calculation: 'Corporate B2B CHF 120k + Workshops CHF 90k + Repairs CHF 50k + Events CHF 30k',
      confidence: 'estimated',
      lastVerified: '2026-02-11',
      documentUrl: '/documents/financials/revenue-model-year3.pdf',
    },
    category: 'financial',
  },

  YEAR3_CORPORATE_B2B: {
    value: 120_000,
    label: 'CHF Corporate B2B (Jahr 3)',
    source: {
      methodology: '15 Unternehmenskunden × CHF 8k Durchschnitt',
      calculation: 'IT Disposal (10 Kunden × CHF 12k) + Corporate Training (5 Kunden × CHF 8k)',
      confidence: 'estimated',
      lastVerified: '2026-02-11',
      documentUrl: '/documents/revenue/corporate-b2b-model.pdf',
    },
    category: 'financial',
  },

  YEAR3_WORKSHOPS: {
    value: 90_000,
    label: 'CHF Tech-Bildung & Workshops (Jahr 3)',
    source: {
      methodology: 'Zahlende Workshops finanzieren kostenlose Programme',
      calculation: 'AI Literacy CHF 30k (60×CHF500) + Repair Skills CHF 24k (80×CHF300) + Corporate Training CHF 36k (12×CHF3k)',
      confidence: 'estimated',
      lastVerified: '2026-02-11',
      documentUrl: '/documents/revenue/workshop-revenue-model.pdf',
    },
    category: 'financial',
  },

  YEAR3_REPAIRS: {
    value: 50_000,
    label: 'CHF Repair Services (Jahr 3)',
    source: {
      methodology: '400 Reparaturen × CHF 120 Durchschnitt + 80 Mitglieder × CHF 400/Jahr',
      calculation: 'Consumer Repairs CHF 48k + Tech Memberships CHF 32k - Rabatte = CHF 50k netto',
      confidence: 'estimated',
      lastVerified: '2026-02-11',
    },
    category: 'financial',
  },

  YEAR3_EVENTS: {
    value: 30_000,
    label: 'CHF Event Space (Jahr 3)',
    source: {
      methodology: '50 Events × CHF 800 Durchschnitt - Betriebskosten',
      calculation: 'Corporate Offsites + Startups + Community Events (Mix bezahlt/kostenlos)',
      confidence: 'estimated',
      lastVerified: '2026-02-11',
    },
    category: 'financial',
  },

  // Revenue Growth Mechanics
  QUALITY_IMPROVEMENT: {
    value: 40,
    label: '% Quality Improvement (durch Hub)',
    source: {
      methodology: 'Professionelle Werkstatt + AI-gestützte Diagnostik + Zertifizierungen',
      calculation: 'Refurbishment-Zeit -25% + Fehlerrate -60% + Zertifizierungsrate +80% → Ø +40% Produktqualität',
      confidence: 'estimated',
      lastVerified: '2026-02-11',
      documentUrl: '/documents/hub/quality-improvements.pdf',
    },
    category: 'operations',
  },

  EFFICIENCY_GAIN: {
    value: 31,
    label: '% Cost Reduction (durch Hub)',
    source: {
      methodology: 'Economies of Scale + Automatisierung + Ausbildungsprogramme',
      calculation: 'Miete/Gerät -40% (4× Raum-Volumen + Team-Skalierung) + Prozesszeit -30% + Fehlerkosten -60% → Ø -31% Kosten',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
      documentUrl: '/documents/hub/efficiency-analysis.pdf',
    },
    category: 'operations',
  },

  SCALE_MULTIPLIER: {
    value: 4.0,
    label: '× Volume Increase (durch Hub)',
    source: {
      methodology: 'Werkstatt-Kapazität + Team-Skalierung',
      calculation: '250m² aktuell → 1000m² Gesamt-Hub (davon ~600m² Werkstatt) = 4× Raum. Mit Prozess-Optimierung + Team-Skalierung → 4× realistisches Volumen.',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
      documentUrl: '/documents/hub/capacity-analysis.pdf',
    },
    category: 'operations',
  },

  // 3-Year Budget
  BUDGET_YEAR1_TOTAL: {
    value: 520_000,
    label: 'CHF Budget Jahr 1 (2026)',
    source: {
      methodology: 'Stiftungen CHF 450k (87%) + Revenue CHF 70k (13%)',
      calculation: 'Infrastruktur CHF 300k + Personal CHF 150k + Programme CHF 70k',
      confidence: 'estimated',
      lastVerified: '2026-02-11',
      documentUrl: '/documents/financials/budget-year1-breakdown.pdf',
    },
    category: 'financial',
  },

  BUDGET_YEAR2_TOTAL: {
    value: 560_000,
    label: 'CHF Budget Jahr 2 (2027)',
    source: {
      methodology: 'Stiftungen CHF 340k (61%) + Revenue CHF 220k (39%)',
      calculation: 'Personal CHF 350k + Programme CHF 150k + Marketing CHF 60k',
      confidence: 'estimated',
      lastVerified: '2026-02-11',
      documentUrl: '/documents/financials/budget-year2-breakdown.pdf',
    },
    category: 'financial',
  },

  BUDGET_YEAR3_TOTAL: {
    value: 540_000,
    label: 'CHF Budget Jahr 3 (2028)',
    source: {
      methodology: 'Stiftungen CHF 250k (46%) + Revenue CHF 290k (54%)',
      calculation: 'Operations selbsttragend (Revenue), Impact von Stiftungen finanziert (kostenlose Laptops/Stipendien)',
      confidence: 'estimated',
      lastVerified: '2026-02-11',
      documentUrl: '/documents/financials/budget-year3-breakdown.pdf',
    },
    category: 'financial',
  },

  BUDGET_3YEAR_TOTAL: {
    value: 1_620_000,
    label: 'CHF Gesamtbudget 3 Jahre (2026-2028)',
    source: {
      methodology: 'Jahr 1 + Jahr 2 + Jahr 3',
      calculation: 'CHF 520k + CHF 560k + CHF 540k = CHF 1\'620k',
      confidence: 'estimated',
      lastVerified: '2026-02-11',
      documentUrl: '/documents/financials/3year-budget-summary.pdf',
    },
    category: 'financial',
  },

  FUNDING_STIFTUNGEN_3YEAR: {
    value: 1_040_000,
    label: 'CHF Stiftungsgelder (3 Jahre)',
    source: {
      methodology: 'Jahr 1: CHF 450k + Jahr 2: CHF 340k + Jahr 3: CHF 250k',
      calculation: '64% des Gesamtbudgets über 3 Jahre',
      confidence: 'estimated',
      lastVerified: '2026-02-11',
    },
    category: 'financial',
  },

  FUNDING_REVENUE_3YEAR: {
    value: 580_000,
    label: 'CHF Revenue (3 Jahre)',
    source: {
      methodology: 'Jahr 1: CHF 70k + Jahr 2: CHF 220k + Jahr 3: CHF 290k',
      calculation: '36% des Gesamtbudgets über 3 Jahre',
      confidence: 'estimated',
      lastVerified: '2026-02-11',
    },
    category: 'financial',
  },

  // Team Multiplication & Bildungsprogrammleiter
  TEAM_MANAGER_RATIO: {
    value: '1:100',
    label: 'Manager → Participant Ratio',
    source: {
      methodology: 'Train-the-Trainer Modell',
      calculation: '1 Bildungsprogrammleiter → 5 Trainer ausbilden → 100 Teilnehmer erreichen',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
      documentUrl: '/documents/team/multiplication-effect.pdf',
    },
    category: 'social',
  },

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

  BPL_DEVICE_CAPACITY_MULTIPLIER: {
    value: 2.5,
    label: '× Geräte-Kapazität pro Bildungsprogrammleiter',
    source: {
      methodology: 'Basierend auf zusätzlicher Arbeitskraft durch trainierte Techniker',
      calculation: '1 BPL trainiert 10 Techniker/Jahr → 5 aktiv gleichzeitig (rotierend) → je 0.5 FTE = 2.5 FTE zusätzliche Kapazität',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
      documentUrl: '/documents/team/capacity-calculation-bpl.pdf',
    },
    category: 'operations',
  },

  DEVICES_PER_MONTH_WITH_2BPL: {
    value: '150-200',
    label: 'Geräte/Monat mit 2× Bildungsprogrammleiter (Ziel Jahr 3)',
    source: {
      methodology: 'Aktuelle Kapazität 25-35/Monat × Team-Multiplikator',
      calculation: 'Aktuell 30/Monat (Durchschnitt) × 6× Multiplikator (Hub 4× + Team 2× BPL × 2.5× je = 5×) ≈ 180/Monat',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
      documentUrl: '/documents/hub/year3-capacity-projection.pdf',
    },
    category: 'operations',
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
    value: '150-200',
    label: 'Menschen erreicht pro Jahr mit 2× BPL (Ziel)',
    source: {
      methodology: 'Train-the-Trainer Modell: Direkt + Indirekt',
      calculation: 'Hardware-BPL: 10 direkt trainiert + 50 durch Trainer = 60. Software-BPL: 8 direkt trainiert + 40 durch AI-Literacy Trainer = 48. Workshops: 50-80 Teilnehmer. Total ≈ 160-190 Menschen/Jahr',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
      documentUrl: '/documents/team/social-impact-projection.pdf',
    },
    category: 'social',
  },

  // Operations KPIs (current state)
  DEVICES_PER_MONTH_CURRENT: {
    value: '25-35',
    label: 'Geräte/Monat refurbished (aktuelle Kapazität)',
    source: {
      methodology: 'Durchschnitt 2024-2025 basierend auf Verkaufsstatistik Kivitendo',
      calculation: 'Jährlicher Geräteverkauf ÷ 12 Monate (ca. 300-420 Geräte/Jahr)',
      confidence: 'medium',
      lastVerified: '2026-02-12',
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
    label: 'CHF Kernteam-Gehälter (3 FTE)',
    source: {
      methodology: 'Budgetplanung basierend auf Schweizer Non-Profit Gehaltsniveau',
      calculation: 'Vero (Geschäftsleitung CHF 85k) + Dani (Operations CHF 75k) + Andreas (Strategie CHF 60k) = CHF 220k',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
    },
    category: 'financial',
  },

  TEAM_SALARY_HARDWARE_BPL: {
    value: 85_000,
    label: 'CHF Gehalt Hardware-Bildungsprogrammleiter',
    source: {
      methodology: 'Marktanalyse Schweizer Non-Profit + Tech-Bildungssektor',
      calculation: 'Erfahrener Techniker + pädagogische Kompetenz + Team-Management = CHF 80-90k, Mittelwert CHF 85k',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
    },
    category: 'financial',
  },

  TEAM_SALARY_SOFTWARE_BPL: {
    value: 90_000,
    label: 'CHF Gehalt Software/AI-Bildungsprogrammleiter',
    source: {
      methodology: 'Marktanalyse Schweizer Non-Profit + Tech-Bildungssektor',
      calculation: 'Senior Developer + AI-Literacy Expertise + Programm-Leitung = CHF 85-95k, Mittelwert CHF 90k',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
    },
    category: 'financial',
  },

  TEAM_TOTAL_SALARY_WITH_BPL: {
    value: 395_000,
    label: 'CHF Total Gehälter mit 2× BPL (5 FTE)',
    source: {
      methodology: 'Summe Kernteam + 2× Bildungsprogrammleiter',
      calculation: 'Kernteam CHF 220k + Hardware-BPL CHF 85k + Software-BPL CHF 90k = CHF 395k',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
    },
    category: 'financial',
  },

  TEAM_COST_TOTAL_WITH_OVERHEAD: {
    value: 475_000,
    label: 'CHF Total Personalkosten inkl. Sozialleistungen',
    source: {
      methodology: 'Gehälter + Schweizer Sozialabgaben (AHV, ALV, Pensionskasse, etc.)',
      calculation: 'Gehälter CHF 395k × 1.20 (20% Arbeitgeberanteil Sozialversicherungen) = CHF 474k',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
    },
    category: 'financial',
  },

  TEAM_ROI_REVENUE_PER_FTE: {
    value: 58_000,
    label: 'CHF Revenue pro FTE (Jahr 3)',
    source: {
      methodology: 'Geplanter Revenue Jahr 3 ÷ Team-Grösse',
      calculation: 'CHF 290k Revenue (Jahr 3) ÷ 5 FTE = CHF 58k/FTE',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
    },
    category: 'financial',
  },

  TEAM_BPL_PAYBACK_MONTHS: {
    value: 18,
    label: 'Monate bis BPL-Investment zurückgezahlt (Schätzung)',
    source: {
      methodology: 'Amortisationsrechnung: Zusätzlicher Revenue durch BPL ÷ BPL-Kosten',
      calculation: '2× BPL kosten CHF 175k/Jahr (inkl. Overhead). Zusätzlicher Revenue durch 6× Kapazität: ~CHF 120k/Jahr. Payback: (CHF 175k / CHF 120k) × 12 = 17.5 Monate',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
      documentUrl: '/documents/team/bpl-roi-calculation.pdf',
    },
    category: 'financial',
  },

  // Scaling Path to Vision 2030 (10,000 Devices/Year)
  DEVICES_YEAR_CURRENT: {
    value: 360,
    label: 'Geräte/Jahr aktuell (2025)',
    source: {
      methodology: 'Durchschnitt 30 Geräte/Monat × 12 Monate',
      calculation: '30/Monat × 12 = 360/Jahr',
      confidence: 'medium',
      lastVerified: '2026-02-12',
    },
    category: 'operations',
  },

  DEVICES_YEAR_YEAR3: {
    value: 2_160,
    label: 'Geräte/Jahr mit Hub + 2× BPL (Jahr 3, 2028)',
    source: {
      methodology: 'Projected capacity mit Hub (4×) + Team (2× BPL)',
      calculation: '180 Geräte/Monat × 12 = 2,160/Jahr',
      confidence: 'estimated',
      lastVerified: '2026-02-12',
    },
    category: 'operations',
  },

  DEVICES_YEAR_YEAR5: {
    value: 5_000,
    label: 'Geräte/Jahr mit zusätzlicher Skalierung (Jahr 5, 2030)',
    source: {
      methodology: 'Hub + 4× BPL + Prozess-Automation',
      calculation: '417 Geräte/Monat × 12 = 5,000/Jahr. Erreicht durch: +2× BPL (Total 4× BPL) + AI-gestützte Triage + automatisierte Listing-Pipeline',
      confidence: 'aspirational',
      lastVerified: '2026-02-12',
      documentUrl: '/documents/vision/scaling-path-to-10k.pdf',
    },
    category: 'operations',
  },

  DEVICES_YEAR_VISION_2030: {
    value: 10_000,
    label: 'Geräte/Jahr Vision 2030 (Jahr 7+)',
    source: {
      methodology: 'Full Vision 2030: Multi-Standort + Vollautomation',
      calculation: '833 Geräte/Monat × 12 = 10,000/Jahr. Erreicht durch: 1000m² Hub voll ausgelastet + 6× BPL + 2. Standort (Satellit-Werkstatt) + Vollautomation (AI Diagnostics, Robot-assisted Testing)',
      confidence: 'aspirational',
      lastVerified: '2026-02-12',
      documentUrl: '/documents/vision/vision-2030-capacity-model.pdf',
    },
    category: 'operations',
  },

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
      confidence: 'aspirational',
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

/**
 * Helper function to format currency
 */
export function formatCHF(amount: number): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Helper function to get all numbers by category
 */
export function getNumbersByCategory(category: NumberSource['category']): Record<string, NumberSource> {
  return Object.fromEntries(
    Object.entries(NUMBERS_REGISTRY).filter(([_, value]) => value.category === category)
  );
}
