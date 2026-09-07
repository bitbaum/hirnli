/**
 * A route that serves one organisation's data must check whose it is.
 *
 * `/api/export/financial` and `/api/export/revenue` did not. They read the
 * code-held accounting and returned it on any host, unauthenticated, with the
 * REQUESTING tenant's name in the Content-Disposition filename — so a second
 * customer could download `evig-finanzen-2018-2025.csv` containing another
 * organisation's books, and nothing in the file said otherwise.
 *
 * It survived because every guard nearby was correct: the pages that show these
 * numbers call `ownsCodeContent`, the PDF routes call it, and the export routes
 * sat one directory away doing something that looked like a generic CSV dump.
 *
 * So the check is on the transitive import rather than on a list of routes: a
 * route that can REACH one organisation's data must mention the ownership
 * gate. Reaching is what matters — the export routes import a helper, and a
 * rule that only read direct imports would have called them clean.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/**
 * Modules holding one organisation's own material.
 *
 * Not "everything in config": the foundation register is shared research and
 * the scoring model is a product feature. These are the ones where the content
 * is a fact ABOUT the code owner.
 */
const OWNED_DATA = [
  '@/lib/data/financial',
  '@/app/(tenant)/fundraising/data',
  '@/lib/config/team',
  '@/lib/config/numbers',
];

/** Routes allowed to reach owned data without a gate, with the reason. */
const MAY_SKIP: Record<string, string> = {};

/**
 * The gate, wherever it is called from.
 *
 * A route may delegate: the PDF routes gate through `lib/pdf/authored.ts`
 * rather than calling `ownsCodeContent` themselves, which is good structure and
 * would look like an offence to a rule that grepped the route file alone. So
 * the gate is looked for by REACHABILITY, exactly as the data is.
 */
const GATE = 'ownsCodeContent';

function resolveImport(spec: string, fromFile: string): string | null {
  const base = spec.startsWith('@/')
    ? join('src', spec.slice(2))
    : spec.startsWith('.')
      ? resolve(dirname(fromFile), spec)
      : null;
  if (!base) return null;
  for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
    if (existsSync(base + ext)) return base + ext;
  }
  return existsSync(base) ? base : null;
}

/** Every module a file can reach, following relative and alias imports. */
function reachable(entry: string, seen = new Set<string>()): Set<string> {
  if (seen.has(entry)) return seen;
  seen.add(entry);
  let src: string;
  try {
    src = readFileSync(entry, 'utf-8');
  } catch {
    return seen;
  }
  for (const m of src.matchAll(/from\s+'([^']+)'/g)) {
    const spec = m[1];
    if (OWNED_DATA.includes(spec)) {
      seen.add(spec);
      continue;
    }
    const next = resolveImport(spec, entry);
    if (next) reachable(next, seen);
  }
  return seen;
}

function routeFiles(): string[] {
  return execSync(`find src/app/api -name 'route.ts' -o -name 'route.tsx' || true`, {
    encoding: 'utf-8',
  })
    .split('\n')
    .filter(Boolean);
}

describe('routes that can reach one organisation’s data check ownership', () => {
  it('finds routes, and finds owned data behind at least one of them', () => {
    // Without this the suite passes when the import walk silently returns
    // nothing, which is how a guard becomes a permanent green light.
    const routes = routeFiles();
    expect(routes.length).toBeGreaterThan(5);
    expect(routes.some((r) => [...reachable(r)].some((m) => OWNED_DATA.includes(m)))).toBe(true);
  });

  it('no route serves owned data without a gate', () => {
    const offenders = routeFiles().filter((route) => {
      if (route in MAY_SKIP) return false;
      const reaches = [...reachable(route)].some((m) => OWNED_DATA.includes(m));
      if (!reaches) return false;
      const files = [...reachable(route)].filter((m) => m.endsWith('.ts') || m.endsWith('.tsx'));
      return !files.some((f) => {
        try {
          return readFileSync(f, 'utf-8').includes(GATE);
        } catch {
          return false;
        }
      });
    });

    expect(
      offenders,
      'these can reach one organisation’s own data and never ask whose it is: ' +
        offenders.join(', '),
    ).toEqual([]);
  });
});
