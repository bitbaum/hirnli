import { describe, it, expect } from 'vitest';
import { composeGesuch, composeGesuchDokument, composeAnschreibenText } from '../gesuch-composer';
import { makeFoundation, makeMinimalFoundation, makeTenant } from './fixtures';

/** One tenant for every composer call here — the identity is not what these
 *  tests are about, but it must be passed rather than imported. */
const TENANT = makeTenant();

describe('composeGesuch', () => {
  it('returns ready=true for well-researched foundation with themes', () => {
    const result = composeGesuch(TENANT, makeFoundation());
    expect(result.ready).toBe(true);
  });

  it('returns ready=false for minimal foundation', () => {
    const result = composeGesuch(TENANT, makeMinimalFoundation());
    expect(result.ready).toBe(false);
    expect(result.readyReason).toBeTruthy();
  });

  it('returns ready=false with reason when not researched', () => {
    const result = composeGesuch(TENANT, makeMinimalFoundation());
    expect(result.ready).toBe(false);
    expect(result.readyReason).toContain('Recherche');
  });

  it('returns ready=false when no themes map', () => {
    // Foundation is researched but has no matching themes
    const f = makeFoundation({ themes: [] });
    const result = composeGesuch(TENANT, f);
    expect(result.ready).toBe(false);
    expect(result.readyReason).toContain('Themen');
  });

  it('includes foundation info', () => {
    const result = composeGesuch(TENANT, makeFoundation());
    expect(result.foundation.name).toBe('Test Stiftung');
    expect(result.foundation.slug).toBe('test-stiftung');
    expect(result.foundation.type).toBe('A');
  });

  it('maps themes with primary and secondary', () => {
    const result = composeGesuch(TENANT, makeFoundation());
    if (result.ready) {
      expect(result.themes.primary).toBeTruthy();
      expect(result.themes.all.length).toBeGreaterThan(0);
    }
  });

  it('falls back to zuerich badge when zuerich is the only theme', () => {
    // Foundations tagged only with the geographic 'zuerich' theme should still
    // get a theme badge — otherwise the hero shows zero theme chips.
    const result = composeGesuch(TENANT, makeFoundation({ themes: ['zuerich'] }));
    expect(result.ready).toBe(true);
    if (result.ready) {
      expect(result.themes.all.length).toBeGreaterThan(0);
      expect(result.themes.all[0].id).toBe('zuerich');
    }
  });

  it('hides zuerich when a content theme is also present', () => {
    // When both a content theme and zuerich are tagged, zuerich is filtered
    // (it maps to the same story key as klima).
    const result = composeGesuch(
      TENANT,
      makeFoundation({ themes: ['kreislaufwirtschaft', 'zuerich'] }),
    );
    expect(result.ready).toBe(true);
    if (result.ready) {
      const ids = result.themes.all.map((t) => t.id);
      expect(ids).toContain('kreislaufwirtschaft');
      expect(ids).not.toContain('zuerich');
    }
  });

  it('includes bridge text when ready', () => {
    const result = composeGesuch(TENANT, makeFoundation());
    if (result.ready) {
      expect(result.foundationBridge).toBeTruthy();
      expect(result.foundationBridge.length).toBeGreaterThan(10);
    }
  });

  it('includes story sections when ready', () => {
    const result = composeGesuch(TENANT, makeFoundation());
    if (result.ready) {
      expect(result.story.why).toBeTruthy();
      expect(result.story.projects.length).toBeGreaterThan(0);
    }
  });

  it('includes organization facts', () => {
    const result = composeGesuch(TENANT, makeFoundation());
    expect(result.organization).toBeTruthy();
    expect(result.organization.organization.name).toBeTruthy();
  });

  it('accepts schwerpunktId override', () => {
    const withDefault = composeGesuch(TENANT, makeFoundation());
    const withSchwerpunkt = composeGesuch(TENANT, makeFoundation(), 'nachhaltigkeit');
    // Both should be ready, but may have different primary themes
    expect(withDefault.ready).toBe(true);
    expect(withSchwerpunkt.ready).toBe(true);
  });

  it('returns ready=false with priority reason for researched P4 foundation', () => {
    // A researched foundation that is P4 should hit the lowPriority gate,
    // not the "needs research" gate — so the reason must mention "Priorität"
    const f = makeFoundation({ priority: 4 });
    const result = composeGesuch(TENANT, f);
    expect(result.ready).toBe(false);
    expect(result.readyReason).toContain('Priorität');
  });
});

describe('composeGesuchDokument', () => {
  it('extends composeGesuch with anschreiben, budget, kurzportrait', () => {
    const result = composeGesuchDokument(TENANT, makeFoundation());
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
    const result = composeGesuchDokument(TENANT, makeMinimalFoundation());
    expect(result.ready).toBe(false);
  });

  it('sets budget.primaryThemeKey when schwerpunktId is provided', () => {
    const result = composeGesuchDokument(TENANT, makeFoundation(), 'nachhaltigkeit');
    if (result.ready) {
      expect(result.budget.primaryThemeKey).toBe('klima');
    }
  });

  it('includes foundation address in anschreiben when contact.address is present', () => {
    const result = composeGesuchDokument(TENANT, makeFoundation());
    if (result.ready) {
      expect(result.anschreiben.foundationAddress).toContain('Test Stiftung');
      expect(result.anschreiben.foundationAddress).toContain('Teststr. 1');
    }
  });

  it('omits address line in anschreiben when contact has no address', () => {
    const f = makeFoundation({ contact: { email: 'info@test.ch' } });
    const result = composeGesuchDokument(TENANT, f);
    if (result.ready) {
      expect(result.anschreiben.foundationAddress).toBe('Test Stiftung');
    }
  });
});

describe('composeAnschreibenText', () => {
  it('returns subject, opening, closing, themeAlignment', () => {
    const result = composeAnschreibenText(TENANT, makeFoundation());
    expect(result.subject).toContain('Fördergesuch');
    expect(result.opening).toBeTruthy();
    expect(result.closing).toBeTruthy();
    expect(result.themeAlignment).toBeTruthy();
  });

  it('puts the GIVEN organisation in the subject, not an imported one', () => {
    const f = makeFoundation();
    expect(composeAnschreibenText(TENANT, f).subject).toContain(TENANT.name);

    // The subject line is what a foundation sees first in its inbox. A second
    // tenant must get its own name there — the same assertion against a literal
    // would pass even if the composer went back to importing one organisation.
    const other = composeAnschreibenText(makeTenant({ name: 'Andere Organisation' }), f);
    expect(other.subject).toContain('Andere Organisation');
    expect(other.subject).not.toContain(TENANT.name);
  });

  it('uses schwerpunkt theme label in subject when schwerpunktId provided', () => {
    // Foundation has only kreislaufwirtschaft — no overlap with 'soziale-integration' schwerpunkt.
    // collectThemeMetadata falls back to schwerpunkt.themeIds directly, so the primary
    // label comes from the schwerpunkt rather than the foundation's own theme.
    const f = makeFoundation({ themes: ['kreislaufwirtschaft'] });
    const withDefault = composeAnschreibenText(TENANT, f);
    const withSchwerpunkt = composeAnschreibenText(TENANT, f, 'soziale-integration');
    expect(withSchwerpunkt.subject).toContain('Fördergesuch');
    expect(withSchwerpunkt.subject).toContain(TENANT.name);
    expect(withSchwerpunkt.subject).not.toBe(withDefault.subject);
  });
});
