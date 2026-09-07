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
  it('finds the leaves and nothing else', () => {
    const fields = collectFields(BLOCK);
    expect(fields.length).toBeGreaterThan(30);
    // Every field carries its value as TEXT for the form, plus the kind it
    // must be written back as.
    for (const f of fields) {
      expect(typeof f.value).toBe('string');
      expect(['string', 'number']).toContain(f.kind);
    }
    // A number is editable — a customer states its own headcount — but is
    // reported as a number so the write puts one back.
    const teamSize = fields.find((f) => f.path === 'CORE_FACTS.team_size');
    expect(teamSize?.kind).toBe('number');

    // Containers are not leaves: offering an object as a text box would let a
    // submission replace a whole section with a sentence.
    const paths = fields.map((f) => f.path);
    expect(paths).not.toContain('CORE_FACTS');
    expect(paths).not.toContain('WHY.klima');
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

  it('rejects a path that exists but is not a leaf', () => {
    // Replacing a whole section with a sentence would pass the form and fail
    // the schema later; refusing here names the real problem instead.
    for (const path of ['CORE_FACTS', 'WHY.klima', 'CORE_FACTS.activities']) {
      expect(applyFields(BLOCK, new Map([[path, 'x']])).ok, path).toBe(false);
    }
  });

  it('writes a number back as a number, not as text', () => {
    // `"3"` where the schema wants `3` is JSON that looks right, fails
    // validation at the boundary, and without that boundary would reach a
    // funder as a value that renders fine and sorts wrong.
    const result = applyFields(BLOCK, new Map([['CORE_FACTS.team_size', '4']]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const block = result.block as { CORE_FACTS: { team_size: unknown } };
    expect(block.CORE_FACTS.team_size).toBe(4);
    expect(typeof block.CORE_FACTS.team_size).toBe('number');
  });

  it('refuses text in a numeric field, and says which', () => {
    for (const bad of ['drei', '', '  ', '12,5x']) {
      const result = applyFields(BLOCK, new Map([['CORE_FACTS.team_size', bad]]));
      expect(result.ok, JSON.stringify(bad)).toBe(false);
      if (result.ok) continue;
      expect(result.badNumbers).toEqual(['CORE_FACTS.team_size']);
    }
  });

  it('accepts a path if and only if the form could have rendered it', () => {
    // The real invariant, and the one worth asserting directly: the set of
    // writable paths is exactly the set `collectFields` reports, which is
    // exactly the set the form renders. Everything else — unknown keys,
    // non-string leaves, prototype walks — follows from it rather than needing
    // its own rule.
    const fields = collectFields(BLOCK);
    const rendered = new Set(fields.map((f) => f.path));

    // A value valid for the field's own kind: the invariant is about which
    // PATHS are writable, and offering text to a numeric field tests the other
    // rule instead.
    for (const f of fields) {
      const value = f.kind === 'number' ? '1' : 'x';
      expect(applyFields(BLOCK, new Map([[f.path, value]])).ok, f.path).toBe(true);
    }

    const notRendered = [
      '__proto__.polluted',
      '__proto__',
      'constructor.prototype.polluted',
      'constructor.name',
      'toString',
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
