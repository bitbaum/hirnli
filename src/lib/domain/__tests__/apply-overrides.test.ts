import { describe, it, expect } from 'vitest';
import { applyGesuchOverrides } from '../apply-overrides';
import type { ComposedGesuch } from '../gesuch-composer';
import type { GesuchOverridesData } from '@/lib/db/schema';

// Minimal fixture — only the fields touched by applyGesuchOverrides
function makeGesuch(overrides: Partial<ComposedGesuch> = {}): ComposedGesuch {
  return {
    ready: true,
    foundation: { name: 'Test Stiftung', slug: 'test', type: 'A', typeLong: 'Typ A', approach: '' },
    foundationBridge: 'Original Bridge',
    themes: { primary: 'kreislaufwirtschaft', secondary: [], all: [] },
    secondaryThemeRelevance: [],
    story: {
      why: { headline: 'Why Headline', hook: 'Hook', problem: 'Problem', solution: 'Solution', body: '' },
      how: {
        track_record: { headline: 'Track Headline', text: 'Track Text', bullets: [] },
        competencies: [],
      },
      projects: [],
      evidence: [],
    },
    organization: {} as ComposedGesuch['organization'],
    approach: { strategy: '', typeDescription: '' },
    anecdotes: { why: [], how: [] },
    photos: { why: [], how: [], projects: [], kurzportrait: [] },
    partnerHighlights: [] as ComposedGesuch['partnerHighlights'],
    ...overrides,
  } as ComposedGesuch;
}

describe('applyGesuchOverrides', () => {
  describe('empty / no-op cases', () => {
    it('returns original object when overrides is empty object', () => {
      const gesuch = makeGesuch();
      const result = applyGesuchOverrides(gesuch, {});
      expect(result).toBe(gesuch);
    });

    it('returns original object when overrides is null-ish', () => {
      const gesuch = makeGesuch();
      // @ts-expect-error testing null guard
      const result = applyGesuchOverrides(gesuch, null);
      expect(result).toBe(gesuch);
    });
  });

  describe('foundationBridge', () => {
    it('replaces foundationBridge when override provided', () => {
      const gesuch = makeGesuch();
      const overrides: GesuchOverridesData = { foundationBridge: 'Custom Bridge Text' };
      const result = applyGesuchOverrides(gesuch, overrides);
      expect(result.foundationBridge).toBe('Custom Bridge Text');
    });

    it('does not mutate original gesuch', () => {
      const gesuch = makeGesuch();
      applyGesuchOverrides(gesuch, { foundationBridge: 'Changed' });
      expect(gesuch.foundationBridge).toBe('Original Bridge');
    });
  });

  describe('why section', () => {
    it('overrides individual why fields selectively', () => {
      const gesuch = makeGesuch();
      const overrides: GesuchOverridesData = {
        why: { headline: 'New Headline' },
      };
      const result = applyGesuchOverrides(gesuch, overrides);
      expect(result.story.why?.headline).toBe('New Headline');
      // Untouched fields preserved
      expect(result.story.why?.hook).toBe('Hook');
      expect(result.story.why?.problem).toBe('Problem');
    });

    it('overrides all why fields when all provided', () => {
      const gesuch = makeGesuch();
      const overrides: GesuchOverridesData = {
        why: { headline: 'H2', hook: 'Hook2', problem: 'P2', solution: 'S2' },
      };
      const result = applyGesuchOverrides(gesuch, overrides);
      expect(result.story.why).toMatchObject({ headline: 'H2', hook: 'Hook2', problem: 'P2', solution: 'S2' });
    });

    it('skips why override when story.why is undefined', () => {
      const gesuch = makeGesuch();
      gesuch.story.why = undefined;
      const overrides: GesuchOverridesData = { why: { headline: 'X' } };
      const result = applyGesuchOverrides(gesuch, overrides);
      expect(result.story.why).toBeUndefined();
    });

    it('does not apply null/undefined why fields', () => {
      const gesuch = makeGesuch();
      const overrides: GesuchOverridesData = { why: { headline: undefined } };
      const result = applyGesuchOverrides(gesuch, overrides);
      expect(result.story.why?.headline).toBe('Why Headline');
    });
  });

  describe('how.trackRecord', () => {
    it('overrides trackRecord headline', () => {
      const gesuch = makeGesuch();
      const overrides: GesuchOverridesData = {
        how: { trackRecord: { headline: 'New Track Headline' } },
      };
      const result = applyGesuchOverrides(gesuch, overrides);
      expect(result.story.how.track_record.headline).toBe('New Track Headline');
      expect(result.story.how.track_record.text).toBe('Track Text');
    });

    it('overrides trackRecord text', () => {
      const gesuch = makeGesuch();
      const overrides: GesuchOverridesData = {
        how: { trackRecord: { text: 'New Track Text' } },
      };
      const result = applyGesuchOverrides(gesuch, overrides);
      expect(result.story.how.track_record.text).toBe('New Track Text');
      expect(result.story.how.track_record.headline).toBe('Track Headline');
    });

    it('does not mutate original track_record', () => {
      const gesuch = makeGesuch();
      applyGesuchOverrides(gesuch, { how: { trackRecord: { headline: 'X' } } });
      expect(gesuch.story.how.track_record.headline).toBe('Track Headline');
    });
  });

  describe('anschreiben (ComposedGesuchDokument only)', () => {
    it('does not apply anschreiben override when field absent from gesuch', () => {
      const gesuch = makeGesuch();
      const overrides: GesuchOverridesData = { anschreiben: { subject: 'New Subject' } };
      // Plain ComposedGesuch has no anschreiben — should be a no-op
      const result = applyGesuchOverrides(gesuch, overrides);
      expect((result as unknown as Record<string, unknown>).anschreiben).toBeUndefined();
    });

    it('applies anschreiben override when field present', () => {
      const gesuch = makeGesuch() as ComposedGesuch & { anschreiben: Record<string, string> };
      gesuch.anschreiben = {
        date: '2026-04-22',
        foundationAddress: 'Some Address',
        subject: 'Original Subject',
        opening: 'Original Opening',
        themeAlignment: 'Original Alignment',
        closing: 'Original Closing',
      };
      const overrides: GesuchOverridesData = {
        anschreiben: { subject: 'New Subject', closing: 'New Closing' },
      };
      const result = applyGesuchOverrides(gesuch, overrides) as typeof gesuch;
      expect(result.anschreiben.subject).toBe('New Subject');
      expect(result.anschreiben.closing).toBe('New Closing');
      // Untouched fields preserved
      expect(result.anschreiben.opening).toBe('Original Opening');
      expect(result.anschreiben.themeAlignment).toBe('Original Alignment');
    });
  });

  describe('immutability', () => {
    it('does not mutate the input gesuch', () => {
      const gesuch = makeGesuch();
      const original = JSON.stringify(gesuch);
      applyGesuchOverrides(gesuch, {
        foundationBridge: 'X',
        why: { headline: 'Y' },
        how: { trackRecord: { text: 'Z' } },
      });
      expect(JSON.stringify(gesuch)).toBe(original);
    });
  });
});
