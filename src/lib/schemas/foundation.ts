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
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  themes: z.array(ThemeId),
  source: SourceId,
  researchDate: z.string(),
  uid: z.string().optional(),
  purposeSummary: z.string().optional(),
  needsResearch: z.boolean().optional(),
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
