import type { Foundation } from '@/lib/schemas/foundation';
import { deriveTenant, type Tenant } from '@/lib/tenant/profile';
import { STORIES_CONTENT } from '@/lib/config/stories';
import { STARTER_STORIES } from '@/lib/content/starter-content';
import { storiesBlockSchema, type StoriesBlock } from '@/lib/content/stories-source';
import { tenantStory, type TenantStory } from '@/lib/content/story-engine';
import {
  BUDGET_LINE_ITEMS,
  BUDGET_SCENARIOS,
  EIGENLEISTUNG_CONFIG,
} from '@/lib/config/budget-scenarios';
import { CODE_BUDGET_MODEL } from '@/lib/config/budget-model';
import { budgetBlockSchema, type BudgetBlock } from '@/lib/schemas/budget';
import { tenantBudget, type TenantBudget } from '@/lib/content/budget-engine';

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

/**
 * A tenant bound to a story, which is what every composer now takes.
 *
 * Built from the code block so the assertions below it keep testing the same
 * content they always did — the point of these tests is the composition, not
 * the prose. What changed is that the prose now arrives through a parameter, so
 * a test can hand a composer a DIFFERENT organisation's story and watch the
 * output follow, which is the property that was untestable while the story was
 * an import.
 */
export function makeStory(
  tenant: Tenant = makeTenant(),
  blockOverrides: Partial<StoriesBlock> = {},
): TenantStory {
  const block = storiesBlockSchema.parse({ ...STORIES_CONTENT, ...blockOverrides });
  return tenantStory(tenant, block);
}

/**
 * A tenant that has signed up and written nothing yet.
 *
 * The starter block is skeleton prose with "[Bitte ergänzen]" markers, which is
 * exactly what a new customer has on day one. Composing from it must produce a
 * visibly unfinished document rather than a polished one.
 */
export function makeStarterStory(tenant: Tenant = makeTenant()): TenantStory {
  return tenantStory(tenant, storiesBlockSchema.parse(STARTER_STORIES));
}

/**
 * A tenant bound to a budget, which is what `composeGesuchDokument` now takes.
 *
 * `overrides` exists so a test can hand the composer a DIFFERENT organisation's
 * figures and watch the output follow — the property that was unrepresentable
 * while the budget was a module import, and the reason every applicant's Gesuch
 * carried one organisation's rent, equipment and staffing.
 */
export function makeBudget(
  tenant: Tenant = makeTenant(),
  overrides: Partial<BudgetBlock> = {},
): TenantBudget {
  const block = budgetBlockSchema.parse({
    LINE_ITEMS: BUDGET_LINE_ITEMS,
    SCENARIOS: BUDGET_SCENARIOS,
    EIGENLEISTUNG: EIGENLEISTUNG_CONFIG,
    DEGRESSIVE: CODE_BUDGET_MODEL.DEGRESSIVE,
    PROJECT: CODE_BUDGET_MODEL.PROJECT,
    ...overrides,
  });
  return tenantBudget(tenant, block);
}

/**
 * A budget belonging to an entirely different organisation.
 *
 * Same structure, no figure or label in common — a small theatre rather than a
 * workshop. Used to assert that nothing in a composed Gesuch's numbers survives
 * changing whose budget it is.
 */
export function makeOtherBudget(tenant: Tenant = makeTenant()): TenantBudget {
  const lineItems = [
    {
      id: 'venue_hire',
      label: 'Saalmiete Probebühne',
      description: 'Probebühne für Ensemble und Nachwuchsarbeit',
      category: 'space' as const,
      amount: 41_000,
      type: 'jaehrlich' as const,
      source: {
        methodology: 'Offerten von drei Spielstätten, Frühjahr 2026',
        confidence: 'medium' as const,
        lastVerified: '2026-03-01',
      },
    },
    {
      id: 'lighting_rig',
      label: 'Lichtanlage',
      description: 'Grundausstattung Bühnenlicht',
      category: 'equipment' as const,
      amount: 23_000,
      type: 'einmalig' as const,
      source: {
        methodology: 'Zwei Offerten Bühnentechnik',
        confidence: 'high' as const,
        lastVerified: '2026-03-01',
      },
    },
  ];
  return tenantBudget(
    tenant,
    budgetBlockSchema.parse({
      LINE_ITEMS: lineItems,
      SCENARIOS: [
        {
          id: 'ensemble',
          label: 'Ensemble — Grundbetrieb',
          description: 'Probebühne und Technik für eine Spielzeit',
          tagline: 'Der Betrieb, den eine Spielzeit mindestens braucht',
          lineItemIds: ['venue_hire', 'lighting_rig'],
          targetFoundations: ['B'],
          spaceRequirement: { min_sqm: 120, max_sqm: 180 },
          threeYearModel: {
            year1: { einmalig: 23_000, jaehrlich: 41_000, eigenleistung: 9_000 },
            year2: { jaehrlich: 41_000, eigenleistung: 12_000 },
            year3: { jaehrlich: 41_000, eigenleistung: 17_000 },
          },
        },
      ],
      EIGENLEISTUNG: {
        label: 'Freiwilligenarbeit Ensemble',
        description: 'Bewerteter Wert unbezahlter Probenarbeit, kein Cashflow.',
        ratePerHour: 30,
        year1: 9_000,
        year2: 12_000,
        year3: 17_000,
        source: {
          methodology: 'Probenplan mal Stundenansatz',
          confidence: 'estimated' as const,
          lastVerified: '2026-03-01',
        },
      },
      DEGRESSIVE: {
        year2: { stiftungenPct: 0.8, eigenGrowth: 3_000 },
        year3: { stiftungenPct: 0.6, eigenGrowth: 8_000 },
      },
      PROJECT: {
        startYear: 2027,
        endYear: 2029,
        durationLabel: 'Spielzeit eins → zwei → drei',
        yearLabels: ['Spielzeit eins', 'Spielzeit zwei', 'Spielzeit drei'],
        defaultScenarioId: 'ensemble',
      },
    }),
  );
}
