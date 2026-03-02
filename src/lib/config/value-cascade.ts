/**
 * Value Cascade (Wertschöpfungskaskade) — SSOT
 *
 * ORG-SPECIFIC: Tier definitions, catch rates, and technical details
 * are specific to Revamp-IT's refurbishing process.
 *
 * Consumed by:
 * - /wie-wir-arbeiten page (full cascade diagram + tier cards)
 * - GesuchProcessSection (compact cascade in gesuch wizard)
 */

// ---------------------------------------------------------------------------
// Tier interface
// ---------------------------------------------------------------------------

export interface CascadeTier {
  id: string;
  number: number;
  name: string;
  shortName: string;
  icon: string;
  /** Full Tailwind class strings — no dynamic interpolation */
  color: {
    border: string;
    bg: string;
    text: string;
    badgeBg: string;
    badgeText: string;
  };
  status: 'operational' | 'future';
  tagline: string;
  description: string;
  technicalDetails: string[];
  /** Approximate % of incoming devices handled at this tier */
  catchRate: string;
  /** What enables or funds this tier */
  enabledBy: string;
}

// ---------------------------------------------------------------------------
// Tier data
// ---------------------------------------------------------------------------

export const CASCADE_TIERS: Record<string, CascadeTier> = {
  refurbishment: {
    id: 'refurbishment',
    number: 1,
    name: 'Vollständiges Refurbishing',
    shortName: 'Refurbishing',
    icon: '🔧',
    color: {
      border: 'border-emerald-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
    },
    status: 'operational',
    tagline: 'Maximale Wertschöpfung — jedes Gerät bekommt eine zweite Chance',
    description:
      'Gespendete Geräte werden vollständig diagnostiziert, aufgerüstet und mit Linux ausgestattet. Jedes Gerät durchläuft einen mehrstufigen Qualitätsprozess und wird mit Garantie an Privatpersonen, Schulen und Organisationen verkauft.',
    technicalDetails: [
      'Hardware-Diagnose (CPU, RAM, Festplatte, Akku, Display)',
      'SSD- und RAM-Upgrade aus eigenem Teilelager',
      'Wärmeleitpaste erneuern',
      'Linux-Installation (Ubuntu/Mint) mit vorkonfigurierter Software',
      'Qualitätskontrolle: Stresstest, Akkukapazität, Funktionscheck',
      '6 Monate Garantie, solidarisches Preismodell',
    ],
    catchRate: '~60%',
    enabledBy: 'Laufender Betrieb seit 2018',
  },

  parts_harvesting: {
    id: 'parts_harvesting',
    number: 2,
    name: 'Ersatzteilgewinnung',
    shortName: 'Ersatzteile',
    icon: '🔩',
    color: {
      border: 'border-amber-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
    },
    status: 'operational',
    tagline: 'Was nicht refurbished wird, liefert Teile für zukünftige Reparaturen',
    description:
      'Geräte, die nicht wirtschaftlich reparierbar sind, werden systematisch zerlegt. Funktionierende Komponenten — SSDs, RAM, Bildschirme, Tastaturen, Netzteile — werden ins Teilelager aufgenommen und fliessen direkt in Tier-1-Reparaturen.',
    technicalDetails: [
      'Systematische Zerlegung nach Komponentenkatalog',
      'Funktionstest jedes Einzelteils',
      'Katalogisierung und Einlagerung nach Gerätetyp',
      'Direkte Wiederverwendung in Tier-1-Refurbishing',
    ],
    catchRate: '~25%',
    enabledBy: 'Laufender Betrieb seit 2018',
  },

  recycling_current: {
    id: 'recycling_current',
    number: 3,
    name: 'Fachgerechtes Recycling',
    shortName: 'Recycling',
    icon: '♻️',
    color: {
      border: 'border-slate-400',
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-700',
    },
    status: 'operational',
    tagline: 'Nur der absolute Rest geht ins Recycling — über SWICO-Partner',
    description:
      'Was weder refurbished noch als Ersatzteil verwendet werden kann, geht an zertifizierte SWICO-Recyclingpartner. Dort werden Rohstoffe wie Kupfer, Gold und seltene Erden zurückgewonnen.',
    technicalDetails: [
      'SWICO-zertifizierter Entsorgungspartner',
      'Rohstoffrückgewinnung (Kupfer, Gold, seltene Erden)',
      'Datenlöschung nach NIST-Standard',
      'Nachweisbare Entsorgungskette',
    ],
    catchRate: '~15%',
    enabledBy: 'SWICO-Partnerschaft',
  },

  vintage_art: {
    id: 'vintage_art',
    number: 3,
    name: 'Vintage & Kunst',
    shortName: 'Vintage/Kunst',
    icon: '🎨',
    color: {
      border: 'border-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
    },
    status: 'future',
    tagline: 'Alte Technik wird Kulturgut — Museum, Kunststudio, Artist-in-Residence',
    description:
      'Mit dem Community Tech Space entsteht ein neuer Weg für Geräte, die bisher direkt ins Recycling gingen: Vintage-Hardware wird für Ausstellungen, Retro-Computing und Bildungszwecke erhalten. Künstler:innen verwandeln E-Waste in Kunstobjekte.',
    technicalDetails: [
      'Vintage-Computing-Sammlung (historische Geräte, Retro-Gaming)',
      'Artist-in-Residence-Programm: E-Waste als Kunstmaterial',
      'Ausstellungen zu Technikgeschichte und Kreislaufwirtschaft',
      'Workshops: "Vom Schrott zum Kunstwerk"',
    ],
    catchRate: 'Neu',
    enabledBy: 'Community Tech Space (mit Förderung)',
  },

  recycling_future: {
    id: 'recycling_future',
    number: 4,
    name: 'Fachgerechtes Recycling',
    shortName: 'Recycling',
    icon: '♻️',
    color: {
      border: 'border-slate-400',
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-700',
    },
    status: 'future',
    tagline: 'Reduziertes Volumen — weil Tier 3 mehr auffängt',
    description:
      'Durch den neuen Vintage & Kunst-Pfad wird weniger Material direkt recycelt. Das Recycling bleibt als letzter Schritt bestehen, aber der Anteil sinkt, weil mehr Geräte kreativ weiterverwendet werden.',
    technicalDetails: [
      'SWICO-zertifizierter Entsorgungspartner',
      'Reduziertes Volumen durch Tier-3-Auffang',
      'Nur noch absolute Restmaterialien',
    ],
    catchRate: '<10%',
    enabledBy: 'SWICO-Partnerschaft',
  },
} as const;

