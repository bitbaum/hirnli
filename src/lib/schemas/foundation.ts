import { z } from 'zod';

// ORG-SPECIFIC: Theme values match current org's focus areas
export const ThemeId = z.enum([
  'klima',
  'kreislaufwirtschaft',
  'soziale-integration',
  'digitale-bildung',
  'digitale-souveraenitaet',
  'zuerich',
  'arbeitsintegration',
]);
export type ThemeId = z.infer<typeof ThemeId>;

// Foundation types (Robert Schmuki classification)
export const FoundationType = z.enum(['A', 'B', 'C', 'D', 'network']);
export type FoundationType = z.infer<typeof FoundationType>;

// Research depth — computed from data completeness
export const ResearchDepth = z.enum(['rapid', 'standard', 'deep']);
export type ResearchDepth = z.infer<typeof ResearchDepth>;

// Quality tier — computed deterministically from data signals (never stored)
export const QualityTier = z.enum([
  'verzeichnet',       // Rank 1: Exists in Swiss registry. Name and UID only.
  'erfasst',           // Rank 2: Registry data available. Needs research.
  'profiliert',        // Rank 3: Automated profile from registry. Directional.
  'recherchiert',      // Rank 4: Verified website and direct contact.
  'anwendungsbereit',  // Rank 5: Apply now — we know how, where, and how much.
]);
export type QualityTier = z.infer<typeof QualityTier>;

// Foundation status
export const FoundationStatus = z.enum(['open', 'closed', 'rolling', 'soon']);
export type FoundationStatus = z.infer<typeof FoundationStatus>;

// Source IDs
export const SourceId = z.enum(['manual', 'fundraiso', 'stiftungschweiz', 'esa', 'zefix', 'website', 'cantonal']);
export type SourceId = z.infer<typeof SourceId>;

// Application methods
export const ApplicationMethod = z.enum([
  'online', 'post', 'email', 'contact', 'direct', 'personal',
  'partnership', 'via_partner', 'membership', 'contract', 'none', 'unknown',
  'invitation',
]);
export type ApplicationMethod = z.infer<typeof ApplicationMethod>;

// Research method — tracks HOW application info was verified
// Used to assess data quality and prioritize re-research
export const ApplicationResearchMethod = z.enum([
  'chatgpt-agent',   // ChatGPT actually visited the foundation's website (highest quality)
  'claude-agent',    // Claude internal Agent with WebSearch/WebFetch tools (good, no JS rendering)
  'chatgpt-search',  // ChatGPT used search/training data (may not reflect current state)
  'groq-pipeline',   // Automated Groq LLM inference from registry text (lowest quality)
  'manual',          // Human-verified directly
  'unknown',         // Provenance not tracked (legacy data)
]);
export type ApplicationResearchMethod = z.infer<typeof ApplicationResearchMethod>;

// Quality rank for each research method — higher = more trustworthy data
// SSOT: import this wherever upgrade logic or queue filtering is needed
export const RESEARCH_METHOD_RANK: Record<ApplicationResearchMethod, number> = {
  'manual':          4,  // Human-verified (gold standard)
  'chatgpt-agent':   3,  // ChatGPT with full browser (JS rendering, real navigation)
  'claude-agent':    2,  // Claude Agent (WebFetch/WebSearch, no JS rendering)
  'chatgpt-search':  2,  // ChatGPT search/training data (may be stale)
  'groq-pipeline':   1,  // Automated LLM triage from register text only
  'unknown':         0,  // Legacy, provenance unknown
};

// Methods considered "researched" — won't appear in the research queue
export const RESEARCHED_METHODS: ApplicationResearchMethod[] = ['chatgpt-agent', 'claude-agent', 'manual'];

// Theme definition
export const themeSchema = z.object({
  id: ThemeId,
  label: z.string(),
  icon: z.string(),
  description: z.string(),
  color: z.string(),
});
export type Theme = z.infer<typeof themeSchema>;

// Source definition
export const sourceSchema = z.object({
  id: SourceId,
  label: z.string(),
  url: z.string().optional(),
  description: z.string(),
});
export type Source = z.infer<typeof sourceSchema>;

// Foundation amount range
const amountSchema = z.object({
  min: z.number().nullable(),
  max: z.number().nullable(),
  text: z.string(),
});

// Foundation contact
const contactSchema = z.object({
  address: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
}).optional();

// Source link (where we found this foundation on aggregator sites)
const sourceLinkSchema = z.object({
  source: SourceId,
  url: z.string(),
  label: z.string().optional(),
});

// Foundation deadline entry
const deadlineEntrySchema = z.object({
  date: z.string(),
  response: z.string(),
});

// Foundation criteria
const criteriaSchema = z.object({
  nature: z.string().optional(),
  education: z.string().optional(),
}).optional();

// ===========================================================================
// Layer 1: Registry — Universal facts about a foundation (org-agnostic)
// ===========================================================================
// Data that survives org swaps and can be bulk-imported from ESA/Zefix/Fundraiso.

