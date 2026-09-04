/**
 * The scripts' assessment writer has one hand-maintained thing in it — the map
 * from schema field to database column — and this file exists to make that
 * map's drift a build failure rather than a silent data loss.
 *
 * The failure it prevents: a field added to `analysisSchema` is immediately
 * part of ANALYSIS_FIELDS, so `splitFoundationPatch` starts routing it away
 * from config_data. If ASSESSMENT_COLUMNS has no entry for it, `upsertAssessment`
 * filters it out and the value is written nowhere at all. Every script keeps
 * reporting success.
 */

import { describe, it, expect } from 'vitest';
import { ASSESSMENT_COLUMNS, splitFoundationPatch } from '../assessment-write';
import { ANALYSIS_FIELDS } from '../../../src/lib/schemas/foundation';

describe('ASSESSMENT_COLUMNS', () => {
  it('maps every analysis field the schema defines, and nothing else', () => {
    expect(new Set(Object.keys(ASSESSMENT_COLUMNS))).toEqual(new Set(ANALYSIS_FIELDS));
  });

  it('gives every field a distinct column', () => {
    const columns = Object.values(ASSESSMENT_COLUMNS).map((c) => c.column);
    expect(new Set(columns).size).toBe(columns.length);
  });

  it('names columns in snake_case, as the table declares them', () => {
    for (const { column } of Object.values(ASSESSMENT_COLUMNS)) {
      expect(column).toMatch(/^[a-z][a-z0-9_]*$/);
    }
  });
});

describe('splitFoundationPatch', () => {
  it('sends analysis fields to the assessment and leaves registry facts behind', () => {
    const { registry, analysis } = splitFoundationPatch({
      slug: 'beispiel-stiftung',
      name: 'Beispiel Stiftung',
      region: 'Zürich',
      fitScore: 8,
      themes: ['klima'],
      researchNotes: 'Passt zu unseren Themen.',
    });

    expect(registry).toEqual({
      slug: 'beispiel-stiftung',
      name: 'Beispiel Stiftung',
      region: 'Zürich',
    });
    expect(analysis).toEqual({
      fitScore: 8,
      themes: ['klima'],
      researchNotes: 'Passt zu unseren Themen.',
    });
  });

  it('keeps no analysis field in the registry half', () => {
    const everything = Object.fromEntries(ANALYSIS_FIELDS.map((f) => [f, 'x']));
    const { registry, analysis } = splitFoundationPatch({ ...everything, slug: 'a' });

    expect(Object.keys(registry)).toEqual(['slug']);
    expect(new Set(Object.keys(analysis))).toEqual(new Set(ANALYSIS_FIELDS));
  });
});
