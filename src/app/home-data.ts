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
  title: `${ORG_PROFILE.name} — ${ORG_PROFILE.missionSummary}`,
  description: `${ORG_PROFILE.legalForm} seit ${ORG_PROFILE.founded} in ${ORG_PROFILE.location}. Alle Daten transparent & inspizierbar.`,
};

// -- Section 1: Hero ---------------------------------------------------------

export const HERO = {
  name: ORG_PROFILE.name,
  story:
    'Wir geben IT-Geräten ein zweites Leben, schaffen Arbeitsplätze für Menschen in der Reintegration und machen digitale Bildung zugänglich.',
  context: `${ORG_PROFILE.legalForm} seit ${ORG_PROFILE.founded} in ${ORG_PROFILE.location}`,
  platformNote: 'Alle Daten transparent & inspizierbar',
  ctas: [
    { href: '/revamp-2030', label: 'Vision 2030', variant: 'primary' as const },
    { href: '/wirkung', label: 'Wirkung erkunden', variant: 'ghost' as const },
  ],
};

// -- Section 2: Platform guide -----------------------------------------------

export const GUIDE_HEADING = 'Was Sie hier finden';

export const GUIDE_SECTIONS = [
  {
    href: '/finanzen',
    icon: '💰',
    title: 'Finanzen',
    description: `${FINANCIAL_YEAR_LABEL} Einnahmen & Ausgaben — direkt aus der Buchhaltung.`,
  },
  {
    href: '/wirkung',
    icon: '🌍',
    title: 'Wirkung',
    description: 'CO₂-Einsparungen, Geräte, soziale Integration — mit Quellen und Methodik.',
  },
  {
    href: '/revamp-2030',
    icon: '🚀',
    title: 'Vision 2030',
    description: 'Hub, Bildungsprogramm, Skalierung — wohin wir gehen und was wir brauchen.',
  },
  {
    href: '/methodik',
    icon: '📊',
    title: 'Methodik',
    description: 'Wie wir messen und berechnen. Was wir wissen, was wir schätzen.',
  },
];

// -- Section 3: Pillars heading ----------------------------------------------

export const PILLARS_HEADING = 'Unsere Schwerpunkte';

// -- Section 4: Transparency -------------------------------------------------

export const TRANSPARENCY = {
  heading: 'Transparenz-Plattform',
  lead: 'Jede Zahl ist inspizierbar. Jede Behauptung belegt.',
  points: [
    'Quellenangaben bei jeder Metrik',
    `${FINANCIAL_YEAR_LABEL} Finanzdaten`,
    'Methodik dokumentiert',
  ],
};

// -- Section 5: CTA ----------------------------------------------------------

export const CTA_CONFIG = {
  title: 'Bereit für den Einblick?',
  description:
    'Erkunde unsere Vision, Wirkung und Finanzen — alles transparent und inspizierbar.',
  links: [
    { href: '/revamp-2030', label: 'Vision 2030 ansehen' },
    { href: '/wirkung', label: 'Wirkung erkunden', variant: 'secondary' as const },
    { href: '/finanzen', label: 'Finanzen einsehen', variant: 'secondary' as const },
  ],
};
