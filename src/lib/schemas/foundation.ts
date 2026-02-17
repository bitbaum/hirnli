import { z } from 'zod';

// Theme IDs
export const ThemeId = z.enum([
  'klima',
  'kreislaufwirtschaft',
  'soziale-integration',
  'digitale-bildung',
  'digitale-souveraenitaet',
  'jugend',
  'zuerich',
  'arbeitsintegration',
]);
export type ThemeId = z.infer<typeof ThemeId>;

// Foundation types (Robert Schmuki classification)
export const FoundationType = z.enum(['A', 'B', 'C', 'D', 'network']);
export type FoundationType = z.infer<typeof FoundationType>;

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
]);
export type ApplicationMethod = z.infer<typeof ApplicationMethod>;

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

// ---------------------------------------------------------------------------
// Research Quality Gate
// ---------------------------------------------------------------------------
// needsResearch: false requires ALL of:
//   1. purposeSummary — what the foundation funds and why
//   2. researchNotes  — strategic fit analysis for Revamp-IT
//   3. contact        — how to reach them (address/email/phone)
// Optional but recommended for needsResearch: false:
//   4. applicationProcess — step-by-step how to apply
//   5. sourceLinks        — where we found this info
// ---------------------------------------------------------------------------

// Foundation entry
export const foundationSchema = z.object({
  slug: z.string(),
  name: z.string(),
  type: FoundationType,
  status: FoundationStatus,
  deadline: z.string().nullable().optional(),
  deadlineText: z.string(),
  nextDeadline: z.string().optional(),
  deadlines: z.array(deadlineEntrySchema).optional(),
  responseTime: z.string().optional(),
  decisionCycle: z.string().optional(),
  amount: amountSchema,
  fit: z.number().min(1).max(3),
  priority: z.number().min(1).max(4),
  tagline: z.string(),
  founded: z.number().nullable().optional(),
  annualBudget: z.string().optional(),
  capital: z.string().optional(),
  totalBudget: z.string().optional(),
  region: z.string(),
  applicationUrl: z.string().optional(),
  websiteUrl: z.string(),
  applicationMethod: ApplicationMethod,
  contact: contactSchema,
  themes: z.array(ThemeId),
  source: SourceId,
  researchDate: z.string(),
  uid: z.string().optional(),
  // Whether this foundation accepts unsolicited applications from any eligible org.
  // 'yes' = open submissions, 'no' = closed/no-applications, 'invitation_only' = by invite only,
  // 'unknown' = not yet researched (default assumption — does not affect screening)
  acceptsApplications: z.enum(['yes', 'no', 'invitation_only', 'unknown']).optional(),
  purposeSummary: z.string().optional(),
  needsResearch: z.boolean(), // required — see Quality Gate above
  researchNotes: z.string().optional(),
  isOperative: z.boolean().optional(),
  isPartnership: z.boolean().optional(),
  isNetwork: z.boolean().optional(),
  requiresOpenSource: z.boolean().optional(),
  requiresPartner: z.boolean().optional(),
  requiresContract: z.boolean().optional(),
  possiblePartners: z.array(z.string()).optional(),
  sdgs: z.array(z.number()).optional(),
  sourceLinks: z.array(sourceLinkSchema).optional(),
  applicationProcess: z.array(z.string()).optional(),
  criteria: criteriaSchema,
  smallProjects: z.object({ max: z.number(), text: z.string() }).optional(),
  stats2025: z.string().optional(),
  members: z.string().optional(),
  events: z.array(z.string()).optional(),
  partners: z.array(z.string()).optional(),
  // Registry-level data (from Fundraiso, Zefix, ESA, foundation websites)
  grantExpenditure: z.string().optional(), // e.g., "CHF 53 Mio./Jahr"
  boardMembers: z.array(z.object({
    name: z.string(),
    role: z.string(), // e.g., "Präsident", "Geschäftsführerin", "Mitglied"
  })).optional(),
  pastGrantees: z.array(z.string()).optional(), // Org names they've funded
  supervisoryAuthority: z.string().optional(), // e.g., "Eidg. Stiftungsaufsicht" or cantonal
  memberships: z.array(z.string()).optional(), // e.g., ["SwissFoundations", "proFonds"]
});
export type Foundation = z.infer<typeof foundationSchema>;

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