// ---------------------------------------------------------------------------
// Cascade models (current vs. future)
// ---------------------------------------------------------------------------

export const CASCADE_MODELS = {
  current: {
    label: 'Heute (operativ)',
    tiers: [
      CASCADE_TIERS.refurbishment,
      CASCADE_TIERS.parts_harvesting,
      CASCADE_TIERS.recycling_current,
    ],
  },
  future: {
    label: 'Mit Community Tech Space',
    tiers: [
      CASCADE_TIERS.refurbishment,
      CASCADE_TIERS.parts_harvesting,
      CASCADE_TIERS.vintage_art,
      CASCADE_TIERS.recycling_future,
    ],
  },
} as const;

// ---------------------------------------------------------------------------
// Compact summary for gesuch sections
// ---------------------------------------------------------------------------

export const CASCADE_SUMMARY = {
  headline: 'Die Wertschöpfungskaskade',
  body: 'Jedes gespendete Gerät durchläuft eine mehrstufige Kaskade: Zuerst wird versucht, es vollständig zu refurbishen. Was nicht reparierbar ist, liefert Ersatzteile für zukünftige Reparaturen. Nur der absolute Rest geht ins fachgerechte Recycling. So maximieren wir die Wertschöpfung pro Gerät und minimieren E-Waste.',
  insight:
    'Ergebnis: Über 85% aller Geräte werden wiederverwendet oder als Ersatzteile genutzt — nur ~15% landen im Recycling.',
} as const;
