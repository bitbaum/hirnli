'use server';

/**
 * Signing out, as a server action, so the button works before the page has
 * hydrated and the session ends on the server that issued it.
 *
 * AccountKit's runtime (`lib/auth/server.ts`) carries Better Auth's
 * `nextCookies` plugin, so the cleared session cookie set by `api.signOut`
 * reaches the browser on this action's response. The session ROW is deleted
 * too, which is what makes the sign-out stick: a prefetch already in flight
 * with the old cookie finds no session behind it and cannot write one back
 * (the race Kivvi hit, where a refreshed cookie landed after the sign-out).
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from './server';

// Where a signed-out person lands: the way back in. Not exported — a
// 'use server' file may export only async functions.
const SIGNED_OUT_PATH = '/anmelden';

export async function signOutOfHirnli(): Promise<never> {
  try {
    await getAuth().api.signOut({ headers: await headers() });
  } catch {
    // Already signed out, or accounts unavailable: either way, leave.
  }
  redirect(SIGNED_OUT_PATH);
}
