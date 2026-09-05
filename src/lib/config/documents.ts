/**
 * Documents Configuration - SSOT
 *
 * Central registry for all downloadable/printable documents
 * Replaces broken navigation-only sections with actual document links
 *
 * Last Updated: 2026-02-13
 */

import {
  TEMPLATE_TYPES,
  resolveTemplateFoundation,
  resolveTemplateLabels,
} from './gesuch-templates';
import type { Tenant } from '@/lib/tenant/profile';
import { TYPE_LABELS } from './foundations/metadata';
import { hasGesuchPage } from '@/lib/domain/foundation-helpers';
import { FINANCIAL_YEAR_LABEL, FINANCIAL_YEAR_RANGE } from '@/lib/config/financial-constants';
import type { Foundation } from '@/lib/schemas/foundation';

// ---------------------------------------------------------------------------
// Document Types
// ---------------------------------------------------------------------------

export type DocumentFormat = 'PDF' | 'CSV' | 'Excel' | 'Markdown';
export type DocumentAction = 'print' | 'download' | 'external';
type DocumentCategory = 'gesuch' | 'vorlage' | 'export' | 'quelle' | 'bericht';

export interface Document {
  id: string;
  title: string;
  description: string;
  format: DocumentFormat;
  category: DocumentCategory;
  action: DocumentAction;
  href: string;
  size?: string; // e.g., "~5 pages", "~2 MB"
  lastUpdated?: string; // ISO date
  badge?: string; // e.g., "N Stiftungen", "N Vorlagen" (derive from data, never hardcode)
}

// ---------------------------------------------------------------------------
// Foundation Gesuche (Personalized Applications) — built at render time from
// the DB read layer, not a module-scope constant.
// ---------------------------------------------------------------------------

function buildFoundationGesuche(foundations: Foundation[]): Document[] {
  return foundations.filter(hasGesuchPage).map((foundation): Document => ({
    id: `gesuch-${foundation.slug}`,
    title: `Gesuch ${foundation.name}`,
    description: `Personalisiertes Gesuch für ${foundation.name} — ${foundation.themes.join(', ')}`,
    format: 'PDF',
    category: 'gesuch',
    action: 'download',
    href: `/api/pdf/gesuch/${foundation.slug}`,
    size: '~5 Seiten',
    badge: `Fit ${foundation.fitScore}/10`,
  }));
}

// ---------------------------------------------------------------------------
// Template Gesuche (Reference Templates)
// ---------------------------------------------------------------------------

// Built per request, not at module scope: the template descriptions are
// `{{name}}` text, and a module-scope constant is filled once — at import,
// for whichever tenant happened to be first. That is exactly how a rendered
// `{{founded}}` reached a live Gesuch page before.
function buildTemplateGesuche(tenant: Tenant): Document[] {
  const labels = resolveTemplateLabels(tenant);

  return TEMPLATE_TYPES.map((templateType): Document => {
    const foundation = resolveTemplateFoundation(templateType, tenant);

    // Get proper label: TYPE_LABELS for A/B/C/D/network, TEMPLATE_LABELS for generisch
    const label =
      templateType === 'generisch' ? labels.generisch.long : TYPE_LABELS[templateType].long;

    return {
      id: `vorlage-${templateType}`,
      title: `Gesuch ${label}`,
      description: foundation?.tagline || label,
      format: 'PDF',
      category: 'vorlage',
      action: 'print',
      href: `/fundraising/gesuch-vorlagen/${templateType}/dokument`,
      size: '~4-6 Seiten',
      badge: templateType === 'generisch' ? 'Generisch' : `Typ ${templateType.toUpperCase()}`,
    };
  });
}

// ---------------------------------------------------------------------------
// Data Exports (CSV Downloads)
// ---------------------------------------------------------------------------

