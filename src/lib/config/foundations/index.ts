/**
 * Foundation Configuration — Re-exports
 *
 * All imports from '@/lib/config/foundations' resolve here.
 * Foundation data itself is a runtime DB read (src/lib/db/foundations-repo.ts,
 * getAllFoundations()/getFoundationBySlug()) — this file only holds metadata
 * constants (themes, labels, config) that don't depend on the dataset.
 */

export {
  THEMES,
  SOURCES,
  TYPE_LABELS,
  resolveTypeLabel,
  STATUS_LABELS,
  STATUS_BADGE_VARIANT,
  PRIORITY_CONFIG,
  PRIORITY_LEVELS,
  type PriorityLevel,
  FIT_CONFIG,
  APPLICATION_METHOD_LABELS,
} from './metadata';
