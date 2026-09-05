/**
 * A person's name may appear on the team page. It may not appear in the
 * explanation of a number.
 *
 * `/team` published this, to anyone, with no login: three colleagues named,
 * a statement that their current salaries were unknown, and a footnote
 * speculating that one of them might not be paid at all. The metric registry
 * carried the same thing twice more — one string saying which two of the three
 * are employed and which one works unpaid, another naming two volunteers — and
 * `SourceModal` renders both when a reader clicks the number.
 *
 * The rule is not "no names". A team page naming its team is the point of a
 * team page, and the roster below stays exactly as it is. The rule is that
 * `source.methodology`, `source.calculation`, `source.path` and the data-quality
 * note explain where a FIGURE came from. Attaching a person's name to a salary,
 * an employment status or an unpaid arrangement is a fact about that person,
 * and no transparency argument reaches it. Aggregate personnel cost is already
 * published under Finanzen, attached to the accounts rather than to three
 * first names.
 *
 * The roster is the source of names, so this cannot drift: add a colleague and
 * they are protected the same day.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const TEAM_FILE = 'src/lib/config/team.ts';

/** Given names, read from the roster itself rather than restated here. */
function rosterNames(): string[] {
  const src = readFileSync(TEAM_FILE, 'utf-8');
  const from = src.indexOf('export const TEAM_MEMBERS');
  // Bound the slice to the array. Running past its closing bracket swept in
  // DEPARTMENTS and "protected" the words Leitung, Technik and Betrieb, which
  // then failed on ordinary German prose — a check that cries wolf gets muted.
  const roster = src.slice(from, src.indexOf('\n];', from));
  const names = [...roster.matchAll(/name: '([^']+)'/g)].map((m) => m[1]);
  // Placeholder roles ("Hardware-Bildungsprogrammleiter:in") are not people.
  // Unicode classes rather than a spelled-out alphabet: the repo forbids the
  // eszett in source (Swiss German), and a hand-written class is wrong the
  // first time a name carries an accent the author did not think of.
  return [...new Set(names.filter((n) => /^\p{Lu}\p{Ll}+$/u.test(n)))];
}

/** Files whose prose explains numbers, and the roster's own narrative parts. */
const EXPLAINS_NUMBERS = [
  'src/lib/config/numbers.ts',
  'src/lib/config/metrics.ts',
  'src/lib/config/stories.ts',
  'src/lib/config/budget-scenarios.ts',
  'src/lib/config/projections.ts',
];

describe('the roster is the only place a colleague is named', () => {
  it('finds the roster, so the check has something to protect', () => {
    // If TEAM_MEMBERS is renamed or moved, the scan silently protects nobody.
    const names = rosterNames();
    expect(names.length, `no given names parsed from ${TEAM_FILE}`).toBeGreaterThan(5);
  });

  for (const file of EXPLAINS_NUMBERS) {
    it(`${file.split('/').pop()} explains figures without naming anyone`, () => {
      const src = readFileSync(file, 'utf-8');
      const found = rosterNames().filter((n) => new RegExp(`\\b${n}\\b`).test(src));

      expect(
        found,
        `A number's methodology, calculation or source named a colleague. ` +
          `Say how many, not who: ${found.join(', ')}`,
      ).toEqual([]);
    });
  }

  it('the public data-quality note names nobody', () => {
    const src = readFileSync(TEAM_FILE, 'utf-8');
    const note = src.slice(src.indexOf('export const DATA_QUALITY_NOTE'));
    const body = note.slice(0, note.indexOf('} as const;'));
    const found = rosterNames().filter((n) => new RegExp(`\\b${n}\\b`).test(body));

    expect(
      found,
      `DATA_QUALITY_NOTE renders on the public /team page. Named: ${found.join(', ')}`,
    ).toEqual([]);
  });
});
