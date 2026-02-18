/**
 * Research Pipeline Types — Zod schemas for structured research output
 *
 * These schemas define the data structures flowing through the pipeline:
 *   screening → queue → prepare (fetch context) → Claude Code analysis → draft → review → DB
 *
 * The analysis itself happens in Claude Code conversation — no separate API key needed.
 *
 * SSOT: All types derived from these Zod schemas via z.infer<>.
 */

import { z } from 'zod';
import { ThemeId, FoundationType } from '../../src/lib/schemas/foundation';

// ============================================================================
// RESEARCH ANALYSIS — Structured output written by Claude Code
// ============================================================================

export const ResearchAnalysisSchema = z.object({
  isFunder: z.boolean(),
  funderConfidence: z.enum(['high', 'medium', 'low']),
  reasoning: z.string(),
  themes: z.array(ThemeId),
  suggestedType: FoundationType,
  suggestedFit: z.number().int().min(1).max(3),
  suggestedPriority: z.number().int().min(1).max(4),
  purposeSummary: z.string().min(150),
  researchNotes: z.string().min(250),
  applicationMethod: z.enum(['online', 'email', 'invitation', 'unknown']),
  contactInfo: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  grantRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    typical: z.number().optional(),
  }),
  warnings: z.array(z.string()),
});

export type ResearchAnalysis = z.infer<typeof ResearchAnalysisSchema>;

// ============================================================================
// QUEUE ITEM — Priority-ordered candidate for research
// ============================================================================

export const ResearchQueueItemSchema = z.object({
  name: z.string(),
  slug: z.string(),
  tier: z.number().int().min(1).max(4),
  evScore: z.number(),
  websiteUrl: z.string().optional(),
  esaMatch: z.object({
    uid: z.string(),
    name: z.string(),
    purpose: z.string(),
    canton: z.string(),
    city: z.string(),
    status: z.string(),
  }),
  candidate: z.object({
    name: z.string(),
    slug: z.string().optional(),
    location: z.string().optional(),
    foundVia: z.array(z.string()).optional(),
    url: z.string().optional(),
  }),
  scores: z.object({
    funderScore: z.number(),
    operatorScore: z.number(),
    socialScore: z.number(),
    confidence: z.enum(['high', 'medium', 'low']),
  }).optional(),
});

export type ResearchQueueItem = z.infer<typeof ResearchQueueItemSchema>;

// ============================================================================
// RESEARCH DRAFT — Full draft ready for human review
// ============================================================================

export const ResearchDraftSchema = z.object({
  slug: z.string(),
  name: z.string(),
  timestamp: z.string(),
  queueItem: ResearchQueueItemSchema,
  websiteContent: z.string().optional(),
  analysis: ResearchAnalysisSchema,
});

export type ResearchDraft = z.infer<typeof ResearchDraftSchema>;

// ============================================================================
// QUEUE FILE — The full queue output
// ============================================================================

export const ResearchQueueSchema = z.object({
  date: z.string(),
  sourceScreening: z.string(),
  totalCandidates: z.number(),
  items: z.array(ResearchQueueItemSchema),
});

export type ResearchQueue = z.infer<typeof ResearchQueueSchema>;