export const registrySchema = z.object({
  // Identity
  slug: z.string(),
  name: z.string(),
  uid: z.string().optional(),
  websiteUrl: z.string().optional(),
  applicationUrl: z.string().optional(),
  officialPurpose: z.string().optional(), // Legal Zweckbeschreibung from ESA/Zefix register

  // Location
  region: z.string(),
  contact: contactSchema,

  // Governance
  founded: z.number().nullable().optional(),
  capital: z.string().optional(),
  annualBudget: z.string().optional(),
  totalBudget: z.string().optional(),
  grantExpenditure: z.string().optional(),
  supervisoryAuthority: z.string().optional(),
  boardMembers: z.array(z.object({
    name: z.string(),
    role: z.string(),
  })).optional(),
  memberships: z.array(z.string()).optional(),

  // Applications
  acceptsApplications: z.enum(['yes', 'no', 'invitation_only', 'unknown']).optional(),
  applicationMethod: ApplicationMethod,
  applicationResearchMethod: ApplicationResearchMethod.optional(),
  applicationProcess: z.array(z.string()).optional(),
  isOperative: z.boolean().optional(),
  isPartnership: z.boolean().optional(),
  isNetwork: z.boolean().optional(),
  requiresOpenSource: z.boolean().optional(),
  requiresPartner: z.boolean().optional(),
  requiresContract: z.boolean().optional(),

  // Timing
  status: FoundationStatus,
  deadline: z.string().nullable().optional(),
  deadlineText: z.string(),
  nextDeadline: z.string().optional(),
  deadlines: z.array(deadlineEntrySchema).optional(),
  responseTime: z.string().optional(),
  decisionCycle: z.string().optional(),

  // Funding
  amount: amountSchema,
  criteria: criteriaSchema,
  smallProjects: z.object({ max: z.number(), text: z.string() }).optional(),

  // Relationships
  pastGrantees: z.array(z.string()).optional(),
  partners: z.array(z.string()).optional(),
  stats2025: z.string().optional(),
  sdgs: z.array(z.number()).optional(),

  // Meta
  sourceLinks: z.array(sourceLinkSchema).optional(),
  source: SourceId,
  purposeSummary: z.string().optional(),
});
export type FoundationRegistry = z.infer<typeof registrySchema>;

// ===========================================================================
// Layer 2: Analysis — Per-org assessment (org-specific)
// ===========================================================================
// Fields that differ per organization analyzing the same foundation.

export const analysisSchema = z.object({
  // -- Scoring (see CLAUDE.md § Scoring Model) --------------------------------
  // fitScore is the ONLY stored fit metric. Display stars computed via getFitLevel().
  fitScore: z.number().min(0).max(10).default(0),
  // priority is stored (1-4) or computed from Fit × Readiness.
  // priorityOverride=true means stored value takes precedence.
  priority: z.number().min(1).max(4),
  priorityOverride: z.boolean().optional(),

  // -- Classification ---------------------------------------------------------
  type: FoundationType,           // A/B/C/D/network — approach strategy
  themes: z.array(ThemeId),       // Input to fit scoring + Gesuch theming

  // -- Content ----------------------------------------------------------------
  tagline: z.string(),
  researchNotes: z.string().optional(),

  // -- Pipeline metadata (not used in domain scoring) -------------------------
  researchDate: z.string(),
  researchDepth: ResearchDepth.optional(),     // Pipeline bookkeeping only

  // -- Relationships ----------------------------------------------------------
  possiblePartners: z.array(z.string()).optional(),

  // -- Identity (for multi-org support) ---------------------------------------
  orgId: z.string().default('revamp-it'),
});
export type FoundationAnalysis = z.infer<typeof analysisSchema>;

// ===========================================================================
// Composed: Foundation — Merged view (registry + analysis)
// ===========================================================================
// Identical shape to the pre-split foundationSchema.
// All ~56 consumer files see the same Foundation type — zero breaking changes.
//
// Research quality is derived from readiness tier (computed, not stored).
// isResearched(f) = tier >= profiliert, computed from data completeness signals.
// Key signals: purposeSummary, researchNotes, contact, themes, websiteUrl.

// Raw composed schema before migration transform
const _foundationRaw = registrySchema.extend(
  analysisSchema.omit({ orgId: true }).shape
);

// Legacy fit→fitScore migration transform was removed alongside the
// deprecated `fit` schema field — all rows have been backfilled to use
// fitScore directly. Display level (0-3) is computed at render time
// via getFitLevel(f) in foundation-helpers.ts.
export const foundationSchema = _foundationRaw;
export type Foundation = z.output<typeof foundationSchema>;

// Type labels
export const typeLabelSchema = z.object({
  short: z.string(),
  long: z.string(),
  desc: z.string(),
  approach: z.string(),
});
export type TypeLabel = z.infer<typeof typeLabelSchema>;

// Status labels
export const statusLabelSchema = z.object({
  text: z.string(),
  class: z.string(),
  desc: z.string(),
});
export type StatusLabel = z.infer<typeof statusLabelSchema>;
