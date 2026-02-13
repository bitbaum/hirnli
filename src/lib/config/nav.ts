import { z } from 'zod';
import { BRANDING } from './branding';

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
// Brand name (re-export from branding config for backward compatibility)
// ---------------------------------------------------------------------------

export const BRAND_NAME = BRANDING.siteName;

// ---------------------------------------------------------------------------
// Navigation structure (SSOT)
// ---------------------------------------------------------------------------

export const NAV_STRUCTURE: {
  logo: { text: string; href: string };
  items: NavItem[];
} = {
  logo: { text: BRAND_NAME, href: '/' },
  items: [
    {
      text: 'Revamp Gestern & Heute',
      icon: '🏢',
      children: [
        { text: 'Mission & Geschichte', href: '/strategie', desc: 'Warum wir existieren, woher wir kommen' },
        { text: 'Team & Operations', href: '/team', desc: 'Wer wir sind, was wir tun' },
        { text: 'Finanzen', href: '/finanzen', desc: 'Einnahmen, Ausgaben, 8-Jahres-Trend' },
        { text: 'Wirkung', href: '/wirkung', desc: 'CO₂, Geräte, Menschen' },
        { text: 'Preismodell', href: '/preismodell', desc: 'Solidarisches 4-Stufen-Modell' },
        { text: 'Methodik', href: '/methodik', desc: 'Wie wir Daten erheben & berechnen' },
      ],
    },
    {
      text: 'Revamp 2030',
      icon: '🚀',
      href: '/revamp-2030',
      mega: true,
      sections: [
        {
          title: 'Vision & Strategie',
          items: [
            { text: 'Revamp 2030 Übersicht', href: '/revamp-2030', desc: 'Die grosse Vision: Organisation, Hub, Bildung' },
          ],
        },
        {
          title: 'Projekte 2026-2028 (3-Jahres-Plan)',
          items: [
            { text: 'Hub (550m²)', href: '/fundraising/hub', desc: 'Werkstatt, AI Lab, Hackerspace, Kulturraum', highlight: true },
            { text: 'Bildungsprogramm', href: '/fundraising/bildung', desc: '2× Programmleiter, Train-the-Trainer' },
          ],
        },
      ],
    },
    {
      text: 'Fundraising',
      icon: '🎯',
      href: '/fundraising',
      mega: true,
      sections: [
        {
          title: 'Finanzierung & Status',
          items: [
            { text: 'Fundraising-Übersicht', href: '/fundraising', desc: 'Budget, Finanzierungsbedarf, Timeline' },
          ],
        },
        {
          title: 'Projekte (Fundraising-Kampagnen)',
          items: [
            { text: 'Hub (550m²)', href: '/fundraising/hub', desc: 'Werkstatt, AI Lab, Hackerspace, Kulturraum', highlight: true },
            { text: 'Bildungsprogramm', href: '/fundraising/bildung', desc: '2× Programmleiter, Train-the-Trainer' },
          ],
        },
        {
          title: 'Stiftungen & Dokumente',
          items: [
            { text: 'Stiftungsliste', href: '/fundraising/stiftungen', desc: '37 Förderstiftungen mit Fit-Score & Deadlines' },
            { text: 'Gesuch-Vorlagen', href: '/fundraising/gesuch-vorlagen', desc: '6 Vorlagen nach Stiftungstyp (A/B/C/D/Netzwerk/Generisch)' },
            { text: 'Alle Dokumente', href: '/dokumente', desc: '52 Gesuche, Vorlagen & Datenexporte' },
          ],
        },
      ],
    },
  ],
};
