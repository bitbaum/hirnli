import { describe, it, expect } from 'vitest';
import { buildAIContext } from '../ai-context';
import type { Foundation } from '@/lib/schemas/foundation';

function makeFoundation(overrides: Partial<Foundation> = {}): Foundation {
  return {
    slug: 'test',
    name: 'Test Stiftung',
    type: 'A',
    fitScore: 5,
    priority: 2,
    themes: [],
    sdgs: [],
    researchDepth: 'standard',
    dataConfidence: 'assessed',
    source: 'manual',
    purposeSummary: '',
    amount: { min: null, max: null, text: '' },
    contact: {},
    ...overrides,
  } as Foundation;
}

describe('buildAIContext', () => {
  describe('required fields always present', () => {
    it('includes name from foundation', () => {
      const ctx = buildAIContext(makeFoundation({ name: 'Muster Stiftung' }));
      expect(ctx.name).toBe('Muster Stiftung');
    });

    it('includes type', () => {
      const ctx = buildAIContext(makeFoundation({ type: 'B' }));
      expect(ctx.type).toBe('B');
    });

    it('includes fitScore', () => {
      const ctx = buildAIContext(makeFoundation({ fitScore: 7 }));
      expect(ctx.fitScore).toBe(7);
    });

    it('includes priority', () => {
      const ctx = buildAIContext(makeFoundation({ priority: 1 }));
      expect(ctx.priority).toBe(1);
    });

    it('maps themes array (copies values)', () => {
      const ctx = buildAIContext(makeFoundation({ themes: ['kreislaufwirtschaft', 'klima'] as Foundation['themes'] }));
      expect(ctx.themes).toEqual(['kreislaufwirtschaft', 'klima']);
    });

    it('returns empty themes array when no themes', () => {
      const ctx = buildAIContext(makeFoundation({ themes: [] }));
      expect(ctx.themes).toEqual([]);
    });
  });

  describe('purpose extraction', () => {
    it('returns undefined purpose when purposeSummary is empty', () => {
      const ctx = buildAIContext(makeFoundation({ purposeSummary: '' }));
      expect(ctx.purpose).toBeUndefined();
    });

    it('extracts core from purposeSummary (first sentence)', () => {
      const ctx = buildAIContext(makeFoundation({
        purposeSummary: 'Fördert Nachhaltigkeit in der Schweiz. Weitere Details folgen.',
      }));
      // extractPurposeCore returns first sentence before '.'
      expect(ctx.purpose).toBe('Fördert Nachhaltigkeit in der Schweiz');
    });

    it('strips ESA-style "Name (Location): " prefix', () => {
      const ctx = buildAIContext(makeFoundation({
        purposeSummary: 'Muster Stiftung (Zürich): Fördert Bildung in der Region.',
      }));
      expect(ctx.purpose).toBe('Fördert Bildung in der Region');
    });
  });

  describe('grantRange', () => {
    it('returns undefined when both min and max are null', () => {
      const ctx = buildAIContext(makeFoundation({ amount: { min: null, max: null, text: '' } }));
      expect(ctx.grantRange).toBeUndefined();
    });

    it('returns grantRange when min is set', () => {
      const ctx = buildAIContext(makeFoundation({ amount: { min: 5000, max: null, text: 'ab CHF 5\'000' } }));
      expect(ctx.grantRange?.min).toBe(5000);
      expect(ctx.grantRange?.max).toBeUndefined();
    });

    it('returns grantRange when max is set', () => {
      const ctx = buildAIContext(makeFoundation({ amount: { min: null, max: 50000, text: 'bis CHF 50\'000' } }));
      expect(ctx.grantRange?.max).toBe(50000);
      expect(ctx.grantRange?.min).toBeUndefined();
    });

    it('returns both bounds when both are set', () => {
      const ctx = buildAIContext(makeFoundation({ amount: { min: 1000, max: 100000, text: 'CHF 1\'000–100\'000' } }));
      expect(ctx.grantRange).toEqual({ min: 1000, max: 100000 });
    });
  });

  describe('applicationProcess', () => {
    it('returns undefined when applicationProcess is absent', () => {
      const ctx = buildAIContext(makeFoundation({ applicationProcess: undefined }));
      expect(ctx.applicationProcess).toBeUndefined();
    });

    it('joins applicationProcess steps with " → "', () => {
      const ctx = buildAIContext(makeFoundation({
        applicationProcess: ['Anfrage senden', 'Gesuch einreichen', 'Entscheid abwarten'],
      }));
      expect(ctx.applicationProcess).toBe('Anfrage senden → Gesuch einreichen → Entscheid abwarten');
    });

    it('returns single step without arrow', () => {
      const ctx = buildAIContext(makeFoundation({ applicationProcess: ['Online-Formular'] }));
      expect(ctx.applicationProcess).toBe('Online-Formular');
    });
  });

  describe('optional fields', () => {
    it('passes through researchNotes', () => {
      const ctx = buildAIContext(makeFoundation({ researchNotes: 'Sehr relevante Stiftung.' }));
      expect(ctx.researchNotes).toBe('Sehr relevante Stiftung.');
    });

    it('passes through tagline', () => {
      const ctx = buildAIContext(makeFoundation({ tagline: 'Für eine bessere Welt.' }));
      expect(ctx.tagline).toBe('Für eine bessere Welt.');
    });

    it('passes through pastGrantees', () => {
      const ctx = buildAIContext(makeFoundation({ pastGrantees: ['Org A', 'Org B'] }));
      expect(ctx.pastGrantees).toEqual(['Org A', 'Org B']);
    });

    it('passes through sdgs', () => {
      const ctx = buildAIContext(makeFoundation({ sdgs: [13, 17] }));
      expect(ctx.sdgs).toEqual([13, 17]);
    });

    it('returns undefined for absent optional fields', () => {
      const ctx = buildAIContext(makeFoundation({
        tagline: undefined,
        researchNotes: undefined,
        pastGrantees: undefined,
        deadline: undefined,
        deadlineText: undefined,
        criteria: undefined,
        partners: undefined,
      }));
      expect(ctx.tagline).toBeUndefined();
      expect(ctx.researchNotes).toBeUndefined();
      expect(ctx.pastGrantees).toBeUndefined();
    });
  });
});
