/**
 * Organization Profile — SSOT for all programmatic org identity
 *
 * Every "which org is this?" reference imports from here.
 * Content files that need full rewrite per-org are marked ORG-SPECIFIC in their headers.
 *
 * To swap orgs: change this file + rewrite ORG-SPECIFIC content files.
 */

export const ORG_PROFILE = {
  // Legal identity
  name: 'Revamp-IT',
  legalForm: 'Gemeinnütziger Verein',
  founded: 2003,
  location: 'Zürich',
  address: 'Badenerstrasse 816, 8048 Zürich',
  website: 'https://revamp-it.ch',
  email: 'empfang@revamp-it.ch',
  fundraisingEmail: 'fundraising@revamp-it.ch',

  // Platform identity
  platform: {
    name: 'Revamp-Info',
    tagline: 'Fundraising Hub',
  },

  // Narrative helpers (for domain text generation)
  experienceLabel: 'über 20 Jahre Erfahrung',
  missionKeywords: ['Kreislaufwirtschaft', 'Arbeitsintegration', 'digitale Bildung'],
  missionSummary: 'Kreislaufwirtschaft, Arbeitsintegration und digitaler Bildung',
} as const;

export type OrgProfile = typeof ORG_PROFILE;
