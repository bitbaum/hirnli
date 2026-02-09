// -- Document category config --------------------------------------------------

export interface DocumentEntry {
  title: string;
  description: string;
  href?: string;
  status: 'ready' | 'wip' | 'planned';
  formats: string[];
  audiences: ('Funder' | 'Intern' | 'Oeffentlich')[];
}

export interface DocumentCategory {
  title: string;
  documents: DocumentEntry[];
}

export const STATUS_MAP = {
  ready: { label: 'Verfuegbar', variant: 'success' as const },
  wip: { label: 'In Entwicklung', variant: 'warning' as const },
  planned: { label: 'Geplant', variant: 'default' as const },
};

export const AUDIENCE_MAP = {
  Funder: 'success' as const,
  Intern: 'primary' as const,
  Oeffentlich: 'warning' as const,
};

export const QUICK_LINKS = [
  { href: '/fundraising', label: 'Fundraising Hub', description: 'Vision, Budget, Pakete' },
  { href: '/fundraising/stiftungen', label: 'Stiftungen-Liste', description: '45+ Foerderer mit Deadlines' },
  { href: '/wirkung', label: 'Wirkungsbericht', description: 'Impact-Zahlen mit Quellen' },
  { href: '/strategie', label: 'Mission & Vision', description: 'Seit 2003, SDG-Alignment' },
];

export const NEXTCLOUD_FILES = [
  { name: 'Pitch Deck 2026', path: 'B_Finanzen/Fundraising/', format: 'PDF, PPTX' },
  { name: 'Gesuch-Vorlage', path: 'B_Finanzen/Fundraising/', format: 'Markdown' },
  { name: 'Einnahmen-Daten', path: 'B_Finanzen/', format: 'Excel' },
  { name: 'Wirkungsbericht PDF', path: 'B_Finanzen/', format: 'PDF' },
];

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  {
    title: 'Fuer Funder & Stiftungen',
    documents: [
      {
        title: 'Wirkungsbericht',
        description: 'Vollstaendiger Impact-Report mit CO2-Ersparnis, Geraeten gerettet und sozialer Wirkung',
        href: '/wirkung',
        status: 'ready',
        formats: ['HTML', 'PDF (Print)'],
        audiences: ['Funder', 'Oeffentlich'],
      },
      {
        title: 'Fundraising-Pitch',
        description: 'Foerdermoeglichkeiten, Verwendungszwecke und konkrete Bedarfe',
        href: '/fundraising',
        status: 'ready',
        formats: ['HTML', 'PDF (Print)'],
        audiences: ['Funder'],
      },
      {
        title: 'One-Pager',
        description: 'Kompakte Zusammenfassung auf einer Seite - ideal fuer Erstkontakte',
        status: 'wip',
        formats: ['PDF'],
        audiences: ['Funder'],
      },
    ],
  },
  {
    title: 'Finanzberichte',
    documents: [
      {
        title: 'Einnahmen-Dashboard',
        description: 'Monatliche Einnahmen nach Kategorie mit Quellennachweis',
        href: '/',
        status: 'ready',
        formats: ['HTML'],
        audiences: ['Intern', 'Funder'],
      },
      {
        title: 'Finanzuebersicht',
        description: 'Detaillierte Finanzanalyse mit Trends und Vergleichen',
        href: '/finanzen',
        status: 'ready',
        formats: ['HTML'],
        audiences: ['Intern'],
      },
      {
        title: 'Jahresabschluss',
        description: 'Vollstaendiger Jahresfinanzbericht fuer Steuern und GV',
        status: 'planned',
        formats: ['PDF'],
        audiences: ['Intern'],
      },
    ],
  },
  {
    title: 'Operations & Prozesse',
    documents: [
      {
        title: 'Refurbishment SOP',
        description: 'Standard Operating Procedures fuer den Refurbishment-Prozess',
        href: '/operations',
        status: 'ready',
        formats: ['HTML', 'Markdown'],
        audiences: ['Intern'],
      },
      {
        title: 'KPI-Dashboard',
        description: '28 KPIs ueber 6 Dimensionen mit Zielen und Status',
        href: '/kennzahlen',
        status: 'ready',
        formats: ['HTML'],
        audiences: ['Intern'],
      },
      {
        title: 'Preismodell',
        description: 'Solidarisches 4-Stufen-Preismodell mit Beispielen',
        href: '/preismodell',
        status: 'ready',
        formats: ['HTML'],
        audiences: ['Intern', 'Oeffentlich'],
      },
    ],
  },
  {
    title: 'Strategie & Team',
    documents: [
      {
        title: 'Mission & Vision',
        description: 'Mission Statement, Vision 2030, Werte und SDG-Alignment',
        href: '/strategie',
        status: 'ready',
        formats: ['HTML'],
        audiences: ['Oeffentlich', 'Funder'],
      },
      {
        title: 'Team-Uebersicht',
        description: 'Organisationsstruktur, Team-Mitglieder und Kapazitaeten',
        href: '/team',
        status: 'ready',
        formats: ['HTML'],
        audiences: ['Intern'],
      },
      {
        title: 'Pitch Deck',
        description: 'Praesentationsfolien fuer Vorstellungen und Pitches',
        status: 'planned',
        formats: ['PPTX', 'PDF'],
        audiences: ['Funder'],
      },
    ],
  },
  {
    title: 'Methodik & Dokumentation',
    documents: [
      {
        title: 'Methodikdokumentation',
        description: 'Berechnungsgrundlagen fuer alle Metriken und Schaetzungen',
        href: '/methodik',
        status: 'ready',
        formats: ['HTML'],
        audiences: ['Intern', 'Funder'],
      },
      {
        title: 'Datenarchitektur',
        description: 'Dokumentation des Datenflusses und der Systemarchitektur',
        status: 'wip',
        formats: ['Markdown'],
        audiences: ['Intern'],
      },
      {
        title: 'API-Dokumentation',
        description: 'Technische Dokumentation fuer Daten-Exports und Integrationen',
        status: 'planned',
        formats: ['HTML'],
        audiences: ['Intern'],
      },
    ],
  },
];

export const SOURCE_DOCUMENTS = [
  { name: 'Mission & Vision', path: 'A_Strategie/Mission_Vision_Statement.md', usedIn: 'Strategie-Seite' },
  { name: 'Finanzstrategie', path: 'B_Finanzen/Finanzstrategie_2025.md', usedIn: 'Finanzen, Preismodell' },
  { name: 'HR-Uebersicht', path: 'E_Personal/HR_Uebersicht.md', usedIn: 'Team-Seite' },
  { name: 'Refurbishment SOP', path: 'G_Operations/Refurbishment/Standard_Operating_Procedure.md', usedIn: 'Operations-Seite' },
  { name: 'Preismodell', path: 'B_Finanzen/Preismodell_Solidaritaet.md', usedIn: 'Preismodell-Seite' },
];

export const ROADMAP = [
  { phase: 'Phase 1 (Aktuell)', description: 'Statische HTML-Seiten, druckbar als PDF' },
  { phase: 'Phase 2', description: 'One-Click PDF-Export mit korrektem Layout' },
  { phase: 'Phase 3', description: 'Automatische Befuellung von Templates (One-Pager, Pitch Deck)' },
  { phase: 'Phase 4', description: 'Zeitraum-Filter (Q1, Q2, Jahresbericht)' },
  { phase: 'Phase 5', description: 'Multi-Format Export (DOCX, PPTX, Markdown)' },
];
