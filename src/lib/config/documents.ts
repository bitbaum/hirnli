/**
 * Documents Configuration - SSOT
 *
 * Central registry for all downloadable/printable documents
 * Replaces broken navigation-only sections with actual document links
 *
 * Last Updated: 2026-02-13
 */

import { STIFTUNGEN_DATA } from './foundations';
import { TEMPLATE_TYPES } from './gesuch-templates';
import { composeGesuch } from '@/lib/domain/gesuch-composer';

// ---------------------------------------------------------------------------
// Document Types
// ---------------------------------------------------------------------------

export type DocumentFormat = 'PDF' | 'CSV' | 'Excel' | 'Markdown';
export type DocumentAction = 'print' | 'download' | 'external';
export type DocumentCategory = 'gesuch' | 'vorlage' | 'export';

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
  badge?: string; // e.g., "37 Stiftungen", "11 Vorlagen"
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

const TEMPLATE_GESUCHE: Document[] = TEMPLATE_TYPES.map((template) => ({
  id: `vorlage-${template.id}`,
  title: template.label,
  description: template.description,
  format: 'PDF' as DocumentFormat,
  category: 'vorlage' as DocumentCategory,
  action: 'print' as DocumentAction,
  href: `/fundraising/gesuch-vorlagen/${template.id}/dokument`,
  size: '~4-6 Seiten',
  badge: template.id ? `Typ ${template.id.toUpperCase()}` : 'Vorlage',
}));

// ---------------------------------------------------------------------------
// Data Exports (CSV Downloads)
// ---------------------------------------------------------------------------

const DATA_EXPORTS: Document[] = [
  {
    id: 'export-financial',
    title: 'Finanzdaten 2018-2025',
    description: 'Komplette Einnahmen & Ausgaben nach Jahr und Kategorie (aus Kivitendo)',
    format: 'CSV',
    category: 'export',
    action: 'download',
    href: '/api/export/financial',
    size: '~200 KB',
    badge: '8 Jahre',
  },
  {
    id: 'export-foundations',
    title: 'Stiftungsliste',
    description: 'Alle 37 recherchierten Stiftungen mit Fit-Score, Themen, Status, Deadlines',
    format: 'CSV',
    category: 'export',
    action: 'download',
    href: '/api/export/foundations',
    size: '~50 KB',
    badge: '37 Stiftungen',
  },
  {
    id: 'export-revenue',
    title: 'Einnahmen-Historie',
    description: 'Jahresumsätze 2018-2025 aufgeschlüsselt nach Einnahmequellen',
    format: 'CSV',
    category: 'export',
    action: 'download',
    href: '/api/export/revenue',
    size: '~10 KB',
    badge: '8 Jahre',
  },
];

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const DOCUMENTS = {
  gesuche: FOUNDATION_GESUCHE,
  vorlagen: TEMPLATE_GESUCHE,
  exports: DATA_EXPORTS,
};

export const DOCUMENT_STATS = {
  gesucheCount: FOUNDATION_GESUCHE.length,
  vorlagenCount: TEMPLATE_GESUCHE.length,
  exportsCount: DATA_EXPORTS.length,
  totalCount: FOUNDATION_GESUCHE.length + TEMPLATE_GESUCHE.length + DATA_EXPORTS.length,
};
