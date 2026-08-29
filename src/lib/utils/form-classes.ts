/**
 * Shared form element class strings — SSOT for form styling
 *
 * Extracted from 15+ repetitions across EditApplicationModal,
 * GesuchEditPanel, FilterSidebar, and other form components.
 */

export const FORM_INPUT_CLASS =
  'w-full rounded-lg border border-border-default px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export const FORM_LABEL_CLASS =
  'mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted';

/** Accessible checkbox row: touch-friendly min-height, consistent label layout */
export const FORM_CHECKBOX_LABEL_CLASS = 'flex min-h-11 cursor-pointer items-center gap-2 text-sm';

/** Checkbox row with muted label text — used in filter sidebars */
export const FORM_CHECKBOX_LABEL_MUTED_CLASS = `${FORM_CHECKBOX_LABEL_CLASS} text-text-muted`;

/** Responsive 2-column form field grid */
export const FORM_GRID_2COL_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2';
