/**
 * The shared bitbaum sign-in button (fleet STACK.md, "Identity"): one service
 * holding the Google, Apple, GitHub, X and Meta credentials for every app.
 *
 * Offered only when SIGNIN_ISSUER, SIGNIN_CLIENT_ID and SIGNIN_CLIENT_SECRET
 * are all set — the same rule AccountKit uses to mount the provider, so the
 * button is never shown without an endpoint behind it. Server-side only: the
 * browser gets the provider id and the label, never the env.
 */

import { authLabelsFor, signInMethods, SIGNIN_PROVIDER_ID } from '@bitbaum/accountkit/auth';

export interface SharedSignIn {
  provider: string;
  label: string;
}

export function sharedSignIn(
  env: Record<string, string | undefined> = process.env,
): SharedSignIn | null {
  // Mail is off in Hirnli (lib/auth/server.ts); it does not affect this button.
  if (!signInMethods(env, false).signin) return null;
  return { provider: SIGNIN_PROVIDER_ID, label: authLabelsFor('de').withSignin };
}
