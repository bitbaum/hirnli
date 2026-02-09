/**
 * Format a number as Swiss Francs
 */
export function formatCHF(value: number | null | undefined, showCents = false): string {
  if (value === null || value === undefined || isNaN(value)) return 'CHF --';
  const opts = { minimumFractionDigits: showCents ? 2 : 0, maximumFractionDigits: showCents ? 2 : 0 };
  const formatted = Math.abs(value).toLocaleString('de-CH', opts);
  return `${value < 0 ? '-' : ''}CHF ${formatted}`;
}

/**
 * Format a number with Swiss thousand separators
 */
export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || isNaN(value)) return '--';
  return value.toLocaleString('de-CH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * Format as percent (input is a ratio, e.g. 0.96 → "96.0%")
 */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(value)) return '--%';
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * Format month string "YYYY-MM" to German name
 */
export function formatMonth(monthStr: string | null | undefined): string {
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  if (!monthStr) return '--';
  const [year, month] = monthStr.split('-');
  const idx = parseInt(month, 10) - 1;
  if (idx < 0 || idx > 11) return monthStr;
  return `${months[idx]} ${year}`;
}

/**
 * Format month string short
 */
export function formatMonthShort(monthStr: string | null | undefined): string {
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  if (!monthStr) return '--';
  const [year, month] = monthStr.split('-');
  const idx = parseInt(month, 10) - 1;
  if (idx < 0 || idx > 11) return monthStr;
  return `${months[idx]} ${year.slice(2)}`;
}

/**
 * Calculate growth rate between two values
 */
export function calcGrowth(oldVal: number, newVal: number): number {
  if (!oldVal || oldVal === 0) return newVal > 0 ? 1 : 0;
  return (newVal - oldVal) / Math.abs(oldVal);
}

/**
 * Calculate average of numeric values
 */
export function calcAverage(values: (number | null)[]): number {
  if (!values || values.length === 0) return 0;
  const valid = values.filter((v): v is number => v !== null && !isNaN(v));
  if (valid.length === 0) return 0;
  return valid.reduce((s, v) => s + v, 0) / valid.length;
}

/**
 * Calculate sum of numeric values
 */
export function calcSum(values: (number | null)[]): number {
  if (!values || values.length === 0) return 0;
  return values.filter((v): v is number => v !== null && !isNaN(v)).reduce((s, v) => s + v, 0);
}

/**
 * Get trend CSS class
 */
export function getTrendClass(growth: number, positiveIsGood = true): string {
  if (Math.abs(growth) < 0.01) return 'trend-neutral';
  if (positiveIsGood) return growth > 0 ? 'trend-up' : 'trend-down';
  return growth < 0 ? 'trend-up' : 'trend-down';
}

/**
 * Get trend arrow character
 */
export function getTrendArrow(growth: number): string {
  if (Math.abs(growth) < 0.01) return '→';
  return growth > 0 ? '↑' : '↓';
}
