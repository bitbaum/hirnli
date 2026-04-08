/**
 * Foundation API Validation Schemas — SSOT for API input validation
 *
 * All foundation API routes import from here. Only indexed flat columns
 * appear as top-level fields; all domain data goes into configData JSONB.
 */

import { z } from 'zod';

/** Shared fields for foundation create/update */
const foundationBaseFields = {
  fitScore: z.number().min(0).max(10).optional().nullable(),
  priority: z.number().min(1).max(4).optional().nullable(),
  researchDepth: z.enum(['rapid', 'standard', 'deep']).optional().nullable(),
  configData: z.record(z.string(), z.unknown()).optional(),
};

/** POST /api/foundations — create a new foundation */
export const createFoundationSchema = z.object({
  name: z.string().min(1),
  source: z.string().optional().nullable(),
  ...foundationBaseFields,
});

/** PATCH /api/foundations/[id] — partial update */
export const updateFoundationSchema = z.object({
  name: z.string().min(1).optional(),
  ...foundationBaseFields,
});
