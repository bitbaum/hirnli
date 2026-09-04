import { describe, it, expect } from 'vitest';
import {
  extractPurposeCore,
  buildFoundationBridge,
  buildSecondaryRelevance,
} from '../bridge-composer';
import { makeFoundation, makeTenant } from './fixtures';

/** One tenant for every composer call here — the identity is not what these
 *  tests are about, but it must be passed rather than imported. */
const TENANT = makeTenant();

describe('extractPurposeCore', () => {
  it('strips ESA prefix format', () => {
    const result = extractPurposeCore(
      'Stiftung Muster (Zürich, ZH): , Förderung von Bildungsprojekten.',
    );
    expect(result).toBe('Förderung von Bildungsprojekten');
  });

  it('strips statute prefix format', () => {
    const result = extractPurposeCore(
      'Zweck der Stiftung ist: - Förderung nachhaltiger Projekte - Bildungsarbeit',
    );
    expect(result).toBe('Förderung nachhaltiger Projekte');
  });

  it('handles double-prefix format', () => {
    const result = extractPurposeCore(
      'Name (City): Zweck der Stiftung ist: - Unterstützung sozialer Projekte',
    );
    expect(result).toBe('Unterstützung sozialer Projekte');
  });

  it('takes first sentence by period', () => {
    const result = extractPurposeCore('Fördert Umweltprojekte. Auch Bildung und Soziales.');
    expect(result).toBe('Fördert Umweltprojekte');
  });

  it('takes first bullet if no period before it', () => {
    const result = extractPurposeCore(
      'Förderung der Nachhaltigkeit - Bildungsprojekte - Sozialarbeit',
    );
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
  it('names the organisation it was GIVEN, not one it imported', () => {
    // Asserting a literal name here is what let the composer keep an
    // ORG_PROFILE import: the fixture and the import agreed, so the test passed
    // either way. Two different tenants must produce two different sentences.
    const f = makeFoundation();
    const mine = buildFoundationBridge(TENANT, f, 'Kreislaufwirtschaft');
    const theirs = buildFoundationBridge(
      makeTenant({ name: 'Andere Organisation' }),
      f,
      'Kreislaufwirtschaft',
    );

    expect(mine).toContain(TENANT.name);
    expect(mine).toContain('Kreislaufwirtschaft');
    expect(theirs).toContain('Andere Organisation');
    expect(theirs).not.toContain(TENANT.name);
  });

  it('mentions foundation name when purposeSummary exists', () => {
    const f = makeFoundation({
      name: 'Drosos Stiftung',
      purposeSummary: 'Fördert Umweltprojekte.',
    });
    const result = buildFoundationBridge(TENANT, f, 'Kreislaufwirtschaft');
    expect(result).toContain('Drosos Stiftung');
    expect(result).toContain(TENANT.name);
    expect(result).toContain('Kreislaufwirtschaft');
  });

  it('uses years-active format when no purposeSummary', () => {
    const f = makeFoundation({ purposeSummary: '' });
    const result = buildFoundationBridge(TENANT, f, 'Kreislaufwirtschaft');
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
