/**
 * What a customer starts from when it has no budget yet.
 *
 * ── THE PROBLEM WITH A STARTER BUDGET ────────────────────────────────────────
 * Every other starter block carries "[Bitte ergänzen]" markers, because an
 * unfinished sentence reads as unfinished. A number cannot do that. "CHF 0"
 * reads as a measured result, and a three-year table of zeros in a grant
 * application is worse than no table: it says the project costs nothing.
 *
 * So this block is structurally complete and materially empty — one scenario,
 * no line items, zero amounts — and `composeBudget` treats a budget with no
 * line items exactly as it treats no budget at all: the Gesuch gets no budget
 * section. The customer fills in line items, and the section appears when there
 * is something true to put in it.
 *
 * The labels are prompts rather than placeholders for the same reason the
 * starter story's are: they tell the person what belongs there.
 */

const TODO = '[Bitte ergänzen]';

export const STARTER_BUDGET = {
  LINE_ITEMS: [] as unknown[],

  SCENARIOS: [
    {
      id: 'basis',
      label: 'Basis — Grundbetrieb',
      description: `${TODO}: Was umfasst dieses Szenario? Ein bis zwei Sätze.`,
      tagline: `${TODO}: Die Kurzformel, an der eine Stiftung erkennt, worum es geht.`,
      // Filled as line items are added: a scenario names the costs it is made
      // of, so this list and LINE_ITEMS grow together.
      lineItemIds: [] as string[],
      targetFoundations: ['A', 'B', 'C'],
      threeYearModel: {
        year1: { einmalig: 0, jaehrlich: 0, eigenleistung: 0 },
        year2: { jaehrlich: 0, eigenleistung: 0 },
        year3: { jaehrlich: 0, eigenleistung: 0 },
      },
    },
  ],

  EIGENLEISTUNG: {
    label: 'Eigenleistung',
    description: `${TODO}: Was tragen Sie selbst bei — Freiwilligenarbeit, eigene Einnahmen? Kein Cashflow, sondern ein bewerteter Beitrag.`,
    ratePerHour: 0,
    year1: 0,
    year2: 0,
    year3: 0,
    source: {
      methodology: `${TODO}: Woraus ergibt sich dieser Betrag?`,
      confidence: 'estimated' as const,
      lastVerified: new Date().toISOString().slice(0, 10),
    },
  },

  /**
   * How years two and three step down from year one.
   *
   * Starts flat — no assumed reduction — because a degressive curve is a
   * promise to a funder about becoming self-sufficient, and inventing one on a
   * customer's behalf makes that promise for them.
   */
  DEGRESSIVE: {
    year2: { stiftungenPct: 1, eigenGrowth: 0 },
    year3: { stiftungenPct: 1, eigenGrowth: 0 },
  },

  PROJECT: {
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 2,
    durationLabel: `${TODO}: Wie heissen die drei Phasen Ihres Vorhabens?`,
    yearLabels: ['Jahr 1', 'Jahr 2', 'Jahr 3'],
    defaultScenarioId: 'basis',
  },
};
