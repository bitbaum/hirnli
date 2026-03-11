/**
 * Auth Middleware — Protect internal fundraising tools
 *
 * Public (intentional):
 *   - Everything at the root level (dashboard, impact, finanzen, team, etc.)
 *   - /gesuch/share/[token]  — designed to be sent to foundation officers, HMAC-protected
 *
 * Protected (internal — Revamp-IT team only):
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
 * Set INTERNAL_PASSWORD in Vercel environment variables.
 * If unset, all routes are open (local dev convenience).
 */

import { NextRequest, NextResponse } from 'next/server';
import { ORG_PROFILE } from '@/lib/config/org-profile';

/** Constant-time string comparison (Edge Runtime compatible) */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

const REALM = `${ORG_PROFILE.name} Intern`;

function unauthorized() {
  return new NextResponse('Zugang verweigert', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}"`,
    },
  });
}

export function middleware(request: NextRequest) {
  const password = process.env.INTERNAL_PASSWORD;

  // No password set → open (local dev, or intentionally public deployment)
  if (!password) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Share pages are always public — this is the controlled external interface
  if (pathname.startsWith('/gesuch/share')) return NextResponse.next();

  // Check credentials
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Basic ')) {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
    // Format is "username:password" — we only care about the password
    const pwd = decoded.includes(':') ? decoded.split(':').slice(1).join(':') : decoded;
    if (safeEqual(pwd, password)) return NextResponse.next();
  }

  return unauthorized();
}

export const config = {
  matcher: [
    '/fundraising/:path*',
    '/api/pdf/:path*',
    '/api/applications/:path*',
    '/api/gesuch-overrides/:path*',
    '/api/ai/:path*',
    '/api/export/:path*',
    '/api/foundations/:path*',
    '/api/customizations/:path*',
    // /api/cron/** excluded — routes have own Bearer token auth (CRON_SECRET)
    '/api/documents/:path*',
  ],
};
