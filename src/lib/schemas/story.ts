import { z } from 'zod';

// Evidence citation
const evidenceSchema = z.object({
  title: z.string(),
  year: z.number(),
  claim: z.string(),
  url: z.string(),
});
export type Evidence = z.infer<typeof evidenceSchema>;

// WHY section (Page 1 of Gesuch)
const whySectionSchema = z.object({
  headline: z.string(),
  hook: z.string(),
  problem: z.string(),
  solution: z.string(),
  evidence: z.array(z.string()),
  metrics: z.array(z.string()),
  call_to_action: z.string(),
});
export type WhySection = z.infer<typeof whySectionSchema>;

// HOW competency section
const competencySectionSchema = z.object({
  headline: z.string(),
  capabilities: z.array(z.string()),
  partners: z.array(z.string()).optional(),
  evidence: z.array(z.string()).optional(), // keys into EVIDENCE registry
});
export type CompetencySection = z.infer<typeof competencySectionSchema>;

// Project template
const projectSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  summary: z.string(),
  goals: z.array(z.string()),
  activities: z.array(z.string()),
  outcomes: z.array(z.string()),
  budget_category: z.string(),
  themes: z.array(z.string()),
});
export type Project = z.infer<typeof projectSchema>;

// Budget line item
const budgetLineItemSchema = z.object({
  item: z.string(),
  amount: z.string(),
  percent: z.string(),
  note: z.string(),
});
type BudgetLineItem = z.infer<typeof budgetLineItemSchema>;

// Proof point (track record evidence)
const proofPointSchema = z.object({
  label: z.string(),
  value: z.string(),
  metric_id: z.string().optional(),
});
type ProofPoint = z.infer<typeof proofPointSchema>;

// Track record
const trackRecordSchema = z.object({
  headline: z.string(),
  text: z.string(),
  proof_points: z.array(proofPointSchema),
});
export type TrackRecord = z.infer<typeof trackRecordSchema>;

// Core facts
const coreFacts = z.object({
  organization: z.object({
    name: z.string(),
    legalForm: z.string(),
    founded: z.number(),
    location: z.string(),
    address: z.string(),
    team_size: z.number(),
    website: z.string(),
  }),
  metrics: z.object({
    financial: z.object({
      self_financing_rate: z.string(),
      monthly_target: z.string(),
    }),
    environmental: z.object({
      co2_per_laptop: z.number(),
      device_lifespan_extension: z.number(),
      reuse_rate: z.number(),
      co2_total: z.string(),
      devices: z.string(),
      ewaste: z.string(),
    }),
    social: z.object({
      practitioners_total: z.string(),
      success_rate: z.string(),
      capacity: z.string(),
    }),
  }),
  activities: z.array(z.string()),
  unique: z.array(z.string()),
});
export type CoreFacts = z.infer<typeof coreFacts>;

// Anecdote template (placeholder text with [bracket markers])
const anecdoteSchema = z.object({
  id: z.string(),
  template: z.string(),
  themes: z.array(z.string()),
  placement: z.enum(['why', 'how']),
});
export type Anecdote = z.infer<typeof anecdoteSchema>;

// Photo slot placeholder
const photoSlotSchema = z.object({
  id: z.string(),
  description: z.string(),
  placement: z.enum(['why', 'how', 'projects', 'kurzportrait']),
  themes: z.array(z.string()).optional(),
});
export type PhotoSlot = z.infer<typeof photoSlotSchema>;
