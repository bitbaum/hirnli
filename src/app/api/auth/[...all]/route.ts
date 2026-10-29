/**
 * AccountKit's HTTP surface: sign-up, sign-in, sign-out, session, passkeys,
 * second factors and the organisation plugin's endpoints all hang off this one
 * catch-all.
 *
 * The instance is built inside the first request, not at module scope, so
 * `next build` needs no BETTER_AUTH_SECRET; a running server without a
 * database answers "accounts unavailable" instead of crashing.
 *
 * Note for middleware: `/api/auth/**` must stay reachable without a session, or
 * signing in would require already being signed in.
 */

export { GET, POST } from '@/lib/auth/server';
