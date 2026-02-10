// ── Gesuche & Vorlagen ──────────────────────────────────────────────────────

export const GESUCH_SECTIONS = [
  {
    title: 'Stiftungs-Gesuche',
    description: 'Personalisierte Gesuche für 99 recherchierte Stiftungen — jeweils mit interaktiver Übersicht und druckfertigem 5-Seiten-Dokument.',
    href: '/fundraising/stiftungen',
    linkLabel: 'Alle Stiftungen anzeigen',
    stats: '92 bereit',
  },
  {
    title: 'Gesuch-Vorlagen nach Typ',
    description: 'Generische Vorlagen für die 5 Stiftungstypen (A/B/C/D/Netzwerk) nach Robert Schmuki — mit Platzhaltern zum Anpassen.',
    href: '/fundraising/gesuch-vorlagen',
    linkLabel: 'Vorlagen öffnen',
    stats: '5 Typen',
  },
];

// ── Online-Berichte (printable pages) ───────────────────────────────────────

export const ONLINE_REPORTS = [
  { href: '/strategie', label: 'Strategie & Vision', description: 'Mission, Souveränitäts-Pfad, Community Tech Space' },
  { href: '/wirkung', label: 'Wirkungsbericht', description: 'CO₂, Geräte, soziale Integration — mit Quellen' },
  { href: '/finanzen', label: 'Finanzbericht', description: 'Einnahmen, Trends, Kategorien (Kivitendo-Daten)' },
  { href: '/fundraising', label: 'Fundraising-Pitch', description: 'Budget, Pipeline, Förderbedarf' },
  { href: '/team', label: 'Team & Kapazitäten', description: 'Mitarbeitende, Rollen, Verfügbarkeit' },
  { href: '/operations', label: 'Operations & SOPs', description: 'Refurbishment-Prozess, Qualitätsstandards' },
  { href: '/methodik', label: 'Methodik', description: 'Berechnungsgrundlagen und Quellenverzeichnis' },
  { href: '/transparenz', label: 'Transparenzbericht', description: 'Datenintegrität und Vollständigkeit' },
];

// ── Downloads (Nextcloud) ───────────────────────────────────────────────────

export const NEXTCLOUD_FILES = [
  { name: 'Pitch Deck 2026', path: 'B_Finanzen/Fundraising/', format: 'PDF, PPTX' },
  { name: 'Gesuch-Vorlage', path: 'B_Finanzen/Fundraising/', format: 'Markdown' },
  { name: 'Einnahmen-Daten', path: 'B_Finanzen/', format: 'Excel' },
  { name: 'Wirkungsbericht PDF', path: 'B_Finanzen/', format: 'PDF' },
];
