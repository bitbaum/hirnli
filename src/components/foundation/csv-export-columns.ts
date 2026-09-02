import { THEMES } from '@/lib/config/foundations';
import { getQualityTier } from '@/lib/domain/foundation-helpers';
import type { Foundation } from '@/lib/schemas/foundation';
import { isRegistryUrl } from '@/lib/config/registry-domains';

// ---------------------------------------------------------------------------
// Address parsing
// ---------------------------------------------------------------------------

interface ParsedAddress {
  street: string;
  zip: string;
  city: string;
}

/**
 * Parse Swiss address string into structured parts.
 * Handles: "Street, ZIP City" | "City, Schweiz" | "c/o X, Street, ZIP City" | "City"
 */
function parseAddress(address?: string | null): ParsedAddress {
  if (!address) return { street: '', zip: '', city: '' };
  const raw = address.trim();

  // Find the ZIP+City segment: 4-digit Swiss zip followed by city name
  // Handles both "8001 Zürich" and "CH-8001 Zürich"
  const zipMatch = raw.match(/(?:CH-)?(\d{4})\s+(.+?)$/);
  if (zipMatch) {
    const zip = zipMatch[1];
    const city = zipMatch[2].replace(/,\s*Schweiz$/i, '').trim();
    // Everything before the zip segment is the street (may include c/o, contact person, etc.)
    const beforeZip = raw.slice(0, raw.indexOf(zipMatch[0])).replace(/,\s*$/, '').trim();
    return { street: beforeZip, zip, city };
  }

  // "City, Schweiz" pattern (most common: ~640 entries)
  const schweizMatch = raw.match(/^(.+?),\s*Schweiz$/i);
  if (schweizMatch) {
    return { street: '', zip: '', city: schweizMatch[1].trim() };
  }

  // Single value — likely just a city name
  if (!raw.includes(',')) {
    return { street: '', zip: '', city: raw };
  }

  // Fallback: put everything as city (better than guessing wrong)
  return { street: '', zip: '', city: raw };
}

// Per-foundation address cache — avoids parsing the same string multiple times
const _addrCache = new WeakMap<Foundation, ParsedAddress>();
function addressCache(f: Foundation): ParsedAddress {
  let cached = _addrCache.get(f);
  if (!cached) {
    cached = parseAddress(f.contact?.address);
    _addrCache.set(f, cached);
  }
  return cached;
}

// ---------------------------------------------------------------------------
// Column helpers
// ---------------------------------------------------------------------------

/** True website (not a registry/directory lookup link) */
function getOwnWebsite(f: Foundation): string {
  const url = f.websiteUrl ?? '';
  if (isRegistryUrl(url)) return '';
  return url;
}

/** Google search link as fallback when data is missing */
function googleSearch(name: string, ...terms: string[]): string {
  const q = encodeURIComponent([name, 'Stiftung Schweiz', ...terms].join(' '));
  return `https://www.google.com/search?q=${q}`;
}

// ---------------------------------------------------------------------------
// Column types
// ---------------------------------------------------------------------------

export interface CsvColumn {
  id: string;
  label: string;
  defaultOn: boolean;
  getValue: (f: Foundation) => string;
}

