/**
 * German month names — SSOT used by formatMonthShort, formatDateDE
 */
const MONTH_NAMES_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
] as const;

const MONTH_NAMES_DE_SHORT = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
] as const;

/**
 * Format a Date as German date string: "Zürich, 26. Februar 2026"
 */
export function formatDateDE(date: Date, location?: string): string {
  const day = date.getDate();
  const month = MONTH_NAMES_DE[date.getMonth()];
  const year = date.getFullYear();
  const dateStr = `${day}. ${month} ${year}`;
  return location ? `${location}, ${dateStr}` : dateStr;
}

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
 * Format month string short
 */
export function formatMonthShort(monthStr: string | null | undefined): string {
  if (!monthStr) return '--';
  const [year, month] = monthStr.split('-');
  const idx = parseInt(month, 10) - 1;
  if (idx < 0 || idx > 11) return monthStr;
  return `${MONTH_NAMES_DE_SHORT[idx]} ${year.slice(2)}`;
}

/**
 * Calculate growth rate between two values
 */
export function calcGrowth(oldVal: number, newVal: number): number {
  if (!oldVal || oldVal === 0) return newVal > 0 ? 1 : 0;
  return (newVal - oldVal) / Math.abs(oldVal);
}

/**
 * Format a date string as Swiss compact date: "26.02.2026"
 */
export function formatDateCH(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a date string as Swiss compact date + time: "26.02.2026, 14:30"
 */
export function formatDateTimeCH(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a date string as Swiss long date: "15. Mai 2026"
 */
export function formatDateCHLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Convert a Date to ISO-8601 date-only string: "2026-05-03" (UTC)
 */
export function toISODateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Today's date as ISO-8601 date string: "2026-05-03"
 */
export function getTodayISO(): string {
  return toISODateStr(new Date());
}

/**
 * Normalize a stored ISO string (may include time) to date-only: "2026-05-03"
 * Returns '' for null/undefined (safe for HTML <input type="date"> value).
 */
export function normalizeDateInput(value: string | null | undefined): string {
  return value ? value.split('T')[0] : '';
}
