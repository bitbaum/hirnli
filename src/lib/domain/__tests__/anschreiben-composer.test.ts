import { describe, it, expect } from 'vitest';
import { buildDynamicOpening, buildThemeAlignment } from '../anschreiben-composer';
import { makeFoundation, makeTenant } from './fixtures';
import type { ThemeMetadata } from '@/lib/schemas/theme';

/** One tenant for every composer call here — the identity is not what these
 *  tests are about, but it must be passed rather than imported. */
const TENANT = makeTenant();

const sampleThemes: ThemeMetadata[] = [
  { id: 'kreislaufwirtschaft', label: 'Kreislaufwirtschaft', icon: '♻️', color: '#10b981' },
  { id: 'soziale-integration', label: 'Soziale Integration', icon: '🤝', color: '#3b82f6' },
];

describe('buildDynamicOpening', () => {
  it('includes Fördergesuch for type A with purpose', () => {
    const result = buildDynamicOpening(
      TENANT,
      makeFoundation({ type: 'A' }),
      'Kreislaufwirtschaft',
    );
    expect(result).toContain('Fördergesuch');
  });

  it('varies by foundation type when research is not deep', () => {
    // Deep+highFit triggers a shared opening regardless of type, so test with standard depth
    const typeA = buildDynamicOpening(
      TENANT,
      makeFoundation({ type: 'A', researchDepth: 'standard', fitScore: 5 }),
      'Kreislaufwirtschaft',
    );
    const typeC = buildDynamicOpening(
      TENANT,
      makeFoundation({ type: 'C', researchDepth: 'standard', fitScore: 5 }),
      'Kreislaufwirtschaft',
    );
    expect(typeA).not.toBe(typeC);
  });

  it('uses deep+highFit special opening', () => {
    const f = makeFoundation({ researchDepth: 'deep', fitScore: 9 });
    const result = buildDynamicOpening(TENANT, f, 'Kreislaufwirtschaft');
    expect(result).toContain('Fördergesuch');
    expect(result).toContain('Kreislaufwirtschaft');
  });

  it('falls back to template when no purposeSummary', () => {
    const f = makeFoundation({ type: 'B', purposeSummary: '' });
    const result = buildDynamicOpening(TENANT, f, 'Kreislaufwirtschaft');
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(20);
  });

  it('handles type D with standard depth', () => {
    const result = buildDynamicOpening(
      TENANT,
      makeFoundation({ type: 'D', researchDepth: 'standard', fitScore: 5 }),
      'Kreislaufwirtschaft',
    );
    expect(result).toContain('messbare Wirkung');
  });

  it('network type uses network template opening, not type-A opening', () => {
    // Regression: default case in switch was returning ANSCHREIBEN_TEMPLATES['A'].opening
    // instead of ANSCHREIBEN_TEMPLATES[foundation.type].opening for 'network' foundations
    const networkResult = buildDynamicOpening(
      TENANT,
      makeFoundation({
        type: 'network',
        researchDepth: 'standard',
        fitScore: 5,
        purposeSummary: '',
      }),
      'Kreislaufwirtschaft',
    );
    const typeAResult = buildDynamicOpening(
      TENANT,
      makeFoundation({ type: 'A', researchDepth: 'standard', fitScore: 5, purposeSummary: '' }),
      'Kreislaufwirtschaft',
    );
    // Network opening is distinct from type-A opening
    expect(networkResult).not.toBe(typeAResult);
    // Network template mentions Mitgliedschaft (unique to network template)
    expect(networkResult).toContain('Mitgliedschaft');
  });
});

describe('buildThemeAlignment', () => {
  it('includes theme labels when provided', () => {
    const result = buildThemeAlignment(makeFoundation(), sampleThemes);
    expect(result).toContain('Kreislaufwirtschaft');
    expect(result).toContain('Förderbereiche');
  });

  it('includes purpose reference when available', () => {
    const result = buildThemeAlignment(makeFoundation(), sampleThemes);
    expect(result).toContain('Stiftungszweck');
  });

  it('falls back gracefully with empty themes', () => {
    const result = buildThemeAlignment(makeFoundation(), []);
    expect(result).toBeTruthy();
    expect(result).toContain('Stiftungszweck');
  });

  it('falls back when no themes and no purpose', () => {
    const result = buildThemeAlignment(makeFoundation({ purposeSummary: '' }), []);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(20);
  });
});
