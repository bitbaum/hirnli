import { z } from 'zod';

// Evidence citation
export const evidenceSchema = z.object({
  title: z.string(),
  year: z.number(),
  claim: z.string(),
  url: z.string(),
});
export type Evidence = z.infer<typeof evidenceSchema>;

// WHY section (Page 1 of Gesuch)
export const whySectionSchema = z.object({
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
export const competencySectionSchema = z.object({
  headline: z.string(),
  capabilities: z.array(z.string()),
  partners: z.array(z.string()).optional(),
});
export type CompetencySection = z.infer<typeof competencySectionSchema>;

// Project template
export const projectSchema = z.object({
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
export const budgetLineItemSchema = z.object({
  item: z.string(),
  amount: z.string(),
  percent: z.string(),
  note: z.string(),
});
export type BudgetLineItem = z.infer<typeof budgetLineItemSchema>;

// Core facts
export const coreFacts = z.object({
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
      co2_per_desktop: z.number(),
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
