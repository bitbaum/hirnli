/**
 * Research Links — SSOT for all external platform URLs
 *
 * Each platform defines how to construct a lookup URL from foundation data.
 * These are authoritative sources — the researcher clicks through to find
 * verified contact info, grant details, and application processes.
 *
 * No scraping, no guessing. Just direct links to where the data lives.
 */

import type { Foundation } from '../schemas/foundation';

interface ResearchLink {
  /** Platform identifier */
  id: string;
  /** Display label */
  label: string;
  /** Short description of what you'll find there */
  description: string;
  /** Construct the URL from foundation data, or null if not applicable */
  url: (f: Foundation) => string | null;
  /** Is this an authoritative/official source? */
  official?: boolean;
}

/**
 * All research platforms, ordered by authority.
 * Official registers first, then commercial databases, then general search.
 */
export const RESEARCH_LINKS: ResearchLink[] = [
  // --- Official registers ---
  {
    id: 'zefix',
    label: 'Zefix',
    description: 'Handelsregister — Name, UID, Sitz, Zweck, Organe',
    official: true,
    url: (f) =>
      f.uid
        ? `https://www.zefix.ch/de/search/entity/list?mainSearch=${encodeURIComponent(f.uid)}`
        : null,
  },
  {
    id: 'uid-register',
    label: 'UID-Register',
    description: 'Unternehmens-Identifikation — Offizielle Registerdaten',
    official: true,
    url: (f) =>
      f.uid ? `https://www.uid.admin.ch/Detail.aspx?uid_id=${encodeURIComponent(f.uid)}` : null,
  },
  // --- Foundation directories ---
  {
    id: 'stiftungschweiz',
    label: 'StiftungSchweiz',
    description: 'Stiftungsverzeichnis — Profil, Kontakt, Fördergebiete',
    url: (f) =>
      f.uid
        ? `https://stiftungen.stiftungschweiz.ch/search?q=${encodeURIComponent(f.uid)}`
        : `https://stiftungen.stiftungschweiz.ch/search?q=${encodeURIComponent(f.name)}`,
  },
  {
    id: 'fundraiso',
    label: 'Fundraiso',
    description: 'Förderdatenbank — Kontakt, Vergabungen, Jahresrechnung',
    url: (f) =>
      f.uid
        ? `https://www.fundraiso.ch/search?q=${encodeURIComponent(f.uid)}`
        : `https://www.fundraiso.ch/search?q=${encodeURIComponent(f.name)}`,
  },
  // --- Commercial databases ---
  {
    id: 'moneyhouse',
    label: 'Moneyhouse',
    description: 'Firmendaten — Finanzen, Personen, Handelsregisterauszug',
    url: (f) =>
      f.uid
        ? `https://www.moneyhouse.ch/de/search?q=${encodeURIComponent(f.uid)}`
        : `https://www.moneyhouse.ch/de/search?q=${encodeURIComponent(f.name)}`,
  },
  {
    id: 'northdata',
    label: 'North Data',
    description: 'Firmennetzwerk — Verbindungen, Personen, Finanzdaten',
    url: (f) =>
      f.uid
        ? `https://www.northdata.com/${encodeURIComponent(f.name)},+${encodeURIComponent(f.uid)}`
        : `https://www.northdata.com/${encodeURIComponent(f.name)}`,
  },
  // --- General search (always available as fallback) ---
  {
    id: 'google',
    label: 'Google',
    description: 'Websuche — Website, Kontakt, Medienberichte',
    url: (f) =>
      `https://www.google.com/search?q=${encodeURIComponent(f.name + ' Stiftung Kontakt')}`,
  },
];

/** Get all applicable research links for a foundation */
export function getResearchLinks(f: Foundation): (ResearchLink & { href: string })[] {
  return RESEARCH_LINKS.map((link) => {
    const href = link.url(f);
    return href ? { ...link, href } : null;
  }).filter((link): link is ResearchLink & { href: string } => link !== null);
}
