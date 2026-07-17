import { describe, expect, it } from 'vitest';
import de from '../../../messages/de.json';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';
import { LOCALES } from '../config';

/**
 * Catalog parity — every locale must define exactly the same message keys.
 * A missing translation is a build failure, not a silent runtime gap.
 */

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') {
      return flattenKeys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

const CATALOGS = { de, en, fr } as const;

describe('message catalogs', () => {
  it('covers every configured locale', () => {
    expect(Object.keys(CATALOGS).sort()).toEqual([...LOCALES].sort());
  });

  it('has identical key sets across all locales', () => {
    const deKeys = flattenKeys(de).sort();
    for (const locale of ['en', 'fr'] as const) {
      expect(flattenKeys(CATALOGS[locale]).sort(), `locale ${locale}`).toEqual(deKeys);
    }
  });

  it('has no empty message values', () => {
    for (const [locale, catalog] of Object.entries(CATALOGS)) {
      const walk = (obj: Record<string, unknown>, prefix: string) => {
        for (const [key, value] of Object.entries(obj)) {
          const path = `${prefix}.${key}`;
          if (value && typeof value === 'object') {
            walk(value as Record<string, unknown>, path);
          } else {
            expect(String(value).trim(), `${locale}:${path}`).not.toBe('');
          }
        }
      };
      walk(catalog, locale);
    }
  });
});
