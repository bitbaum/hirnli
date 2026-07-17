import { z } from 'zod';
import { BRANDING } from './branding';
import { TEMPLATE_TYPES } from './gesuch-templates';
import { HUB_SPACE_DISPLAY, SWISS_FOUNDATIONS_DISPLAY } from './projections';
import { FINANCIAL_YEAR_LABEL, FINANCIAL_YEAR_RANGE } from '@/lib/config/financial-constants';

// ---------------------------------------------------------------------------
// Nav schemas (SSOT for navigation types)
//
// i18n: config carries STRUCTURE (msg keys, hrefs, icons, interpolation
// values); every visible string lives in messages/{de,fr,en}.json under the
// `nav` namespace. useNavStructure() resolves msg → text/desc at render time,
// so menu components stay locale-agnostic.
// ---------------------------------------------------------------------------

const msgValuesSchema = z.record(z.string(), z.union([z.string(), z.number()]));

const navLinkSchema = z.object({
  msg: z.string(), // key in messages nav.<msg>.{label,desc}
  href: z.string(),
  values: msgValuesSchema.optional(),
  hasDesc: z.boolean().optional(),
  external: z.boolean().optional(),
  highlight: z.boolean().optional(),
});
export type NavLinkConfig = z.infer<typeof navLinkSchema>;

const navSectionSchema = z.object({
  msg: z.string(),
  items: z.array(navLinkSchema),
});
export type NavSectionConfig = z.infer<typeof navSectionSchema>;

const _navItemSchema = z.object({
  msg: z.string(),
  href: z.string().optional(),
  icon: z.string().optional(),
  children: z.array(navLinkSchema).optional(),
  mega: z.boolean().optional(),
  sections: z.array(navSectionSchema).optional(),
});
export type NavItemConfig = z.infer<typeof _navItemSchema>;

// Resolved shapes (what the menu components render)
export interface NavLink {
  text: string;
  href: string;
  desc?: string;
  external?: boolean;
  highlight?: boolean;
}
export interface NavSection {
  title: string;
  items: NavLink[];
}
export type NavChild = NavLink;
export interface NavItem {
  text: string;
  href?: string;
  icon?: string;
  children?: NavLink[];
  mega?: boolean;
  sections?: NavSection[];
}

// ---------------------------------------------------------------------------
// Brand name (platform brand via branding.ts — see platform-brand.ts SSOT)
// ---------------------------------------------------------------------------

export const BRAND_NAME = BRANDING.siteName;

// ---------------------------------------------------------------------------
// Navigation structure (SSOT) — strings live in message catalogs
// ---------------------------------------------------------------------------

/** Built at render time — the Stiftungen count comes from the DB read layer, not a module-scope import. */
export function buildNavStructure(stiftungenCount: number): {
  logo: { text: string; href: string };
  items: NavItemConfig[];
} {
  return {
  logo: { text: BRAND_NAME, href: '/' },
  items: [
    {
      msg: 'ueberUns',
      icon: '🏢',
      children: [
        { msg: 'strategie', href: '/strategie', hasDesc: true },
        { msg: 'team', href: '/team', hasDesc: true },
        { msg: 'wieWirArbeiten', href: '/wie-wir-arbeiten', hasDesc: true },
        { msg: 'finanzen', href: '/finanzen', hasDesc: true, values: { range: FINANCIAL_YEAR_RANGE, label: FINANCIAL_YEAR_LABEL } },
        { msg: 'wirkung', href: '/wirkung', hasDesc: true },
        { msg: 'preismodell', href: '/preismodell', hasDesc: true },
        { msg: 'methodik', href: '/methodik', hasDesc: true },
      ],
    },
    {
      msg: 'zukunft',
      icon: '🚀',
      href: '/revamp-2030',
      mega: true,
      sections: [
        {
          msg: 'vision',
          items: [{ msg: 'revamp2030', href: '/revamp-2030', hasDesc: true }],
        },
        {
          msg: 'projekte',
          items: [
            { msg: 'hub', href: '/fundraising/hub', hasDesc: true, highlight: true, values: { space: HUB_SPACE_DISPLAY } },
            { msg: 'bildung', href: '/fundraising/bildung', hasDesc: true },
          ],
        },
      ],
    },
    {
      msg: 'fundraising',
      icon: '🎯',
      href: '/fundraising',
      mega: true,
      sections: [
        {
          msg: 'budgetStatus',
          items: [
            { msg: 'plan', href: '/fundraising', hasDesc: true },
            { msg: 'dashboard', href: '/fundraising/dashboard', hasDesc: true },
          ],
        },
        {
          msg: 'stiftungenSection',
          items: [
            { msg: 'stiftungen', href: '/fundraising/stiftungen', hasDesc: true, values: { count: stiftungenCount } },
            { msg: 'vorlagen', href: '/fundraising/gesuch-vorlagen', hasDesc: true, values: { count: TEMPLATE_TYPES.length } },
            { msg: 'gesuche', href: '/fundraising/gesuche', hasDesc: true },
            { msg: 'pipeline', href: '/fundraising/applications', hasDesc: true },
            { msg: 'scoring', href: '/fundraising/scoring-methodik', hasDesc: true },
            { msg: 'pipelineMethodik', href: '/fundraising/pipeline-methodik', hasDesc: true, values: { universe: SWISS_FOUNDATIONS_DISPLAY } },
          ],
        },
      ],
    },
    {
      msg: 'dokumente',
      icon: '📦',
      href: '/dokumente',
    },
    {
      msg: 'plattform',
      icon: '🧭',
      href: '/plattform',
    },
  ],
  };
}
