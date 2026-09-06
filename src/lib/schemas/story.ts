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
  evidence: z.array(z.string()).optional(), // keys into EVIDENCE registry
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

// Proof point (track record evidence)
export const proofPointSchema = z.object({
  label: z.string(),
  value: z.string(),
  metric_id: z.string().optional(),
});
export type ProofPoint = z.infer<typeof proofPointSchema>;

// Track record
export const trackRecordSchema = z.object({
  headline: z.string(),
  text: z.string(),
  proof_points: z.array(proofPointSchema),
});
export type TrackRecord = z.infer<typeof trackRecordSchema>;

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
  /**
   * The organisation's own key figures, grouped however it groups them.
   *
   * This was a fixed tree of one organisation's KPIs — `co2_per_laptop`,
   * `reuse_rate`, `practitioners_total`, a reintegration quota — required of
   * every tenant by the schema. A youth theatre would have had to declare a
   * carbon saving per laptop to pass validation, so the taxonomy of one
   * customer's business had become a rule the platform enforced on all of them.
   *
   * Groups and keys are now the tenant's, and the engine exposes each leaf to
   * content as `{{metrics.<group>.<key>}}`. Nothing in the platform reads a
   * named metric any more, which is what makes that safe.
   */
  metrics: z.record(z.string(), z.record(z.string(), z.union([z.string(), z.number()]))),
  activities: z.array(z.string()),
  unique: z.array(z.string()),
});
export type CoreFacts = z.infer<typeof coreFacts>;

// Anecdote template (placeholder text with [bracket markers])
export const anecdoteSchema = z.object({
  id: z.string(),
  template: z.string(),
  themes: z.array(z.string()),
  placement: z.enum(['why', 'how']),
});
export type Anecdote = z.infer<typeof anecdoteSchema>;

// Photo slot placeholder
export const photoSlotSchema = z.object({
  id: z.string(),
  description: z.string(),
  placement: z.enum(['why', 'how', 'projects', 'kurzportrait']),
  themes: z.array(z.string()).optional(),
});
export type PhotoSlot = z.infer<typeof photoSlotSchema>;

// ============================================================================
// Block-level shapes — what `org_content['stories']` holds
// ============================================================================
//
// These exist because the story stopped being a module and became a row. While
// it was a module, TypeScript checked its shape at build time and the composers
// could index into it freely. A row is checked by nobody, so every composer
// that reached into one would have been reaching into `unknown`.
//
// So the shapes above, which were already the SSOT for the pieces, are composed
// here into the whole. A tenant's stored story validates against exactly the
// structure the code version had to satisfy — which is what lets one engine
// serve both, and what makes "write your own story" a real offer rather than an
// invitation to produce something the composers cannot read.

/** One theme's competency slot, plus the track record every Gesuch opens with. */
export const howSectionSchema = z.object({
  track_record: trackRecordSchema,
  technical: competencySectionSchema,
  social: competencySectionSchema,
  environmental: competencySectionSchema,
  digital: competencySectionSchema,
  bildung: competencySectionSchema,
});
export type HowSection = z.infer<typeof howSectionSchema>;

/** A named partner and what the relationship actually is. */
export const partnerHighlightSchema = z.object({
  name: z.string(),
  relationship: z.string(),
  // The milestone belongs to the partnership, not the organisation — a tenant
  // whose partner is new has no "since", and that is a normal state, not a hole.
  since: z.string().optional(),
});
export type PartnerHighlight = z.infer<typeof partnerHighlightSchema>;

/** The opening and closing a cover letter uses for one foundation type. */
export const anschreibenTemplateSchema = z.object({
  opening: z.string(),
  closing: z.string(),
});

/**
 * Prose blocks rendered verbatim into the Gesuch.
 *
 * Typed rather than free-form because every one of these fields is read by name
 * in a component — a stored story missing `kurzportrait_subtitle` would render
 * an empty line in a document going to a funder, and silence is the wrong
 * failure for that.
 */
export const gesuchTextSchema = z.object({
  zusammenfassung_intro: z.string(),
  wirkungsmessung: z.object({
    indicators: z.string(),
    sustainability: z.string(),
  }),
  kurzportrait_subtitle: z.string(),
});
export type GesuchText = z.infer<typeof gesuchTextSchema>;

/**
 * One row of the Kurzportrait table — a claim the organisation makes about
 * itself, in its own words.
 *
 * These were six hardcoded rows naming one organisation's key figures:
 * placements supervised, reintegration rate, CO2 saved per laptop, reuse rate.
 * Every applicant's Kurzportrait printed them, so an organisation that does not
 * refurbish laptops still reported a saving per laptop to a funder.
 *
 * `value` is templated like any other content, so a row can cite a metric
 * (`{{metrics.environmental.reuse_rate}}%`) rather than freeze a copy of it —
 * which is what keeps a number that changes from disagreeing with itself
 * between the dashboard and the Gesuch.
 */
export const kurzportraitFactSchema = z.object({
  label: z.string(),
  value: z.string(),
});
export type KurzportraitFact = z.infer<typeof kurzportraitFactSchema>;

/**
 * The half of CoreFacts that is content rather than identity.
 *
 * `organization` is deliberately absent: name, legal form, founding year,
 * location, address and website live in `org_profiles` and are joined on read.
 * Storing them here too would give every one of them two sources that can
 * disagree — which is how a Gesuch ends up contradicting the Impressum.
 */
export const coreFactsContentSchema = z.object({
  team_size: z.number(),
  metrics: coreFacts.shape.metrics,
  activities: z.array(z.string()),
  unique: z.array(z.string()),
});
export type CoreFactsContent = z.infer<typeof coreFactsContentSchema>;
