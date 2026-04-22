import { describe, it, expect } from 'vitest';
import { buildExternalPrompt } from '../prompt-builder';
import type { FoundationAIContext } from '../ai-context';

function makeContext(overrides: Partial<FoundationAIContext> = {}): FoundationAIContext {
  return {
    name: 'Muster Stiftung',
    themes: [],
    ...overrides,
  };
}

describe('buildExternalPrompt', () => {
  describe('always-present structure', () => {
    it('returns a non-empty string', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext(),
        fieldDescription: 'Warum wir',
        currentText: 'Test Text',
      });
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(100);
    });

    it('contains the Aufgabe section', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext(),
        fieldDescription: 'Warum wir',
        currentText: 'Test',
      });
      expect(prompt).toContain('## Aufgabe');
    });

    it('contains the foundation name', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext({ name: 'Spezial Stiftung' }),
        fieldDescription: 'Intro',
        currentText: 'Text',
      });
      expect(prompt).toContain('Spezial Stiftung');
    });

    it('contains the fieldDescription', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext(),
        fieldDescription: 'Einleitung des Gesuchs',
        currentText: 'Text',
      });
      expect(prompt).toContain('Einleitung des Gesuchs');
    });

    it('contains the currentText', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext(),
        fieldDescription: 'Intro',
        currentText: 'Dies ist unser aktueller Text.',
      });
      expect(prompt).toContain('Dies ist unser aktueller Text.');
    });

    it('contains Schreibregeln with Swiss German rule', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext(),
        fieldDescription: 'Intro',
        currentText: 'Text',
      });
      expect(prompt).toContain('ss statt ß');
    });

    it('contains Schreibregeln section header', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext(),
        fieldDescription: 'Intro',
        currentText: 'Text',
      });
      expect(prompt).toContain('## Schreibregeln');
    });
  });

  describe('conditional sections — foundation fields', () => {
    it('includes purpose when provided', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext({ purpose: 'Fördert Nachhaltigkeit' }),
        fieldDescription: 'Intro',
        currentText: 'Text',
      });
      expect(prompt).toContain('Fördert Nachhaltigkeit');
    });

    it('omits purpose section when not provided', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext({ purpose: undefined }),
        fieldDescription: 'Intro',
        currentText: 'Text',
      });
      expect(prompt).not.toContain('**Stiftungszweck:**');
    });

    it('includes themes when present', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext({ themes: ['kreislaufwirtschaft', 'klima'] }),
        fieldDescription: 'Intro',
        currentText: 'Text',
      });
      expect(prompt).toContain('kreislaufwirtschaft');
    });

    it('omits themes line when themes array is empty', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext({ themes: [] }),
        fieldDescription: 'Intro',
        currentText: 'Text',
      });
      expect(prompt).not.toContain('**Förderbereiche:**');
    });

    it('includes fitScore when provided', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext({ fitScore: 8 }),
        fieldDescription: 'Intro',
        currentText: 'Text',
      });
      expect(prompt).toContain('8/10');
    });

    it('includes grant range with min and max', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext({ grantRange: { min: 5000, max: 50000 } }),
        fieldDescription: 'Intro',
        currentText: 'Text',
      });
      expect(prompt).toContain('5');
      expect(prompt).toContain('50');
    });

    it('includes past grantees (up to 5)', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext({ pastGrantees: ['Org A', 'Org B', 'Org C', 'Org D', 'Org E', 'Org F'] }),
        fieldDescription: 'Intro',
        currentText: 'Text',
      });
      expect(prompt).toContain('Org A');
      expect(prompt).toContain('Org E');
      // 6th should be excluded (slice(0,5))
      expect(prompt).not.toContain('Org F');
    });
  });

  describe('conditional Schwerpunkt section', () => {
    it('includes Schwerpunkt section when schwerpunktLabel provided', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext(),
        schwerpunktLabel: 'Kreislaufwirtschaft',
        fieldDescription: 'Intro',
        currentText: 'Text',
      });
      expect(prompt).toContain('## Schwerpunkt dieses Gesuchs');
      expect(prompt).toContain('Kreislaufwirtschaft');
    });

    it('omits Schwerpunkt section when not provided', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext(),
        fieldDescription: 'Intro',
        currentText: 'Text',
      });
      expect(prompt).not.toContain('## Schwerpunkt dieses Gesuchs');
    });
  });

  describe('section ordering', () => {
    it('Aufgabe appears before Schreibregeln', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext(),
        fieldDescription: 'Intro',
        currentText: 'Text',
      });
      const aufgabeIdx = prompt.indexOf('## Aufgabe');
      const regelnIdx = prompt.indexOf('## Schreibregeln');
      expect(aufgabeIdx).toBeLessThan(regelnIdx);
    });

    it('currentText appears before Schreibregeln', () => {
      const prompt = buildExternalPrompt({
        foundation: makeContext(),
        fieldDescription: 'Intro',
        currentText: 'Mein aktueller Text',
      });
      const textIdx = prompt.indexOf('Mein aktueller Text');
      const regelnIdx = prompt.indexOf('## Schreibregeln');
      expect(textIdx).toBeLessThan(regelnIdx);
    });
  });
});
