import { z } from 'zod';

// Inspector source type — used by MetricCard, NumberInspector, and Badge
export const InspectorSourceType = z.enum(['live', 'derived', 'estimated', 'none']);
export type InspectorSourceType = z.infer<typeof InspectorSourceType>;

// Data shape for the NumberInspector modal
export const inspectorDataSchema = z.object({
  label: z.string(),
  value: z.string(),
  sourceType: InspectorSourceType,
  source: z.string(),
  account: z.string().optional(),
  formula: z.string().optional(),
  updated: z.string().optional(),
  confidence: z.string().optional(),
  description: z.string().optional(),
});
export type InspectorData = z.infer<typeof inspectorDataSchema>;