// Generated exports (computed from live data)
function buildDataExports(foundationCount: number): Document[] {
  return [
    {
      id: 'export-financial',
      title: `Finanzdaten ${FINANCIAL_YEAR_RANGE}`,
      description:
        'Komplette Einnahmen & Ausgaben nach Jahr und Kategorie — generiert aus Kivitendo-Quelldaten',
      format: 'CSV',
      category: 'export',
      action: 'download',
      href: '/api/export/financial',
      size: '~200 KB',
      badge: FINANCIAL_YEAR_LABEL,
      lastUpdated: '2026-02-13',
    },
    {
      id: 'export-foundations',
      title: 'Stiftungsliste',
      description: `Alle ${foundationCount} recherchierten Stiftungen mit Fit-Score, Themen, Status, Deadlines — live generiert aus der Foundation-DB`,
      format: 'CSV',
      category: 'export',
      action: 'download',
      href: '/api/export/foundations',
      size: '~50 KB',
      badge: `${foundationCount} Stiftungen`,
      lastUpdated: '2026-02-13',
    },
    {
      id: 'export-revenue',
      title: 'Einnahmen-Historie',
      description: `Jahresumsätze ${FINANCIAL_YEAR_RANGE} aufgeschlüsselt nach Einnahmequellen — generiert aus Kivitendo-Quelldaten`,
      format: 'CSV',
      category: 'export',
      action: 'download',
      href: '/api/export/revenue',
      size: '~10 KB',
      badge: FINANCIAL_YEAR_LABEL,
      lastUpdated: '2026-02-13',
    },
  ];
}

/**
 * Source files — EMPTY, and that is the honest state.
 *
 * Four entries lived here: the Kivitendo trial balance, the chart of accounts,
 * a 13-sheet consolidated finance workbook and its README. Every one of them
 * 404s. `public/documents/` has never contained anything but `.gitkeep` files,
 * and `public/documents/README.md` has recorded that as "referenced but not
 * uploaded" since February — while the page went on offering the downloads.
 *
 * They are listed in that README, which is where the intent belongs until the
 * files exist. A document and its reference land in the SAME commit now;
 * `referenced-documents-exist.test.ts` enforces it.
 */
const SOURCE_FILES: Document[] = [];

// ---------------------------------------------------------------------------
// Reports (Wirkungsberichte)
// ---------------------------------------------------------------------------

const BERICHTE: Document[] = [
  {
    id: 'wirkungsbericht-2025',
    title: 'Wirkungsbericht 2025',
    description: `Jährlicher Impact-Report — Finanzen ${FINANCIAL_YEAR_RANGE}, Umweltwirkung, Arbeitsintegration, Stiftungspipeline. Aus Live-Daten generiert.`,
    format: 'PDF',
    category: 'bericht',
    action: 'download',
    href: '/api/documents/impact-report',
    size: '~2 Seiten',
    badge: 'Neu',
    lastUpdated: '2026-04-23',
  },
  {
    id: 'pitch-deck-2025',
    title: 'Pitch Deck 2025',
    description:
      'Präsentationsdeck für Stiftungen & Förderer — 8 Folien, Querformat A4. Problem, Lösung, Impact, Finanzen, Hub-Vision. Aus Live-Daten generiert.',
    format: 'PDF',
    category: 'bericht',
    action: 'download',
    href: '/api/documents/pitch-deck',
    size: '~8 Folien',
    badge: 'Neu',
    lastUpdated: '2026-04-23',
  },
];

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/** Built at render time — the gesuche + exports lists depend on live foundation data. */
export function buildDocuments(foundations: Foundation[], tenant: Tenant) {
  const gesuche = buildFoundationGesuche(foundations);
  const exports = buildDataExports(foundations.length);
  const vorlagen = buildTemplateGesuche(tenant);

  const documents = {
    berichte: BERICHTE,
    gesuche,
    vorlagen,
    exports,
    quellen: SOURCE_FILES,
  };

  const stats = {
    berichteCount: BERICHTE.length,
    gesucheCount: gesuche.length,
    vorlagenCount: vorlagen.length,
    exportsCount: exports.length,
    quellenCount: SOURCE_FILES.length,
    totalCount:
      BERICHTE.length + gesuche.length + vorlagen.length + exports.length + SOURCE_FILES.length,
  };

  return { documents, stats };
}
