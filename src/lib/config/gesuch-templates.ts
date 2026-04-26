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
 *
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite this file's content.
 * Programmatic org references use ORG_PROFILE (src/lib/config/org-profile.ts).
 */

import type { Foundation, FoundationType } from '@/lib/schemas/foundation';
import { ORG_PROFILE } from './org-profile';
import { SCHWERPUNKTE, SCHWERPUNKT_IDS, type SchwerpunktId } from '@/lib/config/schwerpunkte';
import { TYPE_LABELS } from '@/lib/config/foundations/metadata';

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
    fitScore: 10,
    priority: 1,
    tagline: 'Vorlage für professionalisierte Förderstiftungen (Typ A)',
    region: '[Region]',
    websiteUrl: 'https://example.ch',
    applicationMethod: 'online',
    contact: { address: '[Adresse der Stiftung]', email: '[email@stiftung.ch]' },
    themes: ['kreislaufwirtschaft', 'soziale-integration', 'klima'],
    source: 'manual',
    researchDate: '2026-02-10',
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
    fitScore: 10,
    priority: 1,
    tagline: 'Vorlage für potente Familienstiftungen (Typ B)',
    region: '[Region]',
    websiteUrl: 'https://example.ch',
    applicationMethod: 'email',
    contact: { address: '[Adresse der Stiftung]', email: '[email@stiftung.ch]' },
    themes: ['soziale-integration', 'kreislaufwirtschaft', 'digitale-bildung'],
    source: 'manual',
    researchDate: '2026-02-10',
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
    fitScore: 5,
    priority: 2,
    tagline: 'Vorlage für kleine Familienstiftungen (Typ C)',
    region: '[Region]',
    websiteUrl: 'https://example.ch',
    applicationMethod: 'contact',
    contact: { address: '[Adresse der Stiftung]', email: '[email@stiftung.ch]' },
    themes: ['soziale-integration', 'kreislaufwirtschaft'],
    source: 'manual',
    researchDate: '2026-02-10',
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
    fitScore: 5,
    priority: 2,
    tagline: 'Vorlage für Corporate Foundations (Typ D)',
    region: '[Region]',
    websiteUrl: 'https://example.ch',
    applicationMethod: 'online',
    contact: { address: '[Adresse der Stiftung]', email: '[email@stiftung.ch]' },
    themes: ['klima', 'kreislaufwirtschaft', 'soziale-integration'],
    source: 'manual',
    researchDate: '2026-02-10',
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
    fitScore: 5,
    priority: 3,
    tagline: 'Vorlage für Netzwerke und Verbände',
    region: '[Region]',
    websiteUrl: 'https://example.ch',
    applicationMethod: 'membership',
    contact: { address: '[Adresse des Netzwerks]', email: '[email@netzwerk.ch]' },
    themes: ['kreislaufwirtschaft', 'soziale-integration', 'digitale-bildung'],
    source: 'manual',
    researchDate: '2026-02-10',
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
    fitScore: 10,
    priority: 1,
    tagline: `Universelle Gesuch-Vorlage für ${ORG_PROFILE.name}`,
    region: '[Region]',
    websiteUrl: 'https://example.ch',
    applicationMethod: 'email',
    contact: { address: '[Adresse der Stiftung]', email: '[email@stiftung.ch]' },
    themes: ['klima', 'kreislaufwirtschaft', 'soziale-integration', 'digitale-bildung', 'digitale-souveraenitaet'],
    source: 'manual',
    researchDate: '2026-02-10',
    purposeSummary: '[Stiftungszweck hier einfügen]',
    researchNotes: `Universelle Vorlage — zeigt das gesamte ${ORG_PROFILE.name}-Profil`,
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
    desc: `Das gesamte ${ORG_PROFILE.name}-Profil — alle Schwerpunkte, alle Projekte. Verwenden Sie diese Vorlage, wenn Sie den Fokus der Stiftung noch nicht kennen.`,
    category: 'generic',
  },
};

/** Get a template foundation by type */
export function getTemplateFoundation(type: string): Foundation | undefined {
  return TEMPLATE_FOUNDATIONS[type];
}

// =========================================================================
// Schwerpunkt × Type Templates (4 Schwerpunkte × 3 Types = 12 templates)
// =========================================================================

/** Only generate A/B/C for Schwerpunkt templates (D and network are niche legacy) */
export const SCHWERPUNKT_TEMPLATE_TYPES = ['A', 'B', 'C'] as const;

/** Amount ranges per type — reflects Robert Schmuki's typical ranges */
const SCHWERPUNKT_AMOUNTS: Record<string, { min: number; max: number; text: string }> = {
  A: { min: 20000, max: 50000, text: "CHF 20'000–50'000" },
  B: { min: 10000, max: 30000, text: "CHF 10'000–30'000" },
  C: { min: 5000, max: 15000, text: "CHF 5'000–15'000" },
};

/** Create a template foundation for a Schwerpunkt × Type combination */
function createSchwerpunktTemplate(schwerpunktId: SchwerpunktId, type: string): Foundation {
  const schwerpunkt = SCHWERPUNKTE[schwerpunktId];
  const typeLabel = TYPE_LABELS[type as FoundationType];
  const amount = SCHWERPUNKT_AMOUNTS[type] ?? SCHWERPUNKT_AMOUNTS['B'];

  return {
    slug: `vorlage-${schwerpunktId}-${type.toLowerCase()}`,
    name: '[Name der Stiftung]',
    type: type as FoundationType,
    status: 'rolling',
    deadline: null,
    deadlineText: 'Laufend',
    amount,
    fitScore: 10,
    priority: 1,
    tagline: `Vorlage: ${schwerpunkt.shortLabel} × Typ ${typeLabel.short}`,
    region: '[Region]',
    websiteUrl: 'https://example.ch',
    applicationMethod: type === 'A' ? 'online' : type === 'B' ? 'email' : 'contact',
    contact: { address: '[Adresse der Stiftung]', email: '[email@stiftung.ch]' },
    themes: schwerpunkt.themeIds,
    source: 'manual',
    researchDate: '2026-02-16',
    purposeSummary: '[Stiftungszweck hier einfügen]',
    researchNotes: `Schwerpunkt-Vorlage: ${schwerpunkt.label} (Typ ${typeLabel.short})`,
  };
}

/** Get a Schwerpunkt template foundation */
export function getSchwerpunktTemplate(schwerpunktId: string, type: string): Foundation | undefined {
  if (!SCHWERPUNKT_IDS.includes(schwerpunktId as SchwerpunktId)) return undefined;
  if (!SCHWERPUNKT_TEMPLATE_TYPES.includes(type as typeof SCHWERPUNKT_TEMPLATE_TYPES[number])) return undefined;
  return createSchwerpunktTemplate(schwerpunktId as SchwerpunktId, type);
}

/** All valid Schwerpunkt route params (for generateStaticParams) */
export function getSchwerpunktStaticParams(): { vorlage: string; type: string }[] {
  return SCHWERPUNKT_IDS.flatMap((s) =>
    SCHWERPUNKT_TEMPLATE_TYPES.map((t) => ({ vorlage: s, type: t }))
  );
}
