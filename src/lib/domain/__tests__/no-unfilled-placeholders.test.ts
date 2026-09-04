/**
 * No composed Gesuch may contain an unfilled placeholder.
 *
 * Content is stored as template text — `{{name}}`, `{{yearsActive}}` — so the
 * same strings can serve every tenant without carrying one organisation's facts
 * into another's document. The cost of that is a new failure mode: a template
 * that reaches output unfilled prints the braces verbatim into a Gesuch bound
 * for a foundation.
 *
 * It is not hypothetical. Moving the interpolation out of `stories.ts` left ten
 * of them leaking through `composeGesuchDokument` — `{{yearsActive}}`,
 * `{{founded}}`, `{{teamSize}}`, `{{milestones.integrationProgram}}` — and the
 * suite stayed green, because every existing assertion checks that a field is
 * truthy or contains a substring, and "über {{yearsActive}} Jahre" satisfies
 * both.
 *
 * So this asserts the absence directly, over the whole composed tree, for both
 * composers and both readiness branches. It is the check that would have caught
 * it, and the one that catches the next content source somebody adds without
 * routing it through `fillStoryContent()`.
 */

import { describe, it, expect } from 'vitest';
import { composeGesuch, composeGesuchDokument, composeAnschreibenText } from '../gesuch-composer';
import { makeFoundation, makeMinimalFoundation, makeMinimalTenant, makeTenant } from './fixtures';

/** Matches the placeholder syntax in src/lib/content/interpolate.ts. */
const PLACEHOLDER = /\{\{\s*[a-zA-Z][a-zA-Z0-9_.]*\s*\}\}/g;

function unfilled(value: unknown): string[] {
  const found = JSON.stringify(value)?.match(PLACEHOLDER) ?? [];
  return [...new Set(found)];
}

const TENANT = makeTenant();

describe('composed output carries no unfilled placeholders', () => {
  it('composeGesuch, ready', () => {
    const result = composeGesuch(TENANT, makeFoundation());
    expect(result.ready).toBe(true);
    expect(unfilled(result), 'leaked into the landing page content').toEqual([]);
  });

  it('composeGesuch, not ready', () => {
    // The not-ready branch returns a different object built from different
    // sources; it is exactly the kind of path that gets forgotten.
    const result = composeGesuch(TENANT, makeMinimalFoundation());
    expect(unfilled(result), 'leaked into the not-ready fallback').toEqual([]);
  });

  it('composeGesuchDokument', () => {
    const result = composeGesuchDokument(TENANT, makeFoundation());
    expect(unfilled(result), 'leaked into the Gesuch document').toEqual([]);
  });

  it('composeAnschreibenText', () => {
    const result = composeAnschreibenText(TENANT, makeFoundation());
    expect(unfilled(result), 'leaked into the cover letter').toEqual([]);
  });

  it('every Schwerpunkt variant', () => {
    // Schwerpunkt templates select different WHY sections, so a leak can hide
    // in one variant while the default is clean.
    for (const sp of ['nachhaltigkeit', 'soziale-integration', 'digitale-bildung'] as const) {
      const result = composeGesuchDokument(TENANT, makeFoundation(), sp);
      expect(unfilled(result), `leaked in Schwerpunkt "${sp}"`).toEqual([]);
    }
  });
});

describe('the filled values come from the tenant', () => {
  it('two tenants get their own facts in the same template text', () => {
    const a = composeGesuchDokument(makeTenant({ name: 'Alpha', founded: 2001 }), makeFoundation());
    const b = composeGesuchDokument(makeTenant({ name: 'Beta', founded: 2015 }), makeFoundation());

    const ja = JSON.stringify(a);
    const jb = JSON.stringify(b);

    expect(ja).toContain('2001');
    expect(jb).toContain('2015');
    expect(jb).not.toContain('2001');
  });
});

describe('shared content fits a tenant with only the required facts', () => {
  it('composes for a minimal tenant without throwing', () => {
    // `fillTemplate` throws when content references a fact the tenant has not
    // set — deliberately, because the alternative is "gegründet undefined" in a
    // document. The consequence is that SHARED content may only reference facts
    // every tenant has.
    //
    // This caught a real one: PARTNER_HIGHLIGHTS carried
    // "seit {{milestones.integrationProgram}}", and the second tenant has no
    // milestones at all — so composing anything, including the Gesuch template
    // pages, would have thrown for it. The year was a fact about that
    // partnership rather than about the organisation, so it became content.
    expect(() => composeGesuchDokument(makeMinimalTenant(), makeFoundation())).not.toThrow();
    expect(() => composeGesuch(makeMinimalTenant(), makeFoundation())).not.toThrow();
    expect(() => composeAnschreibenText(makeMinimalTenant(), makeFoundation())).not.toThrow();
  });

  it('leaves no placeholders unfilled for a minimal tenant either', () => {
    const result = composeGesuchDokument(makeMinimalTenant(), makeFoundation());
    expect(unfilled(result)).toEqual([]);
  });
});
