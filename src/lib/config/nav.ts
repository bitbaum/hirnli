import { z } from 'zod';
import { BRANDING } from './branding';
import { STIFTUNGEN_DATA } from './foundations';
import { TEMPLATE_TYPES } from './gesuch-templates';

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
      text: 'Über uns',
      icon: '🏢',
      children: [
        { text: 'Mission & Strategie', href: '/strategie', desc: 'Warum wir existieren & was wir erreichen wollen' },
        { text: 'Team', href: '/team', desc: 'Wer wir sind & wie wir arbeiten' },
        { text: 'Finanzen 2018-2025', href: '/finanzen', desc: 'Transparente Einnahmen & Ausgaben (8 Jahre)' },
        { text: 'Wirkung & Impact', href: '/wirkung', desc: 'CO₂ eingespart, Geräte refurbiert, Menschen erreicht' },
        { text: 'Preismodell', href: '/preismodell', desc: 'Solidarische Preise (4 Stufen nach Einkommen)' },
        { text: 'Methodik', href: '/methodik', desc: 'Wie wir messen & berechnen (Transparenzreport)' },
      ],
    },
    {
      text: 'Zukunft 2030',
      icon: '🚀',
      href: '/revamp-2030',
      mega: true,
      sections: [
        {
          title: 'Vision',
          items: [
            { text: 'Revamp 2030 — Die Vision', href: '/revamp-2030', desc: 'Wo wir 2030 stehen wollen: Hub, Bildung, Impact' },
          ],
        },
        {
          title: 'Konkrete Projekte (2026-2028)',
          items: [
            { text: 'Hub 550m²', href: '/fundraising/hub', desc: '🏢 Werkstatt + AI Lab + Hackerspace + Kulturraum', highlight: true },
            { text: 'Bildungsprogramm', href: '/fundraising/bildung', desc: '🎓 2× Programmleiter für Train-the-Trainer & Workshops' },
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
          title: 'Budget & Status',
          items: [
            { text: 'Fundraising-Dashboard', href: '/fundraising', desc: '📊 Budget-Übersicht, Finanzierungsbedarf, Timeline' },
          ],
        },
        {
          title: 'Stiftungen',
          items: [
            { text: `${STIFTUNGEN_DATA.length} Stiftungen`, href: '/fundraising/stiftungen', desc: '🔍 Mit Fit-Score, Themen, Deadlines, Beträgen' },
            { text: 'Gesuch-Vorlagen', href: '/fundraising/gesuch-vorlagen', desc: `📝 ${TEMPLATE_TYPES.length} Referenz-Vorlagen nach Typ (A/B/C/D)` },
          ],
        },
      ],
    },
    {
      text: 'Dokumente',
      icon: '📦',
      href: '/dokumente',
    },
  ],
};
