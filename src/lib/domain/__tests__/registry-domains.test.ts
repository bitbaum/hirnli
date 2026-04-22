import { describe, it, expect } from 'vitest';
import { isRegistryUrl, REGISTRY_DOMAINS } from '@/lib/config/registry-domains';

// ---------------------------------------------------------------------------
// isRegistryUrl — falsy / invalid inputs
// ---------------------------------------------------------------------------

describe('isRegistryUrl — falsy inputs', () => {
  it('returns false for empty string', () => {
    expect(isRegistryUrl('')).toBe(false);
  });

  it('returns false for invalid URL', () => {
    expect(isRegistryUrl('not-a-url')).toBe(false);
    expect(isRegistryUrl('http://')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isRegistryUrl — known registry domains
// ---------------------------------------------------------------------------

describe('isRegistryUrl — known registry domains', () => {
  it('returns true for zefix.ch URLs', () => {
    expect(isRegistryUrl('https://www.zefix.ch/en/search/entity/list/firm/123456')).toBe(true);
    expect(isRegistryUrl('https://zefix.ch/de/search')).toBe(true);
  });

  it('returns true for zefix.admin.ch', () => {
    expect(isRegistryUrl('https://zefix.admin.ch/en/search/entity')).toBe(true);
  });

  it('returns true for uid.admin.ch', () => {
    expect(isRegistryUrl('https://uid.admin.ch/Detail.aspx?uid_id=CHE-123')).toBe(true);
  });

  it('returns true for stiftungschweiz.ch', () => {
    expect(isRegistryUrl('https://stiftungschweiz.ch/organisation/test-stiftung')).toBe(true);
    expect(isRegistryUrl('https://www.stiftungschweiz.ch/organisation/test')).toBe(true);
  });

  it('returns true for fundraiso.ch and fundraiso.com', () => {
    expect(isRegistryUrl('https://www.fundraiso.ch/organisations/1234')).toBe(true);
    expect(isRegistryUrl('https://fundraiso.com/organisations/1234')).toBe(true);
  });

  it('returns true for moneyhouse.ch', () => {
    expect(isRegistryUrl('https://www.moneyhouse.ch/en/company/test-ag-123')).toBe(true);
  });

  it('returns true for northdata.com', () => {
    expect(isRegistryUrl('https://www.northdata.com/Test+Stiftung,+Zürich')).toBe(true);
  });

  it('returns true for wikipedia.org', () => {
    expect(isRegistryUrl('https://de.wikipedia.org/wiki/Test_Stiftung')).toBe(true);
  });

  it('returns true for linkedin.com', () => {
    expect(isRegistryUrl('https://www.linkedin.com/company/test-stiftung')).toBe(true);
  });

  it('returns true for esa.admin.ch and edi.admin.ch', () => {
    expect(isRegistryUrl('https://esa.admin.ch/something')).toBe(true);
    expect(isRegistryUrl('https://edi.admin.ch/something')).toBe(true);
  });

  it('returns true for spheriq.ch', () => {
    expect(isRegistryUrl('https://www.spheriq.ch/stiftung/test')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isRegistryUrl — legitimate foundation URLs
// ---------------------------------------------------------------------------

describe('isRegistryUrl — legitimate foundation URLs', () => {
  it('returns false for a real foundation website', () => {
    expect(isRegistryUrl('https://www.mercatorstiftung.ch')).toBe(false);
    expect(isRegistryUrl('https://stiftung-beispiel.ch')).toBe(false);
  });

  it('returns false for a foundation with similar but non-registry domain', () => {
    // "zefix-stiftung.ch" contains "zefix" but is not the zefix.ch registry
    expect(isRegistryUrl('https://www.zefix-stiftung.ch')).toBe(false);
    expect(isRegistryUrl('https://mystiftungschweiz.ch')).toBe(false);
  });

  it('returns false for a cantonal government website', () => {
    // E.g. a foundation linked on zh.ch — not a registry domain
    expect(isRegistryUrl('https://www.zh.ch/de/gesundheit')).toBe(false);
  });

  it('returns false for generic Swiss websites', () => {
    expect(isRegistryUrl('https://www.revamp-it.ch')).toBe(false);
    expect(isRegistryUrl('https://www.admin.ch')).toBe(false); // admin.ch itself is not listed
  });
});

// ---------------------------------------------------------------------------
// isRegistryUrl — subdomain matching
// ---------------------------------------------------------------------------

describe('isRegistryUrl — subdomain matching', () => {
  it('returns true for subdomains of wikipedia.org', () => {
    // de.wikipedia.org, en.wikipedia.org — both should match via endsWith('.wikipedia.org')
    expect(isRegistryUrl('https://de.wikipedia.org/wiki/Stiftung')).toBe(true);
    expect(isRegistryUrl('https://en.wikipedia.org/wiki/Foundation')).toBe(true);
  });

  it('returns true for www. prefix of any listed domain', () => {
    for (const domain of REGISTRY_DOMAINS) {
      expect(isRegistryUrl(`https://www.${domain}/path`)).toBe(true);
    }
  });

  it('returns true for exact domain match (no www)', () => {
    for (const domain of REGISTRY_DOMAINS) {
      expect(isRegistryUrl(`https://${domain}/path`)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// isRegistryUrl — case insensitivity
// ---------------------------------------------------------------------------

describe('isRegistryUrl — case insensitivity', () => {
  it('handles uppercase hostnames', () => {
    expect(isRegistryUrl('https://WWW.ZEFIX.CH/search')).toBe(true);
    expect(isRegistryUrl('https://STIFTUNGSCHWEIZ.CH/test')).toBe(true);
  });
});
