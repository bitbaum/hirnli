import { z } from 'zod';

/**
 * Budget Schemas - SSOT for all budget data structures
 *
 * Following Zod-first pattern:
 * 1. Define Zod schemas
 * 2. Derive TypeScript types from schemas
 * 3. Never define types separately
 */

// Source attribution - every budget number needs this
export const BudgetSourceSchema = z.object({
  methodology: z.string().min(1, 'Methodology is required'),
  calculation: z.string().optional(),
  marketResearch: z.string().optional(),
  confidence: z.enum(['high', 'medium', 'estimated']),
  lastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date (YYYY-MM-DD)'),
  notes: z.string().optional(),
});

// Theme-specific label override for Robert Rule III (same cost, different framing)
export const ThemeLabelSchema = z.object({
  label: z.string(),
  description: z.string(),
});

// Atomic unit: single budget line item
export const BudgetLineItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['space', 'equipment', 'infrastructure', 'personnel', 'programs', 'operations']),
  amount: z.number().min(0, 'Amount cannot be negative'),
  type: z.enum(['einmalig', 'jaehrlich']),
  source: BudgetSourceSchema,
  subItems: z
    .array(
      z.object({
        label: z.string(),
        amount: z.number(),
        note: z.string().optional(),
      }),
    )
    .optional(),
  icon: z.string().optional(),
  isOptional: z.boolean().optional(),
  themeLabels: z.record(z.string(), ThemeLabelSchema).optional(),
});

// Scenario: collection of line items with 3-year financial model
export const BudgetScenarioSchema = z.object({
  /**
   * The scenario's own name.
   *
   * Was `z.enum(['minimal','moderate','maximum'])` — one organisation's three
   * funding tiers, enforced by the platform on every tenant. A theatre asking
   * for a season's running costs had no valid id to give, so the schema made
   * the shared budget unavoidable rather than merely convenient.
   */
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  tagline: z.string().min(1),
  lineItemIds: z.array(z.string()), // References BudgetLineItem.id
  targetFoundations: z.array(z.string()), // Foundation types: ['A', 'B', 'C']
  /**
   * Optional: plenty of projects need no premises, and requiring square metres
   * of an organisation that has none forces an invented number into a budget a
   * funder reads.
   */
  spaceRequirement: z
    .object({
      min_sqm: z.number().min(0),
      max_sqm: z.number().min(0),
    })
    .optional(),
  threeYearModel: z.object({
    year1: z.object({
      einmalig: z.number().min(0),
      jaehrlich: z.number().min(0),
      eigenleistung: z.number().min(0),
    }),
    year2: z.object({
      jaehrlich: z.number().min(0),
      eigenleistung: z.number().min(0),
    }),
    year3: z.object({
      jaehrlich: z.number().min(0),
      eigenleistung: z.number().min(0),
    }),
  }),
});

// Eigenleistung (volunteer value) configuration
export const EigenleistungConfigSchema = z.object({
  label: z.string(),
  description: z.string(),
  ratePerHour: z.number().min(0),
  year1: z.number().min(0),
  year2: z.number().min(0),
  year3: z.number().min(0),
  source: BudgetSourceSchema,
});

/**
 * TypeScript types derived from Zod schemas
 * NEVER define these separately - always infer from schema
 */
export type BudgetSource = z.infer<typeof BudgetSourceSchema>;
export type BudgetLineItem = z.infer<typeof BudgetLineItemSchema>;
export type BudgetScenario = z.infer<typeof BudgetScenarioSchema>;
export type EigenleistungConfig = z.infer<typeof EigenleistungConfigSchema>;

/**
 * Category labels for UI display
 */
export const BUDGET_CATEGORY_LABELS = {
  space: '🏢 Raum & Infrastruktur',
  equipment: '🔧 Ausstattung',
  infrastructure: '🖥️ IT & Technologie',
  personnel: '👥 Personal',
  programs: '📚 Programme',
  operations: '⚙️ Betrieb',
} as const;

export type BudgetCategory = keyof typeof BUDGET_CATEGORY_LABELS;

// ============================================================================
// Block-level shape — what `org_content['budget']` holds
// ============================================================================
//
// The budget was a 592-line module whose own header declared itself specific to
// one organisation and told the reader that supporting another meant rewriting
// the file's content. That instruction is the defect: a platform cannot require
// a customer to open a pull request to state what its project costs. Until
// then every applicant's Gesuch carried one organisation's rent, equipment,
// staffing and three-year funding model — as their own budget, to a funder.
//
// (The name that header used is deliberately not quoted here. A comment
// describing a leak is still a copy of it, and the trace ratchet counts it.)

/**
 * How years two and three step down from year one.
 *
 * Content, not arithmetic: the shape of a degressive grant is a claim the
 * applicant makes to a funder about becoming self-sufficient, and different
 * organisations make different ones. Stored per tenant so it can be stated
 * rather than inherited.
 */
export const degressiveModelSchema = z.object({
  year2: z.object({ stiftungenPct: z.number(), eigenGrowth: z.number() }),
  year3: z.object({ stiftungenPct: z.number(), eigenGrowth: z.number() }),
});
export type DegressiveModel = z.infer<typeof degressiveModelSchema>;

/** When the project runs and what the applicant calls its phases. */
export const budgetProjectSchema = z.object({
  startYear: z.number().int(),
  endYear: z.number().int(),
  /** e.g. "Aufbau → Wachstum → Verselbständigung" */
  durationLabel: z.string(),
  yearLabels: z.array(z.string()).length(3),
  /** The scenario shown when nothing selects one. Must exist in SCENARIOS. */
  defaultScenarioId: z.string(),
});

export const budgetBlockSchema = z.object({
  LINE_ITEMS: z.array(BudgetLineItemSchema),
  SCENARIOS: z.array(BudgetScenarioSchema),
  EIGENLEISTUNG: EigenleistungConfigSchema,
  DEGRESSIVE: degressiveModelSchema,
  PROJECT: budgetProjectSchema,
});
export type BudgetBlock = z.infer<typeof budgetBlockSchema>;
