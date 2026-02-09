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

export const PILLARS = [
  {
    title: 'Oekologie & Kreislaufwirtschaft',
    color: 'border-emerald-500',
    bgHighlight: 'bg-emerald-50',
    items: [
      'E-Waste reduzieren durch Wiederverwendung',
      'Lebensdauer von Geraeten verlaengern',
      'Linux statt Windows = laengere Nutzung',
      'Reparieren statt wegwerfen',
    ],
    highlight: 'Wirkung: 1000+ Geraete/Jahr gerettet = 285 Tonnen CO2 eingespart',
  },
  {
    title: 'Soziale Integration',
    color: 'border-amber-500',
    bgHighlight: 'bg-amber-50',
    items: [
      'Praktikumsplaetze fuer Menschen in Uebergangssituationen',
      'Skills entwickeln: Hardware, Software, Kundenkontakt',
      'Begleitung auf dem Weg zurueck in den Arbeitsmarkt',
      'Bezahlbare IT fuer alle',
    ],
    highlight: 'Wirkung: 100+ Menschen begleitet, 90% Erfolgsquote',
  },
  {
    title: 'Tech-Bildung fuer alle',
    color: 'border-blue-500',
    bgHighlight: 'bg-blue-50',
    items: [
      'Reparatur-Wissen weitergeben (Repair Cafe)',
      'Digitale Kompetenzen vermitteln',
      'Kritisches Tech-Verstaendnis foerdern',
      'Hands-on Lernen statt passiver Konsum',
    ],
    highlight: 'Vision: 200+ Workshop-Teilnehmer/Jahr, 40+ Kurse',
  },
];

export const HUB_ZONES = [
  { name: 'Shop', description: 'Refurbished Geraete, Beratung' },
  { name: 'Werkstatt', description: 'Reparatur, Praktikumsplaetze' },
  { name: 'Repair Cafe', description: 'Gemeinsam reparieren lernen' },
  { name: 'Schulungsraum', description: 'Kurse, Workshops, Bildung' },
  { name: 'Hackerspace', description: 'Maker-Bereich, Tuefteln' },
  { name: 'Museum', description: 'Computergeschichte, Hands-on' },
];

export const BUDGET_ITEMS = [
  { label: 'Umzug & Einrichtung', amount: "CHF 130'000" },
  { label: '2 Program Manager', amount: "CHF 216'000" },
  { label: 'Standort-Mehrkosten', amount: "CHF 102'000" },
  { label: 'Repair Cafe & Hackerspace', amount: "CHF 25'000" },
  { label: 'Weiterbildung & Kurse', amount: "CHF 20'000" },
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
  { href: '/fundraising/stiftungen', label: 'Stiftungen-Uebersicht', description: '45+ Foerderer mit Deadlines' },
  { href: '/finanzen', label: 'Finanzdaten', description: 'Kivitendo-Daten visualisiert' },
];

export const HERO_STATS = [
  { label: 'Oekologie', value: '285 kg', sub: 'CO2 pro Laptop gespart' },
  { label: 'Soziales', value: '100+', sub: 'Menschen begleitet' },
  { label: 'Bildung', value: '20+', sub: 'Jahre Erfahrung' },
] as const;

export const NEXT_STEPS = [
  {
    step: '1. Stiftung auswaehlen',
    description: 'Priorisierte Liste mit Deadlines und Anforderungen.',
    href: '/fundraising/stiftungen',
    linkLabel: 'Stiftungen-Uebersicht oeffnen',
  },
  {
    step: '2. Gesuch vorbereiten',
    description: 'Templates und Bausteine fuer schnellere Antraege.',
    href: '/dokumente',
    linkLabel: 'Vorlagen herunterladen',
  },
  {
    step: '3. Wirkung belegen',
    description: 'Zahlen mit Quellenangaben fuer Glaubwuerdigkeit.',
    href: '/wirkung',
    linkLabel: 'Impact-Daten ansehen',
  },
];
