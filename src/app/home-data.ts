/**
 * Homepage section data — SSOT for all homepage content
 *
 * Every value derives from config files. Nothing hardcoded.
 * Section components import from here; page.tsx composes them.
 */

import { ORG_PROFILE } from '@/lib/config/org-profile';
import { FINANCIAL_YEAR_LABEL } from '@/app/finanzen/data';

// -- Page Metadata -----------------------------------------------------------

export const PAGE_META = {
  title: `${ORG_PROFILE.name} — Fundraising-Werkzeuge`,
  description: `Stiftungsrecherche, Gesuch-Vorlagen und belegbare Wirkungsdaten für ${ORG_PROFILE.name}.`,
};

// -- Section 1: Hero ---------------------------------------------------------

export const HERO = {
  name: ORG_PROFILE.name,
  story:
    'Wir geben IT-Geräten ein zweites Leben, schaffen Arbeitsplätze für Menschen in der Reintegration und machen digitale Bildung zugänglich.',
  context: `${ORG_PROFILE.legalForm} seit ${ORG_PROFILE.founded} in ${ORG_PROFILE.location}`,
  platformNote: 'Fundraising-Werkzeuge für gemeinnützige Organisationen',
  ctas: [
    { href: '/fundraising/stiftungen', label: 'Stiftungen durchsuchen', variant: 'primary' as const },
    { href: '/fundraising/gesuch-vorlagen', label: 'Gesuch erstellen', variant: 'ghost' as const },
  ],
};

// -- Section 2: Platform guide -----------------------------------------------

export const GUIDE_HEADING = 'Ihre Werkzeuge';

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
  description:
    'Finden Sie die passende Stiftung und erstellen Sie ein professionelles Gesuch.',
  links: [
    { href: '/fundraising/stiftungen', label: 'Stiftungen durchsuchen' },
    { href: '/fundraising/gesuch-vorlagen', label: 'Gesuch erstellen', variant: 'secondary' as const },
    { href: '/fundraising', label: 'Fundraising-Hub', variant: 'secondary' as const },
  ],
};
