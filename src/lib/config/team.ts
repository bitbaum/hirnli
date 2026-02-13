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

export interface TeamMember {
  name: string;
  role: string;
  vza: number; // Vollzeitäquivalent (0.0 - 1.0)
  bereich: 'Leitung' | 'Technik' | 'Strategie' | 'Bildung';
  status: 'aktiv' | 'geplant';
  fachgebiete?: string[];
  seit?: string; // ISO date or year
}

export const KERNTEAM: TeamMember[] = [
  {
    name: 'Vero',
    role: 'Geschäftsleitung & Koordination',
    vza: 1.0,
    bereich: 'Leitung',
    status: 'aktiv',
    fachgebiete: ['Geschäftsleitung', 'Strategische Planung', 'Fundraising', 'Netzwerk'],
  },
  {
    name: 'Dani',
    role: 'Operations & Refurbishment',
    vza: 1.0,
    bereich: 'Technik',
    status: 'aktiv',
    fachgebiete: ['Refurbishment', 'Werkstatt-Management', 'Qualitätssicherung', 'Logistik'],
  },
  {
    name: 'Andreas',
    role: 'Strategie & Entwicklung',
    vza: 1.0,
    bereich: 'Strategie',
    status: 'aktiv',
    fachgebiete: ['Software-Entwicklung', 'IT-Infrastruktur', 'Digitale Transformation', 'Innovation'],
  },
];

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

export const TEAM_SUMMARY = {
  kernteam_vza: KERNTEAM.reduce((sum, m) => sum + m.vza, 0),
  bpl_vza: BILDUNGSPROGRAMMLEITER.reduce((sum, m) => sum + m.vza, 0),
  total_current_vza: KERNTEAM.filter(m => m.status === 'aktiv').reduce((sum, m) => sum + m.vza, 0),
  total_planned_vza: KERNTEAM.reduce((sum, m) => sum + m.vza, 0) + BILDUNGSPROGRAMMLEITER.reduce((sum, m) => sum + m.vza, 0),
  kernteam_count: KERNTEAM.length,
  bpl_count: BILDUNGSPROGRAMMLEITER.length,
  total_count: KERNTEAM.length + BILDUNGSPROGRAMMLEITER.length,
} as const;

/**
 * Train-the-Trainer Multiplication Effect
 *
 * How 2× Bildungsprogrammleiter create 32× social impact
 *
 * WICHTIG: Diese Zahlen sind PROJEKTIONEN basierend auf:
 * - Train-the-Trainer Konzept (etablierte Bildungsstrategie, siehe z.B. WHO, NGO-Praxis)
 * - Unsere eigene Erfahrung (informell, nicht systematisch dokumentiert)
 * - Schätzungen für realistische Kapazität bei strukturierter Organisation
 *
 * NICHT: Empirisch gemessen oder aus externer Quelle zitiert.
 * Diese Zahlen müssen wir ab 2026 systematisch erfassen (Teil der Data-Strategie).
 *
 * Das Train-the-Trainer Konzept selbst ist real und etabliert, aber die spezifischen
 * Zahlen für unseren Kontext sind Schätzungen/Planungen, keine verifizierten Daten.
 */
export const MULTIPLICATION_EFFECT = {
  hardware_bpl: {
    direct_training: 10, // Menschen/Jahr direkt trainiert
    trained_technicians_active: 5, // Gleichzeitig aktive trainierte Techniker
    indirect_reach: 50, // Menschen/Jahr erreicht durch trainierte Techniker
    total_reach: 60, // Direkt + Indirekt
    device_multiplier: 2.5, // Geräte-Kapazität Multiplikator (durch trainierte Techniker)
  },
  software_bpl: {
    direct_training: 8, // Menschen/Jahr direkt trainiert
    ai_literacy_trainers: 3, // Ausgebildet zu Trainern
    indirect_reach: 40, // Menschen/Jahr erreicht durch Trainer
    total_reach: 48, // Direkt + Indirekt
  },
  combined: {
    direct_training: 18, // 10 + 8
    total_people_reached: 160, // 60 + 48 + Workshops (50-80)
    social_impact_multiplier: 32, // Von 5/Jahr heute auf 160/Jahr = 32×
  },
} as const;

/**
 * Team Salary Structure (from numbers.ts for cross-reference)
 */
export const TEAM_SALARIES = {
  kernteam_total: 220_000, // CHF/Jahr (3 VZÄ)
  hardware_bpl: 87_500, // CHF/Jahr (gleicher Lohn für beide BPL)
  software_bpl: 87_500, // CHF/Jahr (gleicher Lohn für beide BPL)
  total_with_bpl: 395_000, // CHF/Jahr (5 VZÄ)
  social_charges_multiplier: 1.20, // 20% Arbeitgeberanteil
  total_personnel_cost: 475_000, // CHF/Jahr inkl. Sozialleistungen
} as const;

/**
 * Capacity Projections
 */
export const TEAM_CAPACITY = {
  current: {
    devices_per_month: 30,
    devices_per_year: 360,
    people_trained_per_year: 5,
    team_size_vza: 3,
  },
  year3_with_hub_and_bpl: {
    devices_per_month: 180,
    devices_per_year: 2_160,
    people_trained_per_year: 175,
    team_size_vza: 5,
    device_multiplier: 6, // 180/30 = 6×
    social_impact_multiplier: 35, // 175/5 = 35×
  },
} as const;

/**
 * Data Quality Notes
 *
 * WHAT WE KNOW (high confidence):
 * - 3 VZÄ Kernteam (Vero, Dani, Andreas) - operativ verifiziert
 * - Rollen und Bereiche - klar definiert
 * - Geplant: 2 VZÄ Bildungsprogrammleiter
 *
 * WHAT WE DON'T TRACK SYSTEMATICALLY:
 * - Stundensätze (cost_rate) - nicht systematisch erfasst
 * - Detaillierte Skills-Matrix - informell bekannt, nicht dokumentiert
 * - Arbeitszeiten/Anwesenheit - Vertrauensarbeitszeit, keine Zeiterfassung
 * - Urlaubstage, Krankheit - HR-Daten nicht digitalisiert
 *
 * WHY THIS IS OK:
 * - Wir sind ein 3-Personen-Team, keine formelle HR-Abteilung nötig
 * - Für Fundraising/Transparenz reichen VZÄ und Rollen
 * - Detaillierte HR-Daten sind privacy-sensitiv (gehören nicht auf public site)
 */

export const DATA_QUALITY_NOTE = {
  what_we_know: 'VZÄ, Rollen, Bereiche - operativ verifiziert',
  what_we_dont_track: 'Stundensätze, Skills-Matrix, Zeiterfassung - nicht systematisch erfasst',
  why_this_is_ok: '3-Personen-Team, keine formelle HR-Abteilung nötig. Für Transparenz reichen VZÄ und Rollen.',
  previous_source: 'HR_Roster.csv (retired 2026-02-13 - incomplete data, external dependency)',
  current_source: 'team.ts (SSOT - operational reality)',
} as const;

// Type exports
export type { TeamMember };
export { KERNTEAM, BILDUNGSPROGRAMMLEITER, TEAM_SUMMARY, MULTIPLICATION_EFFECT, TEAM_SALARIES, TEAM_CAPACITY, DATA_QUALITY_NOTE };
