import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { composeGesuch } from '@/lib/domain/gesuch-composer';
import { TEMPLATE_TYPES } from '@/lib/config/gesuch-templates';

// ── Gesuche & Vorlagen ──────────────────────────────────────────────────────

const gesuchReadyCount = STIFTUNGEN_DATA.filter((f) => composeGesuch(f).ready).length;

export const GESUCH_SECTIONS = [
  {
    title: 'Stiftungs-Gesuche',
    description: `Personalisierte Gesuche für ${STIFTUNGEN_DATA.length} recherchierte Stiftungen — jeweils mit interaktiver Übersicht und druckfertigem 5-Seiten-Dokument.`,
    href: '/fundraising/stiftungen',
    linkLabel: 'Alle Stiftungen anzeigen',
    stats: `${gesuchReadyCount} bereit`,
  },
  {
    title: 'Gesuch-Vorlagen',
    description: `${TEMPLATE_TYPES.length} Referenz-Vorlagen — nach Stiftungstyp (A/B/C/D/Netzwerk) plus eine universelle Fallback-Vorlage. Zeigen Struktur und Ton für jeden Foundation-Typ.`,
    href: '/fundraising/gesuch-vorlagen',
    linkLabel: 'Vorlagen öffnen',
    stats: `${TEMPLATE_TYPES.length} Vorlagen`,
  },
];

// ── Online-Berichte (printable pages) ───────────────────────────────────────

export const ONLINE_REPORTS = [
  { href: '/strategie', label: 'Strategie & Vision', description: 'Mission, Souveränitäts-Pfad, Community Tech Space' },
  { href: '/wirkung', label: 'Wirkungsbericht', description: 'CO₂, Geräte, soziale Integration — mit Quellen' },
  { href: '/finanzen', label: 'Finanzbericht', description: 'Einnahmen, Ausgaben, 8-Jahres-Trend (Kivitendo-Daten)' },
  { href: '/fundraising', label: 'Fundraising-Pitch', description: 'Budget, Pipeline, Förderbedarf' },
  { href: '/team', label: 'Team & Kapazitäten', description: 'Mitarbeitende, Rollen, Verfügbarkeit' },
  { href: '/operations', label: 'Operations & SOPs', description: 'Refurbishment-Prozess, Qualitätsstandards' },
  { href: '/methodik', label: 'Methodik & Transparenz', description: 'Berechnungen, Quellen, Zahlen-Integritäts-Report' },
];

// ── Downloads (Nextcloud) ───────────────────────────────────────────────────

export const NEXTCLOUD_FILES = [
  { name: 'Pitch Deck 2026', path: 'B_Finanzen/Fundraising/', format: 'PDF, PPTX' },
  { name: 'Gesuch-Vorlage', path: 'B_Finanzen/Fundraising/', format: 'Markdown' },
  { name: 'Einnahmen-Daten', path: 'B_Finanzen/', format: 'Excel' },
  { name: 'Wirkungsbericht PDF', path: 'B_Finanzen/', format: 'PDF' },
];
