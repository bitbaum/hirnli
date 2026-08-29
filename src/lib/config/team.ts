/**
 * Team Configuration - SSOT
 *
 * Ground Truth #2: Single Source of Truth for team data
 *
 * IMPORTANT: This replaces HR_Roster.csv which had incomplete data.
 * We only include what we actually know and can verify.
 *
 * Last Updated: 2026-02-13
 */

interface TeamMember {
  name: string;
  role: string;
  vza: number; // Vollzeitäquivalent (0.0 - 1.0)
  bereich: 'Leitung' | 'Technik' | 'Strategie' | 'Bildung';
  status: 'aktiv' | 'geplant';
  fachgebiete?: string[];
  seit?: string; // ISO date or year
}

export const BILDUNGSPROGRAMMLEITER: TeamMember[] = [
  {
    name: 'Hardware-Bildungsprogrammleiter:in',
    role: 'Hardware-BPL (Techniker ausbilden)',
    vza: 1.0,
    bereich: 'Bildung',
    status: 'geplant',
    fachgebiete: [
      'Hardware-Refurbishment',
      'Technische Ausbildung',
      'Train-the-Trainer',
      'Programm-Management',
      'Qualitätssicherung',
    ],
  },
  {
    name: 'Software/AI-Bildungsprogrammleiter:in',
    role: 'Software/AI-BPL (Entwickler trainieren)',
    vza: 1.0,
    bereich: 'Bildung',
    status: 'geplant',
    fachgebiete: [
      'Software-Entwicklung',
      'AI & Machine Learning',
      'Open-Source',
      'Digitale Bildung',
      'Train-the-Trainer',
    ],
  },
];

/**
 * Train-the-Trainer Effect (Direct Training Only)
 *
 * WICHTIG: Nur direkte Trainings-Zahlen. Keine Kaskadenberechnungen oder
 * Multiplikatoren, da diese nicht verifizierbar sind.
 *
 * Diese Zahlen sind PROJEKTIONEN basierend auf:
 * - Train-the-Trainer Konzept (etablierte Bildungsstrategie)
 * - Schätzungen für realistische Kapazität bei strukturierter Organisation
 *
 * NICHT: Empirisch gemessen. Ab 2026 systematisch erfassen.
 */
export const MULTIPLICATION_EFFECT = {
  hardware_bpl: {
    direct_training: 10, // Menschen/Jahr direkt trainiert
  },
  software_bpl: {
    direct_training: 8, // Menschen/Jahr direkt trainiert
  },
  combined: {
    direct_training: 18, // 10 + 8
    people_reached_with_workshops: '40-60', // Direkte Trainings + Workshop-Teilnehmer (konservativ)
  },
} as const;

/**
 * Team Salary Structure — BUDGET-ZIELE, nicht aktuelle Löhne
 *
 * WICHTIG: Aktuelle Gehälter von Dani und Veronica sind uns NICHT bekannt.
 * Kivitendo zeigt historisch CHF 30-48k/Jahr TOTAL Personal (2020-2023),
 * was für Zürich weit unter Markt liegt. Die hier genannten Zahlen sind
 * Budget-Ziele für faire Entlöhnung, NICHT aktuelle Ist-Werte.
 */
export const TEAM_SALARIES = {
  kernteam_total: 220_000, // CHF/Jahr — BUDGET-ZIEL für 3 Personen (aktuelle Löhne unbekannt)
  hardware_bpl: 90_000, // CHF/Jahr — Budget-Ziel (Position noch nicht besetzt)
  software_bpl: 90_000, // CHF/Jahr — Budget-Ziel (Position noch nicht besetzt)
  total_with_bpl: 400_000, // CHF/Jahr — Budget-Ziel (5 Personen): 220k + 90k + 90k
  social_charges_multiplier: 1.2, // 20% Arbeitgeberanteil
  total_personnel_cost: 480_000, // CHF/Jahr — Budget-Ziel inkl. Sozialleistungen: 400k × 1.20
  _note:
    'Alle Werte sind Budget-Ziele. Historische Kivitendo-Daten (2020-2023): CHF 30-48k/Jahr total Personal.',
} as const;

