/**
 * Better Auth's HTTP surface: sign-up, sign-in, sign-out, session, and the
 * organisation plugin's endpoints all hang off this one catch-all.
 *
 * The handler is resolved INSIDE each request, not at module scope. `next build`
 * evaluates this module to collect page data, and building the auth instance
 * there would require BETTER_AUTH_SECRET at build time — which CI has no reason
 * to hold. Deferring keeps the build secretless and still fails loudly on a
 * running server that lacks the secret.
 *
 * Note for middleware: `/api/auth/**` must stay reachable without a session, or
 * signing in would require already being signed in.
 */

import { getAuth } from '@/lib/auth/server';
import { toNextJsHandler } from 'better-auth/next-js';

export async function GET(request: Request) {
  return toNextJsHandler(getAuth().handler).GET(request);
}

export async function POST(request: Request) {
  return toNextJsHandler(getAuth().handler).POST(request);
}
