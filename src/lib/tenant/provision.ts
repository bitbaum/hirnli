/**
 * Creating a customer.
 *
 * Until now this did not exist. A person could register an account, and
 * `/start` told them "this account does not belong to any organisation yet —
 * ask whoever invited you to send it to your address". There was no way to be
 * that inviter, because there was no way to create an organisation at all. The
 * two tenants in production were made by hand: rows written by a script, a host
 * added to a TypeScript map, a web server reloaded.
 *
 * A tenant is not one row, and that is the whole difficulty. Four things must
 * agree or the customer gets a broken account in a way that is hard to see:
 *
 *   organizations   the account, and the slug that scopes every row they own
 *   org_members     who may act as them — the authorisation boundary
 *   org_profiles    who they ARE: the name and facts every page renders
 *   org_domains     where they live, and what Caddy will issue a certificate for
 *
 * So it is one transaction. A half-provisioned tenant — an org with no profile,
 * say — throws on every page render, and the person who just signed up sees a
 * 500 with no idea why.
 */

import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { member, organization } from '@/lib/db/auth-schema';
import { orgContent, orgDomains, orgProfiles } from '@/lib/db/schema';
import { storedTenantProfileSchema } from './profile';
import {
  hostForSlug,
  newOrganizationSchema,
  RESERVED_SLUGS,
  slugify,
  type NewOrganization,
} from './org-naming';
import { normalizeHost } from './registry';
import { STARTER_STORIES } from '@/lib/content/starter-content';

export type ProvisionResult =
  { ok: true; orgId: string; slug: string; host: string } | { ok: false; error: string };

/**
 * Create a tenant and make the given user its owner.
 *
 * Returns a result rather than throwing for the cases a person can cause — a
 * taken name, a reserved word — because those are form errors, not faults.
 */
export async function provisionOrganization(
  input: NewOrganization,
  userId: string,
): Promise<ProvisionResult> {
  const parsed = newOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe' };
  }
  const data = parsed.data;

  const slug = slugify(data.name);
  if (slug.length < 2) {
    return { ok: false, error: 'Aus diesem Namen lässt sich keine Adresse bilden' };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { ok: false, error: `„${slug}" ist reserviert — bitte einen anderen Namen wählen` };
  }

  const host = normalizeHost(hostForSlug(slug));

  const taken = await db
    .select({ slug: organization.slug })
    .from(organization)
    .where(eq(organization.slug, slug))
    .limit(1);
  if (taken.length > 0) {
    return { ok: false, error: 'Diese Organisation gibt es bereits' };
  }

  // The profile is validated BEFORE anything is written. `.strict()` rejects a
  // shape carrying derived values, and a row that fails to parse on read would
  // 500 every page this customer opens — after they had been told the account
  // was created.
  const profile = storedTenantProfileSchema.parse({
    orgId: slug,
    name: data.name,
    legalForm: data.legalForm,
    founded: data.founded,
    location: data.location,
    email: data.email,
    siteUrl: `https://${host}`,
  });

  await db.transaction(async (tx) => {
    await tx.insert(organization).values({
      id: `org_${slug.replace(/-/g, '_')}`,
      name: data.name,
      slug,
      createdAt: new Date(),
    });

    await tx.insert(member).values({
      id: `mem_${slug}_${userId}`.slice(0, 64),
      organizationId: `org_${slug.replace(/-/g, '_')}`,
      userId,
      role: 'owner',
      createdAt: new Date(),
    });

    await tx.insert(orgProfiles).values({ orgId: slug, profile, branding: {} });

    await tx.insert(orgDomains).values({ host, orgId: slug });

    // A starter story, so the product works on day one. It is a SKELETON in the
    // tenant's own voice — `{{name}}` placeholders and prompts to replace —
    // not a copy of another customer's narrative, which is the thing this whole
    // migration exists to stop.
    await tx.insert(orgContent).values({
      orgId: slug,
      key: 'stories',
      locale: 'de',
      value: STARTER_STORIES,
    });
  });

  return { ok: true, orgId: slug, slug, host };
}

/** Is this user already an owner or member of something? */
export async function userHasOrganization(userId: string): Promise<boolean> {
  const rows = await db
    .select({ id: member.id })
    .from(member)
    .where(and(eq(member.userId, userId)))
    .limit(1);
  return rows.length > 0;
}
