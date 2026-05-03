/**
 * Shared styles for Gesuch Dokument PDF
 *
 * Defines colors, typography, and reusable style patterns
 * for the @react-pdf/renderer template.
 */

import { StyleSheet } from '@react-pdf/renderer';
import { CHART_COLORS } from '@/lib/config/chart-colors';

// Design tokens matching the HTML dokument page
export const COLORS = {
  text: '#1F2937',
  textMuted: '#6B7280',
  textLight: '#4B5563',
  primary: CHART_COLORS.blue,
  accent: CHART_COLORS.orange,
  secondary: '#27AE60',
  border: '#E5E7EB',
  borderDark: '#1F2937',
  bgLight: '#F9FAFB',
  bgBlue: '#EFF6FF',
  bgGreen: '#ECFDF5',
  greenText: '#065F46',
  white: '#FFFFFF',
} as const;

export const styles = StyleSheet.create({
  // Page
  page: {
    padding: 40,
    paddingBottom: 60,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    color: COLORS.text,
  },

  // Section headings
  h2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.borderDark,
  },
  h3: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginBottom: 12,
  },

  // Text
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  muted: {
    color: COLORS.textMuted,
    fontSize: 8,
  },
  small: {
    fontSize: 8,
  },

  // Table
  tableRow: {
    flexDirection: 'row' as const,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row' as const,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.borderDark,
    paddingBottom: 4,
  },
  tableTotalRow: {
    flexDirection: 'row' as const,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.borderDark,
    paddingVertical: 6,
  },

  // Boxes
  infoBox: {
    backgroundColor: COLORS.bgBlue,
    padding: 8,
    marginBottom: 8,
    borderRadius: 2,
  },
  highlightBox: {
    backgroundColor: COLORS.bgLight,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 2,
  },

  // Footer
  footer: {
    position: 'absolute' as const,
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    fontSize: 7,
    color: COLORS.textMuted,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },

  // Layout
  row: {
    flexDirection: 'row' as const,
  },
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
});

/** Format CHF for PDF (can't use Intl in react-pdf) */
export function pdfFormatCHF(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('de-CH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${value < 0 ? '-' : ''}CHF ${formatted}`;
}

/** Today's date formatted for PDF documents (DD.MM.YYYY) */
export function pdfTodayCH(): string {
  return new Date().toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
