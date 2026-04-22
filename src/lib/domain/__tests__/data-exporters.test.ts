import { describe, it, expect } from 'vitest';
import {
  exportFoundationList,
  exportRevenueHistory,
  exportFinancialData,
} from '../data-exporters';

// ---------------------------------------------------------------------------
// CSV structure helpers
// ---------------------------------------------------------------------------

function parseCSV(csv: string): string[][] {
  return csv.split('\n').map((line) => {
    const cells: string[] = [];
    let i = 0;
    while (i <= line.length) {
      if (i === line.length) {
        // End of line — push empty field if line ended with comma
        if (line.endsWith(',')) cells.push('');
        break;
      }
      if (line[i] === '"') {
        // Quoted field — consume until closing unescaped quote
        let field = '';
        i++; // skip opening quote
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') {
            field += '"';
            i += 2;
          } else if (line[i] === '"') {
            i++; // skip closing quote
            break;
          } else {
            field += line[i++];
          }
        }
        cells.push(field);
        if (line[i] === ',') i++; // skip comma after field
      } else {
        const end = line.indexOf(',', i);
        if (end === -1) {
          cells.push(line.slice(i));
          break;
        }
        cells.push(line.slice(i, end));
        i = end + 1;
      }
    }
    return cells;
  });
}

// ---------------------------------------------------------------------------
// exportFoundationList
// ---------------------------------------------------------------------------

describe('exportFoundationList', () => {
  it('returns a non-empty string', () => {
    const csv = exportFoundationList();
    expect(csv.length).toBeGreaterThan(0);
  });

  it('first line is the header row', () => {
    const csv = exportFoundationList();
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toContain('Name');
    expect(firstLine).toContain('Fit-Score');
    expect(firstLine).toContain('Typ');
  });

  it('header has exactly 9 columns', () => {
    const csv = exportFoundationList();
    const headerCells = parseCSV(csv)[0];
    expect(headerCells).toHaveLength(9);
  });

  it('has at least one data row after the header', () => {
    const csv = exportFoundationList();
    const lines = csv.split('\n');
    // At minimum: header + 1 data row
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it('each data row has the same number of columns as the header', () => {
    const csv = exportFoundationList();
    const rows = parseCSV(csv);
    const headerLen = rows[0].length;
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].length).toBe(headerLen);
    }
  });

  it('Fit-Score column has the format <n>/10', () => {
    const csv = exportFoundationList();
    const rows = parseCSV(csv);
    // Fit-Score is column index 6 (0-based)
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i][6]).toMatch(/^\d+\/10$/);
    }
  });
});

// ---------------------------------------------------------------------------
// exportRevenueHistory
// ---------------------------------------------------------------------------

describe('exportRevenueHistory', () => {
  it('returns a non-empty string', () => {
    const csv = exportRevenueHistory();
    expect(csv.length).toBeGreaterThan(0);
  });

  it('first line is the header row with Jahr and Total columns', () => {
    const csv = exportRevenueHistory();
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toContain('Jahr');
    expect(firstLine).toContain('Total');
  });

  it('header has 5 columns', () => {
    const csv = exportRevenueHistory();
    const headerCells = parseCSV(csv)[0];
    expect(headerCells).toHaveLength(5);
  });

  it('has at least one data row', () => {
    const csv = exportRevenueHistory();
    const lines = csv.split('\n').filter((l) => l.trim().length > 0);
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it('each data row has the same number of columns as the header', () => {
    const csv = exportRevenueHistory();
    const rows = parseCSV(csv).filter((r) => r.some((c) => c.trim().length > 0));
    const headerLen = rows[0].length;
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].length).toBe(headerLen);
    }
  });

  it('Jahr column contains numeric year values', () => {
    const csv = exportRevenueHistory();
    const rows = parseCSV(csv).filter((r) => r.some((c) => c.trim().length > 0));
    for (let i = 1; i < rows.length; i++) {
      const year = parseInt(rows[i][0], 10);
      expect(year).toBeGreaterThan(2000);
      expect(year).toBeLessThan(2100);
    }
  });
});

// ---------------------------------------------------------------------------
// exportFinancialData
// ---------------------------------------------------------------------------

describe('exportFinancialData', () => {
  it('returns a non-empty string', () => {
    const csv = exportFinancialData();
    expect(csv.length).toBeGreaterThan(0);
  });

  it('first line is the header row with Jahr and Kategorie', () => {
    const csv = exportFinancialData();
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toContain('Jahr');
    expect(firstLine).toContain('Kategorie');
  });

  it('header has 4 columns', () => {
    const csv = exportFinancialData();
    const headerCells = parseCSV(csv)[0];
    expect(headerCells).toHaveLength(4);
  });

  it('covers exactly 8 years × 6 categories = 48 data rows', () => {
    const csv = exportFinancialData();
    // header + 48 data rows
    const lines = csv.split('\n').filter((l) => l.trim().length > 0);
    expect(lines.length).toBe(49); // 1 header + 48 rows
  });

  it('all data rows cite Kivitendo or Berechnet as source', () => {
    const csv = exportFinancialData();
    const rows = parseCSV(csv);
    for (let i = 1; i < rows.length; i++) {
      expect(['Kivitendo', 'Berechnet']).toContain(rows[i][3]);
    }
  });

  it('year values span 2018 to 2025', () => {
    const csv = exportFinancialData();
    const rows = parseCSV(csv);
    const years = new Set(rows.slice(1).map((r) => r[0]));
    expect(years.has('2018')).toBe(true);
    expect(years.has('2025')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CSV escaping — exercised via exportFoundationList data
// ---------------------------------------------------------------------------

describe('CSV escaping', () => {
  it('produces output that does not break on semicolons (themes join)', () => {
    const csv = exportFoundationList();
    // Themes column uses '; ' as separator — verify it doesn't break row structure
    const rows = parseCSV(csv);
    const headerLen = rows[0].length;
    for (let i = 1; i < rows.length; i++) {
      // Each row must parse to the same number of columns as the header
      expect(rows[i].length).toBe(headerLen);
    }
  });

  it('produces parseable output even if names contain special chars', () => {
    const csv = exportFoundationList();
    // Should not throw and should have consistent column count
    expect(() => parseCSV(csv)).not.toThrow();
    const rows = parseCSV(csv);
    expect(rows.length).toBeGreaterThan(1);
  });
});
