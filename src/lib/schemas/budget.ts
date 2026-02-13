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

// Atomic unit: single budget line item
export const BudgetLineItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['space', 'equipment', 'infrastructure', 'personnel', 'programs', 'operations']),
  amount: z.number().min(0, 'Amount cannot be negative'),
  type: z.enum(['einmalig', 'jaehrlich']),
  source: BudgetSourceSchema,
  subItems: z.array(z.object({
    label: z.string(),
    amount: z.number(),
    note: z.string().optional(),
  })).optional(),
  icon: z.string().optional(),
  isOptional: z.boolean().default(false),
});

// Scenario: collection of line items with 3-year financial model
export const BudgetScenarioSchema = z.object({
  id: z.enum(['minimal', 'moderate', 'maximum']),
  label: z.string().min(1),
  description: z.string().min(1),
  tagline: z.string().min(1),
  lineItemIds: z.array(z.string()), // References BudgetLineItem.id
  targetFoundations: z.array(z.string()), // Foundation types: ['A', 'B', 'C']
  spaceRequirement: z.object({
    min_sqm: z.number().min(0),
    max_sqm: z.number().min(0),
  }),
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
