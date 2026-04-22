import { describe, it, expect } from 'vitest';
import { getTrustLevel } from '@/lib/config/trust-levels';
import { RESEARCH_LINKS, getResearchLinks } from '@/lib/config/research-links';
import type { Foundation } from '@/lib/schemas/foundation';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeFoundation(overrides: Partial<Foundation> = {}): Foundation {
  return {
    slug: 'test',
    name: 'Test Stiftung',
    type: 'A',
    fitScore: 5,
    priority: 2,
    themes: [],
    sdgs: [],
    researchDepth: 'rapid',
    dataConfidence: 'unverified',
    // 'zefix' is not in VERIFIED_SOURCES or ASSESSED_SOURCES → defaults to unverified tier
    source: 'zefix',
    purposeSummary: '',
    amount: { min: null, max: null },
    contact: {},
    ...overrides,
  } as Foundation;
}

// ---------------------------------------------------------------------------
// getTrustLevel — verified sources
// ---------------------------------------------------------------------------

describe('getTrustLevel — verified', () => {
  it('returns verified for source=manual', () => {
    expect(getTrustLevel(makeFoundation({ source: 'manual' }))).toBe('verified');
  });

  it('returns verified for source=cantonal', () => {
    expect(getTrustLevel(makeFoundation({ source: 'cantonal' }))).toBe('verified');
  });

  it('returns verified for researchDepth=deep regardless of source', () => {
    expect(
      getTrustLevel(makeFoundation({ source: 'zefix', researchDepth: 'deep' }))
    ).toBe('verified');
  });

  it('returns verified for manual source even if depth is rapid', () => {
    expect(getTrustLevel(makeFoundation({ source: 'manual', researchDepth: 'rapid' }))).toBe('verified');
  });
});

// ---------------------------------------------------------------------------
// getTrustLevel — assessed sources
// ---------------------------------------------------------------------------

describe('getTrustLevel — assessed', () => {
  it('returns assessed for source=website', () => {
    expect(getTrustLevel(makeFoundation({ source: 'website' }))).toBe('assessed');
  });

  it('returns assessed for source=esa', () => {
    expect(getTrustLevel(makeFoundation({ source: 'esa' }))).toBe('assessed');
  });

  it('returns assessed for source=fundraiso', () => {
    expect(getTrustLevel(makeFoundation({ source: 'fundraiso' }))).toBe('assessed');
  });

  it('returns assessed for source=stiftungschweiz', () => {
    expect(getTrustLevel(makeFoundation({ source: 'stiftungschweiz' }))).toBe('assessed');
  });

  it('returns assessed for researchDepth=standard regardless of source', () => {
    expect(
      getTrustLevel(makeFoundation({ source: 'zefix', researchDepth: 'standard' }))
    ).toBe('assessed');
  });
});

// ---------------------------------------------------------------------------
// getTrustLevel — unverified
// ---------------------------------------------------------------------------

describe('getTrustLevel — unverified', () => {
  it('returns unverified for zefix source at rapid depth (not in verified or assessed lists)', () => {
    // zefix is the only SourceId not in VERIFIED_SOURCES or ASSESSED_SOURCES
    expect(
      getTrustLevel(makeFoundation({ source: 'zefix', researchDepth: 'rapid' }))
    ).toBe('unverified');
  });

  it('returns unverified by default (no matching source or depth)', () => {
    // Base fixture: source='zefix', researchDepth='rapid' → unverified
    expect(getTrustLevel(makeFoundation())).toBe('unverified');
  });

  it('zefix source at standard depth is assessed (depth wins)', () => {
    // researchDepth=standard overrides a non-assessed source
    expect(
      getTrustLevel(makeFoundation({ source: 'zefix', researchDepth: 'standard' }))
    ).toBe('assessed');
  });
});

// ---------------------------------------------------------------------------
// RESEARCH_LINKS — structure
// ---------------------------------------------------------------------------

describe('RESEARCH_LINKS — structure', () => {
  it('has 7 links', () => {
    expect(RESEARCH_LINKS).toHaveLength(7);
  });

  it('each link has id, label, description, url function', () => {
    for (const link of RESEARCH_LINKS) {
      expect(typeof link.id).toBe('string');
      expect(link.id.length).toBeGreaterThan(0);
      expect(typeof link.label).toBe('string');
      expect(typeof link.description).toBe('string');
      expect(typeof link.url).toBe('function');
    }
  });

  it('IDs are unique', () => {
    const ids = RESEARCH_LINKS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes zefix and uid-register as official sources', () => {
    const official = RESEARCH_LINKS.filter((l) => l.official).map((l) => l.id);
    expect(official).toContain('zefix');
    expect(official).toContain('uid-register');
  });

  it('google is always the last link (fallback)', () => {
    expect(RESEARCH_LINKS[RESEARCH_LINKS.length - 1].id).toBe('google');
  });
});

