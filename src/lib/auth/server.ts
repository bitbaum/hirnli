/**
 * Better Auth server instance — constructed lazily.
 *
 * Email + password only for now: Hirnli has no email sender configured
 * (RESEND_API_KEY is absent in production), so magic links and verification
 * mails would fail silently, which is worse than not offering them.
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

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { organization } from 'better-auth/plugins';
import { db } from '@/lib/db/client';
import * as authSchema from '@/lib/db/auth-schema';

function authSecret(): string {
  const s = process.env.BETTER_AUTH_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BETTER_AUTH_SECRET is not set — sessions cannot be signed.');
  }
  // Development only. Deterministic so restarts don't invalidate local logins.
  return 'dev-only-insecure-secret-do-not-use-in-production';
}

function createAuth() {
  return betterAuth({
    secret: authSecret(),
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: authSchema.user,
        session: authSchema.session,
        account: authSchema.account,
        verification: authSchema.verification,
        organization: authSchema.organization,
        member: authSchema.member,
        invitation: authSchema.invitation,
      },
    }),
    emailAndPassword: {
      enabled: true,
      // No sender configured, so a "verify your email" flow would strand people
      // on an unverifiable account. Revisit together with RESEND_API_KEY.
      requireEmailVerification: false,
      minPasswordLength: 12,
    },
    plugins: [
      organization({
        // A person may hold several customers' fundraising work at once — that
        // is the product, not an edge case.
        allowUserToCreateOrganization: true,
      }),
    ],
  });
}

let _auth: ReturnType<typeof createAuth> | null = null;

/** The auth instance. Built on first use so a build needs no secret. */
export function getAuth() {
  if (!_auth) _auth = createAuth();
  return _auth;
}

export type Session = ReturnType<typeof createAuth>['$Infer']['Session'];
