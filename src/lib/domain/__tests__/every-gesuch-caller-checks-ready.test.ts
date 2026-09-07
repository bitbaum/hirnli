/**
 * A composed Gesuch says whether it can honestly be sent. Every caller must ask.
 *
 * `composeGesuch` has always returned `ready` and `readyReason`, and four
 * routes never read either — they rendered the document regardless. That was
 * invisible for years because the first customer had written every theme, so
 * `ready` was always true in practice. The second customer had written four of
 * five, and the first funder matched on the fifth got a formal grant
 * application whose argument page was blank.
 *
 * This is the same shape as a `?next=` parameter nobody reads: a producer that
 * reports a problem to no consumer looks handled from the producing side, and
 * the only thing that distinguishes the two is reading the other end.
 *
 * So the rule is checked at the source, on the import: a file that composes a
 * Gesuch must also mention `.ready`. It is a grep rather than a render because
 * this repo has no jsdom, and because the failure being prevented is
 * structural — a route that never asks — rather than a rendering detail.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const COMPOSERS = ['composeGesuch', 'composeGesuchDokument'];

/**
 * Files allowed to compose without checking, with the reason.
 *
 * `gesuch-composer.ts` defines the flag. The audit script reports on documents
 * rather than sending them, and prints readiness itself as a finding.
 */
const MAY_SKIP = ['src/lib/domain/gesuch-composer.ts', 'scripts/gesuch-audit.ts'];

/**
 * Source with comments removed.
 *
 * Without this the rule reported `foundation-helpers.ts` and `stories.ts`,
 * whose only mention of a composer is a sentence ABOUT one — the same trap as
 * a scanner matching its own prose. A rule about calls must look at calls.
 */
function code(file: string): string {
  return readFileSync(file, 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function callers(): string[] {
  const out = execSync(
    `grep -rl "composeGesuch" src/ scripts/ --include='*.ts' --include='*.tsx' || true`,
    { encoding: 'utf-8' },
  );
  return out
    .split('\n')
    .filter(Boolean)
    .filter((f) => !f.includes('__tests__'))
    .filter((f) => !MAY_SKIP.includes(f));
}

describe('every route that composes a Gesuch asks whether it is ready', () => {
  it('finds callers at all', () => {
    // Without this the suite passes when the grep breaks, which is how a guard
    // rots into a permanent green light.
    expect(callers().length).toBeGreaterThan(4);
  });

  it('no caller renders a Gesuch without checking ready', () => {
    const offenders = callers().filter((file) => {
      const src = code(file);
      // Must actually CALL a composer, not merely mention the word in prose.
      const composes = COMPOSERS.some((c) => new RegExp(`${c}\\s*\\(`).test(src));
      return composes && !src.includes('.ready');
    });

    expect(
      offenders,
      'these compose a Gesuch and never ask whether it can be sent: ' + offenders.join(', '),
    ).toEqual([]);
  });
});
