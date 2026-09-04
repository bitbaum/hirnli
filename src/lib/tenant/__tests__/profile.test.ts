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
import { execSync } from 'node:child_process';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import {
  deriveTenant,
  parseBranding,
  parseTenant,
  storedTenantProfileSchema,
  tenantBrandingSchema,
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

describe('tenantBrandingSchema / parseBranding', () => {
  it('accepts a tenant with its own mark', () => {
    expect(
      parseBranding({ logoUrl: 'https://evig.orangecat.ch/icon.png', logoAlt: 'evig Logo' }),
    ).toEqual({ logoUrl: 'https://evig.orangecat.ch/icon.png', logoAlt: 'evig Logo' });
  });

  it('accepts a platform-hosted relative path', () => {
    // A tenant should not need a pull request to change its logo, but marks the
    // platform already hosts must keep working.
    expect(parseBranding({ logoUrl: '/revampit-icon.png' }).logoUrl).toBe('/revampit-icon.png');
  });

  it('returns EMPTY branding for a tenant that has none', () => {
    // The whole bug in one assertion: the fallback must be "no mark", never
    // another tenant's mark.
    expect(parseBranding({})).toEqual({});
    expect(parseBranding(null)).toEqual({});
    expect(parseBranding(undefined)).toEqual({});
  });

  it('falls back to empty rather than throwing on a malformed row', () => {
    // Chrome renders on every page; a bad branding row must not take the site
    // down, and must not silently borrow someone else's identity either.
    expect(parseBranding({ logoUrl: 123 })).toEqual({});
    expect(parseBranding({ primaryColor: 'green' })).toEqual({});
  });

  it('rejects an unknown branding key rather than ignoring it', () => {
    expect(tenantBrandingSchema.safeParse({ logoURL: '/x.png' }).success).toBe(false);
  });

  it('accepts a #rrggbb accent', () => {
    expect(parseBranding({ primaryColor: '#10b981' }).primaryColor).toBe('#10b981');
  });
});

/**
 * The legacy constant and a stored tenant profile are NOT the same shape, and
 * the difference is load-bearing rather than cosmetic.
 *
 * `scripts/seed-org-content.ts` used to upsert `ORG_PROFILE` straight into
 * `org_profiles`, and its own header invited re-running it after any config
 * edit. That table stopped being a mirror the moment `getTenantById()` began
 * reading it on every request — and the row it would have written is one that
 * `parseTenant()` refuses, because ORG_PROFILE carries `yearsActive` and
 * `experienceLabel` and the schema is `.strict()` precisely so those cannot be
 * stored. Postgres would accept it; the next request would throw; every page
 * would 500. From running a maintenance script exactly as documented.
 */
describe('the retiring constant cannot be written back as a tenant', () => {
  it('is REJECTED by the stored-profile schema', () => {
    const asRow = JSON.parse(JSON.stringify(ORG_PROFILE));
    const result = storedTenantProfileSchema.safeParse(asRow);

    expect(result.success).toBe(false);
    if (!result.success) {
      // Name the fields, so a future reader sees which ones and why.
      const message = JSON.stringify(result.error.issues);
      expect(message).toContain('yearsActive');
      expect(message).toContain('experienceLabel');
    }
  });

  it('is not written to org_profiles by any script', () => {
    // Source assertion, because the property is an absence. Migrations are
    // exempt: they are reviewed, run once, and are how a tenant row is created.
    const hits = execSync(
      "grep -rln 'org_profiles' scripts/ 2>/dev/null | xargs -r grep -ln 'INSERT INTO org_profiles\\|UPDATE org_profiles' || true",
      { encoding: 'utf-8' },
    )
      .split('\n')
      .filter(Boolean);

    expect(
      hits,
      `A tenant's identity is edited in the database, never seeded from code: ${hits.join(', ')}`,
    ).toEqual([]);
  });
});
