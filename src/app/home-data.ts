/**
 * Homepage section data — SSOT for all homepage content
 *
 * Every value derives from config files. Nothing hardcoded.
 * Section components import from here; page.tsx composes them.
 */

import { ORG_PROFILE } from '@/lib/config/org-profile';
import { NUMBERS_REGISTRY, CO2_PER_LAPTOP } from '@/lib/config/numbers';
import { FINANCIAL_YEAR_LABEL } from '@/app/finanzen/data';
import { TEAM_MEMBERS } from '@/app/team/data';

// -- Page Metadata -----------------------------------------------------------

export const PAGE_META = {
  title: `${ORG_PROFILE.name} — ${ORG_PROFILE.missionSummary}`,
  description: `${ORG_PROFILE.legalForm} seit ${ORG_PROFILE.founded} in ${ORG_PROFILE.location}. Alle Daten transparent & inspizierbar.`,
};

// -- Section 1: Hero ---------------------------------------------------------

export const HERO = {
  name: ORG_PROFILE.name,
  subtitle: 'Gebrauchte Laptops. Neues Leben. Für Mensch und Umwelt.',
  context: `${ORG_PROFILE.legalForm} seit ${ORG_PROFILE.founded} in ${ORG_PROFILE.location}`,
  platformNote: 'Alle Daten transparent & inspizierbar',
  metrics: [
    {
      value: String(NUMBERS_REGISTRY.YEARS_EXPERIENCE.value),
      label: 'Jahre Erfahrung',
      sublabel: `Seit ${ORG_PROFILE.founded}`,
    },
    {
      value: String(NUMBERS_REGISTRY.LAPTOPS_REFURBISHED_TOTAL.value),
      label: 'Laptops refurbished',
      sublabel: `${ORG_PROFILE.founded}–2025`,
    },
    {
      value: String(NUMBERS_REGISTRY.PEOPLE_HELPED.value),
      label: 'Menschen begleitet',
      sublabel: 'Praktikum, Reintegration, Workshops',
    },
  ],
  ctas: [
    { href: '/revamp-2030', label: 'Vision 2030', variant: 'primary' as const },
    { href: '/wirkung', label: 'Wirkung erkunden', variant: 'ghost' as const },
  ],
};

// -- Section 2: Impact -------------------------------------------------------

export const IMPACT_HEADING = 'Was wir bewirken';

// Compute total CO2 saved: laptops × CO2 per laptop / 1000 → tonnes
const laptopsTotal = Number(
  String(NUMBERS_REGISTRY.LAPTOPS_REFURBISHED_TOTAL.value).replace(/[^0-9]/g, ''),
);
const co2TotalTonnes = Math.round((laptopsTotal * CO2_PER_LAPTOP) / 1000);

export const IMPACT_METRICS = [
  {
    value: `${CO2_PER_LAPTOP} kg`,
    label: 'CO₂ gespart pro Laptop',
    confidence: NUMBERS_REGISTRY.CO2_SAVED_PER_LAPTOP.source.confidence,
    source: 'Fraunhofer IZM 2023',
  },
  {
    value: `~${co2TotalTonnes} t`,
    label: 'CO₂ total eingespart',
    confidence: NUMBERS_REGISTRY.CO2_SAVED_PER_LAPTOP.source.confidence,
    source: `${laptopsTotal} Laptops × ${CO2_PER_LAPTOP} kg`,
  },
  {
    value: `${NUMBERS_REGISTRY.DEVICE_LIFESPAN_EXTENSION.value}+`,
    label: 'Jahre Lebensdauer-Verlängerung',
    confidence: NUMBERS_REGISTRY.DEVICE_LIFESPAN_EXTENSION.source.confidence,
    source: 'Erfahrungswerte',
  },
  {
    value: `${TEAM_MEMBERS.length}`,
    label: 'Teammitglieder',
    confidence: 'high' as const,
    source: 'Aktuelles Team',
  },
];

// -- Section 3: Pillars heading ----------------------------------------------

export const PILLARS_HEADING = 'Unsere Schwerpunkte';

// -- Section 5: Transparency -------------------------------------------------

export const TRANSPARENCY = {
  heading: 'Transparenz-Plattform',
  lead: 'Jede Zahl ist inspizierbar. Jede Behauptung belegt.',
  points: [
    '100% Quellenangaben',
    `${FINANCIAL_YEAR_LABEL} Finanzdaten`,
    'Methodik dokumentiert',
  ],
};

// -- Section 7: CTA ----------------------------------------------------------

export const CTA_CONFIG = {
  title: 'Bereit für den Einblick?',
  description: 'Erkunde unsere Vision, Wirkung und Finanzen — alles transparent und inspizierbar.',
  links: [
    { href: '/revamp-2030', label: 'Vision 2030 ansehen' },
    { href: '/wirkung', label: 'Wirkung erkunden', variant: 'secondary' as const },
    { href: '/finanzen', label: 'Finanzen einsehen', variant: 'secondary' as const },
  ],
};
