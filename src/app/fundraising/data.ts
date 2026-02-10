import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import type { FoundationStatus } from '@/lib/schemas/foundation';

// -- Derived data from STIFTUNGEN_DATA ----------------------------------------

export function computePipelineStats() {
  const statusCounts: Record<FoundationStatus, number> = {
    open: 0,
    closed: 0,
    rolling: 0,
    soon: 0,
  };

  let totalFit = 0;
  let fitCount = 0;
  let upcomingDeadlines = 0;
  const now = new Date();
  const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  for (const f of STIFTUNGEN_DATA) {
    statusCounts[f.status]++;

    if (f.fit) {
      totalFit += f.fit;
      fitCount++;
    }

    if (f.deadline) {
      const deadline = new Date(f.deadline);
      if (deadline >= now && deadline <= threeMonths) {
        upcomingDeadlines++;
      }
    }
  }

  const avgFit = fitCount > 0 ? totalFit / fitCount : 0;
  const highFitCount = STIFTUNGEN_DATA.filter((f) => f.fit >= 3).length;

  return {
    total: STIFTUNGEN_DATA.length,
    statusCounts,
    avgFit,
    highFitCount,
    upcomingDeadlines,
  };
}

// -- Static config for the page -----------------------------------------------

export const STATUS_BADGE_VARIANT: Record<FoundationStatus, 'success' | 'warning' | 'danger' | 'primary'> = {
  open: 'success',
  rolling: 'primary',
  soon: 'warning',
  closed: 'danger',
};

export const BUDGET_ITEMS = [
  { label: 'Umzug & Einrichtung', amount: "CHF 130'000" },
  { label: '2 Program Manager', amount: "CHF 216'000" },
  { label: 'Standort-Mehrkosten', amount: "CHF 102'000" },
  { label: 'Repair Cafe & Hackerspace', amount: "CHF 25'000" },
  { label: 'Weiterbildung & Kurse', amount: "CHF 20'000" },
  { label: 'GPU-Infrastruktur / Sovereign AI Lab', amount: "CHF 45'000" },
  { label: 'Museum & Hands-on', amount: "CHF 17'000" },
];

export const PACKAGES = [
  { name: 'Hauptpartner', amount: "CHF 185'000", description: 'Der Hub existiert', featured: true },
  { name: 'Hub-Einrichtung', amount: "CHF 130'000", description: 'Umzug & Aufbau', featured: false },
  { name: 'Bildungsprogramm', amount: "CHF 108'000", description: '1 Jahr Kurse & Workshops', featured: false },
  { name: 'Integration', amount: "CHF 108'000", description: '1 Jahr Praktikumsbetreuung', featured: false },
  { name: 'Jahrespartner', amount: "CHF 55'000", description: '1 Jahr Standortkosten', featured: false },
  { name: 'Repair Cafe', amount: "CHF 15'000", description: 'Community-Reparaturwerkstatt', featured: false },
];

export const RESOURCES = [
  { href: '/wirkung', label: 'Wirkungsbericht', description: 'Impact-Zahlen mit Quellen' },
  { href: '/fundraising/stiftungen', label: 'Stiftungen-Übersicht', description: '45+ Förderer mit Deadlines' },
  { href: '/finanzen', label: 'Finanzdaten', description: 'Kivitendo-Daten visualisiert' },
];

export const HERO_STATS = [
  { label: 'Ökologie', value: '285 kg', sub: 'CO2 pro Laptop gespart' },
  { label: 'Soziales', value: '100+', sub: 'Menschen begleitet' },
  { label: 'Bildung', value: '20+', sub: 'Jahre Erfahrung' },
] as const;

export const NEXT_STEPS = [
  {
    step: '1. Stiftung auswählen',
    description: 'Priorisierte Liste mit Deadlines und Anforderungen.',
    href: '/fundraising/stiftungen',
    linkLabel: 'Stiftungen-Übersicht öffnen',
  },
  {
    step: '2. Gesuch vorbereiten',
    description: 'Templates und Bausteine für schnellere Anträge.',
    href: '/fundraising/gesuch-vorlagen',
    linkLabel: 'Gesuch-Vorlagen öffnen',
  },
  {
    step: '3. Wirkung belegen',
    description: 'Zahlen mit Quellenangaben für Glaubwürdigkeit.',
    href: '/wirkung',
    linkLabel: 'Impact-Daten ansehen',
  },
];
