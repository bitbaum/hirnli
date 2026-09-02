/**
 * Better Auth server instance.
 *
 * Email + password for now: Hirnli has no email sender configured
 * (RESEND_API_KEY is absent in production), so magic links and verification
 * mails would fail silently — worse than not offering them. Wire providers
 * when there is a working sender to carry them.
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { organization } from 'better-auth/plugins';
import { db } from '@/lib/db/client';
import * as authSchema from '@/lib/db/auth-schema';

/**
 * Signing secret. Absent in CI and local builds, which must still compile —
 * the app only needs it when it actually serves a request. A build-time
 * placeholder here would be indistinguishable from a real secret at runtime,
 * so this throws at USE time instead (same pattern as DATABASE_URL in
 * lib/db/client.ts).
 */
function authSecret(): string {
  const s = process.env.BETTER_AUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('BETTER_AUTH_SECRET is not set — sessions cannot be signed.');
    }
    // Development only. Deterministic so restarts don't invalidate local logins.
    return 'dev-only-insecure-secret-do-not-use-in-production';
  }
  return s;
}

export const auth = betterAuth({
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

export type Session = typeof auth.$Infer.Session;
