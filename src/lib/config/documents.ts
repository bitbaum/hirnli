/**
 * Documents Configuration - SSOT
 *
 * Central registry for all downloadable/printable documents
 * Replaces broken navigation-only sections with actual document links
 *
 * Last Updated: 2026-02-13
 */

import { TEMPLATE_TYPES, TEMPLATE_FOUNDATIONS, TEMPLATE_LABELS } from './gesuch-templates';
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
  return foundations
    .filter(hasGesuchPage)
    .map((foundation): Document => ({
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

const TEMPLATE_GESUCHE: Document[] = TEMPLATE_TYPES.map((templateType): Document => {
  const foundation = TEMPLATE_FOUNDATIONS[templateType];

  // Get proper label: TYPE_LABELS for A/B/C/D/network, TEMPLATE_LABELS for generisch
  const label = templateType === 'generisch'
    ? TEMPLATE_LABELS.generisch.long
    : TYPE_LABELS[templateType].long;

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

// ---------------------------------------------------------------------------
// Data Exports (CSV Downloads)
// ---------------------------------------------------------------------------

// Generated exports (computed from live data)
function buildDataExports(foundationCount: number): Document[] {
  return [
    {
      id: 'export-financial',
      title: `Finanzdaten ${FINANCIAL_YEAR_RANGE}`,
      description: 'Komplette Einnahmen & Ausgaben nach Jahr und Kategorie — generiert aus Kivitendo-Quelldaten',
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

// Source files (original data from Kivitendo, anonymized for public access)
const SOURCE_FILES: Document[] = [
  {
    id: 'source-trial-balance',
    title: 'Summen & Saldenliste (Kivitendo)',
    description: 'Original Erfolgsrechnung aus Kivitendo — Kontensalden per 31.12.2026. Basis für alle Finanzdaten auf dieser Seite.',
    format: 'CSV',
    category: 'quelle',
    action: 'download',
    href: '/documents/sources/summen_saldenliste_trial_balance.csv',
    size: '~8 KB',
    badge: 'Original',
    lastUpdated: '2026-02-13',
  },
  {
    id: 'source-chart-accounts',
    title: 'Kontenplan (Kivitendo)',
    description: 'Kontenplan-Struktur aus Kivitendo — zeigt alle Konten und ihre Hierarchie. Wichtig für Transparenz der Buchführung.',
    format: 'CSV',
    category: 'quelle',
    action: 'download',
    href: '/documents/sources/kontenplan_chart_of_accounts.csv',
    size: '~6 KB',
    badge: 'Original',
    lastUpdated: '2026-02-13',
  },
  {
    id: 'source-consolidated-workbook',
    title: 'Konsolidierte Finanzdaten 2007-2025 (Excel)',
    description: '13-Sheet Excel mit allen Finanzdaten: P&L, Bilanz, Top Kunden, Einkauf, etc. — ANONYMISIERT (Kundennamen ersetzt) mit Datenqualitäts-Warnungen und Quellenangaben pro Sheet.',
    format: 'Excel',
    category: 'quelle',
    action: 'download',
    href: '/documents/sources/revamp-it_finanzen_anonymisiert.xlsx',
    size: '~53 KB',
    badge: '13 Sheets',
    lastUpdated: '2026-02-13',
  },
  {
    id: 'source-excel-readme',
    title: 'README: Konsolidierte Finanzdaten',
    description: 'Umfassende Dokumentation der Excel-Datei: Inhalt, Erstellung, Anonymisierung, Datenqualitäts-Warnungen, Quellenangaben. BITTE ZUERST LESEN.',
    format: 'Markdown',
    category: 'quelle',
    action: 'download',
    href: '/documents/sources/README_FINANZEN_EXCEL.txt',
    size: '~11 KB',
    badge: 'Wichtig',
    lastUpdated: '2026-02-13',
  },
];

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
    description: 'Präsentationsdeck für Stiftungen & Förderer — 8 Folien, Querformat A4. Problem, Lösung, Impact, Finanzen, Hub-Vision. Aus Live-Daten generiert.',
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
export function buildDocuments(foundations: Foundation[]) {
  const gesuche = buildFoundationGesuche(foundations);
  const exports = buildDataExports(foundations.length);

  const documents = {
    berichte: BERICHTE,
    gesuche,
    vorlagen: TEMPLATE_GESUCHE,
    exports,
    quellen: SOURCE_FILES,
  };

  const stats = {
    berichteCount: BERICHTE.length,
    gesucheCount: gesuche.length,
    vorlagenCount: TEMPLATE_GESUCHE.length,
    exportsCount: exports.length,
    quellenCount: SOURCE_FILES.length,
    totalCount: BERICHTE.length + gesuche.length + TEMPLATE_GESUCHE.length + exports.length + SOURCE_FILES.length,
  };

  return { documents, stats };
}
