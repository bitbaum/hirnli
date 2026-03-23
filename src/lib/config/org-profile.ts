/**
 * Organization Profile — SSOT for all programmatic org identity
 *
 * Every "which org is this?" reference imports from here.
 * Content files that need full rewrite per-org are marked ORG-SPECIFIC in their headers.
 *
 * To swap orgs: change this file + rewrite ORG-SPECIFIC content files.
 */

const _FOUNDED = 2003;
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
  email: 'empfang@revamp-it.ch',
  fundraisingEmail: 'fundraising@revamp-it.ch',
  contactName: 'Andreas Hunkeler',
  phone: '+41 (0)43 960 32 64',
  warehouseAddress: 'Badenerstrasse 816, 8048 Zürich',

  // Platform identity
  platform: {
    name: 'Revamp-Info',
    tagline: 'Fundraising Hub',
    url: 'https://revamp-info.vercel.app',
  },

  // Key program milestones (years)
  milestones: {
    integrationProgram: 2009,  // Praktikums-/Integrationsprogramm
    kivitendoStart: 2007,      // ERP-Buchhaltung
    deviceTrackingStart: 2018, // Systematische Geräteerfassung
  },

  // Computed from founded year — never hardcode "20 Jahre" etc.
  yearsActive: _YEARS_ACTIVE,
  experienceLabel: `über ${_YEARS_ACTIVE} Jahre Erfahrung`,
  missionKeywords: ['Kreislaufwirtschaft', 'Arbeitsintegration', 'digitale Bildung'],
  missionSummary: 'Kreislaufwirtschaft, Arbeitsintegration und digitaler Bildung',

  // ORG-SPECIFIC: Mission areas with concrete metrics for AI prompt assembly
  missionAreas: [
    {
      name: 'Kreislaufwirtschaft',
      description: 'IT-Geräte reparieren, refurbishen, weitergeben',
      metrics: ['~150 Geräte/Jahr', '~285 kg CO₂ pro Gerät gespart (Fraunhofer IZM 2023)', '75% Reuse-Rate'],
    },
    {
      name: 'Arbeitsintegration',
      description: '8–10 Praktikumsplätze für benachteiligte Menschen (Sozialhilfe, RAV, IV)',
      metrics: ['100+ Praktikant:innen seit 2009', 'Begleitung durch erfahrene Techniker'],
    },
    {
      name: 'Digitale Bildung',
      description: 'Linux-Kurse, IT-Grundlagen, Reparatur-Workshops',
      metrics: ['Eigene Open-Source-Plattform', 'Partnerschaften mit Schulen und Sozialdiensten'],
    },
  ],
} as const;

export type OrgProfile = typeof ORG_PROFILE;
