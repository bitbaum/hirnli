/**
 * Foundation Configuration — Re-exports
 *
 * All imports from '@/lib/config/foundations' resolve here.
 * Foundation data is generated from DB via `npm run sync`.
 * DB is write SSOT; stiftungen-generated.ts is read-only build cache.
 */

export {
  THEMES,
  SOURCES,
  TYPE_LABELS,
  STATUS_LABELS,
  STATUS_BADGE_VARIANT,
  PRIORITY_CONFIG,
  FIT_CONFIG,
  NOT_RECOMMENDED,
  DATABASES,
  APPLICATION_METHOD_LABELS,
} from './metadata';

import { STIFTUNGEN_GENERATED } from './stiftungen-generated';
import type { Foundation } from '../../schemas/foundation';

export const STIFTUNGEN_DATA: Foundation[] = STIFTUNGEN_GENERATED;

// Run quality gate lazily to avoid circular dependency:
// foundations/index → foundation-quality → foundation-helpers → foundations/index
let _qualityGateRan = false;
export async function runQualityGate(): Promise<void> {
  if (_qualityGateRan) return;
  _qualityGateRan = true;
  // Dynamic import() breaks the cycle — module is fully initialized by the time this runs
  const { validateFoundationQuality } = await import('../../domain/foundation-quality');
  const violations = validateFoundationQuality(STIFTUNGEN_DATA);
  if (violations.length > 0) {
    const msg = violations
      .map((v: { slug: string; issues: string[] }) => `  ${v.slug}: ${v.issues.join('; ')}`)
      .join('\n');
    console.warn(
      `[Foundation Quality Gate] ${violations.length} researched entries (tier >= profiliert) have quality issues:\n${msg}`
    );
  }
}

// Trigger on first access in non-edge environments (build time, dev server)
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  // Use queueMicrotask to run after all module initialization completes
  queueMicrotask(() => void runQualityGate());
}
