'use client';

import { useState, useMemo, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { THEMES } from '@/lib/config/foundations';
import { getQualityTier } from '@/lib/domain/foundation-helpers';
import type { Foundation } from '@/lib/schemas/foundation';
import { isRegistryUrl } from '@/lib/config/registry-domains';

// ---------------------------------------------------------------------------
// CSV utilities
// ---------------------------------------------------------------------------

function csvEscape(val: string): string {
  if (val.includes('"') || val.includes(',') || val.includes('\n') || val.includes(';')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

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

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

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

interface CsvColumn {
  id: string;
  label: string;
  defaultOn: boolean;
  getValue: (f: Foundation) => string;
}

interface ColumnGroup {
  label: string;
  columns: CsvColumn[];
}

// Generate binary theme columns from THEMES config (SSOT)
const THEME_COLUMNS: CsvColumn[] = Object.values(THEMES).map((t) => ({
  id: `theme_${t.id}`,
  label: t.label,
  defaultOn: true,
  getValue: (f: Foundation) => (f.themes ?? []).includes(t.id) ? 'X' : '',
}));

const COLUMN_GROUPS: ColumnGroup[] = [
  {
    label: 'Basisdaten',
    columns: [
      { id: 'name', label: 'Name', defaultOn: true, getValue: (f) => f.name },
      { id: 'type', label: 'Typ (A/B/C/D)', defaultOn: true, getValue: (f) => f.type ?? '' },
      { id: 'websiteUrl', label: 'Website', defaultOn: true, getValue: (f) => getOwnWebsite(f) || googleSearch(f.name, 'website') },
      { id: 'purposeSummary', label: 'Zweckbeschreibung', defaultOn: false, getValue: (f) => f.purposeSummary ?? '' },
      { id: 'tagline', label: 'Kurzbeschreibung', defaultOn: false, getValue: (f) => f.tagline ?? '' },
    ],
  },
  {
    label: 'Adresse',
    columns: [
      { id: 'street', label: 'Strasse', defaultOn: true, getValue: (f) => {
        const a = addressCache(f);
        return a.street || (a.zip ? '' : googleSearch(f.name, 'adresse'));
      }},
      { id: 'zip', label: 'PLZ', defaultOn: true, getValue: (f) => addressCache(f).zip },
      { id: 'city', label: 'Ort', defaultOn: true, getValue: (f) => addressCache(f).city },
      { id: 'region', label: 'Region / Kanton', defaultOn: true, getValue: (f) => f.region ?? '' },
      { id: 'email', label: 'E-Mail', defaultOn: true, getValue: (f) => f.contact?.email || googleSearch(f.name, 'kontakt email') },
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
      { id: 'fitScore', label: 'Fit-Score (0–10)', defaultOn: true, getValue: (f) => String(f.fitScore ?? 0) },
      { id: 'priority', label: 'Priorität (P1–P4)', defaultOn: true, getValue: (f) => `P${f.priority}` },
      { id: 'tier', label: 'Qualitäts-Tier', defaultOn: false, getValue: (f) => getQualityTier(f) },
    ],
  },
  {
    label: 'Bewerbung',
    columns: [
      { id: 'status', label: 'Status', defaultOn: false, getValue: (f) => f.status ?? '' },
      { id: 'applicationMethod', label: 'Bewerbungsweg', defaultOn: false, getValue: (f) => f.applicationMethod ?? '' },
      { id: 'deadline', label: 'Frist', defaultOn: false, getValue: (f) => f.deadlineText ?? '' },
      { id: 'applicationUrl', label: 'Bewerbungs-URL', defaultOn: false, getValue: (f) => f.applicationUrl ?? '' },
    ],
  },
  {
    label: 'Finanzen',
    columns: [
      { id: 'amountText', label: 'Förderbetrag', defaultOn: false, getValue: (f) => f.amount?.text ?? '' },
      { id: 'amountMin', label: 'Betrag Min (CHF)', defaultOn: false, getValue: (f) => f.amount?.min != null ? String(f.amount.min) : '' },
      { id: 'amountMax', label: 'Betrag Max (CHF)', defaultOn: false, getValue: (f) => f.amount?.max != null ? String(f.amount.max) : '' },
      { id: 'capital', label: 'Kapital', defaultOn: false, getValue: (f) => f.capital ?? '' },
    ],
  },
  {
    label: 'Notizen',
    columns: [
      { id: 'researchNotes', label: 'Recherche-Notizen', defaultOn: false, getValue: (f) => f.researchNotes ?? '' },
    ],
  },
];

const ALL_COLUMNS = COLUMN_GROUPS.flatMap((g) => g.columns);
const DEFAULT_IDS = new Set(ALL_COLUMNS.filter((c) => c.defaultOn).map((c) => c.id));

// ---------------------------------------------------------------------------
// Coverage indicator
// ---------------------------------------------------------------------------

function CoverageBar({ percent }: { percent: number }) {
  const filled = Math.round(percent / 20); // 0–5 blocks
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex gap-0.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-2 w-1.5 rounded-sm ${i < filled ? 'bg-primary' : 'bg-bg-light'}`}
          />
        ))}
      </span>
      <span
        className={`w-8 text-right text-xs tabular-nums ${percent < 25 ? 'text-accent' : 'text-text-muted'}`}
        aria-label={`${percent}% Datenvollständigkeit`}
      >
        {percent}%
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Modal component
// ---------------------------------------------------------------------------

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  foundations: Foundation[];
}

export default function CsvExportModal({ isOpen, onClose, foundations }: CsvExportModalProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(DEFAULT_IDS));

  // Coverage per column — only computed when modal is open
  const coverage = useMemo(() => {
    if (!isOpen || foundations.length === 0) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const col of ALL_COLUMNS) {
      const filled = foundations.filter((f) => col.getValue(f).trim() !== '').length;
      map.set(col.id, Math.round((filled / foundations.length) * 100));
    }
    return map;
  }, [isOpen, foundations]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(ALL_COLUMNS.map((c) => c.id)));
  }, []);

  const selectNone = useCallback(() => {
    setSelected(new Set());
  }, []);

  const selectDefaults = useCallback(() => {
    setSelected(new Set(DEFAULT_IDS));
  }, []);

  const handleExport = useCallback(() => {
    const activeCols = ALL_COLUMNS.filter((c) => selected.has(c.id));
    if (activeCols.length === 0) return;

    const header = activeCols.map((c) => csvEscape(c.label));
    const rows = foundations.map((f) =>
      activeCols.map((c) => csvEscape(c.getValue(f))).join(','),
    );

    const csv = '\uFEFF' + [header.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stiftungen-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  }, [foundations, selected, onClose]);

  const selectedCount = selected.size;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CSV Export" className="max-w-xl">
      {/* Count + quick toggles */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text-muted">
          <span className="font-semibold text-grey-dark">{foundations.length}</span> Stiftungen (aktueller Filter)
        </p>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={selectAll}>Alle</Button>
          <Button variant="ghost" size="sm" onClick={selectNone}>Keine</Button>
          <Button variant="ghost" size="sm" onClick={selectDefaults}>Standard</Button>
        </div>
      </div>

      {/* Column groups */}
      <div className="space-y-4">
        {COLUMN_GROUPS.map((group) => (
          <div key={group.label}>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {group.label}
            </h4>
            <div className="space-y-0.5">
              {group.columns.map((col) => {
                const checked = selected.has(col.id);
                const pct = coverage.get(col.id) ?? 0;
                return (
                  <label
                    key={col.id}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-sm hover:bg-bg-light"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(col.id)}
                      className="rounded border-border"
                    />
                    <span className={`flex-1 ${checked ? 'font-medium text-grey-dark' : 'text-text-muted'}`}>
                      {col.label}
                    </span>
                    <CoverageBar percent={pct} />
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-muted">
          {selectedCount} {selectedCount === 1 ? 'Spalte' : 'Spalten'} ausgewählt
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={selectedCount === 0}
            onClick={handleExport}
          >
            Herunterladen
          </Button>
        </div>
      </div>
    </Modal>
  );
}
