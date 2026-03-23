import { describe, it, expect } from 'vitest';
import { computeFitScore, fitScoreToDisplay, evaluateEngine } from '../fit-scoring';
import { SCORING_ENGINE, READINESS_ENGINE } from '@/lib/config/fit-scoring';

describe('computeFitScore', () => {
  it('returns fitScore 0-10', () => {
    const result = computeFitScore({
      themes: ['kreislaufwirtschaft', 'soziale-integration'],
      canton: 'ZH',
      city: 'Zürich',
      applicationMethod: 'email',
      isFunder: true,
    });
    expect(result.fitScore).toBeGreaterThanOrEqual(0);
    expect(result.fitScore).toBeLessThanOrEqual(10);
  });

  it('returns higher score for matching themes', () => {
    const withThemes = computeFitScore({
      themes: ['kreislaufwirtschaft', 'arbeitsintegration', 'digitale-bildung'],
      canton: 'ZH',
      city: 'Zürich',
      applicationMethod: 'email',
      isFunder: true,
    });
    const noThemes = computeFitScore({
      themes: [],
      canton: 'AG',
      city: 'Aarau',
      applicationMethod: 'unknown',
      isFunder: true,
    });
    expect(withThemes.fitScore).toBeGreaterThan(noThemes.fitScore);
  });

  it('returns per-dimension breakdown', () => {
    const result = computeFitScore({
      themes: ['kreislaufwirtschaft'],
      canton: 'ZH',
      city: 'Zürich',
      applicationMethod: 'email',
      isFunder: true,
    });
    expect(Object.keys(result.dimensions).length).toBeGreaterThan(0);
  });

  it('returns 0 for empty input', () => {
    const result = computeFitScore({
      themes: [],
      canton: '',
      city: '',
      applicationMethod: 'unknown',
      isFunder: false,
    });
    expect(result.fitScore).toBe(0);
  });
});

describe('fitScoreToDisplay', () => {
  it('maps 7-10 to level 3', () => {
    expect(fitScoreToDisplay(7, false)).toBe(3);
    expect(fitScoreToDisplay(10, false)).toBe(3);
  });

  it('maps 4-6 to level 2', () => {
    expect(fitScoreToDisplay(4, false)).toBe(2);
    expect(fitScoreToDisplay(6, false)).toBe(2);
  });

  it('maps 1-3 to level 1', () => {
    expect(fitScoreToDisplay(1, false)).toBe(1);
    expect(fitScoreToDisplay(3, false)).toBe(1);
  });

  it('maps 0 to level 0', () => {
    expect(fitScoreToDisplay(0, false)).toBe(0);
  });

  it('returns gated level (0) when isGated=true', () => {
    expect(fitScoreToDisplay(8, true)).toBe(0);
    expect(fitScoreToDisplay(5, true)).toBe(0);
  });
});

describe('evaluateEngine', () => {
  it('SCORING_ENGINE produces valid result', () => {
    const result = evaluateEngine(SCORING_ENGINE, {
      themes: ['kreislaufwirtschaft'],
      canton: 'ZH',
      city: 'Zürich',
      applicationMethod: 'email',
      isFunder: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(typeof result.displayLevel).toBe('number');
    expect(Object.keys(result.dimensions).length).toBe(SCORING_ENGINE.dimensions.length);
  });

  it('READINESS_ENGINE produces valid result', () => {
    const result = evaluateEngine(READINESS_ENGINE, {
      hasPurposeSummary: true,
      hasResearchNotes: true,
      hasThemes: true,
      hasDirectContact: true,
      hasOwnWebsite: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.checks.length).toBeGreaterThan(0);
  });

  it('dimension scores do not exceed maxScore', () => {
    const result = evaluateEngine(SCORING_ENGINE, {
      themes: ['kreislaufwirtschaft', 'arbeitsintegration', 'digitale-bildung',
        'soziale-integration', 'klima', 'zuerich', 'digitale-souveraenitaet'],
      canton: 'ZH',
      city: 'Zürich',
      applicationMethod: 'email',
      isFunder: true,
    });
    for (const dim of SCORING_ENGINE.dimensions) {
      expect(result.dimensions[dim.id]).toBeLessThanOrEqual(dim.maxScore);
    }
  });
});
