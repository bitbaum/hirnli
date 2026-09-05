/**
 * Whose content is this page showing?
 *
 * ── THE PROBLEM ─────────────────────────────────────────────────────────────
 * Measured 2026-09-05 against production: of 6,502 rendered text lines, 982
 * differed between the two tenants — 85% IDENTICAL. Excluding the two pages
 * backed by the database, the sixteen backed by TypeScript constants were
 * 96.5% identical. The second tenant's /finanzen showed the first tenant's
 * eight-year profit-and-loss; its /team showed fourteen of the first tenant's
 * colleagues by name; its /wirkung showed the first tenant's CO2 savings. Only
 * the organisation's name was substituted — which makes it worse than leaving
 * it alone, because the substitution presents one organisation's facts as the
 * reader's own.
 *
 * The cause is not that the content is in TypeScript. It is that NOBODY OWNS
 * IT. A module exports `ANNUAL_PL` and any page renders it for any tenant,
 * because nothing in the type system or the call ever asks whose figures those
 * are.
 *
 * ── THE FIX, AND WHY IT IS THIS SHAPE ───────────────────────────────────────
 * Content gets an owner, and reading it requires being that owner.
 *
 * That is deliberately NOT the same as "move all content to the database
 * first". Moving ~4,650 lines of one organisation's data into `org_content` is
 * weeks of authoring, and it fixes nothing until the last line lands. Naming
 * the owner is a small change that fixes every page at once: a tenant that did
 * not author a page stops seeing another's, today, and the eventual database
 * read is the same call with a different backend.
 *
 * So this is a ratchet, not a destination. `CODE_OWNED` is the list of pages
 * whose content still lives in TypeScript and therefore belongs to exactly one
 * tenant. Entries leave it as their content moves into `org_content`; the
 * accessor's signature does not change when they do.
 *
 * ── WHAT A TENANT WITHOUT CONTENT SEES ──────────────────────────────────────
 * Nothing — its own empty state, never a substitute. This is the rule already
 * settled one layer down: `parseBranding` falls back to no logo rather than
 * another tenant's mark, `getTenantById` throws rather than substitute an
 * identity, and `fillTemplate` throws rather than invent a fact. A fallback IS
 * the contamination.
 */

import { getCurrentOrgId } from '@/lib/tenant/resolve';

/**
 * Pages whose content is a per-tenant thing rather than a product feature.
 *
 * A page is listed here when what it shows is one organisation's own material:
 * its finances, its people, its impact figures, its strategy, its premises.
 * Pages that explain how the PRODUCT works — the scoring methodology, the
 * foundation register, the Gesuch templates — are not listed, because they are
 * the same for everyone and belong in code.
 */
export const TENANT_PAGES = [
  'home-story', // the homepage's own description of what this org does
  'wirkung',
  'finanzen',
  'team',
  'strategie',
  'methodik',
  'operations',
  'preismodell',
  'wie-wir-arbeiten',
  'vision',
  'fundraising',
  'hub',
  'bildung',
] as const;

export type TenantPage = (typeof TENANT_PAGES)[number];

/**
 * The tenant whose content the TypeScript modules actually describe.
 *
 * Every `ORG-SPECIFIC: Content written for Revamp-IT` header in `src/lib/config`
 * and every `data.ts` under `(tenant)/` is this organisation's material. Stating
 * it once, here, is what lets the accessor below refuse to serve it to anyone
 * else — and makes the coupling greppable instead of implicit in 29 modules.
 *
 * This is not `DEFAULT_TENANT_ID`. That constant answers "who do we serve when
 * the host is unknown"; this one answers "whose facts are hard-coded in this
 * repository". They happen to be the same organisation today, and conflating
 * them is how the fallback tenant silently became the content tenant.
 */
export const CODE_CONTENT_OWNER = 'revamp-it';

/**
 * Pages still served from code, and therefore readable only by their owner.
 *
 * SHRINKS as content moves to `org_content`. `page-ownership.test.ts` asserts
 * it may not grow, so a new page cannot quietly hard-code a tenant's material.
 */
export const CODE_OWNED: readonly TenantPage[] = [
  // 'home-story' migrated: the hero sentence is `tenant.missionSummary` and the
  // focus-area grid is `tenant.missionAreas`, both stored per tenant. The
  // homepage is now generated from the profile for anybody, which is what
  // leaving this list is supposed to mean.
  'wirkung',
  'finanzen',
  'team',
  'strategie',
  'methodik',
  'operations',
  'preismodell',
  'wie-wir-arbeiten',
  'vision',
  'fundraising',
  'hub',
  'bildung',
] as const;

/**
 * May the requesting tenant see this page's code-held content?
 *
 * True only for the organisation the content is actually about. Everyone else
 * gets `false` and the page renders its "not published" state.
 */
export async function ownsCodeContent(page: TenantPage, orgId?: string): Promise<boolean> {
  if (!CODE_OWNED.includes(page)) return false;
  const id = orgId ?? (await getCurrentOrgId());
  return id === CODE_CONTENT_OWNER;
}

/**
 * The content, or null if it is not this tenant's.
 *
 * Takes a thunk rather than a value so a caller cannot accidentally evaluate
 * one organisation's data into scope before discovering it may not show it.
 *
 *   const pl = await pageContent('finanzen', () => ANNUAL_PL);
 *   if (!pl) return <ContentNotPublished page="Finanzen" />;
 */
export async function pageContent<T>(
  page: TenantPage,
  content: () => T,
  orgId?: string,
): Promise<T | null> {
  return (await ownsCodeContent(page, orgId)) ? content() : null;
}

/**
 * Routes whose content this tenant owns, for building navigation from what it
 * actually has rather than from a fixed list.
 *
 * A menu that offers eight pages and delivers eight "not published yet" cards
 * is a worse experience than a shorter menu, and it still implies the pages are
 * the tenant's. The gate on each page stays regardless — navigation is a
 * courtesy, not a boundary, and a link can always be typed by hand.
 */
export const PAGE_ROUTES: Record<TenantPage, string> = {
  'home-story': '/',
  wirkung: '/wirkung',
  finanzen: '/finanzen',
  team: '/team',
  strategie: '/strategie',
  methodik: '/methodik',
  operations: '/operations',
  preismodell: '/preismodell',
  'wie-wir-arbeiten': '/wie-wir-arbeiten',
  vision: '/vision',
  fundraising: '/fundraising',
  hub: '/fundraising/hub',
  bildung: '/fundraising/bildung',
};

/** Hrefs to hide from this tenant's navigation. Empty for the content owner. */
export async function unauthoredRoutes(orgId?: string): Promise<string[]> {
  const id = orgId ?? (await getCurrentOrgId());
  if (id === CODE_CONTENT_OWNER) return [];
  // Everything code-owned is unavailable to anyone else, by definition of
  // `ownsCodeContent`. Derived from that list rather than restated, so the two
  // cannot disagree.
  return CODE_OWNED.map((page) => PAGE_ROUTES[page]);
}
