/**
 * Data Export Functions
 *
 * Pure functions to convert internal data to CSV format
 * Used by API routes in /app/api/export/*
 */

import { FinanceDataSet } from '@/lib/data/financial';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { REVENUE_HISTORY } from '@/app/fundraising/data';

// ---------------------------------------------------------------------------
// CSV Helper Functions
// ---------------------------------------------------------------------------

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerRow = headers.map(escapeCSV).join(',');
  const dataRows = rows.map((row) => row.map(escapeCSV).join(',')).join('\n');
  return `${headerRow}\n${dataRows}`;
}

// ---------------------------------------------------------------------------
// Financial Data Export
// ---------------------------------------------------------------------------

export function exportFinancialData(): string {
  const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const headers = ['Jahr', 'Kategorie', 'Betrag (CHF)', 'Quelle'];

  const rows: (string | number)[][] = [];

  years.forEach((year) => {
    const data = new FinanceDataSet(year);
    const totals = data.getTotals();

    rows.push([year, 'Warenverkauf', totals.warenverkauf, 'Kivitendo']);
    rows.push([year, 'Dienstleistungen', totals.dienstleistungen, 'Kivitendo']);
    rows.push([year, 'Integration', totals.integration, 'Kivitendo']);
    rows.push([year, 'Spenden', totals.spenden, 'Kivitendo']);
    rows.push([year, 'Aufstockung', totals.aufstockung, 'Kivitendo']);
    rows.push([year, 'Total', totals.total, 'Berechnet']);
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
    'Geographie',
    'URL',
  ];

  const rows = STIFTUNGEN_DATA.map((foundation) => [
    foundation.name,
    foundation.type,
    foundation.themes.join('; '),
    foundation.status,
    foundation.deadline || 'Rolling',
    foundation.amount || 'Variabel',
    `${foundation.fit}/3`,
    foundation.geo?.join(', ') || 'CH',
    foundation.website || '',
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
