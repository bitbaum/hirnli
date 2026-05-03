/**
 * Data Export Functions
 *
 * Pure functions to convert internal data to CSV format
 * Used by API routes in /app/api/export/*
 */

import { loadFinancialData } from '@/lib/data/financial';
import { FINANCIAL_YEAR_START, FINANCIAL_YEAR_END } from '@/lib/config/financial-constants';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { REVENUE_HISTORY } from '@/app/fundraising/data';
import { escapeCSV, arrayToCSV } from '@/lib/utils/csv';

// ---------------------------------------------------------------------------
// Financial Data Export
// ---------------------------------------------------------------------------

export function exportFinancialData(): string {
  const years = Array.from({ length: FINANCIAL_YEAR_END - FINANCIAL_YEAR_START + 1 }, (_, i) => FINANCIAL_YEAR_START + i);
  const headers = ['Jahr', 'Kategorie', 'Betrag (CHF)', 'Quelle'];

  const rows: (string | number)[][] = [];

  years.forEach((year) => {
    const data = loadFinancialData(year);

    rows.push([year, 'Warenverkauf', data.sum('warenverkauf'), 'Kivitendo']);
    rows.push([year, 'Dienstleistungen', data.sum('dienstleistungen'), 'Kivitendo']);
    rows.push([year, 'Integration', data.sum('integration'), 'Kivitendo']);
    rows.push([year, 'Spenden', data.sum('spenden'), 'Kivitendo']);
    rows.push([year, 'Aufstockung', data.sum('aufstockung'), 'Kivitendo']);
    rows.push([year, 'Total', data.sum('total'), 'Berechnet']);
  });

  return arrayToCSV(headers, rows);
}

// ---------------------------------------------------------------------------
// Foundation List Export
// ---------------------------------------------------------------------------

export function exportFoundationList(): string {
  const headers = [
    'Name',
    'Typ',
    'Themen',
    'Status',
    'Deadline',
    'Betrag (CHF)',
    'Fit-Score',
    'Region',
    'URL',
  ];

  const rows = STIFTUNGEN_DATA.map((foundation) => [
    foundation.name,
    foundation.type,
    foundation.themes.join('; '),
    foundation.status,
    foundation.deadlineText || 'Rolling',
    foundation.amount.text || 'Variabel',
    `${foundation.fitScore}/10`,
    foundation.region || 'CH',
    foundation.websiteUrl || '',
  ]);

  return arrayToCSV(headers, rows);
}

// ---------------------------------------------------------------------------
// Revenue History Export
// ---------------------------------------------------------------------------

export function exportRevenueHistory(): string {
  const headers = ['Jahr', 'Total (CHF)', 'Warenverkauf (CHF)', 'Dienstleistungen (CHF)', 'Quelle'];

  const rows = REVENUE_HISTORY.map((entry) => [
    entry.year,
    entry.total,
    entry.warenverkauf,
    entry.dienstleistungen,
    'Kivitendo',
  ]);

  return arrayToCSV(headers, rows);
}
