/**
 * An organisation must never see another organisation's assessment.
 *
 * The registry blob still carries Revamp-IT's fit score, tagline and private
 * research notes for every foundation — migration 0012 copied those values into
 * the per-org assessment table without deleting them from `config_data`. So the
 * composition has one way to go wrong that is both easy to write and invisible
 * in production: spreading the assessment *over* the blob. Every field lines up
 * for the tenant that has an assessment, and the tenant that has none silently
 * inherits the first tenant's opinions.
 *
 * These are unit tests on purpose. The property is "a missing assessment
 * contributes nothing", and a test against seeded database rows would only
 * demonstrate it for the rows someone remembered to seed.
 */

import { describe, it, expect } from 'vitest';
import {
  composeFoundation,
  UNASSESSED_ANALYSIS,
  type AssessmentValues,
} from '../foundation-compose';
import { ANALYSIS_FIELDS } from '@/lib/schemas/foundation';
import { makeFoundation } from '@/lib/domain/__tests__/fixtures';

/**
 * A registry blob exactly as it sits in `config_data` today: registry facts and
 * the first tenant's analysis fields together in one object.
 */
function blobWithForeignAnalysis(overrides: Record<string, unknown> = {}) {
  return {
    ...makeFoundation({
      fitScore: 9,
      priority: 1,
      themes: ['klima', 'zuerich'],
      tagline: 'Revamp-IT: Top-Prio, Kontakt über Vorstand',
      researchNotes: 'Vorstandsmitglied kennt unsere Geschäftsleitung persönlich.',
      researchDate: '2026-01-15',
      researchDepth: 'deep',
    }),
    ...overrides,
  } as Record<string, unknown>;
}

/** One organisation's own assessment of the same foundation. */
const OWN_ASSESSMENT: AssessmentValues = {
  fitScore: 3,
  priority: 4,
  priorityOverride: false,
  themes: ['digitale-bildung'],
  tagline: 'Noch nicht bewertet',
  researchNotes: 'Erstkontakt offen.',
  researchDate: '2026-09-01',
  researchDepth: 'rapid',
  possiblePartners: undefined,
};

describe('composeFoundation', () => {
  it('gives a tenant with no assessment none of the blob’s analysis values', () => {
    const composed = composeFoundation(blobWithForeignAnalysis(), null);

    expect(composed).toBeDefined();
    // The numbers a tenant has not produced.
    expect(composed!.fitScore).toBe(0);
    expect(composed!.priority).toBe(4);
    expect(composed!.themes).toEqual([]);
    // The text that names the other tenant, and the note that is confidential
    // to it. These are the fields whose leakage would be least visible and most
    // damaging: a private observation about a funder, rendered to a competitor.
    expect(composed!.tagline).toBe('');
    expect(composed!.researchNotes).toBeUndefined();
    expect(composed!.researchNotes ?? '').not.toContain('Vorstandsmitglied');
    expect(composed!.researchDate).toBe('');
    expect(composed!.researchDepth).toBeUndefined();
  });

  it('keeps the registry facts, which are shared and not anyone’s opinion', () => {
    const composed = composeFoundation(blobWithForeignAnalysis(), null);

    expect(composed!.slug).toBe('test-stiftung');
    expect(composed!.name).toBe('Test Stiftung');
    expect(composed!.region).toBe('Zürich');
    expect(composed!.contact?.email).toBe('info@test.ch');
    expect(composed!.amount.text).toBe('10k-50k CHF');
    // `type` is the Schmuki classification. It describes the foundation, not
    // the relationship to it, so it survives on the registry side.
    expect(composed!.type).toBe('A');
  });

  it('uses the tenant’s own assessment when it has one', () => {
    const composed = composeFoundation(blobWithForeignAnalysis(), OWN_ASSESSMENT);

    expect(composed!.fitScore).toBe(3);
    expect(composed!.priority).toBe(4);
    expect(composed!.themes).toEqual(['digitale-bildung']);
    expect(composed!.tagline).toBe('Noch nicht bewertet');
    expect(composed!.researchNotes).toBe('Erstkontakt offen.');
    // Not the blob's 9/1 — the assessment replaces, it does not merge.
    expect(composed!.fitScore).not.toBe(9);
    expect(composed!.priority).not.toBe(1);
  });

  it('has an unassessed default for every analysis field the schema defines', () => {
    // This is the assertion that actually protects the boundary, and it earned
    // its place by watching a more obvious one fail to.
    //
    // The tempting test is: remove the analysis-key deletion from
    // composeFoundation and check that a leak appears. It doesn't.
    // UNASSESSED_ANALYSIS names all nine fields, so the spread already
    // overrides each of them — undefined included, which Zod strips — and the
    // leak test passes against the broken code as readily as the correct code.
    //
    // What genuinely breaks the boundary is adding a field to analysisSchema
    // and not adding it here: the spread then leaves the blob's value in place
    // and one organisation's figure surfaces under another's name. Comparing
    // the two key sets is what catches that, at the moment the field is added
    // rather than after it has been served to someone.
    expect(new Set(Object.keys(UNASSESSED_ANALYSIS))).toEqual(new Set(ANALYSIS_FIELDS));
  });

  it('returns undefined for a blob that is not a usable registry record', () => {
    expect(composeFoundation(null, null)).toBeUndefined();
    expect(composeFoundation('not an object', null)).toBeUndefined();
    // Well-formed object, but missing the registry fields the schema requires.
    expect(composeFoundation({ slug: 'x' }, null)).toBeUndefined();
  });

  it('reports the slug of a record it had to skip', () => {
    const seen: string[] = [];
    composeFoundation({ slug: 'kaputte-stiftung' }, null, (slug) => seen.push(slug));
    expect(seen).toEqual(['kaputte-stiftung']);
  });
});
