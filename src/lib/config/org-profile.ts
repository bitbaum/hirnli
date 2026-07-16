/**
 * Organization Profile — SSOT for all programmatic org identity
 *
 * Every "which org is this?" reference imports from here.
 * Content files that need full rewrite per-org are marked ORG-SPECIFIC in their headers.
 *
 * To swap orgs: change this file + rewrite ORG-SPECIFIC content files.
 */

// Import from shared-org-numbers (auto-generated from DB) — not from numbers.ts
// to avoid a circular dependency (numbers.ts imports ORG_PROFILE).
import { SHARED_ORG_NUMBERS } from './shared-org-numbers.generated';

const _FOUNDED = SHARED_ORG_NUMBERS.FOUNDING_YEAR;
const _INTEGRATION_PROGRAM_YEAR = 2009; // Praktikums-/Integrationsprogramm start
const _YEARS_ACTIVE = new Date().getFullYear() - _FOUNDED;

export const ORG_PROFILE = {
  // DB/pipeline identifier (must match org_id column in fundraising_foundations)
  orgId: 'revamp-it',

  // Legal identity
  name: 'Revamp-IT',
  legalForm: 'Gemeinnütziger Verein',
  founded: _FOUNDED,
  location: 'Zürich',
  address: 'Birmensdorferstrasse 379, 8055 Zürich',
  website: 'https://revamp-it.ch',
  cloudUrl: 'https://cloud.revamp-it.ch',
  email: 'empfang@revamp-it.ch',
  fundraisingEmail: 'fundraising@revamp-it.ch',
  contactName: 'Andreas Hunkeler',
  phone: '+41 (0)43 960 32 64',
  warehouseAddress: 'Badenerstrasse 816, 8048 Zürich',
  taxExemption: 'Steuerbefreit gemäss Kanton Zürich',

  // Platform identity
  platform: {
    name: 'Revamp-Info',
    tagline: 'Fundraising Hub',
    url: 'https://revamp-info.orangecat.ch',
  },

  // Key program milestones (years)
  milestones: {
    integrationProgram: _INTEGRATION_PROGRAM_YEAR,
    kivitendoStart: 2007,      // ERP-Buchhaltung
    deviceTrackingStart: 2018, // Systematische Geräteerfassung
  },

  // Computed from founded year — never hardcode "20 Jahre" etc.
  yearsActive: _YEARS_ACTIVE,
  // Dative form ("Jahren") — used after "mit" / "Als <X> mit", so plural dative
  // is required. Bridge-composer, anschreiben-composer, and the stories opening
  // template all interpolate this in dative position.
  experienceLabel: `über ${_YEARS_ACTIVE} Jahren Erfahrung`,
  missionKeywords: ['Kreislaufwirtschaft', 'Arbeitsintegration', 'digitale Bildung'],
  missionSummary: 'Kreislaufwirtschaft, Arbeitsintegration und digitaler Bildung',

  // ORG-SPECIFIC: Mission areas with concrete metrics for AI prompt assembly
  missionAreas: [
    {
      name: 'Kreislaufwirtschaft',
      description: 'IT-Geräte reparieren, refurbishen, weitergeben',
      metrics: [
        `~${SHARED_ORG_NUMBERS.DEVICES_YEAR_CURRENT} Geräte/Jahr`,
        `~${SHARED_ORG_NUMBERS.CO2_SAVED_PER_LAPTOP} kg CO₂ pro Gerät gespart (Fraunhofer IZM 2023)`,
        `${SHARED_ORG_NUMBERS.REUSE_RATE}% Reuse-Rate`,
      ],
    },
    {
      name: 'Arbeitsintegration',
      description: '8–10 Praktikumsplätze für benachteiligte Menschen (Sozialhilfe, RAV, IV)',
      metrics: [`100+ Praktikant:innen seit ${_INTEGRATION_PROGRAM_YEAR}`, 'Begleitung durch erfahrene Techniker'],
    },
    {
      name: 'Digitale Bildung',
      description: 'Linux-Kurse, IT-Grundlagen, Reparatur-Workshops',
      metrics: ['Eigene Open-Source-Plattform', 'Partnerschaften mit Schulen und Sozialdiensten'],
    },
  ],
} as const;

export type OrgProfile = typeof ORG_PROFILE;