interface ColumnGroup {
  label: string;
  columns: CsvColumn[];
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const THEME_COLUMNS: CsvColumn[] = Object.values(THEMES).map((t) => ({
  id: `theme_${t.id}`,
  label: t.label,
  defaultOn: true,
  getValue: (f: Foundation) => ((f.themes ?? []).includes(t.id) ? 'X' : ''),
}));

export const COLUMN_GROUPS: ColumnGroup[] = [
  {
    label: 'Basisdaten',
    columns: [
      { id: 'name', label: 'Name', defaultOn: true, getValue: (f) => f.name },
      { id: 'type', label: 'Typ (A/B/C/D)', defaultOn: true, getValue: (f) => f.type ?? '' },
      {
        id: 'websiteUrl',
        label: 'Website',
        defaultOn: true,
        getValue: (f) => getOwnWebsite(f) || googleSearch(f.name, 'website'),
      },
      {
        id: 'purposeSummary',
        label: 'Zweckbeschreibung',
        defaultOn: false,
        getValue: (f) => f.purposeSummary ?? '',
      },
      {
        id: 'tagline',
        label: 'Kurzbeschreibung',
        defaultOn: false,
        getValue: (f) => f.tagline ?? '',
      },
    ],
  },
  {
    label: 'Adresse',
    columns: [
      {
        id: 'street',
        label: 'Strasse',
        defaultOn: true,
        getValue: (f) => {
          const a = addressCache(f);
          return a.street || (a.zip ? '' : googleSearch(f.name, 'adresse'));
        },
      },
      { id: 'zip', label: 'PLZ', defaultOn: true, getValue: (f) => addressCache(f).zip },
      { id: 'city', label: 'Ort', defaultOn: true, getValue: (f) => addressCache(f).city },
      { id: 'region', label: 'Region / Kanton', defaultOn: true, getValue: (f) => f.region ?? '' },
      {
        id: 'email',
        label: 'E-Mail',
        defaultOn: true,
        getValue: (f) => f.contact?.email || googleSearch(f.name, 'kontakt email'),
      },
      { id: 'phone', label: 'Telefon', defaultOn: false, getValue: (f) => f.contact?.phone ?? '' },
    ],
  },
  {
    label: 'Schwerpunkte',
    columns: THEME_COLUMNS,
  },
  {
    label: 'Bewertung',
    columns: [
      {
        id: 'fitScore',
        label: 'Fit-Score (0–10)',
        defaultOn: true,
        getValue: (f) => String(f.fitScore ?? 0),
      },
      {
        id: 'priority',
        label: 'Priorität (P1–P4)',
        defaultOn: true,
        getValue: (f) => `P${f.priority}`,
      },
      { id: 'tier', label: 'Qualitäts-Tier', defaultOn: false, getValue: (f) => getQualityTier(f) },
    ],
  },
  {
    label: 'Bewerbung',
    columns: [
      { id: 'status', label: 'Status', defaultOn: false, getValue: (f) => f.status ?? '' },
      {
        id: 'applicationMethod',
        label: 'Bewerbungsweg',
        defaultOn: false,
        getValue: (f) => f.applicationMethod ?? '',
      },
      { id: 'deadline', label: 'Frist', defaultOn: false, getValue: (f) => f.deadlineText ?? '' },
      {
        id: 'applicationUrl',
        label: 'Bewerbungs-URL',
        defaultOn: false,
        getValue: (f) => f.applicationUrl ?? '',
      },
    ],
  },
  {
    label: 'Finanzen',
    columns: [
      {
        id: 'amountText',
        label: 'Förderbetrag',
        defaultOn: false,
        getValue: (f) => f.amount?.text ?? '',
      },
      {
        id: 'amountMin',
        label: 'Betrag Min (CHF)',
        defaultOn: false,
        getValue: (f) => (f.amount?.min != null ? String(f.amount.min) : ''),
      },
      {
        id: 'amountMax',
        label: 'Betrag Max (CHF)',
        defaultOn: false,
        getValue: (f) => (f.amount?.max != null ? String(f.amount.max) : ''),
      },
      { id: 'capital', label: 'Kapital', defaultOn: false, getValue: (f) => f.capital ?? '' },
    ],
  },
  {
    label: 'Notizen',
    columns: [
      {
        id: 'researchNotes',
        label: 'Recherche-Notizen',
        defaultOn: false,
        getValue: (f) => f.researchNotes ?? '',
      },
    ],
  },
];

export const ALL_COLUMNS = COLUMN_GROUPS.flatMap((g) => g.columns);
export const DEFAULT_IDS = new Set(ALL_COLUMNS.filter((c) => c.defaultOn).map((c) => c.id));
