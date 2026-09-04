/**
 * Auth Middleware — Protect internal fundraising tools
 *
 * Public (intentional):
 *   - Everything at the root level (dashboard, impact, finanzen, team, etc.)
 *   - /gesuch/share/[token]  — designed to be sent to foundation officers, HMAC-protected
 *
 * Protected (internal — the tenant's own team only):
 *   - /fundraising/**          — pipeline, foundation research, gesuch workflow
 *   - /api/pdf/**              — PDF generation (contains internal research context)
 *   - /api/applications/**     — pipeline management
 *   - /api/gesuch-overrides/** — saved edits
 *   - /api/ai/**               — AI rewrite (reveals foundation context)
 *   - /api/export/**           — financial & pipeline data exports
 *   - /api/foundations/**       — foundation CRUD (fit scores, research notes)
 *   - /api/customizations/**    — gesuch personalization rules
 *   - /api/cron/**              — own Bearer token auth (CRON_SECRET), not in middleware
 *   - /api/documents/**         — document generation (Gesuch PDFs with internal context)
 *
 * Auth method: HTTP Basic Auth — browser handles the prompt.
 * Set INTERNAL_PASSWORD in the server environment (/opt/revamp-info/app/.env).
 *
 * Modes:
 *   INTERNAL_PASSWORD set   → internal routes require Basic Auth
 *   INTERNAL_AUTH=off       → everything public (explicit choice, e.g. demo phase)
 *   neither (development)   → open (local convenience)
 *   neither (production)    → 503 — misconfiguration must never silently expose data
 */

import { NextRequest, NextResponse } from 'next/server';
import { PLATFORM_BRAND } from '@/lib/config/platform-brand';
import { getTenantIdByHost, isPlatformHost } from '@/lib/tenant/registry';

/**
 * Paths the Basic-Auth gate applies to. Previously this list lived only in
 * `config.matcher`, so "which paths run middleware" and "which paths are
 * protected" were the same statement. They are not the same question any more:
 * middleware now also does host routing, which must run on `/` — a public page.
 * Keeping the protected set explicit here means widening the matcher can never
 * silently widen what is behind the password.
 */
const PROTECTED_PREFIXES = [
  '/fundraising',
  '/api/pdf',
  '/api/applications',
  '/api/gesuch-overrides',
  '/api/ai',
  '/api/export',
  '/api/foundations',
  '/api/customizations',
  '/api/documents',
  '/api/activity-log',
] as const;

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Constant-time string comparison (Edge Runtime compatible) */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * The Basic-Auth realm, and why it names the platform rather than the tenant.
 *
 * Middleware runs on the Edge runtime, where the tenant reader — Drizzle over
 * node-postgres — cannot go, so this genuinely cannot be resolved per request.
 * It was the first tenant's name, which meant every other tenant's browser
 * prompted for a password under an unrelated organisation's name.
 *
 * The platform's own name is the honest answer: it is the platform asking.
 */
const REALM = `${PLATFORM_BRAND.name} Intern`;

function unauthorized() {
  return new NextResponse('Zugang verweigert', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}"`,
    },
  });
}

/**
 * Carry the resolved tenant on the request.
 *
 * This is the seam the whole migration hangs on: `getCurrentOrgId()` reads this
 * header, and every page, route handler, composer and PDF now gets its
 * organisation from there rather than from a compile-time constant.
 */
function withTenantHeader(request: NextRequest, orgId: string): NextResponse {
  const headers = new Headers(request.headers);
  headers.set('x-org-id', orgId);
  return NextResponse.next({ request: { headers } });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host');

  // ── Host routing ─────────────────────────────────────────────────────────
  // The platform host serves the product, not a tenant. Its root would
  // otherwise render Revamp-IT's showcase — the exact conflation
  // docs/HIRNLI-REPLATFORM-PLAN.md §2 exists to end.
  //
  // REDIRECT, not rewrite, and the reason is deployment-shaped rather than
  // aesthetic. `request.nextUrl` carries the PUBLIC origin
  // (https://hirnli.orangecat.ch, from Caddy's X-Forwarded-Proto), while the
  // Next server's own origin is http://localhost:4012. Those differ, so Next
  // treats a rewrite to that URL as an EXTERNAL proxy target and dials it
  // literally — TLS against a plain-HTTP port:
  //
  //   Failed to proxy https://localhost:4012/plattform
  //   Error: write EPROTO ... tls_validate_record_header:wrong version number
  //
  // which took the platform host to a hard 500. A same-origin rewrite only
  // works where the public origin IS the server's origin (Vercel); behind a
  // reverse proxy it is a cross-origin fetch wearing a rewrite's clothes.
  //
  // The redirect keeps the host — only the path becomes visible — and stays
  // correct under any proxy. When the platform home moves to `/` inside the
  // (platform) route group, this branch disappears rather than becoming a
  // rewrite again.
  if (isPlatformHost(host) && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = PLATFORM_BRAND.marketingPath;
    return NextResponse.redirect(url, 308);
  }

  const orgId = getTenantIdByHost(host);

  // ── Internal-area auth ───────────────────────────────────────────────────
  // Only the protected paths are gated; everything else (the public showcase,
  // the platform surface) passes through with the tenant header attached.
  if (!isProtected(pathname)) return withTenantHeader(request, orgId);

  // Explicitly public (demo phase) — the org's deliberate choice, not a default.
  if (process.env.INTERNAL_AUTH === 'off') return withTenantHeader(request, orgId);

  const password = process.env.INTERNAL_PASSWORD;

  // No password set → open in dev only; production fails closed.
  if (!password) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('Interner Bereich nicht konfiguriert (INTERNAL_PASSWORD fehlt)', {
        status: 503,
      });
    }
    return withTenantHeader(request, orgId);
  }

  // Share pages are always public — this is the controlled external interface
  if (pathname.startsWith('/gesuch/share')) return withTenantHeader(request, orgId);

  // Check credentials
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Basic ')) {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
    // Format is "username:password" — we only care about the password
    const pwd = decoded.includes(':') ? decoded.split(':').slice(1).join(':') : decoded;
    if (safeEqual(pwd, password)) return withTenantHeader(request, orgId);
  }

  return unauthorized();
}

export const config = {
  // Runs on everything except Next internals, static assets and /api/cron
  // (cron routes carry their own Bearer auth via CRON_SECRET and must not be
  // touched here). Host routing has to see `/`, so the matcher can no longer be
  // "the protected paths" — that set now lives in PROTECTED_PREFIXES above,
  // which is what actually decides who gets challenged.
  matcher: [
    '/((?!_next/static|_next/image|api/cron|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|woff2?)$).*)',
  ],
};
