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
      title: 'Fundraising',
      href: '/fundraising',
      reason: 'Stiftungsgesuche & 3-Jahres-Plan',
      icon: '🏛️',
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
      title: 'Fundraising',
      href: '/fundraising',
      reason: 'Welche Ressourcen wir brauchen',
      icon: '💰',
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
      title: 'Wirkung',
      href: '/wirkung',
      reason: 'Welchen Impact wir schaffen',
      icon: '🌱',
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
      title: 'Fundraising',
      href: '/fundraising',
      reason: 'Hub + Menschen: Was wir brauchen',
      icon: '💰',
    },
    {
      title: 'Strategie',
      href: '/strategie',
      reason: 'Unsere Vision & Mission',
      icon: '🎯',
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
      title: 'Fundraising',
      href: '/fundraising',
      reason: 'Warum wir Stiftungen brauchen',
      icon: '🏛️',
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
      title: 'Preismodell',
      href: '/preismodell',
      reason: 'Wie wir Zugang ermöglichen',
      icon: '🏷️',
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
      title: 'Fundraising',
      href: '/fundraising',
      reason: 'Gesuche & Vorlagen ansehen',
      icon: '🏛️',
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

  'strategie-2030': [
    {
      title: 'Hub Fundraising',
      href: '/fundraising/hub',
      reason: 'Detailliertes Hub-Budget & Umsetzung',
      icon: '🏢',
    },
    {
      title: 'Bildung Fundraising',
      href: '/fundraising/bildung',
      reason: 'Train-the-Trainer Programm Details',
      icon: '🎓',
    },
    {
      title: 'Stiftungen',
      href: '/fundraising/stiftungen',
      reason: 'Passende Förderstiftungen finden',
      icon: '🏛️',
    },
  ],
};

/**
 * Get story bridges for a page
 */
export function getStoryBridges(pageKey: string): StoryBridge[] {
  return STORY_BRIDGES[pageKey] || [];
}