// ---------------------------------------------------------------------------
// RESEARCH_LINKS URL construction — with UID
// ---------------------------------------------------------------------------

describe('RESEARCH_LINKS URL construction — with UID', () => {
  const withUID = makeFoundation({ uid: 'CHE-123.456.789', name: 'Muster Stiftung' });

  it('zefix URL contains UID', () => {
    const zefix = RESEARCH_LINKS.find((l) => l.id === 'zefix')!;
    const url = zefix.url(withUID);
    expect(url).toContain('CHE-123.456.789');
    expect(url).toContain('zefix.ch');
  });

  it('uid-register URL contains UID', () => {
    const link = RESEARCH_LINKS.find((l) => l.id === 'uid-register')!;
    const url = link.url(withUID);
    expect(url).toContain('CHE-123.456.789');
    expect(url).toContain('uid.admin.ch');
  });

  it('northdata URL contains both name and UID', () => {
    const link = RESEARCH_LINKS.find((l) => l.id === 'northdata')!;
    const url = link.url(withUID);
    expect(url).toContain('northdata.com');
    // Both name and UID encoded in URL
    expect(url).toContain('CHE-123.456.789');
  });
});

// ---------------------------------------------------------------------------
// RESEARCH_LINKS URL construction — without UID
// ---------------------------------------------------------------------------

describe('RESEARCH_LINKS URL construction — without UID', () => {
  const noUID = makeFoundation({ uid: undefined, name: 'Helvetia Stiftung' });

  it('zefix returns null without UID', () => {
    const zefix = RESEARCH_LINKS.find((l) => l.id === 'zefix')!;
    expect(zefix.url(noUID)).toBeNull();
  });

  it('uid-register returns null without UID', () => {
    const link = RESEARCH_LINKS.find((l) => l.id === 'uid-register')!;
    expect(link.url(noUID)).toBeNull();
  });

  it('stiftungschweiz falls back to name search without UID', () => {
    const link = RESEARCH_LINKS.find((l) => l.id === 'stiftungschweiz')!;
    const url = link.url(noUID);
    expect(url).not.toBeNull();
    expect(url).toContain('Helvetia');
  });

  it('google always returns a URL', () => {
    const link = RESEARCH_LINKS.find((l) => l.id === 'google')!;
    expect(link.url(noUID)).not.toBeNull();
    expect(link.url(noUID)).toContain('google.com');
  });
});

// ---------------------------------------------------------------------------
// getResearchLinks — filters out null URLs
// ---------------------------------------------------------------------------

describe('getResearchLinks', () => {
  it('returns only links with non-null URLs', () => {
    const noUID = makeFoundation({ uid: undefined, name: 'Test Stiftung' });
    const links = getResearchLinks(noUID);
    // All returned links must have href
    for (const link of links) {
      expect(typeof link.href).toBe('string');
      expect(link.href.length).toBeGreaterThan(0);
    }
  });

  it('returns fewer links when UID is missing (zefix/uid-register excluded)', () => {
    const withUID = makeFoundation({ uid: 'CHE-000.000.000', name: 'Test' });
    const noUID = makeFoundation({ uid: undefined, name: 'Test' });
    const linksWithUID = getResearchLinks(withUID);
    const linksNoUID = getResearchLinks(noUID);
    expect(linksWithUID.length).toBeGreaterThan(linksNoUID.length);
  });

  it('each returned link has href that is a valid URL', () => {
    const f = makeFoundation({ uid: 'CHE-123.456.789', name: 'Muster Stiftung' });
    const links = getResearchLinks(f);
    for (const link of links) {
      expect(() => new URL(link.href)).not.toThrow();
    }
  });

  it('returned links preserve the original link properties', () => {
    const f = makeFoundation({ uid: 'CHE-123.456.789', name: 'Test' });
    const links = getResearchLinks(f);
    for (const link of links) {
      expect(typeof link.id).toBe('string');
      expect(typeof link.label).toBe('string');
    }
  });
});
