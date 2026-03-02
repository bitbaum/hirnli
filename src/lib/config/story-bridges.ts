/**
 * Story Bridges Configuration - SSOT for page connections
 *
 * Ground Truth #2 (SSOT): Every page connection lives here
 * Ground Truth #1 (Serve humans): Shows WHY to visit related pages
 *
 * Each bridge explains the narrative connection between pages
 */

export interface StoryBridge {
  title: string;
  href: string;
  reason: string;
  icon?: string;
}

export const STORY_BRIDGES: Record<string, StoryBridge[]> = {
  dashboard: [
    {
      title: 'Strategie',
      href: '/strategie',
      reason: 'Unsere Vision & Mission verstehen',
      icon: '🎯',
    },
    {
      title: 'Finanzen',
      href: '/finanzen',
      reason: 'Detaillierte Finanzanalyse ansehen',
      icon: '💰',
    },
    {
      title: 'Wirkung',
      href: '/wirkung',
      reason: 'Unsere Wirkung in Zahlen',
      icon: '🌱',
    },
  ],

  strategie: [
    {
      title: 'Operations',
      href: '/operations',
      reason: 'Wie wir Vision in Praxis umsetzen',
      icon: '⚙️',
    },
    {
      title: 'Revamp 2030',
      href: '/revamp-2030',
      reason: 'Unsere Roadmap und was wir brauchen',
      icon: '🚀',
    },
    {
      title: 'Wirkung',
      href: '/wirkung',
      reason: 'Welchen Impact wir schaffen',
      icon: '🌱',
    },
  ],

  preismodell: [
    {
      title: 'Wirkung',
      href: '/wirkung',
      reason: 'Wie Solidarität Impact schafft',
      icon: '🌱',
    },
    {
      title: 'Finanzen',
      href: '/finanzen',
      reason: 'Woher unser Revenue kommt',
      icon: '💰',
    },
    {
      title: 'Strategie',
      href: '/strategie',
      reason: 'Warum Zugang ein Grundrecht ist',
      icon: '🎯',
    },
  ],

  operations: [
    {
      title: 'Team',
      href: '/team',
      reason: 'Wer macht diese Arbeit?',
      icon: '👥',
    },
    {
      title: 'Wie wir arbeiten',
      href: '/wie-wir-arbeiten',
      reason: 'Die Wertschöpfungskaskade im Detail',
      icon: '🔧',
    },
    {
      title: 'Preismodell',
      href: '/preismodell',
      reason: 'Wie Geräte verteilt werden',
      icon: '🏷️',
    },
  ],

  team: [
    {
      title: 'Operations',
      href: '/operations',
      reason: 'Was unser Team leistet',
      icon: '⚙️',
    },
    {
      title: 'Revamp 2030',
      href: '/revamp-2030',
      reason: 'Unsere Zukunftsvision',
      icon: '🚀',
    },
    {
      title: 'Strategie',
      href: '/strategie',
      reason: 'Unsere Vision & Mission',
      icon: '🎯',
    },
  ],

  'wie-wir-arbeiten': [
    {
      title: 'Operations',
      href: '/operations',
      reason: 'SOPs und Prozesse im Detail',
      icon: '⚙️',
    },
    {
      title: 'Wirkung',
      href: '/wirkung',
      reason: 'Der Impact unserer Kaskade in Zahlen',
      icon: '🌱',
    },
    {
      title: 'Revamp 2030',
      href: '/revamp-2030',
      reason: 'Was Förderung zusätzlich ermöglicht',
      icon: '🚀',
    },
  ],

  finanzen: [
    {
      title: 'Wirkung',
      href: '/wirkung',
      reason: 'Was wir mit dem Geld bewirken',
      icon: '🌱',
    },
    {
      title: 'Revamp 2030',
      href: '/revamp-2030',
      reason: 'Warum wir Förderung brauchen',
      icon: '🚀',
    },
    {
      title: 'Methodik',
      href: '/methodik',
      reason: 'Woher die Zahlen kommen',
      icon: '📊',
    },
  ],

  wirkung: [
    {
      title: 'Finanzen',
      href: '/finanzen',
      reason: 'Wie wir finanziert sind',
      icon: '💰',
    },
    {
      title: 'Wie wir arbeiten',
      href: '/wie-wir-arbeiten',
      reason: 'Warum unsere Impact-Zahlen so hoch sind',
      icon: '🔧',
    },
    {
      title: 'Methodik',
      href: '/methodik',
      reason: 'Wie Impact berechnet wird',
      icon: '📊',
    },
  ],

  methodik: [
    {
      title: 'Finanzen',
      href: '/finanzen',
      reason: 'Daten in Aktion sehen',
      icon: '💰',
    },
    {
      title: 'Wirkung',
      href: '/wirkung',
      reason: 'Impact-Berechnungen sehen',
      icon: '🌱',
    },
    {
      title: 'Operations',
      href: '/operations',
      reason: 'Wie wir Kennzahlen erheben',
      icon: '⚙️',
    },
  ],

  dokumente: [
    {
      title: 'Finanzen',
      href: '/finanzen',
      reason: 'Finanzübersicht ansehen',
      icon: '💰',
    },
    {
      title: 'Methodik',
      href: '/methodik',
      reason: 'Wie Daten erhoben werden',
      icon: '📊',
    },
  ],

  fundraising: [
    {
      title: 'Team',
      href: '/team',
      reason: 'Wer setzt Hub + Menschen um?',
      icon: '👥',
    },
    {
      title: 'Strategie',
      href: '/strategie',
      reason: 'Unsere Vision verstehen',
      icon: '🎯',
    },
    {
      title: 'Wirkung',
      href: '/wirkung',
      reason: 'Welchen Impact wir schaffen',
      icon: '🌱',
    },
  ],

  stiftungen: [
    {
      title: 'Fundraising Hub',
      href: '/fundraising',
      reason: '3-Jahres-Plan & Budget verstehen',
      icon: '💰',
    },
    {
      title: 'Wirkung',
      href: '/wirkung',
      reason: 'Welchen Impact wir schaffen',
      icon: '🌱',
    },
    {
      title: 'Gesuch-Vorlagen',
      href: '/fundraising/gesuch-vorlagen',
      reason: 'Alle Gesuch-Typen ansehen',
      icon: '📄',
    },
  ],

  'revamp-2030': [
    {
      title: 'Wie wir arbeiten',
      href: '/wie-wir-arbeiten',
      reason: 'Unsere Wertschöpfungskaskade im Detail',
      icon: '🔧',
    },
    {
      title: 'Wirkung',
      href: '/wirkung',
      reason: 'Unser Impact in Zahlen',
      icon: '🌱',
    },
    {
      title: 'Finanzen',
      href: '/finanzen',
      reason: 'Finanzübersicht & 8-Jahres-Analyse',
      icon: '💰',
    },
  ],
};

/**
 * Get story bridges for a page
 */
export function getStoryBridges(pageKey: string): StoryBridge[] {
  return STORY_BRIDGES[pageKey] || [];
}
