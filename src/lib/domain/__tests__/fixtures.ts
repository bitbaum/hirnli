import type { Foundation } from '@/lib/schemas/foundation';
import { deriveTenant, type Tenant } from '@/lib/tenant/profile';

/**
 * Factory for creating test Foundation objects.
 * Override any field by passing a partial.
 */
export function makeFoundation(overrides: Partial<Foundation> = {}): Foundation {
  return {
    // Registry
    slug: 'test-stiftung',
    name: 'Test Stiftung',
    websiteUrl: 'https://test-stiftung.ch',
    region: 'Zürich',
    contact: { email: 'info@test.ch', phone: '+41 44 000 00 00', address: 'Teststr. 1' },
    founded: 2010,
    status: 'open',
    deadlineText: 'Laufend',
    deadline: null,
    applicationMethod: 'email',
    acceptsApplications: 'yes',
    amount: { min: 10000, max: 50000, text: '10k-50k CHF' },
    source: 'manual',
    sourceLinks: [{ source: 'manual', url: 'https://test.ch' }],
    purposeSummary:
      'Die Stiftung fördert Projekte in den Bereichen Umwelt, Bildung und soziale Integration mit Schwerpunkt auf nachhaltige Entwicklung in der Schweiz. Sie unterstützt innovative Ansätze.',
    boardMembers: [{ name: 'Max Muster', role: 'Präsident' }],
    pastGrantees: ['Org A', 'Org B'],
    applicationProcess: ['Gesuch einreichen', 'Prüfung', 'Entscheid'],

    // Analysis
    fitScore: 7,
    priority: 2,
    type: 'A',
    themes: ['kreislaufwirtschaft', 'soziale-integration'],
    tagline: 'Fördert Nachhaltigkeit und Bildung',
    researchNotes:
      'Gut recherchierte Stiftung mit klarem Profil. Die Stiftung hat eine lange Tradition der Förderung von Projekten in den Bereichen Umwelt und Bildung. Direkter Kontakt möglich. Ansprechperson bekannt. Regelmässige Vergabesitzungen vierteljährlich. Gute Passung.',
    researchDate: '2026-01-15',
    researchDepth: 'deep',
    ...overrides,
  };
}

/** Minimal foundation — only name and slug, everything else bare minimum */
export function makeMinimalFoundation(overrides: Partial<Foundation> = {}): Foundation {
  return makeFoundation({
    websiteUrl: '',
    contact: undefined,
    founded: null,
    applicationMethod: 'unknown',
    acceptsApplications: 'unknown',
    amount: { min: null, max: null, text: 'Unbekannt' },
    purposeSummary: '',
    boardMembers: undefined,
    pastGrantees: undefined,
    applicationProcess: undefined,
    sourceLinks: undefined,
    fitScore: 0,
    priority: 4,
    type: 'D',
    themes: [],
    tagline: 'Keine Details',
    researchNotes: '',
    researchDepth: 'rapid',
    deadlineText: 'Unbekannt',
    ...overrides,
  });
}

/**
 * A tenant for composer tests.
 *
 * Built through `deriveTenant` rather than as a literal, so `yearsActive` and
 * `experienceLabel` are computed the way production computes them and cannot
 * drift from `founded`. The clock is pinned: these fields change with the
 * calendar, so a fixture reading the real date passes all year and fails on
 * 1 January.
 */
export function makeTenant(overrides: Partial<Tenant> = {}): Tenant {
  const base = deriveTenant(
    {
      orgId: 'test-org',
      name: 'Test-Organisation',
      legalForm: 'Gemeinnütziger Verein',
      founded: 2003,
      location: 'Zürich',
      email: 'kontakt@test-org.ch',
      website: 'https://test-org.ch',
      siteUrl: 'https://test-org.example',
      missionSummary: 'Kreislaufwirtschaft und Arbeitsintegration',
    },
    new Date('2026-06-01'),
  );
  return { ...base, ...overrides };
}

/**
 * A tenant with only the facts the schema requires.
 *
 * The optional fields are the ones that actually break composers — no
 * missionSummary, no siteUrl, no missionAreas — and the second real tenant
 * lacks most of them. Use this to assert that absence degrades to something
 * true rather than to "undefined" in a document going to a foundation.
 */
export function makeMinimalTenant(overrides: Partial<Tenant> = {}): Tenant {
  const base = deriveTenant(
    {
      orgId: 'minimal-org',
      name: 'Minimal-Organisation',
      legalForm: 'Verein nach Art. 60 ff. ZGB',
      founded: 2026,
      location: 'Bern',
      email: 'kontakt@minimal.example',
    },
    new Date('2026-06-01'),
  );
  return { ...base, ...overrides };
}
