/**
 * Gesuch Templates — Virtual foundations for all template levels
 *
 * Level 1: Generic (generisch) — full pitch, all themes, for unknown foundations
 * Level 2: By Robert Schmuki type (A/B/C/D/network) — different tone per type
 * Level 3: By theme/focus (klima/kreislaufwirtschaft/sozial/bildung/digital) — different content angle
 *
 * These "template foundations" flow through the existing composeGesuch/composeGesuchDokument
 * pipeline. Foundation-specific fields (name, address, amount) use placeholder text
 * that users replace when customizing for a specific foundation.
 */

import type { Foundation } from '@/lib/schemas/foundation';

/** Virtual foundations per template key — placeholder data for template generation */
export const TEMPLATE_FOUNDATIONS: Record<string, Foundation> = {
  A: {
    slug: 'vorlage-typ-a',
    name: '[Name der Stiftung]',
    type: 'A',
    status: 'rolling',
    deadline: null,
    deadlineText: 'Laufend',
    amount: { min: 20000, max: 50000, text: 'CHF 20\'000–50\'000' },
    fit: 3,
    priority: 1,
    tagline: 'Vorlage für professionalisierte Förderstiftungen (Typ A)',
    region: '[Region]',
    websiteUrl: 'https://example.ch',
    applicationMethod: 'online',
    contact: { address: '[Adresse der Stiftung]', email: '[email@stiftung.ch]' },
    themes: ['kreislaufwirtschaft', 'soziale-integration', 'klima'],
    source: 'manual',
    researchDate: '2026-02-10',
    needsResearch: false,
    purposeSummary: '[Stiftungszweck hier einfügen]',
    researchNotes: 'Vorlage-Dokument für Typ-A-Stiftungen',
  },
  B: {
    slug: 'vorlage-typ-b',
    name: '[Name der Stiftung]',
    type: 'B',
    status: 'rolling',
    deadline: null,
    deadlineText: 'Laufend',
    amount: { min: 10000, max: 30000, text: 'CHF 10\'000–30\'000' },
    fit: 3,
    priority: 1,
    tagline: 'Vorlage für potente Familienstiftungen (Typ B)',
    region: '[Region]',
    websiteUrl: 'https://example.ch',
    applicationMethod: 'email',
    contact: { address: '[Adresse der Stiftung]', email: '[email@stiftung.ch]' },
    themes: ['soziale-integration', 'kreislaufwirtschaft', 'digitale-bildung'],
    source: 'manual',
    researchDate: '2026-02-10',
    needsResearch: false,
    purposeSummary: '[Stiftungszweck hier einfügen]',
    researchNotes: 'Vorlage-Dokument für Typ-B-Stiftungen',
  },
  C: {
    slug: 'vorlage-typ-c',
    name: '[Name der Stiftung]',
    type: 'C',
    status: 'rolling',
    deadline: null,
    deadlineText: 'Laufend',
    amount: { min: 5000, max: 15000, text: 'CHF 5\'000–15\'000' },
    fit: 2,
    priority: 2,
    tagline: 'Vorlage für kleine Familienstiftungen (Typ C)',
    region: '[Region]',
    websiteUrl: 'https://example.ch',
    applicationMethod: 'contact',
    contact: { address: '[Adresse der Stiftung]', email: '[email@stiftung.ch]' },
    themes: ['soziale-integration', 'kreislaufwirtschaft'],
    source: 'manual',
    researchDate: '2026-02-10',
    needsResearch: false,
    purposeSummary: '[Stiftungszweck hier einfügen]',
    researchNotes: 'Vorlage-Dokument für Typ-C-Stiftungen',
  },
  D: {
    slug: 'vorlage-typ-d',
    name: '[Name der Stiftung]',
    type: 'D',
    status: 'rolling',
    deadline: null,
    deadlineText: 'Laufend',
    amount: { min: 15000, max: 50000, text: 'CHF 15\'000–50\'000' },
    fit: 2,
    priority: 2,
    tagline: 'Vorlage für Corporate Foundations (Typ D)',
    region: '[Region]',
    websiteUrl: 'https://example.ch',
    applicationMethod: 'online',
    contact: { address: '[Adresse der Stiftung]', email: '[email@stiftung.ch]' },
    themes: ['klima', 'kreislaufwirtschaft', 'soziale-integration'],
    source: 'manual',
    researchDate: '2026-02-10',
    needsResearch: false,
    purposeSummary: '[Stiftungszweck hier einfügen]',
    researchNotes: 'Vorlage-Dokument für Typ-D-Stiftungen',
  },
  network: {
    slug: 'vorlage-typ-network',
    name: '[Name des Netzwerks]',
    type: 'network',
    status: 'rolling',
    deadline: null,
    deadlineText: 'Laufend',
    amount: { min: null, max: null, text: 'Mitgliedschaft' },
    fit: 2,
    priority: 3,
    tagline: 'Vorlage für Netzwerke und Verbände',
    region: '[Region]',
    websiteUrl: 'https://example.ch',
    applicationMethod: 'membership',
    contact: { address: '[Adresse des Netzwerks]', email: '[email@netzwerk.ch]' },
    themes: ['kreislaufwirtschaft', 'soziale-integration', 'digitale-bildung'],
    source: 'manual',
    researchDate: '2026-02-10',
    needsResearch: false,
    purposeSummary: '[Netzwerk-Zweck hier einfügen]',
    researchNotes: 'Vorlage-Dokument für Netzwerke/Verbände',
  },

  // =========================================================================
  // Level 1: Generic — full Revamp-IT pitch, all themes
  // =========================================================================
  generisch: {
    slug: 'vorlage-generisch',
    name: '[Name der Stiftung]',
    type: 'A',
    status: 'rolling',
    deadline: null,
    deadlineText: 'Laufend',
    amount: { min: 10000, max: 50000, text: 'CHF 10\'000–50\'000' },
    fit: 3,
    priority: 1,
    tagline: 'Universelle Gesuch-Vorlage für Revamp-IT',
    region: '[Region]',
    websiteUrl: 'https://example.ch',
    applicationMethod: 'email',
    contact: { address: '[Adresse der Stiftung]', email: '[email@stiftung.ch]' },
    themes: ['klima', 'kreislaufwirtschaft', 'soziale-integration', 'digitale-bildung', 'digitale-souveraenitaet'],
    source: 'manual',
    researchDate: '2026-02-10',
    needsResearch: false,
    purposeSummary: '[Stiftungszweck hier einfügen]',
    researchNotes: 'Universelle Vorlage — zeigt das gesamte Revamp-IT-Profil',
  },

};

/** All valid template type keys */
export const TEMPLATE_TYPES = [
  'A', 'B', 'C', 'D', 'network',
  'generisch',
] as const;

/** Subset: Robert Schmuki type templates */
export const TYPE_TEMPLATE_KEYS = ['A', 'B', 'C', 'D', 'network'] as const;

/** Labels for generic template (type templates use TYPE_LABELS from foundations/metadata) */
export const TEMPLATE_LABELS: Record<string, { short: string; long: string; desc: string; category: 'generic' }> = {
  generisch: {
    short: 'Generisch',
    long: 'Universelle Vorlage',
    desc: 'Das gesamte Revamp-IT-Profil — alle Schwerpunkte, alle Projekte. Verwenden Sie diese Vorlage, wenn Sie den Fokus der Stiftung noch nicht kennen.',
    category: 'generic',
  },
};

/** Get a template foundation by type */
export function getTemplateFoundation(type: string): Foundation | undefined {
  return TEMPLATE_FOUNDATIONS[type];
}
