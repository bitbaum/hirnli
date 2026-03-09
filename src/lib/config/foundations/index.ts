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
  PRIORITY_CONFIG,
  FIT_CONFIG,
  NOT_RECOMMENDED,
  DATABASES,
} from './metadata';

import { STIFTUNGEN_GENERATED } from './stiftungen-generated';
import type { Foundation } from '../../schemas/foundation';
import { validateFoundationQuality } from '../../domain/foundation-quality';

export const STIFTUNGEN_DATA: Foundation[] = STIFTUNGEN_GENERATED;

// Run quality gate at import time — warns on violations without breaking prod builds
const violations = validateFoundationQuality(STIFTUNGEN_DATA);
if (violations.length > 0) {
  const msg = violations
    .map((v) => `  ${v.slug}: ${v.issues.join('; ')}`)
    .join('\n');
  console.warn(
    `[Foundation Quality Gate] ${violations.length} researched entries (tier >= profiliert) have quality issues:\n${msg}`
  );
}
