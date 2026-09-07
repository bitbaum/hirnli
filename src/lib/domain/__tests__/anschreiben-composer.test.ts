import { describe, it, expect } from 'vitest';
import { buildDynamicOpening, buildThemeAlignment } from '../anschreiben-composer';
import { makeFoundation, makeStory, makeTenant } from './fixtures';
import type { ThemeMetadata } from '@/lib/schemas/theme';

/** One tenant for every composer call here — the identity is not what these
 *  tests are about, but it must be passed rather than imported. */
const TENANT = makeTenant();
/** The same, bound to a story: these functions read templates from it. */
const STORY = makeStory(TENANT);

const sampleThemes: ThemeMetadata[] = [
  { id: 'kreislaufwirtschaft', label: 'Kreislaufwirtschaft', icon: '♻️', color: '#10b981' },
  { id: 'soziale-integration', label: 'Soziale Integration', icon: '🤝', color: '#3b82f6' },
];

describe('buildDynamicOpening', () => {
  it('includes Fördergesuch for type A with purpose', () => {
    const result = buildDynamicOpening(STORY, makeFoundation({ type: 'A' }), 'Kreislaufwirtschaft');
    expect(result).toContain('Fördergesuch');
  });

  it('varies by foundation type when research is not deep', () => {
    // Deep+highFit triggers a shared opening regardless of type, so test with standard depth
    const typeA = buildDynamicOpening(
      STORY,
      makeFoundation({ type: 'A', researchDepth: 'standard', fitScore: 5 }),
      'Kreislaufwirtschaft',
    );
    const typeC = buildDynamicOpening(
      STORY,
      makeFoundation({ type: 'C', researchDepth: 'standard', fitScore: 5 }),
      'Kreislaufwirtschaft',
    );
    expect(typeA).not.toBe(typeC);
  });

  it('uses deep+highFit special opening', () => {
    const f = makeFoundation({ researchDepth: 'deep', fitScore: 9 });
    const result = buildDynamicOpening(STORY, f, 'Kreislaufwirtschaft');
    expect(result).toContain('Fördergesuch');
    expect(result).toContain('Kreislaufwirtschaft');
  });

  it('falls back to template when no purposeSummary', () => {
    const f = makeFoundation({ type: 'B', purposeSummary: '' });
    const result = buildDynamicOpening(STORY, f, 'Kreislaufwirtschaft');
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(20);
  });

  it('handles type D with standard depth', () => {
    const result = buildDynamicOpening(
      STORY,
      makeFoundation({ type: 'D', researchDepth: 'standard', fitScore: 5 }),
      'Kreislaufwirtschaft',
    );
    expect(result).toContain('messbare Wirkung');
  });

  it('network type uses network template opening, not type-A opening', () => {
    // Regression: default case in switch was returning ANSCHREIBEN_TEMPLATES['A'].opening
    // instead of ANSCHREIBEN_TEMPLATES[foundation.type].opening for 'network' foundations
    const networkResult = buildDynamicOpening(
      STORY,
      makeFoundation({
        type: 'network',
        researchDepth: 'standard',
        fitScore: 5,
        purposeSummary: '',
      }),
      'Kreislaufwirtschaft',
    );
    const typeAResult = buildDynamicOpening(
      STORY,
      makeFoundation({ type: 'A', researchDepth: 'standard', fitScore: 5, purposeSummary: '' }),
      'Kreislaufwirtschaft',
    );
    // Network opening is distinct from type-A opening
    expect(networkResult).not.toBe(typeAResult);
    // And it is THIS organisation's network template, whatever that says. The
    // assertion used to look for a particular German word, which held only
    // because the fixture was one real customer's content — a test that fails
    // when a customer rewrites a sentence is testing the customer.
    expect(networkResult).toBe(STORY.anschreibenTemplate('network').opening);
  });
});

describe('buildThemeAlignment', () => {
  it('includes theme labels when provided', () => {
    const result = buildThemeAlignment(STORY, makeFoundation(), sampleThemes);
    expect(result).toContain('Kreislaufwirtschaft');
    expect(result).toContain('Förderbereiche');
  });

  it('includes purpose reference when available', () => {
    const result = buildThemeAlignment(STORY, makeFoundation(), sampleThemes);
    expect(result).toContain('Stiftungszweck');
  });

  it('falls back gracefully with empty themes', () => {
    const result = buildThemeAlignment(STORY, makeFoundation(), []);
    expect(result).toBeTruthy();
    expect(result).toContain('Stiftungszweck');
  });

  it('falls back when no themes and no purpose', () => {
    const result = buildThemeAlignment(STORY, makeFoundation({ purposeSummary: '' }), []);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(20);
  });
});
