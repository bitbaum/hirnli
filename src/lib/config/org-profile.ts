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
  // Legal identity
  name: 'Revamp-IT',
  legalForm: 'Gemeinnütziger Verein',
  founded: _FOUNDED,
  location: 'Zürich',
  address: 'Badenerstrasse 816, 8048 Zürich',
  website: 'https://revamp-it.ch',
  email: 'empfang@revamp-it.ch',
  fundraisingEmail: 'fundraising@revamp-it.ch',
  phone: '+41 (0)43 960 32 64',
  shopAddress: 'Birmensdorferstrasse 379, 8055 Zürich',

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
} as const;

export type OrgProfile = typeof ORG_PROFILE;
