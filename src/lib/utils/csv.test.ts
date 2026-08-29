import { describe, it, expect } from 'vitest';
import { escapeCSV, arrayToCSV } from './csv';

describe('escapeCSV', () => {
  it('returns empty string for null and undefined', () => {
    expect(escapeCSV(null)).toBe('');
    expect(escapeCSV(undefined)).toBe('');
  });

  it('passes through plain strings unchanged', () => {
    expect(escapeCSV('hello')).toBe('hello');
    expect(escapeCSV('no special chars')).toBe('no special chars');
  });

  it('converts numbers to strings', () => {
    expect(escapeCSV(42)).toBe('42');
    expect(escapeCSV(0)).toBe('0');
  });

  it('wraps values containing commas in quotes', () => {
    expect(escapeCSV('a,b')).toBe('"a,b"');
  });

  it('wraps values containing semicolons in quotes', () => {
    expect(escapeCSV('a;b')).toBe('"a;b"');
  });

  it('wraps values containing newlines in quotes', () => {
    expect(escapeCSV('a\nb')).toBe('"a\nb"');
  });

  it('escapes embedded quotes by doubling them', () => {
    expect(escapeCSV('say "hi"')).toBe('"say ""hi"""');
  });

  it('wraps and escapes combined special chars', () => {
    expect(escapeCSV('a,"b",c')).toBe('"a,""b"",c"');
  });
});

describe('arrayToCSV', () => {
  it('produces header + data rows', () => {
    const result = arrayToCSV(
      ['Name', 'Score'],
      [
        ['Alice', 10],
        ['Bob', 20],
      ],
    );
    expect(result).toBe('Name,Score\nAlice,10\nBob,20');
  });

  it('escapes special characters in cells', () => {
    const result = arrayToCSV(['Key'], [['val,ue'], [null], [undefined]]);
    expect(result).toBe('Key\n"val,ue"\n\n');
  });
});
