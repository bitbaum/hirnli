import { describe, it, expect } from 'vitest';
import { computeGesuchReadiness } from '../gesuch-readiness';
import type { ComposedGesuch } from '../gesuch-composer';
import type { GesuchOverridesData } from '@/lib/db/schema';
import { makeFoundation } from './fixtures';

function makeGesuch(overrides: Partial<ComposedGesuch> = {}): ComposedGesuch {
  return {
    ready: true,
    foundation: {
      name: 'Test',
      slug: 'test',
      type: 'A',
      typeLong: 'Perfekter Fit',
      approach: 'Full proposal',
      purposeSummary: 'Testing',
    },
    foundationBridge: 'Default bridge text for testing purposes.',
    themes: {
      primary: { id: 'kreislaufwirtschaft', label: 'Kreislaufwirtschaft' },
      secondary: [],
      all: [{ id: 'kreislaufwirtschaft', label: 'Kreislaufwirtschaft' }],
    },
    secondaryThemeRelevance: [],
    story: {
      why: 'Why text',
      how: 'How text',
      projects: ['Project A'],
      evidence: 'Evidence text',
    },
    ...overrides,
  } as ComposedGesuch;
}

function makeOverrides(overrides: Partial<GesuchOverridesData> = {}): GesuchOverridesData {
  return {
    foundationBridge: 'A personalized bridge text that is long enough to pass the check.',
    anschreiben: {
      opening: 'A personalized opening paragraph that is long enough to pass the check.',
    },
    ...overrides,
  } as GesuchOverridesData;
}

describe('computeGesuchReadiness', () => {
  it('returns score 0-100', () => {
    const result = computeGesuchReadiness(makeGesuch(), makeOverrides(), makeFoundation());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('returns 6 checks', () => {
    const result = computeGesuchReadiness(makeGesuch(), makeOverrides(), makeFoundation());
    expect(result.checks).toHaveLength(6);
  });

  it('all checks pass for complete data', () => {
    const result = computeGesuchReadiness(makeGesuch(), makeOverrides(), makeFoundation());
    expect(result.checks.every((c) => c.passed)).toBe(true);
    expect(result.score).toBe(100);
    expect(result.ready).toBe(true);
  });

  it('ready=true when score >= 60', () => {
    // 4 of 6 checks passing = 67%
    const result = computeGesuchReadiness(
      makeGesuch(),
      makeOverrides({ foundationBridge: '', anschreiben: undefined }),
      makeFoundation(),
    );
    // bridge and anschreiben fail → 4/6 = 67 → ready
    expect(result.ready).toBe(true);
  });

  it('ready=false when too few checks pass', () => {
    const result = computeGesuchReadiness(
      makeGesuch({
        themes: { primary: null, secondary: [], all: [] },
        story: { why: '', how: '', projects: [], evidence: '' },
      } as unknown as ComposedGesuch),
      makeOverrides({ foundationBridge: '', anschreiben: undefined }),
      makeFoundation({ contact: undefined, applicationMethod: 'unknown' }),
    );
    expect(result.ready).toBe(false);
  });

  it('bridge check fails for short text', () => {
    const result = computeGesuchReadiness(
      makeGesuch(),
      makeOverrides({ foundationBridge: 'Too short' }),
      makeFoundation(),
    );
    const bridge = result.checks.find((c) => c.id === 'bridge');
    expect(bridge?.passed).toBe(false);
  });

  it('anschreiben check fails when missing', () => {
    const result = computeGesuchReadiness(
      makeGesuch(),
      makeOverrides({ anschreiben: undefined }),
      makeFoundation(),
    );
    const anschreiben = result.checks.find((c) => c.id === 'anschreiben');
    expect(anschreiben?.passed).toBe(false);
  });

  it('contact check passes with email OR website', () => {
    const withEmail = computeGesuchReadiness(
      makeGesuch(),
      makeOverrides(),
      makeFoundation({ contact: { email: 'a@b.ch' }, websiteUrl: '' }),
    );
    expect(withEmail.checks.find((c) => c.id === 'contact')?.passed).toBe(true);

    const withWebsite = computeGesuchReadiness(
      makeGesuch(),
      makeOverrides(),
      makeFoundation({ contact: undefined, websiteUrl: 'https://test.ch' }),
    );
    expect(withWebsite.checks.find((c) => c.id === 'contact')?.passed).toBe(true);
  });

  it('method check fails for unknown', () => {
    const result = computeGesuchReadiness(
      makeGesuch(),
      makeOverrides(),
      makeFoundation({ applicationMethod: 'unknown' }),
    );
    expect(result.checks.find((c) => c.id === 'method')?.passed).toBe(false);
  });

  it('each check has id, label, and hint', () => {
    const result = computeGesuchReadiness(makeGesuch(), makeOverrides(), makeFoundation());
    for (const check of result.checks) {
      expect(check.id).toBeTruthy();
      expect(check.label).toBeTruthy();
      expect(check.hint).toBeTruthy();
    }
  });
});
