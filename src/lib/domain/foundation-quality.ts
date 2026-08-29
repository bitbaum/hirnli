import type { Foundation } from '../schemas/foundation';
import { isResearched } from './foundation-helpers';
import { QUALITY_THRESHOLDS } from '../config/fit-scoring';
import { isRegistryUrl } from '../config/registry-domains';

interface QualityViolation {
  slug: string;
  issues: string[];
}

/**
 * Validates that researched foundations (tier >= profiliert) meet the quality bar.
 * Called at import time in foundations/index.ts — violations warn in dev, log in prod.
 *
 * Thresholds defined in QUALITY_THRESHOLDS (lib/config/fit-scoring.ts).
 * Additional checks: contact, themes, websiteUrl.
 */
export function validateFoundationQuality(data: Foundation[]): QualityViolation[] {
  const violations: QualityViolation[] = [];

  for (const f of data) {
    if (!isResearched(f)) continue; // Only validate researched entries (tier >= profiliert)

    const issues: string[] = [];

    const { purposeSummaryMinChars, researchNotesMinChars } = QUALITY_THRESHOLDS;
    if (!f.purposeSummary || f.purposeSummary.length < purposeSummaryMinChars) {
      issues.push(
        `purposeSummary missing or too short (${f.purposeSummary?.length ?? 0} chars, min ${purposeSummaryMinChars})`,
      );
    }
    if (!f.researchNotes || f.researchNotes.length < researchNotesMinChars) {
      issues.push(
        `researchNotes missing or too short (${f.researchNotes?.length ?? 0} chars, min ${researchNotesMinChars})`,
      );
    }
    if (!f.contact || (!f.contact.email && !f.contact.phone && !f.contact.address)) {
      issues.push('contact missing (need at least email, phone, or address)');
    }
    if (!f.themes || f.themes.length === 0) {
      issues.push('no themes assigned');
    }
    // Operative foundations often have no public grant application website — skip URL check
    if (!f.isOperative) {
      if (!f.websiteUrl) {
        issues.push('websiteUrl missing');
      } else if (isRegistryUrl(f.websiteUrl)) {
        issues.push('websiteUrl is a registry/directory link, not foundation website');
      }
    }

    if (issues.length > 0) {
      violations.push({ slug: f.slug, issues });
    }
  }

  return violations;
}
