/**
 * Accounts, on `@bitbaum/accountkit` — the fleet's one account runtime (Better
 * Auth underneath) — constructed lazily.
 *
 * AccountKit owns the sign-in methods, password rule, hashing, limits and
 * cookie rules. Hirnli adds what is its own: its tables, its hosts and the
 * `organization` plugin its workspaces run on.
 *
 * No account mail: every existing account is unverified, so switching mail on
 * would make verification compulsory and lock all of them out. Revisit together
 * with a verification pass for existing people.
 *
 * ── Why this is lazy ─────────────────────────────────────────────────────────
 * `next build` evaluates route modules to collect page data. A `betterAuth({…})`
 * call at module scope therefore runs during the BUILD, not just when serving —
 * so a secret check written as "throw in production" fires in CI, where there is
 * no secret and none is needed:
 *
 *   Failed to collect configuration for /api/auth/[...all]
 *   [cause]: BETTER_AUTH_SECRET is not set — sessions cannot be signed.
 *
 * `lib/db/client.ts` avoids this by deferring construction into a function, and
 * that is the mechanism, not merely the intent, that has to be copied: the
 * instance is built on first request and cached, so a build needs no secret and
 * a running server still refuses to sign sessions without one.
 */

import { organization } from 'better-auth/plugins';
import type { betterAuth } from 'better-auth';
import { createAuthRuntime } from '@bitbaum/accountkit/auth/next';
import { db } from '@/lib/db/client';
import { orgDomains } from '@/lib/db/schema';
import * as authSchema from '@/lib/db/auth-schema';
import { PLATFORM_HOST } from '@/lib/tenant/registry';

const organizations = () =>
  organization({
    // A person may hold several customers' fundraising work at once — that
    // is the product, not an edge case.
    allowUserToCreateOrganization: true,
  });

const runtime = createAuthRuntime({
  site: {
    url: process.env.BETTER_AUTH_URL ?? `https://${PLATFORM_HOST}`,
    title: 'Hirnli',
    // Better Auth's own default prefix, so sessions from before the move stay valid.
    slug: 'better-auth',
    // Tenant hosts are rows, so a customer added today can sign in today.
    trustedOrigins: async () =>
      (await db.select({ host: orgDomains.host }).from(orgDomains)).map((d) => `https://${d.host}`),
  },
  mail: { configured: false, send: async () => {} },
  isDatabaseConfigured: (env) => Boolean(env.DATABASE_URL),
  getDatabase: () => db,
  schema: {
    user: authSchema.user,
    session: authSchema.session,
    account: authSchema.account,
    verification: authSchema.verification,
    passkey: authSchema.passkey,
    twoFactor: authSchema.twoFactor,
    organization: authSchema.organization,
    member: authSchema.member,
    invitation: authSchema.invitation,
  },
  plugins: [organizations()],
});

/** The instance, typed with the organization plugin's endpoints. */
type HirnliAuth = ReturnType<typeof betterAuth<{ plugins: [ReturnType<typeof organizations>] }>>;

/** The auth instance. Built on first use so a build needs no secret. */
export function getAuth(): HirnliAuth {
  return runtime.getAuth() as unknown as HirnliAuth;
}

/** `/api/auth/**`: AccountKit's surface plus the organization plugin's endpoints. */
export const { GET, POST } = runtime;

export type Session = HirnliAuth['$Infer']['Session'];
