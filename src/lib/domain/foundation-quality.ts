import type { Foundation } from '../schemas/foundation';

export interface QualityViolation {
  slug: string;
  issues: string[];
}

/**
 * Validates that foundations marked needsResearch:false meet the quality bar.
 * Called at import time in foundations/index.ts — violations warn in dev, log in prod.
 *
 * Quality bar (see CLAUDE.md — Foundation Database Model):
 * - purposeSummary: 150+ chars
 * - researchNotes: 250+ chars
 * - contact: at least email, phone, or address
 * - themes: at least one assigned
 * - websiteUrl: present
 */
export function validateFoundationQuality(data: Foundation[]): QualityViolation[] {
  const violations: QualityViolation[] = [];

  for (const f of data) {
    if (f.needsResearch) continue; // Only validate "ready" entries

    const issues: string[] = [];

    if (!f.purposeSummary || f.purposeSummary.length < 150) {
      issues.push(`purposeSummary missing or too short (${f.purposeSummary?.length ?? 0} chars, min 150)`);
    }
    if (!f.researchNotes || f.researchNotes.length < 250) {
      issues.push(`researchNotes missing or too short (${f.researchNotes?.length ?? 0} chars, min 250)`);
    }
    if (!f.contact || (!f.contact.email && !f.contact.phone && !f.contact.address)) {
      issues.push('contact missing (need at least email, phone, or address)');
    }
    if (!f.themes || f.themes.length === 0) {
      issues.push('no themes assigned');
    }
    if (!f.websiteUrl) {
      issues.push('websiteUrl missing');
    }

    if (issues.length > 0) {
      violations.push({ slug: f.slug, issues });
    }
  }

  return violations;
}
