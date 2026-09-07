/**
 * The editor's field paths come from a browser, so they are untrusted input.
 *
 * The form renders one input per string in a tenant's stored block, named by
 * its path. Nothing stops a submission naming a path the form never rendered,
 * so `applyFields` has to be the thing that refuses — schema validation alone
 * would not: `{"__proto__": {"admin": "yes"}}` and a story block with an extra
 * key are both perfectly well-formed JSON, and a `.strict()` schema catches the
 * second while the first never reaches it as a field at all.
 */

import { describe, it, expect } from 'vitest';
import { applyFields, collectFields, readField } from '../block-fields';
import { STARTER_STORIES } from '../starter-content';
import { storiesBlockSchema } from '../stories-source';

const BLOCK = storiesBlockSchema.parse(STARTER_STORIES);

describe('collectFields', () => {
  it('finds every string in the block, and only strings', () => {
    const fields = collectFields(BLOCK);
    expect(fields.length).toBeGreaterThan(30);
    for (const f of fields) expect(typeof f.value).toBe('string');
    // Numbers are not editable as text — team_size is a number and must not
    // appear, or saving would put a string where the schema wants a number.
    expect(fields.map((f) => f.path)).not.toContain('CORE_FACTS.team_size');
  });

  it('reaches into arrays by index', () => {
    const fields = collectFields(BLOCK).map((f) => f.path);
    expect(fields.some((p) => /^CORE_FACTS\.activities\.\d+$/.test(p))).toBe(true);
  });

  it('every collected path reads back the value it reported', () => {
    for (const f of collectFields(BLOCK)) {
      expect(readField(BLOCK, f.path)).toBe(f.value);
    }
  });
});

describe('applyFields only writes where a string already is', () => {
  it('applies a known path and leaves the rest alone', () => {
    const result = applyFields(BLOCK, new Map([['GESUCH_TEXT.zusammenfassung_intro', 'Neu.']]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(readField(result.block, 'GESUCH_TEXT.zusammenfassung_intro')).toBe('Neu.');
    expect(readField(result.block, 'GESUCH_TEXT.kurzportrait_subtitle')).toBe(
      readField(BLOCK, 'GESUCH_TEXT.kurzportrait_subtitle'),
    );
    // The input is not mutated: the caller still holds what it read.
    expect(readField(BLOCK, 'GESUCH_TEXT.zusammenfassung_intro')).not.toBe('Neu.');
  });

  it('rejects a path that does not exist', () => {
    const result = applyFields(BLOCK, new Map([['GESUCH_TEXT.erfunden', 'x']]));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.unknownPaths).toEqual(['GESUCH_TEXT.erfunden']);
  });

  it('rejects a path that exists but is not a string', () => {
    // Writing "3" over the team size would pass the form and fail the schema
    // later; refusing here names the real problem instead.
    const result = applyFields(BLOCK, new Map([['CORE_FACTS.team_size', '3']]));
    expect(result.ok).toBe(false);
  });

  it('accepts a path if and only if the form could have rendered it', () => {
    // The real invariant, and the one worth asserting directly: the set of
    // writable paths is exactly the set `collectFields` reports, which is
    // exactly the set the form renders. Everything else — unknown keys,
    // non-string leaves, prototype walks — follows from it rather than needing
    // its own rule.
    const rendered = new Set(collectFields(BLOCK).map((f) => f.path));

    for (const path of rendered) {
      expect(applyFields(BLOCK, new Map([[path, 'x']])).ok, path).toBe(true);
    }

    const notRendered = [
      '__proto__.polluted',
      '__proto__',
      'constructor.prototype.polluted',
      'constructor.name',
      'toString',
      'CORE_FACTS.team_size',
      'CORE_FACTS',
      'WHY.klima',
      'CORE_FACTS.activities.99',
      'CORE_FACTS.activities.-1',
      'GESUCH_TEXT.erfunden',
      '',
    ];
    for (const path of notRendered) {
      expect(rendered.has(path), `${path} should not be rendered`).toBe(false);
      expect(applyFields(BLOCK, new Map([[path, 'x']])).ok, path).toBe(false);
    }

    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('rejects the whole submission when one path is bad', () => {
    // Skipping the bad field and saving the rest would report success while
    // throwing away something the person typed.
    const result = applyFields(
      BLOCK,
      new Map([
        ['GESUCH_TEXT.zusammenfassung_intro', 'Gut.'],
        ['nicht.vorhanden', 'schlecht'],
      ]),
    );
    expect(result.ok).toBe(false);
  });

  it('an edited block still satisfies the schema every reader trusts', () => {
    const updates = new Map(
      collectFields(BLOCK).map((f) => [f.path, f.value.replace('[Bitte ergänzen]', 'Ausgefüllt')]),
    );
    const result = applyFields(BLOCK, updates);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(storiesBlockSchema.safeParse(result.block).success).toBe(true);
  });
});
