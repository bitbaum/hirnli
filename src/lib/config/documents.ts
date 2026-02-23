/**
 * Documents Configuration - SSOT
 *
 * Central registry for all downloadable/printable documents
 * Replaces broken navigation-only sections with actual document links
 *
 * Last Updated: 2026-02-13
 */

import { STIFTUNGEN_DATA } from './foundations';
import { TEMPLATE_TYPES, TEMPLATE_FOUNDATIONS, TEMPLATE_LABELS } from './gesuch-templates';
import { TYPE_LABELS } from './foundations/metadata';
import { composeGesuch } from '@/lib/domain/gesuch-composer';
import { FINANCIAL_YEAR_LABEL, FINANCIAL_YEAR_RANGE } from '@/app/finanzen/data';

// ---------------------------------------------------------------------------
// Document Types
// ---------------------------------------------------------------------------

export type DocumentFormat = 'PDF' | 'CSV' | 'Excel' | 'Markdown';
export type DocumentAction = 'print' | 'download' | 'external';
export type DocumentCategory = 'gesuch' | 'vorlage' | 'export' | 'quelle';

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
// Foundation Gesuche (Personalized Applications)
// ---------------------------------------------------------------------------

const FOUNDATION_GESUCHE: Document[] = STIFTUNGEN_DATA
  .filter((foundation) => {
    const gesuch = composeGesuch(foundation);
    return gesuch.ready; // Only include ready Gesuche
  })
  .map((foundation) => ({
    id: `gesuch-${foundation.slug}`,
    title: `Gesuch ${foundation.name}`,
    description: `Personalisiertes Gesuch für ${foundation.name} — ${foundation.themes.join(', ')}`,
    format: 'PDF' as DocumentFormat,
    category: 'gesuch' as DocumentCategory,
    action: 'print' as DocumentAction,
    href: `/fundraising/stiftungen/${foundation.slug}/gesuch/dokument`,
    size: '~5 Seiten',
    badge: `Fit ${foundation.fit}/3`,
  }));

// ---------------------------------------------------------------------------
// Template Gesuche (Reference Templates)
// ---------------------------------------------------------------------------

const TEMPLATE_GESUCHE: Document[] = TEMPLATE_TYPES.map((templateType) => {
  const foundation = TEMPLATE_FOUNDATIONS[templateType];

  // Get proper label: TYPE_LABELS for A/B/C/D/network, TEMPLATE_LABELS for generisch
  const label = templateType === 'generisch'
    ? TEMPLATE_LABELS.generisch.long
    : TYPE_LABELS[templateType as keyof typeof TYPE_LABELS]?.long || `Typ ${templateType.toUpperCase()}`;

  return {
    id: `vorlage-${templateType}`,
    title: `Gesuch ${label}`,
    description: foundation?.tagline || label,
    format: 'PDF' as DocumentFormat,
    category: 'vorlage' as DocumentCategory,
    action: 'print' as DocumentAction,
    href: `/fundraising/gesuch-vorlagen/${templateType}/dokument`,
    size: '~4-6 Seiten',
    badge: templateType === 'generisch' ? 'Generisch' : `Typ ${templateType.toUpperCase()}`,
  };
});

// ---------------------------------------------------------------------------
// Data Exports (CSV Downloads)
// ---------------------------------------------------------------------------

// Generated exports (computed from live data)
const DATA_EXPORTS: Document[] = [
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
    description: `Alle ${STIFTUNGEN_DATA.length} recherchierten Stiftungen mit Fit-Score, Themen, Status, Deadlines — live generiert aus STIFTUNGEN_DATA`,
    format: 'CSV',
    category: 'export',
    action: 'download',
    href: '/api/export/foundations',
    size: '~50 KB',
    badge: `${STIFTUNGEN_DATA.length} Stiftungen`,
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
// Exports
// ---------------------------------------------------------------------------

export const DOCUMENTS = {
  gesuche: FOUNDATION_GESUCHE,
  vorlagen: TEMPLATE_GESUCHE,
  exports: DATA_EXPORTS,
  quellen: SOURCE_FILES,
};

export const DOCUMENT_STATS = {
  gesucheCount: FOUNDATION_GESUCHE.length,
  vorlagenCount: TEMPLATE_GESUCHE.length,
  exportsCount: DATA_EXPORTS.length,
  quellenCount: SOURCE_FILES.length,
  totalCount: FOUNDATION_GESUCHE.length + TEMPLATE_GESUCHE.length + DATA_EXPORTS.length + SOURCE_FILES.length,
};
