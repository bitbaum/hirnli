/**
 * Foundation Config Patch — Domain logic for merging PATCH API data into config_data
 *
 * Maps flat DB column names (from updateFoundationSchema) to nested config_data structure.
 * Handles nested object merging for amount and contact fields.
 *
 * Extracted from /api/foundations/[id] PATCH handler to keep API route thin.
 */

interface PatchInput {
  fitScore?: number | null;
  priority?: number | null;
  applicationMethod?: string | null;
  focusAreas?: string[];
  name?: string;
  websiteUrl?: string | null;
  geographicScope?: string | null;
  applicationDeadline?: string | null;
  grantRangeMin?: number | null;
  grantRangeMax?: number | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactAddress?: string | null;
  strategicFit?: string | null;
  applicationNotes?: string | null;
  researchDepth?: string | null;
  organizationType?: string | null;
  typicalAmount?: number | null;
  fundingModel?: string | null;
  decisionTimeline?: string | null;
}

/**
 * Build merged config_data from flat PATCH fields + existing config.
 *
 * Field mapping (flat DB column → config_data key):
 * - focusAreas → themes
 * - geographicScope → region
 * - applicationDeadline → deadline
 * - grantRangeMin/Max → amount.min/max (nested merge)
 * - contactEmail/Phone → contact.email/phone (nested merge)
 * - All others: same key name
 */
export function mergeConfigPatch(
  data: PatchInput,
  existingConfig: Record<string, unknown>,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  // Direct field mappings (flat → config_data)
  if (data.fitScore !== undefined) patch.fitScore = data.fitScore;
  if (data.priority !== undefined) patch.priority = data.priority;
  if (data.applicationMethod !== undefined) patch.applicationMethod = data.applicationMethod;
  if (data.focusAreas !== undefined) patch.themes = data.focusAreas;
  if (data.name !== undefined) patch.name = data.name;
  if (data.websiteUrl !== undefined) patch.websiteUrl = data.websiteUrl;
  if (data.geographicScope !== undefined) patch.region = data.geographicScope;
  if (data.applicationDeadline !== undefined) patch.deadline = data.applicationDeadline;
  if (data.strategicFit !== undefined) patch.strategicFit = data.strategicFit;
  if (data.applicationNotes !== undefined) patch.applicationNotes = data.applicationNotes;
  if (data.researchDepth !== undefined) patch.researchDepth = data.researchDepth;
  if (data.decisionTimeline !== undefined) patch.decisionTimeline = data.decisionTimeline;

  // Nested merge: amount (preserve existing min/max when only one changes)
  if (data.grantRangeMin !== undefined || data.grantRangeMax !== undefined) {
    const existingAmount = (existingConfig.amount ?? { min: null, max: null }) as Record<string, unknown>;
    patch.amount = {
      ...existingAmount,
      ...(data.grantRangeMin !== undefined ? { min: data.grantRangeMin } : {}),
      ...(data.grantRangeMax !== undefined ? { max: data.grantRangeMax } : {}),
    };
  }

  // Nested merge: contact (preserve existing email/phone/address when only one changes)
  if (data.contactEmail !== undefined || data.contactPhone !== undefined || data.contactAddress !== undefined) {
    const existingContact = (existingConfig.contact ?? {}) as Record<string, unknown>;
    patch.contact = {
      ...existingContact,
      ...(data.contactEmail !== undefined ? { email: data.contactEmail } : {}),
      ...(data.contactPhone !== undefined ? { phone: data.contactPhone } : {}),
      ...(data.contactAddress !== undefined ? { address: data.contactAddress } : {}),
    };
  }

  return { ...existingConfig, ...patch };
}
