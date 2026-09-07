/**
 * The funding-model half of one organisation's budget content.
 *
 * Split out of `fundraising/data.ts`, where it sat between page-level
 * derivations, because it is content in exactly the sense the rest of this
 * migration means: a claim this organisation makes to funders about how its
 * grant steps down over three years. It seeds `org_content['budget']` and is
 * read from code only by the organisation it was written for.
 *
 * The percentages are preserved verbatim from `data.ts`. They do NOT agree with
 * the year-2 and year-3 figures the scenarios themselves declare — see
 * `budget-engine.ts` — and reconciling them changes a live customer's published
 * numbers, which is their call and not a refactor's.
 */

export const CODE_BUDGET_MODEL = {
  // Standard Swiss 3-year model: foundations expect 25-50% reduction/year.
  // Eigenleistung aligned to the bottom-up revenue model: 100k → 140k → 195k.
  DEGRESSIVE: {
    year2: { stiftungenPct: 0.745, eigenGrowth: 40_000 },
    year3: { stiftungenPct: 0.478, eigenGrowth: 95_000 },
  },
  PROJECT: {
    startYear: 2026,
    endYear: 2028,
    durationLabel: 'Aufbau → Wachstum → Verselbständigung',
    yearLabels: ['Aufbau', 'Wachstum', 'Verselbständigung'],
    defaultScenarioId: 'moderate',
  },
} as const;
