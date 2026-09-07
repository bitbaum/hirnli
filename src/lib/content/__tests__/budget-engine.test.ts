/**
 * The budget a funder reads follows the applicant, and did not move in the move.
 *
 * Two things are asserted here, and they pull in opposite directions on
 * purpose. The first is that the figures are now the tenant's: hand the
 * composer a different organisation's budget and every number changes. The
 * second is that migrating the existing organisation's budget out of code did
 * not alter a single figure it publishes — a refactor that quietly restates
 * what a project costs is worse than no refactor, because the restatement goes
 * to funders under the applicant's signature.
 */

import { describe, it, expect } from 'vitest';
import { composeGesuchDokument } from '@/lib/domain/gesuch-composer';
import {
  makeBudget,
  makeFoundation,
  makeOtherBudget,
  makeStory,
  makeTenant,
} from '@/lib/domain/__tests__/fixtures';

const STORY = makeStory();

describe('the migrated budget publishes exactly what it published before', () => {
  /**
   * Pinned from the pre-migration module, measured before anything moved.
   *
   * These are not "the right numbers" — see the inconsistencies recorded in
   * `budget-engine.ts` and `composeBudget()`. They are the numbers this
   * organisation is currently sending to funders, and this test exists so that
   * changing them is a deliberate act with a failing test attached, rather than
   * a side effect of moving content into a row.
   */
  const PINNED = [
    { year: 'Jahr 1', einmalig: 107_500, stiftungen: 344_000, eigen: 100_000, total: 551_500 },
    { year: 'Jahr 2', einmalig: 0, stiftungen: 256_280, eigen: 140_000, total: 396_280 },
    { year: 'Jahr 3', einmalig: 0, stiftungen: 164_432, eigen: 195_000, total: 359_432 },
  ];

  it('the three-year table is unchanged', () => {
    const budget = makeBudget();
    const table = budget.threeYearTable(budget.defaultScenario());

    expect(
      table.rows.map(({ year, einmalig, stiftungen, eigen, total }) => ({
        year,
        einmalig,
        stiftungen,
        eigen,
        total,
      })),
    ).toEqual(PINNED);
    expect(table.stiftungen3yTotal).toBe(872_212);
    expect(table.eigen3yTotal).toBe(435_000);
    expect(table.project3yTotal).toBe(1_307_212);
  });

  it('the project duration line is unchanged', () => {
    expect(makeBudget().projectDuration()).toBe(
      '3 Jahre (2026–2028): Aufbau → Wachstum → Verselbständigung',
    );
  });
});

describe('the budget in a Gesuch belongs to the applicant', () => {
  const FOUNDATION = makeFoundation();

  it('a different organisation gets different figures', () => {
    // A funder with no stated range, so the ask is driven by the applicant's
    // own funding gap rather than capped by the funder's maximum — which is
    // legitimately the same number for both when a cap applies.
    const openRange = makeFoundation({ amount: { min: null, max: null, text: 'k.A.' } });
    const mine = composeGesuchDokument(STORY, makeBudget(), openRange);
    const theirs = composeGesuchDokument(STORY, makeOtherBudget(), openRange);

    expect(mine.budget!.project3yTotal).not.toBe(theirs.budget!.project3yTotal);
    expect(mine.budget!.requestedAmount).not.toBe(theirs.budget!.requestedAmount);
    // Line items are the concrete costs a funder reads line by line. No id may
    // be shared: those are the rows that used to be one organisation's rent and
    // equipment printed in everybody's application.
    const mineIds = mine.budget!.lineItems.map((i) => i.id);
    const theirIds = theirs.budget!.lineItems.map((i) => i.id);
    expect(mineIds.filter((id) => theirIds.includes(id))).toEqual([]);
  });

  it('an organisation with no budget composes a Gesuch with no figures', () => {
    // Not an error, and not zeros. A grant application missing its budget is
    // visibly incomplete; one carrying somebody else's looks finished.
    const dok = composeGesuchDokument(STORY, null, FOUNDATION);

    expect(dok.budget).toBeUndefined();
    expect(dok.ready).toBe(true);
    expect(JSON.stringify(dok)).not.toContain('344000');
  });

  it('a scenario id outside one organisation’s three tiers is valid content', () => {
    // The schema used to enum this to minimal/moderate/maximum, so an
    // organisation whose funding does not come in those three shapes could not
    // state a budget at all.
    expect(
      makeOtherBudget()
        .scenarios()
        .map((s) => s.id),
    ).toEqual(['ensemble']);
  });

  it('a budget whose default names no scenario fails loudly', () => {
    // Falling back to "the first scenario" would put an arbitrary set of
    // figures into a grant document, which is the failure this whole migration
    // is about.
    const broken = makeBudget(makeTenant(), {
      PROJECT: {
        startYear: 2026,
        endYear: 2028,
        durationLabel: 'x',
        yearLabels: ['a', 'b', 'c'],
        defaultScenarioId: 'does-not-exist',
      },
    });
    expect(() => broken.defaultScenario()).toThrow(/matches no scenario/);
  });
});
