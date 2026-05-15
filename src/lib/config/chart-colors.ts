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
  amber: '#F39C12',
  concrete: '#95A5A6',
  silver: '#BDC3C7',
  white: '#ffffff',
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

/**
 * Theme Colors — SSOT for foundation theme hex values used in inline styles
 * Matches --color-theme-* CSS vars in globals.css. Used wherever a raw hex is
 * needed (inline style, canvas, themeStyle() utility). Must stay in sync with globals.css.
 */
export const THEME_COLORS = {
  klima:                  '#10b981',  // --color-theme-klima
  kreislaufwirtschaft:    '#059669',  // --color-theme-kreislauf
  soziale_integration:    '#8b5cf6',  // --color-theme-sozial
  digitale_bildung:       '#3b82f6',  // --color-theme-bildung
  digitale_souveraenitaet:'#6366f1',  // --color-theme-digital
  zuerich:                '#ef4444',  // --color-theme-zuerich
  arbeitsintegration:     '#14b8a6',  // --color-theme-arbeit
} as const;
