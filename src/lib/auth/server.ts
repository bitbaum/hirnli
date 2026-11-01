/**
 * Accounts, on `@bitbaum/accountkit` — the fleet's one account runtime (Better
 * Auth underneath) — constructed lazily.
 *
 * AccountKit owns the sign-in methods, password rule, hashing, limits and
 * cookie rules. Hirnli adds what is its own: its tables, its hosts and the
 * `organization` plugin its workspaces run on.
 *
 * Account mail (the sign-in link, password recovery, address confirmation)
 * goes through AccountKit's mailer and mail-kit, with the fleet's
 * RESEND_API_KEY. It was off because every existing account is unverified and
 * the AccountKit of the time made confirmation compulsory once mail was on,
 * which would have locked all of them out. Since AccountKit 0.19 confirmation
 * comes AFTER sign-in by default (`emailConfirmation: "after-sign-in"`): an
 * unverified account keeps signing in as before, and confirms whenever it
 * likes from /konto ("Bestätigungslink nochmals schicken", AccountKit's
 * resend) or by using "Passwort vergessen?", which proves the address too.
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
import { createAuthMailer } from '@bitbaum/accountkit/auth/mail';
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

const siteUrl = process.env.BETTER_AUTH_URL ?? `https://${PLATFORM_HOST}`;

/**
 * Links in account mail point at the platform host, the runtime's base URL;
 * the mailer refuses any other origin before a credential leaves by email.
 */
const mailer = createAuthMailer({
  site: { url: siteUrl, title: 'Hirnli' },
  subjects: {
    verify: 'Bestätigen Sie Ihre E-Mail-Adresse für Hirnli',
    magicLink: 'Ihr Anmeldelink für Hirnli',
    reset: 'Neues Passwort für Hirnli',
  },
});

/** Whether account mail can go out; the screens offer the link and recovery only then. */
export const mailConfigured = (): boolean => mailer.configured;

const runtime = createAuthRuntime({
  site: {
    url: siteUrl,
    title: 'Hirnli',
    // Better Auth's own default prefix, so sessions from before the move stay valid.
    slug: 'better-auth',
    // Tenant hosts are rows, so a customer added today can sign in today.
    trustedOrigins: async () =>
      (await db.select({ host: orgDomains.host }).from(orgDomains)).map((d) => `https://${d.host}`),
  },
  // Default confirmation is after sign-in: mail on locks nobody out (above).
  mail: mailer,
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
