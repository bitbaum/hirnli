/**
 * Homepage section data — SSOT for all homepage content
 *
 * Every value derives from config files. Nothing hardcoded.
 * Section components import from here; page.tsx composes them.
 */

import type { Tenant } from '@/lib/tenant/profile';
import { FINANCIAL_YEAR_LABEL } from '@/lib/config/financial-constants';

// -- Page Metadata -----------------------------------------------------------

// Functions rather than constants: these name the organisation, and a constant
// is evaluated once for the whole build. Every tenant's homepage title, link
// preview and hero therefore carried the first tenant's name.

export const pageMeta = (tenant: Tenant) => ({
  title: `${tenant.name} — Transparentes Fundraising`,
  description: `Wirkung, Finanzen und Strategie von ${tenant.name} — jede Zahl belegbar. Plus Stiftungsrecherche und Gesuch-Generierung auf einer Plattform.`,
});

// -- Section 1: Hero ---------------------------------------------------------

export const hero = (tenant: Tenant) => ({
  name: tenant.name,
  /**
   * The organisation's own summary of what it does.
   *
   * Was a fixed sentence about refurbishing IT hardware, reintegration work and
   * digital education — one organisation's activity, printed under every
   * tenant's name on its own front page. `missionSummary` is already in
   * `org_profiles` and both tenants have written one, so there was never a
   * reason to guess. Undefined renders nothing rather than someone else's.
   */
  story: tenant.tagline ?? tenant.missionSummary,
  context: `${tenant.legalForm} seit ${tenant.founded} in ${tenant.location}`,
  platformNote: 'Fundraising-Werkzeuge für gemeinnützige Organisationen',
  ctas: [
    {
      href: '/fundraising/stiftungen',
      label: 'Stiftungen durchsuchen',
      variant: 'primary' as const,
    },
    { href: '/fundraising/gesuch-vorlagen', label: 'Gesuch erstellen', variant: 'ghost' as const },
  ],
});

// -- Section 2: Platform guide -----------------------------------------------

export const GUIDE_HEADING = 'Was diese Plattform kann';

export const GUIDE_SECTIONS = [
  {
    href: '/fundraising/stiftungen',
    icon: '🔍',
    title: 'Stiftungsrecherche',
    description: 'Passende Stiftungen finden, Fit-Analyse einsehen, Prioritäten setzen.',
  },
  {
    href: '/fundraising/gesuch-vorlagen',
    icon: '📝',
    title: 'Gesuch-Vorlagen',
    description: 'Professionelle Anträge erstellen — angepasst an jede Stiftung.',
  },
  {
    href: '/wirkung',
    icon: '🌍',
    title: 'Wirkungsdaten',
    description: 'CO₂-Einsparungen, Geräte, soziale Integration — belegbar für Anträge.',
  },
  {
    href: '/finanzen',
    icon: '💰',
    title: 'Finanzdaten',
    description: `${FINANCIAL_YEAR_LABEL} Einnahmen & Ausgaben — direkt referenzierbar.`,
  },
];

// -- Section 3: Pillars heading ----------------------------------------------

export const PILLARS_HEADING = 'Unsere Schwerpunkte';

// -- Section 4: Data quality -------------------------------------------------

export const TRANSPARENCY = {
  heading: 'Datenqualität',
  lead: 'Alle Zahlen in Ihren Anträgen sind belegbar und nachvollziehbar.',
  points: [
    'Quellenangaben bei jeder Metrik',
    `${FINANCIAL_YEAR_LABEL} Finanzdaten`,
    'Methodik dokumentiert',
  ],
};

// -- Section 5: CTA ----------------------------------------------------------

export const CTA_CONFIG = {
  title: 'Bereit für den nächsten Antrag?',
  description: 'Finden Sie die passende Stiftung und erstellen Sie ein professionelles Gesuch.',
  links: [
    { href: '/fundraising/stiftungen', label: 'Stiftungen durchsuchen' },
    {
      href: '/fundraising/gesuch-vorlagen',
      label: 'Gesuch erstellen',
      variant: 'secondary' as const,
    },
    { href: '/fundraising', label: 'Fundraising-Hub', variant: 'secondary' as const },
  ],
};
