import { z } from 'zod';

// Source types for metrics
export const MetricSourceType = z.enum([
  'source',
  'derived',
  'estimated',
  'calculated',
  'target',
  'capacity',
]);
export type MetricSourceType = z.infer<typeof MetricSourceType>;

// Confidence levels
export const Confidence = z.enum(['high', 'medium', 'low']);
export type Confidence = z.infer<typeof Confidence>;

// Format types
const MetricFormat = z.enum(['CHF', 'percent', 'integer', 'tonnes', 'kg', 'range']);
type MetricFormat = z.infer<typeof MetricFormat>;

// Validation rule
const validationRuleSchema = z.object({
  type: z.string(),
  min: z.number().optional(),
  max: z.number().optional(),
  message: z.string().optional(),
});

// Metric source definition
const metricSourceSchema = z.object({
  type: MetricSourceType,
  confidence: Confidence,
  path: z.string().optional(),
  account: z.string().optional(),
  lastUpdated: z.string().nullable().optional(),
  assumption: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
});

// Metric formula
const metricFormulaSchema = z
  .object({
    type: z.string(),
    expression: z.string(),
    dependencies: z.array(z.string()).optional(),
  })
  .optional();

// Metric documentation
const metricDocSchema = z.object({
  description: z.string(),
  drivers: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
  target: z.number().optional(),
  link: z.string(),
  whyItMatters: z.string().optional(),
});

// Full metric entry
export const metricSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  dimension: z.string(),
  format: MetricFormat,
  source: metricSourceSchema,
  formula: metricFormulaSchema,
  validation: z.object({
    rules: z.array(validationRuleSchema),
  }),
  documentation: metricDocSchema,
});
export type Metric = z.infer<typeof metricSchema>;
