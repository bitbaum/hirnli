export interface NavItem {
  text: string;
  href?: string;
  icon?: string;
  children?: NavChild[];
  mega?: boolean;
  sections?: NavSection[];
}

export interface NavChild {
  text: string;
  href: string;
  desc?: string;
}

export interface NavSection {
  title: string;
  items: NavLink[];
}

export interface NavLink {
  text: string;
  href: string;
  desc?: string;
  external?: boolean;
  highlight?: boolean;
}

export const NAV_STRUCTURE: {
  logo: { text: string; href: string };
  items: NavItem[];
} = {
  logo: { text: 'Revamp-Info', href: '/' },
  items: [
    { text: 'Dashboard', href: '/', icon: '📊' },
    {
      text: 'Organisation',
      icon: '🏢',
      children: [
        { text: 'Vision & Strategie', href: '/strategie', desc: 'Mission, Ziele, Ausrichtung' },
        { text: 'Team & HR', href: '/team', desc: 'Mitarbeitende, Rollen, Kapazitäten' },
        { text: 'Operations', href: '/operations', desc: 'Prozesse, SOPs, Qualität' },
      ],
    },
    {
      text: 'Finanzen',
      icon: '💰',
      children: [
        { text: 'Übersicht', href: '/finanzen', desc: 'Einnahmen, Ausgaben, Trends' },
        { text: 'Kennzahlen', href: '/kennzahlen', desc: 'KPIs und Metriken' },
        { text: 'Preismodell', href: '/preismodell', desc: 'Kalkulation, Margen' },
      ],
    },
    {
      text: 'Fundraising',
      icon: '🎯',
      href: '/fundraising',
      mega: true,
      sections: [
        {
          title: 'Recherche',
          items: [
            { text: 'Stiftungen-Übersicht', href: '/fundraising/stiftungen', desc: 'Alle Förderstiftungen mit Deadlines', highlight: true },
            { text: 'Fundraising Hub', href: '/fundraising', desc: 'Übersicht & Pipeline' },
          ],
        },
        {
          title: 'Dokumente',
          items: [
            { text: 'Alle Dokumente', href: '/dokumente', desc: 'Berichte, Vorlagen, Downloads' },
            { text: 'Organisationsprofil', href: '/fundraising#vision', desc: 'Vision & 3 Säulen' },
          ],
        },
        {
          title: 'Quick Links',
          items: [
            { text: 'Migros Engagement', href: 'https://engagement.migros.ch/de', external: true },
            { text: 'Ernst Göhner', href: 'https://www.ernst-goehner-stiftung.ch', external: true },
            { text: 'Stiftungsverzeichnis CH', href: 'https://stiftungsverzeichnis.ch', external: true },
          ],
        },
      ],
    },
    {
      text: 'Wirkung',
      icon: '🌱',
      children: [
        { text: 'Impact-Zahlen', href: '/wirkung', desc: 'CO₂, Geräte, Menschen' },
        { text: 'Methodik', href: '/methodik', desc: 'Berechnungen & Quellen' },
        { text: 'Transparenz', href: '/transparenz', desc: 'Offenlegung & Reports' },
      ],
    },
    { text: 'Dokumente', href: '/dokumente', icon: '📄' },
  ],
};
