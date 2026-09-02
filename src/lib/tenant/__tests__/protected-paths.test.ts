/**
 * The middleware matcher used to BE the protected list: one regex decided both
 * "does middleware run" and "is this behind the password". Host routing forced
 * those apart — middleware must now run on `/`, which is public.
 *
 * That split is exactly the kind of change that quietly un-protects a route, so
 * this pins the protected set against the paths the middleware's own docs
 * claim are internal. It duplicates the list on purpose: a test that imports
 * the value it is checking proves only that a constant equals itself.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const middlewareSource = readFileSync(join(process.cwd(), 'src/middleware.ts'), 'utf-8');

/** Paths the header comment in middleware.ts documents as internal-only. */
const MUST_BE_PROTECTED = [
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
];

describe('protected paths', () => {
  it('every documented internal path is still in PROTECTED_PREFIXES', () => {
    for (const p of MUST_BE_PROTECTED) {
      expect(middlewareSource).toContain(`'${p}'`);
    }
  });

  it('the auth gate is keyed on PROTECTED_PREFIXES, not on the matcher', () => {
    // If this disappears, middleware is protecting "everything it runs on"
    // again — which, with the widened matcher, would mean the public site.
    expect(middlewareSource).toMatch(/if \(!isProtected\(pathname\)\)/);
  });

  it('cron routes stay out of the matcher (they carry their own Bearer auth)', () => {
    expect(middlewareSource).toContain('api/cron');
  });

  it('the platform root redirects rather than rewrites', () => {
    // Not a style preference — a rewrite here 500s in production. nextUrl
    // carries the public origin (https://hirnli.orangecat.ch) while the server
    // listens on http://localhost:4012, so Next treats the rewrite as an
    // external proxy and speaks TLS to a plain-HTTP port. Redirect is the only
    // form that survives a reverse proxy. Reverting this to rewrite() takes
    // the platform host down.
    expect(middlewareSource).toMatch(/NextResponse\.redirect\(url, 308\)/);
    expect(middlewareSource).not.toMatch(/NextResponse\.rewrite/);
  });

  it('the redirect changes only the path, never the host', () => {
    // Cloning nextUrl and setting pathname keeps scheme+host intact. Building
    // a fresh URL from a literal would send hirnli.* traffic elsewhere.
    expect(middlewareSource).toMatch(/const url = request\.nextUrl\.clone\(\)/);
    expect(middlewareSource).toMatch(/url\.pathname = PLATFORM_BRAND\.marketingPath/);
  });
});
