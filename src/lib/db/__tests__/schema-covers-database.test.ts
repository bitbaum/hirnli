/**
 * Every table that exists must be declared in schema.ts.
 *
 * `drizzle.config.ts` points drizzle-kit at `schema.ts` as the source of truth
 * for the whole database, and `package.json` exposes `db:push` and
 * `db:generate`. Those commands do not merge — they reconcile. A table that
 * exists in Postgres but not in `schema.ts` is a table drizzle-kit reports as
 * unknown and offers to DROP.
 *
 * `org_content` and `org_scoring` were in exactly that state: created by
 * migration 0007, seeded with this tenant's stories, metrics, cover-letter
 * templates and scoring engines, written by `scripts/seed-org-content.ts` — and
 * invisible to the schema. Running a documented maintenance command would have
 * offered to delete the content the multi-tenancy migration is built on.
 *
 * The check is against the migration files rather than a live connection so it
 * runs in CI without a database. That makes it a lower bound: it catches tables
 * this repo created and forgot to declare, which is the whole failure mode.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = 'src/lib/db/migrations';
const SCHEMA_FILES = ['src/lib/db/schema.ts', 'src/lib/db/auth-schema.ts'];

/**
 * Tables deliberately absent from schema.ts, each with the reason.
 *
 * Deliberately a short, annotated list rather than a pattern: the point of the
 * check is that adding to it is a decision somebody makes and explains.
 */
const NOT_DECLARED_ON_PURPOSE: Record<string, string> = {
  fundraising_foundations_config_pre0015:
    'Transient backup taken by migration 0015 before stripping analysis keys ' +
    'from config_data. Not application state; drop it once 0015 has been in ' +
    'production long enough to trust.',
};

function createdTables(): Set<string> {
  const names = new Set<string>();
  for (const file of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'))) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
    for (const m of sql.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?"?([a-z_0-9]+)"?/gi)) {
      names.add(m[1]);
    }
  }
  return names;
}

function droppedTables(): Set<string> {
  const names = new Set<string>();
  for (const file of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'))) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
    for (const m of sql.matchAll(/DROP TABLE (?:IF EXISTS )?"?([a-z_0-9]+)"?/gi)) {
      names.add(m[1]);
    }
    for (const m of sql.matchAll(/ALTER TABLE "?([a-z_0-9]+)"? RENAME TO/gi)) {
      names.add(m[1]);
    }
  }
  return names;
}

function declaredTables(): Set<string> {
  const src = SCHEMA_FILES.map((f) => readFileSync(f, 'utf-8')).join('\n');
  return new Set([...src.matchAll(/pgTable\(\s*'([a-z_0-9]+)'/g)].map((m) => m[1]));
}

describe('schema.ts covers the database', () => {
  it('declares every table the migrations create and do not remove', () => {
    const declared = declaredTables();
    const dropped = droppedTables();

    const undeclared = [...createdTables()]
      .filter((t) => !declared.has(t))
      .filter((t) => !dropped.has(t))
      .filter((t) => !(t in NOT_DECLARED_ON_PURPOSE))
      .sort();

    expect(
      undeclared,
      `drizzle-kit would report these as unknown and offer to DROP them: ${undeclared.join(', ')}\n` +
        'Declare them in schema.ts, or add them to NOT_DECLARED_ON_PURPOSE with a reason.',
    ).toEqual([]);
  });

  it('has not accumulated stale exemptions', () => {
    // An exemption for a table no longer created anywhere is dead weight that
    // makes the list harder to read and easier to add to.
    const created = createdTables();
    const stale = Object.keys(NOT_DECLARED_ON_PURPOSE).filter((t) => !created.has(t));
    expect(stale, `Exempted but never created: ${stale.join(', ')}`).toEqual([]);
  });
});
