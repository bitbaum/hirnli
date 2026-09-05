/**
 * No query may scope tenant data by a compile-time constant.
 *
 * This is the confidentiality boundary between customers, and it broke in the
 * most ordinary way imaginable: an org id read from the compile-time tenant
 * constant at module scope, then `.where(eq(gesuchOverrides.orgId, ORG_ID))`.
 * Correct with one
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

describe('tenant query scoping', () => {
  it('no module-scope constant stands in for the requesting tenant', () => {
    // The constant this originally guarded is deleted, so the check moved to
    // the SHAPE rather than the name: an org id fixed at module scope is wrong
    // whatever it is called, and the next one will not be called the same
    // thing. `getCurrentOrgId()` inside a function is the only correct source.
    const offenders = execSync(
      'grep -rnE "^(const|let) [A-Z_]*ORG_?ID[A-Z_]* *=" src/ ' +
        "--include='*.ts' --include='*.tsx' || true",
      { encoding: 'utf-8' },
    )
      .split('\n')
      .filter(Boolean);

    expect(
      offenders,
      `A module-scope org id scopes every request to one customer:\n${offenders.join('\n')}`,
    ).toEqual([]);
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

  /**
   * Every handler that touches a tenant-owned table must name that table's own
   * org column.
   *
   * The specific assertions above were written one leak at a time, which is the
   * shape of the problem: three separate fixes, then a sweep that found eleven
   * more of exactly the same thing. Unscoped queries were the normal state of
   * this codebase, because they were correct for its entire single-tenant life
   * — `where(eq(applications.id, id))` reads like a complete lookup, and the
   * missing half is invisible until a second customer exists.
   *
   * What had actually accumulated: the KPI dashboard summed every
   * organisation's requested and awarded amounts; the applications board listed
   * and paginated over everyone's rows; PATCH and a hard DELETE resolved an
   * application by id alone, so any tenant could edit or destroy any other's by
   * knowing one; POST's duplicate check answered 409 citing a stranger's
   * application id; the activity log answered "who changed this, and when" for
   * any entity; the personalisation engine applied other organisations' global
   * rules to your Gesuch text.
   *
   * WHAT THIS CHECKS, AND WHAT IT DOES NOT
   *
   * Per function: if the body queries a tenant table, it must mention that
   * table's `orgId` at least once. One mention can legitimately cover several
   * queries — a seeded `conditions` array, a shared `mine` predicate — which is
   * why this counts presence rather than matching each query to a predicate.
   *
   * So a function that scopes one of its two queries still passes. This is a
   * gate against the whole-file omission that actually happened, not a proof of
   * correctness, and it is deliberately blunt rather than clever: an earlier
   * attempt at per-statement analysis mis-parsed on a semicolon inside a code
   * comment and reported four false positives, which is how a check like this
   * gets muted and stops being read.
   */
  it('names the table org column in every handler that queries tenant data', () => {
    // foundations is deliberately absent: it is the shared registry, and its
    // org column is a historical artefact rather than a tenancy boundary (see
    // the note on the table in schema.ts). Scoping reads by it would hide most
    // of the registry from every tenant.
    const TENANT_TABLES = [
      'applications',
      'customizationRules',
      'activityLog',
      'gesuchOverrides',
      'foundationAssessments',
    ];

    const sources = execSync("find src -name '*.ts' -o -name '*.tsx' | grep -v __tests__ || true", {
      encoding: 'utf-8',
    })
      .split('\n')
      .filter(Boolean);

    const offenders: string[] = [];

    for (const file of sources) {
      const src = readFileSync(file, 'utf-8');
      // Split on function boundaries so a scoped handler cannot vouch for an
      // unscoped one sharing the file.
      const bodies = src.split(/(?=(?:export\s+)?(?:async\s+)?function\s)/);

      for (const body of bodies) {
        for (const table of TENANT_TABLES) {
          const queries =
            body.split(`.from(${table})`).length -
            1 +
            (body.split(`.update(${table})`).length - 1) +
            (body.split(`.delete(${table})`).length - 1);
          if (queries === 0) continue;
          if (body.includes(`${table}.orgId`)) continue;

          const name = body.match(/function\s+(\w+)/)?.[1] ?? '(module scope)';
          offenders.push(`${file} → ${name}() queries ${table} without ${table}.orgId`);
        }
      }
    }

    expect(offenders, `Unscoped tenant queries:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('does not discard override-load failures in silence', () => {
    // The fallback is right; hiding it was not. Saved edits vanishing from a
    // document about to be sent should leave a trace somewhere.
    const src = readFileSync('src/lib/domain/apply-overrides.ts', 'utf-8');
    expect(src).not.toMatch(/\}\s*catch\s*\{\s*return \{\};\s*\}/);
    expect(src).toMatch(/console\.error/);
  });
});
