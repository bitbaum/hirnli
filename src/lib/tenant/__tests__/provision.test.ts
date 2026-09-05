/**
 * Onboarding rules that are cheap to get wrong and expensive to discover.
 *
 * The slug produced here becomes three things at once: a hostname, a URL path
 * segment, and the `org_id` in every `WHERE` clause scoping that customer's
 * data. The intersection of what those three accept is narrower than any one of
 * them, and a slug that is merely *unusual* — an umlaut, a trailing dash, a
 * reserved word — fails in a different layer each time.
 */

import { describe, it, expect } from 'vitest';
import { hostForSlug, newOrganizationSchema, slugify } from '../org-naming';
import { PLATFORM_HOST } from '../registry';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Beispiel Verein')).toBe('beispiel-verein');
  });

  it('transliterates German umlauts rather than stripping them', () => {
    // "Grün" must not become "grn": the slug is user-facing in the hostname,
    // and a mangled name reads as a bug in their account on day one.
    expect(slugify('Grüne Zukunft')).toBe('gruene-zukunft');
    expect(slugify('Öko Änderung')).toBe('oeko-aenderung');
    expect(slugify('Strasse')).toBe('strasse');
  });

  it('drops characters a hostname cannot carry', () => {
    expect(slugify('Verein für IT & Umwelt (Zürich)')).toBe('verein-fuer-it-umwelt-zuerich');
  });

  it('never starts or ends with a hyphen', () => {
    // A leading or trailing hyphen is an invalid DNS label, so the certificate
    // request would fail after the account was created.
    expect(slugify('  -- Test --  ')).toBe('test');
    expect(slugify('!!!')).toBe('');
  });

  it('stays short enough for a DNS label', () => {
    expect(slugify('a'.repeat(200)).length).toBeLessThanOrEqual(40);
  });
});

describe('hostForSlug', () => {
  it('puts the tenant on a subdomain of the platform', () => {
    expect(hostForSlug('beispiel')).toBe(`beispiel.${PLATFORM_HOST}`);
  });
});

describe('newOrganizationSchema', () => {
  const valid = {
    name: 'Beispiel-Verein',
    legalForm: 'Verein nach Art. 60 ff. ZGB',
    founded: 2026,
    location: 'Zürich',
    email: 'kontakt@beispiel.ch',
  };

  it('accepts the minimum a profile needs', () => {
    expect(newOrganizationSchema.safeParse(valid).success).toBe(true);
  });

  it('coerces the year, because a form sends strings', () => {
    const parsed = newOrganizationSchema.parse({ ...valid, founded: '2026' });
    expect(parsed.founded).toBe(2026);
  });

  it('rejects a founding year in the future', () => {
    const next = new Date().getFullYear() + 1;
    expect(newOrganizationSchema.safeParse({ ...valid, founded: next }).success).toBe(false);
  });

  it('rejects a malformed email', () => {
    // This address goes on grant applications; a typo here is not cosmetic.
    expect(newOrganizationSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false);
  });

  it('trims, so a pasted name does not become a hyphen', () => {
    expect(newOrganizationSchema.parse({ ...valid, name: '  Beispiel  ' }).name).toBe('Beispiel');
  });
});
