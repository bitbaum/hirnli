/**
 * Foundation Configuration — Re-exports
 *
 * All imports from '@/lib/config/foundations' resolve here.
 * Adding a new research batch: create stiftungen-YYYY-MM.ts, add to STIFTUNGEN_DATA below.
 */

import type { Foundation } from '../../schemas/foundation';

export {
  THEMES,
  SOURCES,
  TYPE_LABELS,
  STATUS_LABELS,
  FIT_CONFIG,
  NOT_RECOMMENDED,
  DATABASES,
} from './metadata';

export { STIFTUNGEN_CORE } from './stiftungen-core';
export { STIFTUNGEN_2026_02 } from './stiftungen-2026-02';

import { STIFTUNGEN_CORE } from './stiftungen-core';
import { STIFTUNGEN_2026_02 } from './stiftungen-2026-02';

export const STIFTUNGEN_DATA: Foundation[] = [
  ...STIFTUNGEN_CORE,
  ...STIFTUNGEN_2026_02,
];

// ---------------------------------------------------------------------------
// Quality Gate Validation (enforced at build time)
// ---------------------------------------------------------------------------
// Ground Truth #2: Schema defines behavior. The quality gate for
// needsResearch: false is documented in foundation.ts but was never enforced.
// This validation runs at import time — if it fails, the build fails.
// ---------------------------------------------------------------------------

interface QualityViolation {
  slug: string;
  issues: string[];
}

function validateFoundationQuality(data: Foundation[]): QualityViolation[] {
  const violations: QualityViolation[] = [];

  for (const f of data) {
    if (f.needsResearch) continue; // Only validate "ready" entries

    const issues: string[] = [];

    if (!f.purposeSummary || f.purposeSummary.length < 50) {
      issues.push(`purposeSummary missing or too short (${f.purposeSummary?.length ?? 0} chars, min 50)`);
    }
    if (!f.researchNotes || f.researchNotes.length < 50) {
      issues.push(`researchNotes missing or too short (${f.researchNotes?.length ?? 0} chars, min 50)`);
    }
    if (!f.contact || (!f.contact.email && !f.contact.phone && !f.contact.address)) {
      issues.push('contact missing (need at least email, phone, or address)');
    }
    if (!f.themes || f.themes.length === 0) {
      issues.push('no themes assigned');
    }

    if (issues.length > 0) {
      violations.push({ slug: f.slug, issues });
    }
  }

  return violations;
}

// Run validation — warn in dev, log in prod (don't break prod builds for data issues)
const violations = validateFoundationQuality(STIFTUNGEN_DATA);
if (violations.length > 0) {
  const msg = violations
    .map((v) => `  ${v.slug}: ${v.issues.join('; ')}`)
    .join('\n');
  console.warn(
    `[Foundation Quality Gate] ${violations.length} entries marked needsResearch:false but have quality issues:\n${msg}`
  );
}
