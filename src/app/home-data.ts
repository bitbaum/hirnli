/**
 * Homepage section data — SSOT for all homepage content
 *
 * Every value derives from config files. Nothing hardcoded.
 * Section components import from here; page.tsx composes them.
 */

import { ORG_PROFILE } from '@/lib/config/org-profile';
import { NUMBERS_REGISTRY, CO2_PER_LAPTOP } from '@/lib/config/numbers';
import {
  REVENUE_CURRENT_DISPLAY,
  REVENUE_YEAR3_DISPLAY,
  DEVICES_PER_YEAR_TARGET_DISPLAY,
  PEOPLE_REACHED_CURRENT_DISPLAY,
  PEOPLE_REACHED_PER_YEAR,
  PEOPLE_REACHED_DISPLAY,
  HUB_SPACE_DISPLAY,
} from '@/lib/config/projections';
import { FINANCIAL_YEAR_LABEL, FINANCIAL_YEAR_RANGE } from '@/app/finanzen/data';
import { TEAM_MEMBERS } from '@/app/team/data';

// -- Page Metadata -----------------------------------------------------------

export const PAGE_META = {
  title: `${ORG_PROFILE.name} — ${ORG_PROFILE.missionSummary}`,
  description: `${ORG_PROFILE.legalForm} seit ${ORG_PROFILE.founded} in ${ORG_PROFILE.location}. Alle Daten transparent & inspizierbar.`,
};

// -- Section 1: Hero ---------------------------------------------------------

export const HERO = {
  name: ORG_PROFILE.name,
  subtitle: ORG_PROFILE.missionSummary,
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
};

// -- Section 2: Impact -------------------------------------------------------

export const IMPACT_HEADING = 'Was wir bewirken';

export const IMPACT_METRICS = [
  {
    value: `${CO2_PER_LAPTOP} kg`,
    label: 'CO₂ gespart pro Laptop',
    confidence: NUMBERS_REGISTRY.CO2_SAVED_PER_LAPTOP.source.confidence,
    source: 'Fraunhofer IZM 2023',
  },
  {
    value: String(NUMBERS_REGISTRY.LAPTOPS_REFURBISHED_TOTAL.value),
    label: 'Laptops refurbished',
    confidence: NUMBERS_REGISTRY.LAPTOPS_REFURBISHED_TOTAL.source.confidence,
    source: `${ORG_PROFILE.founded}–2025`,
  },
  {
    value: String(NUMBERS_REGISTRY.PEOPLE_HELPED.value),
    label: 'Menschen begleitet',
    confidence: NUMBERS_REGISTRY.PEOPLE_HELPED.source.confidence,
    source: 'Praktikum & Integration',
  },
  {
    value: `${NUMBERS_REGISTRY.DEVICE_LIFESPAN_EXTENSION.value}+`,
    label: 'Jahre Lebensdauer-Verlängerung',
    confidence: NUMBERS_REGISTRY.DEVICE_LIFESPAN_EXTENSION.source.confidence,
    source: 'Erfahrungswerte',
  },
];

// -- Section 3: Pillars heading ----------------------------------------------

export const PILLARS_HEADING = 'Unsere Schwerpunkte';

/** Border color map for Schwerpunkte → design tokens from globals.css */
export const PILLAR_BORDER_COLORS: Record<string, string> = {
  nachhaltigkeit: 'border-l-theme-klima',
  'soziale-integration': 'border-l-theme-sozial',
  'digitale-bildung': 'border-l-theme-bildung',
  'digitale-souveraenitaet': 'border-l-theme-digital',
};

// -- Section 4: Growth -------------------------------------------------------

export const GROWTH_HEADING = 'Wohin wir gehen';
export const GROWTH_SUBHEADING = 'Mit Förderung';

