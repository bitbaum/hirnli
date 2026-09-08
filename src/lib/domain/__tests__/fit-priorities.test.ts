/**
 * A fit breakdown ranks a foundation by the APPLICANT's priorities.
 *
 * `THEME_HIERARCHY` in the config names one organisation's core fields of work
 * — labour integration, circular economy, digital education, digital
 * sovereignty — and every tenant's scoring used it. The ingest scripts write
 * the resulting number into an assessment, so it decides which foundations an
 * organisation is told to approach; the "Fit" tab explains the same number back
 * to whoever is reading.
 *
 * It stayed invisible because only one organisation had ever run research: the
 * priorities compiled into the module were that organisation's, so the scores
 * were right by coincidence rather than by construction. The second customer is
 * what turns "right for the only user" into "wrong for a user".
 */

import { describe, it, expect } from 'vitest';
import { computeFitScore, explainFitScore } from '../fit-scoring';
import { SCORING_ENGINE, type ThemeCategory } from '@/lib/config/fit-scoring';

/** The priorities the engine ships with — one organisation's. */
const OWNERS = (
  SCORING_ENGINE.dimensions.find((d) => d.id === 'thematic')!.config as {
    categories: readonly ThemeCategory[];
  }
).categories as ThemeCategory[];

/** A different organisation's, ranking the opposite way. */
const OTHERS: ThemeCategory[] = [
  { name: 'core', members: ['klima', 'soziale-integration'], weight: 1.5, cap: 3 },
  {
    name: 'secondary',
    members: ['arbeitsintegration', 'kreislaufwirtschaft'],
    weight: 0.5,
    cap: 3,
  },
];

const INPUT = {
  themes: ['arbeitsintegration', 'kreislaufwirtschaft'],
  canton: 'ZH',
  city: 'zürich',
  applicationMethod: 'online',
  isFunder: false,
};

describe('fit scoring follows the applicant, not the module', () => {
  it('two organisations score the same foundation differently', () => {
    // Both themes are core for one and secondary for the other, so the same
    // foundation is a strong match for one applicant and a weak one for the
    // other. That is the whole point of a fit score, and it was impossible to
    // express while the hierarchy was an import.
    const mine = computeFitScore(INPUT, OWNERS);
    const theirs = computeFitScore(INPUT, OTHERS);

    expect(mine.fitScore).not.toBe(theirs.fitScore);
    expect(mine.fitScore).toBeGreaterThan(theirs.fitScore);
  });

  it('an applicant that has stated no priorities gets a flat weighting', () => {
    // Not the owner's ranking, and not a refusal: the breakdown still says the
    // themes matched, without claiming an order the applicant never gave.
    const flat = computeFitScore(INPUT, null);

    expect(flat.fitScore).toBeGreaterThan(0);
    expect(flat.fitScore).not.toBe(computeFitScore(INPUT, OWNERS).fitScore);
  });

  it('the explanation follows the same priorities as the score', () => {
    // One number explained two ways would be worse than either: the tab exists
    // to answer "why this score?".
    const explainOwners = explainFitScore(
      { themes: INPUT.themes, applicationMethod: 'online', isFunder: false, fitScore: 8 },
      OWNERS,
    );
    const explainOthers = explainFitScore(
      { themes: INPUT.themes, applicationMethod: 'online', isFunder: false, fitScore: 8 },
      OTHERS,
    );

    const thematic = (e: typeof explainOwners) => e.dimensions.find((d) => d.id === 'thematic');
    expect(thematic(explainOwners)?.score).not.toBe(thematic(explainOthers)?.score);
  });

  it('a theme nobody prioritised still counts when weighting is flat', () => {
    // The flat category has to cover every theme id, or an applicant with no
    // stated priorities would score 0 on a foundation that matches it exactly.
    const unlisted = { ...INPUT, themes: ['zuerich'] };
    expect(computeFitScore(unlisted, null).fitScore).toBeGreaterThan(0);
  });
});