// Derived: total annual cost for both BPL positions incl. social charges
export const BPL_TOTAL_COST_PER_YEAR =
  (TEAM_SALARIES.hardware_bpl + TEAM_SALARIES.software_bpl) *
  TEAM_SALARIES.social_charges_multiplier;

/**
 * Capacity Projections — DRAFT/ESTIMATES
 *
 * IMPORTANT: These are planning estimates, NOT verified data.
 * - Current capacity: NOT systematically tracked (estimates based on informal observation)
 * - Year 3 projections: Based on realistic hub plan (~150m² werkstatt, NOT 600m²)
 * - All numbers need validation and systematic measurement starting 2026
 */
export const TEAM_CAPACITY = {
  current: {
    devices_per_month: 12, // ESTIMATE - derived from Warenverkauf: CHF 22k ÷ CHF 150 ÷ 12
    devices_per_year: 150, // ESTIMATE - derived from Warenverkauf revenue
    people_trained_per_year: 5, // ESTIMATED ~5 (informal, not systematically tracked) — aligned with NUMBERS_REGISTRY.PEOPLE_REACHED_CURRENT
    team_size_vza: 3,
  },
  year3_with_hub_and_bpl: {
    devices_per_month: 40, // Conservative 2-3× from current ~15 (better processes + more space)
    devices_per_year: 480, // 40 × 12
    people_trained_per_year: 50, // Conservative: 18 direct (BPL) + ~30 workshop participants
    team_size_vza: 5, // 3 current + 2 BPL
  },
} as const;

/**
 * Data Quality Notes & Team Reality
 *
 * KERNTEAM:
 * - 3 Personen: Andreas, Veronica (Sozialpädagogin), Dani
 * - Aktuelle Gehälter sind NICHT bekannt
 * - Andreas may not even be paid (doesn't like talking about it)
 * - Kivitendo zeigt CHF 30-48k/Jahr TOTAL Personal (2020-2023) — weit unter Markt
 * - Diese 3 sind das "Kernteam" - täglich präsent, Verantwortung tragen
 *
 * WEITERE TEAM-MITGLIEDER (NICHT IM VZÄ ERFASST):
 * - Freiwillige (Volunteers) - variable Anzahl, nicht systematisch getrackt
 * - 1 Praktikant: Reza - consistently present, wichtiger Beitrag
 * - Reintegrations-Mitarbeiter - via GEP-Programm und ähnliche Initiativen
 *
 * SOZIALE MISSION:
 * - Wir sind KEIN Silicon-Valley-Startup mit "move fast break things" Mentalität
 * - Soziale Mission steht im Vordergrund - Menschen entwickeln, nicht nur produktiv sein
 * - Veronica's Rolle als Sozialpädagogin ist zentral für Arbeitsintegration
 *
 * WHAT WE DON'T TRACK SYSTEMATICALLY:
 * - Stundenleistung von Freiwilligen (variabel, vertrauensbasiert)
 * - Detaillierte Anwesenheit/Zeiterfassung (Vertrauensarbeitszeit)
 * - Aktuelle Refurbishment-Kapazität (Schätzung: ~12-15 Geräte/Monat, basierend auf Umsatz)
 * - Aktuelle Bildungswirkung (informelles Training passiert, aber nicht gemessen)
 *
 * WHY THIS IS OK:
 * - Kleine Organisation, keine formelle HR-Abteilung nötig
 * - Für Fundraising/Transparenz reichen VZÄ des Kernteams
 * - Privacy-sensible Daten gehören nicht auf public site
 * - Fokus auf soziale Mission, nicht auf Metriken-Optimierung
 */

