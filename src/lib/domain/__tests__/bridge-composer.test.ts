import { describe, it, expect } from 'vitest';
import { extractPurposeCore, buildFoundationBridge, buildSecondaryRelevance } from '../bridge-composer';
import { makeFoundation } from './fixtures';

describe('extractPurposeCore', () => {
  it('strips ESA prefix format', () => {
    const result = extractPurposeCore('Stiftung Muster (Zürich, ZH): , Förderung von Bildungsprojekten.');
    expect(result).toBe('Förderung von Bildungsprojekten');
  });

  it('strips statute prefix format', () => {
    const result = extractPurposeCore('Zweck der Stiftung ist: - Förderung nachhaltiger Projekte - Bildungsarbeit');
    expect(result).toBe('Förderung nachhaltiger Projekte');
  });

  it('handles double-prefix format', () => {
    const result = extractPurposeCore('Name (City): Zweck der Stiftung ist: - Unterstützung sozialer Projekte');
    expect(result).toBe('Unterstützung sozialer Projekte');
  });

  it('takes first sentence by period', () => {
    const result = extractPurposeCore('Fördert Umweltprojekte. Auch Bildung und Soziales.');
    expect(result).toBe('Fördert Umweltprojekte');
  });

  it('takes first bullet if no period before it', () => {
    const result = extractPurposeCore('Förderung der Nachhaltigkeit - Bildungsprojekte - Sozialarbeit');
    expect(result).toBe('Förderung der Nachhaltigkeit');
  });

  it('returns full text if no separator', () => {
    const result = extractPurposeCore('Förderung sozialer Projekte');
    expect(result).toBe('Förderung sozialer Projekte');
  });

  it('handles empty string', () => {
    expect(extractPurposeCore('')).toBe('');
  });

  it('strips leading bullet markers', () => {
    const result = extractPurposeCore('- Förderung der Bildung. Weitere Ziele.');
    expect(result).toBe('Förderung der Bildung');
  });
});

describe('buildFoundationBridge', () => {
  it('returns bridge text with org name', () => {
    const f = makeFoundation();
    const result = buildFoundationBridge(f, 'Kreislaufwirtschaft');
    expect(result).toContain('Revamp-IT');
    expect(result).toContain('Kreislaufwirtschaft');
  });

  it('uses experience format when purposeSummary exists', () => {
    const f = makeFoundation({ purposeSummary: 'Fördert Umweltprojekte.' });
    const result = buildFoundationBridge(f, 'Kreislaufwirtschaft');
    expect(result).toContain('adressiert genau dieses Anliegen');
  });

  it('uses years-active format when no purposeSummary', () => {
    const f = makeFoundation({ purposeSummary: '' });
    const result = buildFoundationBridge(f, 'Kreislaufwirtschaft');
    expect(result).toContain('Jahren aktiv');
  });
});

describe('buildSecondaryRelevance', () => {
  it('returns empty array for empty input', () => {
    expect(buildSecondaryRelevance([])).toHaveLength(0);
  });

  it('returns label and connection for valid themes', () => {
    const result = buildSecondaryRelevance(['kreislaufwirtschaft']);
    if (result.length > 0) {
      expect(result[0].label).toBeTruthy();
      expect(result[0].connection).toBeTruthy();
      expect(result[0].connection).toMatch(/\.$/); // ends with period
    }
  });

  it('filters out themes with no WHY section', () => {
    const result = buildSecondaryRelevance(['nonexistent' as never]);
    expect(result).toHaveLength(0);
  });
});