export const GROWTH_TRAJECTORIES = [
  {
    label: 'Umsatz',
    current: REVENUE_CURRENT_DISPLAY,
    target: REVENUE_YEAR3_DISPLAY,
    icon: '💰',
  },
  {
    label: 'Geräte/Jahr',
    current: `~${NUMBERS_REGISTRY.DEVICES_YEAR_CURRENT.value}`,
    target: DEVICES_PER_YEAR_TARGET_DISPLAY,
    icon: '💻',
  },
  {
    label: 'Menschen/Jahr',
    current: PEOPLE_REACHED_CURRENT_DISPLAY,
    target: PEOPLE_REACHED_PER_YEAR,
    icon: '👥',
  },
  {
    label: 'Fläche',
    current: `${NUMBERS_REGISTRY.CURRENT_WORKSHOP_SPACE.value} m²`,
    target: HUB_SPACE_DISPLAY,
    icon: '🏢',
  },
];

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

// -- Section 6: Navigation ---------------------------------------------------

export const NAV_HEADING = 'Deep Dive';

export const NAV_CARDS = [
  {
    title: 'Revamp 2030',
    badge: 'Vision',
    borderColor: 'border-l-primary',
    href: '/revamp-2030',
    icon: '🚀',
    description: `Wohin wir gehen: Organisation + Hub + Bildung. ${DEVICES_PER_YEAR_TARGET_DISPLAY} Geräte/Jahr + ${PEOPLE_REACHED_DISPLAY}.`,
    linkLabel: 'Vision & Strategie ansehen',
    hoverColor: 'group-hover:text-primary',
    badgeColor: 'blue',
  },
  {
    title: 'Finanzen',
    badge: FINANCIAL_YEAR_LABEL,
    borderColor: 'border-l-accent',
    href: '/finanzen',
    icon: '💰',
    description: `Einnahmen, Ausgaben, Kategorien: Komplette P&L ${FINANCIAL_YEAR_RANGE} aus Kivitendo.`,
    linkLabel: 'Finanzdaten einsehen',
    hoverColor: 'group-hover:text-accent',
    badgeColor: 'orange',
  },
  {
    title: 'Wirkung',
    badge: 'Impact',
    borderColor: 'border-l-secondary',
    href: '/wirkung',
    icon: '🌍',
    description: 'CO₂-Einsparungen, Geräte, Menschen erreicht — mit Methodik & Quellenangaben.',
    linkLabel: 'Impact-Metriken ansehen',
    hoverColor: 'group-hover:text-secondary',
    badgeColor: 'green',
  },
  {
    title: 'Team',
    badge: `${TEAM_MEMBERS.length} Teammitglieder`,
    borderColor: 'border-l-theme-sozial',
    href: '/team',
    icon: '👥',
    description: `${TEAM_MEMBERS.length} Menschen arbeiten bei uns: Leitung, Techniker, Betrieb — plus geplante Bildungsprogrammleiter.`,
    linkLabel: 'Team kennenlernen',
    hoverColor: 'group-hover:text-theme-sozial',
    badgeColor: 'purple',
  },
  {
    title: 'Wie wir arbeiten',
    badge: 'Kaskade',
    borderColor: 'border-l-theme-kreislauf',
    href: '/wie-wir-arbeiten',
    icon: '🔧',
    description: 'Die Wertschöpfungskaskade: Refurbishing → Ersatzteile → Recycling. Maximale Wertschöpfung pro Gerät.',
    linkLabel: 'Methode verstehen',
    hoverColor: 'group-hover:text-theme-kreislauf',
    badgeColor: 'emerald',
  },
  {
    title: 'Methodik',
    badge: 'Transparenz',
    borderColor: 'border-l-grey-medium',
    href: '/methodik',
    icon: '📊',
    description: 'Wie wir Daten erheben, was wir wissen, was fehlt — komplett transparent.',
    linkLabel: 'Datenquellen einsehen',
    hoverColor: 'group-hover:text-grey-medium',
    badgeColor: 'gray',
  },
];

// -- Section 7: CTA ----------------------------------------------------------

export const CTA_CONFIG = {
  title: 'Bereit für den Deep Dive?',
  description: 'Erkunde unsere Vision, Wirkung und Finanzen — alles transparent und inspizierbar.',
  links: [
    { href: '/revamp-2030', label: 'Vision 2030 ansehen' },
    { href: '/wirkung', label: 'Wirkung erkunden', variant: 'secondary' as const },
    { href: '/finanzen', label: 'Finanzen deep dive', variant: 'secondary' as const },
  ],
};