export const DATA_QUALITY_NOTE = {
  kernteam:
    '3 Personen (Andreas*, Veronica, Dani) — aktuelle Gehälter nicht bekannt. *may not even be paid. Kivitendo: CHF 30-48k/Jahr total Personal (2020-2023).',
  weitere_mitglieder: 'Freiwillige, 1 Praktikant (Reza), Reintegrations-Mitarbeiter (GEP-Programm)',
  social_mission: 'Sozialpädagogischer Fokus (Veronica), NICHT Silicon Valley Mentalität',
  what_we_dont_track: 'Freiwilligen-Stunden, aktuelle Kapazität, informelle Bildungswirkung',
  why_this_is_ok: 'Kleine Org, soziale Mission > Metriken, Privacy-sensible Daten nicht public',
  previous_source: 'HR_Roster.csv (retired 2026-02-13 - incomplete data)',
  current_source: 'team.ts (SSOT - operational reality)',
} as const;

// ============================================================================
// DISPLAY-ORIENTED TEAM MEMBERS
// Used by team page, fundraising sections, and any component needing a
// simple name+fachgebiete+bereich list.
// ============================================================================

/** Display-oriented team member (distinct from the VZA-focused TeamMember above) */
export interface TeamMemberDisplay {
  id: string;
  name: string;
  fachgebiete: string[];
  bereich: 'Leitung' | 'Technik' | 'Betrieb';
  capacity?: string;
}

export const TEAM_MEMBERS: TeamMemberDisplay[] = [
  // Leitung
  {
    id: 'PER-0001',
    name: 'Andreas',
    fachgebiete: ['Geschäftsführung', 'Strategie'],
    bereich: 'Leitung',
  },
  {
    id: 'PER-0002',
    name: 'Daniel',
    fachgebiete: ['Elektrotechnik', 'Software Engineering', 'Betrieb'],
    bereich: 'Leitung',
  },
  {
    id: 'PER-0003',
    name: 'Veronica',
    fachgebiete: ['Sozialpädagogik', 'HR', 'Fundraising'],
    bereich: 'Leitung',
  },
  // Technik
  {
    id: 'PER-0004',
    name: 'Cem',
    fachgebiete: ['Software Engineering', 'Kivitendo'],
    bereich: 'Technik',
  },
  {
    id: 'PER-0005',
    name: 'George',
    fachgebiete: ['Software Engineering', 'Fundraising', 'Betrieb', 'Systementwicklung'],
    bereich: 'Technik',
    capacity: '60%',
  },
  { id: 'PER-0006', name: 'Michael', fachgebiete: ['Technik'], bereich: 'Technik' },
  { id: 'PER-0007', name: 'Mike', fachgebiete: ['Open Source', 'Linux'], bereich: 'Technik' },
  { id: 'PER-0008', name: 'Reza', fachgebiete: ['Reparatur', 'Technik'], bereich: 'Technik' },
  { id: 'PER-0009', name: 'Romeo', fachgebiete: ['Reparatur'], bereich: 'Technik' },
  {
    id: 'PER-0010',
    name: 'Sili',
    fachgebiete: ['Reparatur', 'Software Engineering', 'Kivitendo'],
    bereich: 'Technik',
  },
  { id: 'PER-0011', name: 'Simeon', fachgebiete: ['Technik'], bereich: 'Technik' },
  { id: 'PER-0012', name: 'Winchester', fachgebiete: ['3D-Modellierung'], bereich: 'Technik' },
  // Betrieb
  { id: 'PER-0013', name: 'Heinz', fachgebiete: ['Betrieb', 'Geräte-Annahme'], bereich: 'Betrieb' },
  { id: 'PER-0014', name: 'Bruno', fachgebiete: ['Betrieb'], bereich: 'Betrieb' },
];

export const DEPARTMENTS = [
  { name: 'Leitung', icon: '👔', borderColor: 'border-l-pillar-vision' },
  { name: 'Technik', icon: '🔧', borderColor: 'border-l-primary' },
  { name: 'Betrieb', icon: '📦', borderColor: 'border-l-success' },
] as const;
