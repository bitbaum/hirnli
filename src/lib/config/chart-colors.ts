/**
 * Chart Colors — SSOT for all Chart.js color values
 * Matches CSS tokens in globals.css: --color-chart-1 through --color-chart-6
 */
export const CHART_COLORS = {
  blue: '#3498DB',
  green: '#2ECC71',
  orange: '#E67E22',
  red: '#E74C3C',
  purple: '#9B59B6',
  teal: '#1ABC9C',
} as const;

/** Ordered array for multi-dataset charts */
export const CHART_PALETTE = [
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.orange,
  CHART_COLORS.red,
  CHART_COLORS.purple,
  CHART_COLORS.teal,
] as const;

/** Default fallback theme color for gesuch pages when no theme color is available */
export const DEFAULT_THEME_COLOR = CHART_COLORS.blue;

/** Grey-dark hex value for inline styles (matches --color-grey-dark in globals.css) */
export const GREY_DARK_HEX = '#2C3E50';
