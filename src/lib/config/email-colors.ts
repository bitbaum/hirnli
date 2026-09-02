/**
 * Email Color SSOT
 *
 * Hex values for HTML email templates (CSS variables are not supported in email clients).
 * Values should stay in sync with globals.css semantic tokens.
 *
 * --color-text      → textDark
 * --color-danger    → urgencyHigh
 * --color-warning   → urgencyMedium
 * --color-success   → urgencyLow
 */
export const EMAIL_COLORS = {
  text: '#333333',
  textDark: '#1F2937',
  textMuted: '#6B7280',
  textLight: '#4B5563',
  textFaint: '#9CA3AF',
  bg: '#FFFFFF',
  bgLight: '#F9FAFB',
  border: '#E5E7EB',
  primary: '#3B82F6',
  urgencyHigh: '#DC2626', // --color-danger
  urgencyMedium: '#F59E0B', // --color-warning
  urgencyLow: '#10B981', // --color-success
} as const;
