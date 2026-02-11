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
// Brand name (SSOT)
// ---------------------------------------------------------------------------

export const BRAND_NAME = 'Revamp-Info';

// ---------------------------------------------------------------------------
// Navigation structure (SSOT)
// ---------------------------------------------------------------------------

export const NAV_STRUCTURE: {
  logo: { text: string; href: string };
  items: NavItem[];
} = {
  logo: { text: BRAND_NAME, href: '/' },
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
      text: 'Finanzen & Wirkung',
      icon: '💰',
      children: [
        { text: 'Finanzen', href: '/finanzen', desc: 'Einnahmen, Ausgaben, 8-Jahres-Trend' },
        { text: 'Wirkung', href: '/wirkung', desc: 'CO₂, Geräte, Menschen' },
        { text: 'Preismodell', href: '/preismodell', desc: 'Solidarisches 4-Stufen-Modell' },
      ],
    },
    {
      text: 'Fundraising',
      icon: '🎯',
      href: '/fundraising',
      mega: true,
      sections: [
        {
          title: 'Übersicht',
          items: [
            { text: 'Fundraising Hub', href: '/fundraising', desc: 'Vision, Budget & Pipeline' },
            { text: 'Stiftungen-Übersicht', href: '/fundraising/stiftungen', desc: 'Alle Förderstiftungen mit Deadlines', highlight: true },
          ],
        },
        {
          title: 'Dokumente',
          items: [
            { text: 'Gesuch-Vorlagen', href: '/fundraising/gesuch-vorlagen', desc: 'Vorlagen nach Stiftungstyp (A/B/C/D)', highlight: true },
            { text: 'Alle Dokumente', href: '/dokumente', desc: 'Berichte, Vorlagen, Downloads' },
          ],
        },
      ],
    },
    { text: 'Methodik', href: '/methodik', icon: '🔬' },
  ],
};
