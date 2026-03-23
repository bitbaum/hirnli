import { describe, it, expect } from 'vitest';
import { composeGesuch, composeGesuchDokument, composeAnschreibenText } from '../gesuch-composer';
import { makeFoundation, makeMinimalFoundation } from './fixtures';

describe('composeGesuch', () => {
  it('returns ready=true for well-researched foundation with themes', () => {
    const result = composeGesuch(makeFoundation());
    expect(result.ready).toBe(true);
  });

  it('returns ready=false for minimal foundation', () => {
    const result = composeGesuch(makeMinimalFoundation());
    expect(result.ready).toBe(false);
    expect(result.readyReason).toBeTruthy();
  });

  it('returns ready=false with reason when not researched', () => {
    const result = composeGesuch(makeMinimalFoundation());
    expect(result.ready).toBe(false);
    expect(result.readyReason).toContain('Recherche');
  });

  it('returns ready=false when no themes map', () => {
    // Foundation is researched but has no matching themes
    const f = makeFoundation({ themes: [] });
    const result = composeGesuch(f);
    expect(result.ready).toBe(false);
    expect(result.readyReason).toContain('Themen');
  });

  it('includes foundation info', () => {
    const result = composeGesuch(makeFoundation());
    expect(result.foundation.name).toBe('Test Stiftung');
    expect(result.foundation.slug).toBe('test-stiftung');
    expect(result.foundation.type).toBe('A');
  });

  it('maps themes with primary and secondary', () => {
    const result = composeGesuch(makeFoundation());
    if (result.ready) {
      expect(result.themes.primary).toBeTruthy();
      expect(result.themes.all.length).toBeGreaterThan(0);
    }
  });

  it('includes bridge text when ready', () => {
    const result = composeGesuch(makeFoundation());
    if (result.ready) {
      expect(result.foundationBridge).toBeTruthy();
      expect(result.foundationBridge.length).toBeGreaterThan(10);
    }
  });

  it('includes story sections when ready', () => {
    const result = composeGesuch(makeFoundation());
    if (result.ready) {
      expect(result.story.why).toBeTruthy();
      expect(result.story.projects.length).toBeGreaterThan(0);
    }
  });

  it('includes organization facts', () => {
    const result = composeGesuch(makeFoundation());
    expect(result.organization).toBeTruthy();
    expect(result.organization.organization.name).toBeTruthy();
  });

  it('accepts schwerpunktId override', () => {
    const withDefault = composeGesuch(makeFoundation());
    const withSchwerpunkt = composeGesuch(makeFoundation(), 'nachhaltigkeit');
    // Both should be ready, but may have different primary themes
    expect(withDefault.ready).toBe(true);
    expect(withSchwerpunkt.ready).toBe(true);
  });
});

describe('composeGesuchDokument', () => {
  it('extends composeGesuch with anschreiben, budget, kurzportrait', () => {
    const result = composeGesuchDokument(makeFoundation());
    if (result.ready) {
      expect(result.anschreiben).toBeDefined();
      expect(result.anschreiben.date).toBeTruthy();
      expect(result.anschreiben.subject).toContain('Fördergesuch');
      expect(result.anschreiben.opening).toBeTruthy();
      expect(result.anschreiben.closing).toBeTruthy();

      expect(result.budget).toBeDefined();
      expect(result.budget.scenario).toBeTruthy();
      expect(result.budget.lineItems.length).toBeGreaterThan(0);
      expect(result.budget.requestedAmount).toBeGreaterThan(0);

      expect(result.kurzportrait).toBeDefined();
      expect(result.kurzportrait.facts.length).toBeGreaterThan(0);

      expect(result.landingPageUrl).toContain('test-stiftung');
    }
  });

  it('returns not-ready for minimal foundation', () => {
    const result = composeGesuchDokument(makeMinimalFoundation());
    expect(result.ready).toBe(false);
  });
});

describe('composeAnschreibenText', () => {
  it('returns subject, opening, closing, themeAlignment', () => {
    const result = composeAnschreibenText(makeFoundation());
    expect(result.subject).toContain('Fördergesuch');
    expect(result.opening).toBeTruthy();
    expect(result.closing).toBeTruthy();
    expect(result.themeAlignment).toBeTruthy();
  });

  it('includes org name in subject', () => {
    const result = composeAnschreibenText(makeFoundation());
    expect(result.subject).toContain('Revamp-IT');
  });
});
