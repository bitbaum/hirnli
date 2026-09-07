/**
 * A composed Gesuch may contain nothing but the applicant's own words.
 *
 * The other content tests check imports — which module reads which raw export.
 * That rule caught renderers reaching into content, but it is blind to the
 * defect that survived it longest: prose written directly into a composer.
 *
 * Three of the cover-letter openings described one organisation's business in
 * plain German — repairing computers otherwise thrown away, combining
 * environmental protection with social integration — and named nobody. No
 * search for that organisation's name found them, no import rule applied
 * because nothing was imported, and every applicant posted them to funders
 * under their own letterhead.
 *
 * So this test asserts the property directly rather than a proxy for it:
 * compose the same document for two different organisations with two different
 * stories, and no substantial sentence may appear in both. A sentence that
 * survives changing the applicant AND the applicant's story came from neither,
 * which leaves only the code — and the code does not know who is applying.
 */

import { describe, it, expect } from 'vitest';
import { composeGesuchDokument } from '@/lib/domain/gesuch-composer';
import {
  makeBudget,
  makeFoundation,
  makeOtherBudget,
  makeStarterStory,
  makeStory,
  makeTenant,
} from '@/lib/domain/__tests__/fixtures';
import { STARTER_STORIES } from '../starter-content';

/**
 * Sections whose text is legitimately the same for two different applicants.
 *
 * Each is here for a stated reason, and the reason is always that the text
 * describes something other than the applicant. Anything added to this list to
 * make the test pass, without such a reason, is the bug this test exists to
 * catch.
 */
const NOT_THE_APPLICANT = {
  // The funder's own words, and both documents are addressed to the same
  // funder. Identical by construction.
  foundation: 'the foundation being written to',
  // Platform taxonomy: how one approaches a type-A foundation as opposed to a
  // type-C one. A claim about the process, not about the applicant.
  approach: 'how to approach a foundation of this type',
};

/** Strings long enough to be prose rather than a label or a number. */
function longStrings(
  value: unknown,
  path = '',
  found = new Map<string, string>(),
): Map<string, string> {
  if (typeof value === 'string') {
    if (value.length >= 40) found.set(value, path);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => longStrings(v, `${path}[${i}]`, found));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) longStrings(v, path ? `${path}.${k}` : k, found);
  }
  return found;
}

function excused(path: string): boolean {
  return Object.keys(NOT_THE_APPLICANT).some(
    (p) => path === p || path.startsWith(`${p}.`) || path.startsWith(`${p}[`),
  );
}

const FOUNDATION = makeFoundation();

describe('composed prose belongs to the applicant', () => {
  it('no sentence survives changing both the organisation and its story', () => {
    // Two organisations, two stories, one foundation. Anything identical in
    // both outputs was written by neither of them.
    const alpha = composeGesuchDokument(
      makeStory(
        makeTenant({
          name: 'Alpha',
          location: 'Bern',
          missionSummary: 'Alpha-Zweck',
          siteUrl: 'https://alpha.example',
        }),
      ),
      makeBudget(),
      FOUNDATION,
    );
    const beta = composeGesuchDokument(
      makeStarterStory(
        makeTenant({
          name: 'Beta',
          location: 'Genf',
          missionSummary: 'Beta-Zweck',
          siteUrl: 'https://beta.example',
        }),
      ),
      makeOtherBudget(),
      FOUNDATION,
    );

    const inBeta = new Set(longStrings(beta).keys());
    const shared = [...longStrings(alpha)]
      .filter(([text, path]) => inBeta.has(text) && !excused(path))
      .map(([text, path]) => `${path}: ${text.slice(0, 80)}`);

    expect(
      shared,
      'prose that changes with neither the applicant nor its story is hardcoded ' +
        'into the composer, and ships to funders under every customer’s name',
    ).toEqual([]);
  });

  it('a starter story composes a visibly unfinished document, not a polished one', () => {
    // The failure mode this replaces was NOT an error. A new customer got a
    // complete, confident Gesuch — somebody else's, with their name in it.
    const dok = composeGesuchDokument(
      makeStarterStory(makeTenant({ name: 'Neu' })),
      null,
      FOUNDATION,
    );
    const text = JSON.stringify(dok);

    expect(text, 'a new customer must see prompts, not finished prose').toContain(
      '[Bitte ergänzen]',
    );
  });

  it('the story that is passed in is the story that comes out', () => {
    // A marker no organisation would write. If the composer reads its own
    // module rather than the argument, this is absent and the module's real
    // sentence is present instead.
    const MARKER = 'PROBE-SOLUTION-KLIMA-EINDEUTIG';
    const story = makeStory(makeTenant(), {
      WHY: {
        ...STARTER_STORIES.WHY,
        klima: { ...STARTER_STORIES.WHY.klima, solution: MARKER },
      },
    });
    const dok = composeGesuchDokument(story, makeBudget(), makeFoundation({ themes: ['klima'] }));

    expect(JSON.stringify(dok)).toContain(MARKER);
  });

  it('a Kurzportrait reports only figures the organisation stated', () => {
    // Six rows of one organisation's KPIs used to be built into the composer:
    // a CO2 saving per laptop, a reuse rate, a reintegration quota. An
    // organisation that measures none of those must report none of them.
    const dok = composeGesuchDokument(
      makeStarterStory(makeTenant({ name: 'Neu' })),
      null,
      FOUNDATION,
    );
    const labels = dok.kurzportrait.facts.map((f) => f.label);

    expect(labels).toEqual(['Name', 'Rechtsform', 'Gegründet', 'Standort', 'Website']);
  });
});
