import { z } from 'zod';

// Raw financial row from Kivitendo export
const financialRowSchema = z.object({
  year: z.number(),
  month: z.number().min(1).max(12),
  account_code: z.string(),
  account_name: z.string(),
  category: z.string(),
  subcategory: z.string(),
  value: z.number(),
});
export type FinancialRow = z.infer<typeof financialRowSchema>;

// Year data container
export const yearDataSchema = z.object({
  year: z.number(),
  source: z.string(),
  imported_at: z.string(),
  data: z.array(financialRowSchema),
});
export type YearData = z.infer<typeof yearDataSchema>;

// Monthly aggregate (computed from raw rows)
export const monthlyAggregateSchema = z.object({
  period: z.string(),
  year: z.number(),
  month: z.number(),
  warenverkauf: z.number(),
  dienstleistungen: z.number(),
  integration: z.number(),
  spenden: z.number(),
  aufstockung: z.number(),
  total: z.number(),
});
export type MonthlyAggregate = z.infer<typeof monthlyAggregateSchema>;

// Source info for traceability
const sourceInfoSchema = z.object({
  file: z.string(),
  system: z.string(),
  importedAt: z.string(),
  methodology: z.string(),
  confidence: z.string(),
});
export type SourceInfo = z.infer<typeof sourceInfoSchema>;

// Sum with source (for traceable calculations)
export const sumWithSourceSchema = z.object({
  value: z.number(),
  source: sourceInfoSchema,
  calculation: z.object({
    operation: z.string(),
    column: z.string(),
    count: z.number(),
    values: z.array(z.number()),
  }),
});
export type SumWithSource = z.infer<typeof sumWithSourceSchema>;
