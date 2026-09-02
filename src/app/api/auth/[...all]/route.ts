/**
 * Better Auth's HTTP surface: sign-up, sign-in, sign-out, session, and the
 * organisation plugin's endpoints all hang off this one catch-all.
 *
 * Note for middleware: `/api/auth/**` must stay reachable without a session,
 * or signing in would require already being signed in.
 */

import { auth } from '@/lib/auth/server';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth.handler);
