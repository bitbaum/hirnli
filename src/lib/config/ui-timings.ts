/** Centralised UI timing constants — all setTimeout durations in milliseconds */
export const UI_TIMINGS = {
  /** Copy-to-clipboard success indicator (standard) */
  copySuccess: 2000,
  /** Copy-to-clipboard success indicator (compact/tight UI) */
  copySuccessShort: 1500,
  /** "Gespeichert" confirmation badge after a successful save */
  savedIndicator: 2500,
  /** Saved indicator for operations that take slightly longer */
  savedIndicatorLong: 3000,
  /** Auto-dismiss for drag-error banners */
  dragErrorDismiss: 5000,
} as const;
