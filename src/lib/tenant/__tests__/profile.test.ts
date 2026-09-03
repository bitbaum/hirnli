/**
 * These pin the two rules that make tenant identity survive many customers:
 * the database is the only source of the values, and anything derivable is
 * never among them.
 *
 * The second rule has a date attached. The seeded revamp-it row stored
 * `yearsActive: 23` beside `founded: 2003`, which agreed with the code only
 * because the year was 2026. Tests that use the real clock would have passed
 * all year and failed on 1 January, so the year is injected here.
 */

import { describe, it, expect } from 'vitest';
import {
  deriveTenant,
  parseTenant,
  storedTenantProfileSchema,
  type StoredTenantProfile,
} from '../profile';

const MINIMAL: StoredTenantProfile = {
  orgId: 'evig',
  name: 'evig',
  legalForm: 'Verein nach Art. 60 ff. ZGB',
  founded: 2026,
  location: 'Zürich',
  email: 'butaeff@gmail.com',
};

describe('storedTenantProfileSchema', () => {
  it('accepts a tenant that has only the required facts', () => {
    expect(() => storedTenantProfileSchema.parse(MINIMAL)).not.toThrow();
  });

  it('REJECTS a stored derived value — this is the whole point', () => {
    // Re-adding yearsActive is how the drift returns. .strict() makes it an
    // error at the boundary rather than a divergence discovered in January.
    expect(() => storedTenantProfileSchema.parse({ ...MINIMAL, yearsActive: 0 })).toThrow();
    expect(() =>
      storedTenantProfileSchema.parse({ ...MINIMAL, experienceLabel: 'über 0 Jahren Erfahrung' }),
    ).toThrow();
  });

  it('rejects an unknown field rather than silently dropping it', () => {
    // Silent tolerance is how a typo'd key becomes an invisible missing value.
    expect(() => storedTenantProfileSchema.parse({ ...MINIMAL, emial: 'x@y.ch' })).toThrow();
  });

  it('requires the facts a Gesuch cannot be written without', () => {
    for (const key of ['orgId', 'name', 'legalForm', 'founded', 'location', 'email'] as const) {
      const partial = { ...MINIMAL };
      delete (partial as Record<string, unknown>)[key];
      expect(() => storedTenantProfileSchema.parse(partial), `missing ${key}`).toThrow();
    }
  });

  it('treats unpublished optional facts as absent, not as empty strings', () => {
    const parsed = storedTenantProfileSchema.parse(MINIMAL);
    // evig publishes no postal address or phone. Absent must stay absent so the
    // UI can say "not stated" instead of rendering a convincing blank.
    expect(parsed.address).toBeUndefined();
    expect(parsed.phone).toBeUndefined();
    expect(parsed.taxExemption).toBeUndefined();
  });

  it('rejects a malformed email or website rather than storing it', () => {
    expect(() => storedTenantProfileSchema.parse({ ...MINIMAL, email: 'not-an-email' })).toThrow();
    expect(() => storedTenantProfileSchema.parse({ ...MINIMAL, website: 'evig.ch' })).toThrow();
  });
});

describe('deriveTenant', () => {
  it('computes yearsActive from founded, at the given moment', () => {
    expect(deriveTenant(MINIMAL, new Date('2026-06-01')).yearsActive).toBe(0);
    expect(deriveTenant(MINIMAL, new Date('2030-06-01')).yearsActive).toBe(4);
  });

  it('changes with the year — the reason it must not be stored', () => {
    const revampIt = { ...MINIMAL, orgId: 'revamp-it', name: 'Revamp-IT', founded: 2003 };
    expect(deriveTenant(revampIt, new Date('2026-12-31')).yearsActive).toBe(23);
    expect(deriveTenant(revampIt, new Date('2027-01-01')).yearsActive).toBe(24);
  });

  it('keeps the dative plural for an established org', () => {
    // Interpolated after "mit" / "Als <X> mit" — nominative would be wrong German.
    const t = deriveTenant({ ...MINIMAL, founded: 2003 }, new Date('2026-06-01'));
    expect(t.experienceLabel).toBe('über 23 Jahren Erfahrung');
  });

  it('uses the dative SINGULAR at one year', () => {
    // "über 1 Jahren" is ungrammatical, and it would ship inside a real Gesuch.
    const t = deriveTenant({ ...MINIMAL, founded: 2025 }, new Date('2026-06-01'));
    expect(t.experienceLabel).toBe('über einem Jahr Erfahrung');
  });

  it('does not claim experience an org founded this year does not have', () => {
    // The original template produced "über 0 Jahren Erfahrung" for evig.
    const t = deriveTenant({ ...MINIMAL, founded: 2026 }, new Date('2026-06-01'));
    expect(t.yearsActive).toBe(0);
    expect(t.experienceLabel).toBe('seit diesem Jahr');
  });

  it('never reports negative years for a founding date in the future', () => {
    const t = deriveTenant({ ...MINIMAL, founded: 2030 }, new Date('2026-06-01'));
    expect(t.yearsActive).toBe(0);
    expect(t.experienceLabel).toBe('seit diesem Jahr');
  });

  it('does not mutate its input', () => {
    const input = { ...MINIMAL };
    deriveTenant(input);
    expect(input).toEqual(MINIMAL);
  });
});

describe('parseTenant', () => {
  it('validates and derives in one step', () => {
    const t = parseTenant({ ...MINIMAL, founded: 2003 }, new Date('2026-06-01'));
    expect(t.name).toBe('evig');
    expect(t.yearsActive).toBe(23);
  });

  it('throws on a row that does not match the schema', () => {
    expect(() => parseTenant({ name: 'incomplete' })).toThrow();
  });
});
