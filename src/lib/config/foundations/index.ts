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
