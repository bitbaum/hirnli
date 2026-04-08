/**
 * Layout Constants — SSOT for page widths and section spacing
 *
 * Import these instead of hardcoding max-w-* and mb-* values.
 */

export const LAYOUT = {
  /** max-w-3xl (48rem) — Forms, document preview, narrow content */
  WIDTH_NARROW: 'max-w-3xl',
  /** max-w-4xl (56rem) — Default content pages, Gesuch pages */
  WIDTH_STANDARD: 'max-w-4xl',
  /** Standard section spacing */
  SECTION_GAP: 'mb-8',
  /** Large section spacing — page-level breaks */
  SECTION_GAP_LARGE: 'mb-12',
} as const;
