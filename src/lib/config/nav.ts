import { z } from 'zod';

// ---------------------------------------------------------------------------
// Nav schemas (SSOT for navigation types)
// ---------------------------------------------------------------------------

const navLinkSchema = z.object({
  text: z.string(),
  href: z.string(),
  desc: z.string().optional(),
  external: z.boolean().optional(),
  highlight: z.boolean().optional(),
});
export type NavLink = z.infer<typeof navLinkSchema>;

const navSectionSchema = z.object({
  title: z.string(),
  items: z.array(navLinkSchema),
});
export type NavSection = z.infer<typeof navSectionSchema>;

const navChildSchema = z.object({
  text: z.string(),
  href: z.string(),
  desc: z.string().optional(),
});
export type NavChild = z.infer<typeof navChildSchema>;

const navItemSchema = z.object({
  text: z.string(),
  href: z.string().optional(),
  icon: z.string().optional(),
  children: z.array(navChildSchema).optional(),
  mega: z.boolean().optional(),
  sections: z.array(navSectionSchema).optional(),
});
export type NavItem = z.infer<typeof navItemSchema>;

// ---------------------------------------------------------------------------
// Navigation structure (SSOT)
// ---------------------------------------------------------------------------

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
