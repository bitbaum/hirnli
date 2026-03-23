import { describe, it, expect } from 'vitest';
import { buildDynamicOpening, buildThemeAlignment } from '../anschreiben-composer';
import { makeFoundation } from './fixtures';
import type { ThemeMetadata } from '@/lib/schemas/theme';

const sampleThemes: ThemeMetadata[] = [
  { id: 'kreislaufwirtschaft', label: 'Kreislaufwirtschaft', icon: '♻️', color: '#10b981' },
  { id: 'soziale-integration', label: 'Soziale Integration', icon: '🤝', color: '#3b82f6' },
];

describe('buildDynamicOpening', () => {
  it('includes Fördergesuch for type A with purpose', () => {
    const result = buildDynamicOpening(makeFoundation({ type: 'A' }), 'Kreislaufwirtschaft');
    expect(result).toContain('Fördergesuch');
  });

  it('varies by foundation type when research is not deep', () => {
    // Deep+highFit triggers a shared opening regardless of type, so test with standard depth
    const typeA = buildDynamicOpening(makeFoundation({ type: 'A', researchDepth: 'standard', fitScore: 5 }), 'Kreislaufwirtschaft');
    const typeC = buildDynamicOpening(makeFoundation({ type: 'C', researchDepth: 'standard', fitScore: 5 }), 'Kreislaufwirtschaft');
    expect(typeA).not.toBe(typeC);
  });

  it('uses deep+highFit special opening', () => {
    const f = makeFoundation({ researchDepth: 'deep', fitScore: 9 });
    const result = buildDynamicOpening(f, 'Kreislaufwirtschaft');
    expect(result).toContain('Fördergesuch');
    expect(result).toContain('Kreislaufwirtschaft');
  });

  it('falls back to template when no purposeSummary', () => {
    const f = makeFoundation({ type: 'B', purposeSummary: '' });
    const result = buildDynamicOpening(f, 'Kreislaufwirtschaft');
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(20);
  });

  it('handles type D with standard depth', () => {
    const result = buildDynamicOpening(
      makeFoundation({ type: 'D', researchDepth: 'standard', fitScore: 5 }),
      'Kreislaufwirtschaft',
    );
    expect(result).toContain('messbare Wirkung');
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
