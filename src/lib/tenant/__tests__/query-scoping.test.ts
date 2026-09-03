/**
 * No query may scope tenant data by a compile-time constant.
 *
 * This is the confidentiality boundary between customers, and it broke in the
 * most ordinary way imaginable: `const ORG_ID = ORG_PROFILE.orgId` at module
 * scope, then `.where(eq(gesuchOverrides.orgId, ORG_ID))`. Correct with one
 * tenant, and with two it means every tenant reads and writes the FIRST
 * tenant's rows. Those rows are saved edits to grant applications, so the
 * effect is one customer's Gesuch rendering with another customer's revisions
 * — and, on write, overwriting them.
 *
 * Source assertions, because the property is "this shape does not appear
 * anywhere", and no return value can demonstrate an absence. A test that
 * exercised one route would leave the next one free to reintroduce it.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

/** Every source file that mentions the legacy identity constant. */
function filesMentioning(needle: string): string[] {
  try {
    return execSync(`grep -rl "${needle}" src/ --include='*.ts' --include='*.tsx' || true`, {
      encoding: 'utf-8',
    })
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }
}

describe('tenant query scoping', () => {
  it('never derives an org id for a query from the compile-time constant', () => {
    // registry.ts is the one legitimate mention: it is the shim that still maps
    // the default tenant while call sites migrate. Everywhere else, an org id
    // taken from ORG_PROFILE is a query scoped to the wrong customer.
    // registry.ts legitimately maps the default tenant while call sites
    // migrate; this file names the pattern in order to forbid it.
    const ALLOWED = ['src/lib/tenant/registry.ts', __filename.replace(process.cwd() + '/', '')];
    const offenders = filesMentioning('ORG_PROFILE\\.orgId').filter(
      (f) => !ALLOWED.some((a) => a.endsWith(f) || f.endsWith(a)),
    );
    expect(offenders, `ORG_PROFILE.orgId must not scope data in: ${offenders.join(', ')}`).toEqual(
      [],
    );
  });

  it('resolves the org id per request in the gesuch-overrides routes', () => {
    const routes = [
      'src/app/api/gesuch-overrides/route.ts',
      'src/app/api/gesuch-overrides/[slug]/route.ts',
      'src/app/api/gesuch-overrides/[slug]/variants/route.ts',
    ];
    for (const r of routes) {
      const src = readFileSync(r, 'utf-8');
      expect(src, `${r} should resolve the org per request`).toMatch(
        /const ORG_ID = await getCurrentOrgId\(\)/,
      );
      // Module scope is the trap: evaluated once at import, shared by every
      // request, and therefore by every tenant.
      expect(src, `${r} must not hoist the org id to module scope`).not.toMatch(
        /^const ORG_ID =(?! await)/m,
      );
    }
  });

  it('scopes the domain-layer override lookup by the request tenant', () => {
    const src = readFileSync('src/lib/domain/apply-overrides.ts', 'utf-8');
    expect(src).toMatch(/getCurrentOrgId/);
    expect(src).toMatch(/eq\(gesuchOverrides\.orgId, orgId\)/);
  });

  it('does not discard override-load failures in silence', () => {
    // The fallback is right; hiding it was not. Saved edits vanishing from a
    // document about to be sent should leave a trace somewhere.
    const src = readFileSync('src/lib/domain/apply-overrides.ts', 'utf-8');
    expect(src).not.toMatch(/\}\s*catch\s*\{\s*return \{\};\s*\}/);
    expect(src).toMatch(/console\.error/);
  });
});
