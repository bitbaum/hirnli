/**
 * The one place that reads a tenant's CONTENT.
 *
 * `resolve.ts` made identity per-tenant: name, address, logo all come from
 * `org_profiles`. Content did not follow. It still lives in TypeScript
 * constants written for the first customer, which is why 85% of every rendered
 * page is byte-identical between the two tenants — the same organisation's
 * impact figures, finances, team and prose, with the name substituted. The
 * substitution is what makes it wrong rather than merely unfinished: it
 * presents one organisation's facts as the reader's own.
 *
 * `org_content` has existed since 0007 and is seeded for the reference tenant.
 * What was missing was this: anything that reads it. The seed wrote into a
 * mirror nobody looked at.
 *
 * ── THE RULE ────────────────────────────────────────────────────────────────
 * A tenant with no content for a block gets NOTHING — never another tenant's.
 * `get()` returns null and the caller renders an empty state or omits the
 * section. There is deliberately no fallback, because a fallback IS the
 * contamination: it is exactly the behaviour that put one customer's founding
 * year, laptop counts and staff on another customer's pages.
 *
 * This mirrors decisions already made one layer down — `parseBranding` falls
 * back to no logo rather than another's mark, and `getTenantById` throws rather
 * than substitute a tenant.
 *
 * ── TWO KINDS OF BLOCK ──────────────────────────────────────────────────────
 * Stored rows are one of two things, and the distinction decides whether a
 * block can ever be shared:
 *
 *   DATA  — this organisation's measured facts. Frozen values, no placeholders.
 *           `numbers` is 52 such entries. Cannot be shared or templated: filling
 *           `{{founded}}` into "1'200 laptops since 2003" prints the reader's
 *           year over the first tenant's count.
 *   PROSE — narrative with `{{name}}`-style slots, filled per request by
 *           `fillContent()`. Shareable in shape, but still authored by and
 *           about one organisation, so it is still stored per tenant.
 *
 * Both are keyed by `org_id`, so the storage model already enforces the split.
 */

import { cache } from 'react';
import { and, eq } from 'drizzle-orm';
import type { ZodType } from 'zod';
import { db } from '@/lib/db/client';
import { orgContent } from '@/lib/db/schema';
import { getCurrentOrgId } from '@/lib/tenant/resolve';

/** Content blocks a tenant may have authored. The vocabulary, in one place. */
export const CONTENT_KEYS = [
  'stories',
  'numbers',
  'schwerpunkte',
  'themes',
  'gesuch-templates',
] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];

/** Default locale for a stored block. The PK is (org_id, key, locale). */
const DEFAULT_LOCALE = 'de';

/**
 * Raw JSON for one block, or null when this tenant has not authored it.
 *
 * Request-cached: a page renders several sections from the same block and must
 * not issue a query each time.
 */
const readRaw = cache(
  async (orgId: string, key: string, locale: string): Promise<unknown | null> => {
    const rows = await db
      .select({ value: orgContent.value })
      .from(orgContent)
      .where(
        and(eq(orgContent.orgId, orgId), eq(orgContent.key, key), eq(orgContent.locale, locale)),
      )
      .limit(1);

    return rows[0]?.value ?? null;
  },
);

/**
 * One tenant's content block, validated, or null if it has none.
 *
 * The schema is required rather than optional: a jsonb column is `unknown`, and
 * handing `unknown` to a renderer as if it were typed is how a bad row becomes
 * a runtime crash on a public page. Validating at the boundary is the same rule
 * `parseTenant` follows for the profile.
 *
 * A row that EXISTS but does not validate throws, rather than being treated as
 * absent. Absent means "this tenant has not written this yet" and is a normal,
 * renderable state; malformed means someone wrote something wrong, and quietly
 * showing an empty page would hide it.
 */
export async function getOrgContent<T>(
  key: ContentKey,
  schema: ZodType<T>,
  opts: { orgId?: string; locale?: string } = {},
): Promise<T | null> {
  const orgId = opts.orgId ?? (await getCurrentOrgId());
  const locale = opts.locale ?? DEFAULT_LOCALE;

  const raw = await readRaw(orgId, key, locale);
  if (raw === null) return null;

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `org_content["${orgId}"]["${key}"]["${locale}"] does not match its schema: ` +
        parsed.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
          .join('; '),
    );
  }
  return parsed.data;
}

/**
 * Has this tenant authored this block?
 *
 * For deciding whether a section or a nav entry exists at all, without paying
 * to validate a block you are not about to render.
 */
export async function hasOrgContent(
  key: ContentKey,
  opts: { orgId?: string; locale?: string } = {},
): Promise<boolean> {
  const orgId = opts.orgId ?? (await getCurrentOrgId());
  return (await readRaw(orgId, key, opts.locale ?? DEFAULT_LOCALE)) !== null;
}

/** Which blocks this tenant has. Used to build navigation from its own content. */
export async function authoredContentKeys(orgId?: string): Promise<Set<ContentKey>> {
  const id = orgId ?? (await getCurrentOrgId());
  const rows = await db
    .select({ key: orgContent.key })
    .from(orgContent)
    .where(eq(orgContent.orgId, id));

  const authored = new Set(rows.map((r) => r.key));
  return new Set(CONTENT_KEYS.filter((k) => authored.has(k)));
}
