import { describe, it, expect } from 'vitest';
import {
  generateFitNarrative,
  generateApproachSteps,
  getApplicationReadiness,
  generateThemeAlignments,
} from '../foundation-contextualization';
import type { Foundation } from '@/lib/schemas/foundation';

// Minimal fixture. Themes used here all map to story keys in THEME_ID_TO_STORY_KEY.
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
    purposeSummary: 'Fördert nachhaltige Projekte in der Region.',
    amount: { min: null, max: null },
    contact: {},
    applicationMethod: 'unknown' as Foundation['applicationMethod'],
    ...overrides,
  } as Foundation;
}

// ---------------------------------------------------------------------------
// generateFitNarrative
// ---------------------------------------------------------------------------

describe('generateFitNarrative', () => {
  it('returns strengthLevel "strong" for fitScore >= 7', () => {
    const f = makeFoundation({ fitScore: 8, themes: ['kreislaufwirtschaft'] as Foundation['themes'] });
    const narrative = generateFitNarrative(f);
    expect(narrative.strengthLevel).toBe('strong');
  });

  it('returns strengthLevel "moderate" for fitScore 4-6', () => {
    const f = makeFoundation({ fitScore: 5, themes: ['kreislaufwirtschaft'] as Foundation['themes'] });
    const narrative = generateFitNarrative(f);
    expect(narrative.strengthLevel).toBe('moderate');
  });

  it('returns strengthLevel "limited" for fitScore < 4', () => {
    const f = makeFoundation({ fitScore: 2, themes: ['kreislaufwirtschaft'] as Foundation['themes'] });
    const narrative = generateFitNarrative(f);
    expect(narrative.strengthLevel).toBe('limited');
  });

  it('counts themeOverlaps correctly (all ThemeIds map to story keys)', () => {
    const f = makeFoundation({
      fitScore: 8,
      themes: ['kreislaufwirtschaft', 'klima', 'arbeitsintegration'] as Foundation['themes'],
    });
    const narrative = generateFitNarrative(f);
    expect(narrative.themeOverlaps).toBe(3);
  });

  it('returns 0 themeOverlaps for empty themes', () => {
    const f = makeFoundation({ fitScore: 8, themes: [] });
    expect(generateFitNarrative(f).themeOverlaps).toBe(0);
  });

  it('returns a non-empty text string', () => {
    const f = makeFoundation({ fitScore: 7, themes: ['kreislaufwirtschaft'] as Foundation['themes'] });
    expect(generateFitNarrative(f).text.length).toBeGreaterThan(10);
  });

  it('strong narrative includes foundation name', () => {
    const f = makeFoundation({ fitScore: 9, name: 'Örsted Stiftung', themes: ['kreislaufwirtschaft'] as Foundation['themes'] });
    const narrative = generateFitNarrative(f);
    expect(narrative.text).toContain('Örsted Stiftung');
  });
});

// ---------------------------------------------------------------------------
// generateApproachSteps
// ---------------------------------------------------------------------------

describe('generateApproachSteps', () => {
  it('always ends with "Nachfassen" step', () => {
    const f = makeFoundation();
    const steps = generateApproachSteps(f);
    expect(steps[steps.length - 1].action).toBe('Nachfassen nach 6 Wochen');
  });

  it('first step is always "Gesuch vorbereiten"', () => {
    const f = makeFoundation();
    expect(generateApproachSteps(f)[0].action).toBe('Gesuch vorbereiten');
  });

  it('Gesuch vorbereiten is "ready" when fitScore >= 4 and has themes', () => {
    const f = makeFoundation({ fitScore: 5, themes: ['kreislaufwirtschaft'] as Foundation['themes'] });
    const steps = generateApproachSteps(f);
    expect(steps[0].status).toBe('ready');
  });

  it('Gesuch vorbereiten is "todo" when fitScore < 4', () => {
    const f = makeFoundation({ fitScore: 2, themes: ['kreislaufwirtschaft'] as Foundation['themes'] });
    expect(generateApproachSteps(f)[0].status).toBe('todo');
  });

  describe('email method', () => {
    it('adds email step when method is email', () => {
      const f = makeFoundation({ applicationMethod: 'email' as Foundation['applicationMethod'] });
      const steps = generateApproachSteps(f);
      expect(steps[1].action).toBe('Per E-Mail einreichen');
    });

    it('email step is "ready" when contact.email present', () => {
      const f = makeFoundation({
        applicationMethod: 'email' as Foundation['applicationMethod'],
        contact: { email: 'info@example.ch' },
      });
      expect(generateApproachSteps(f)[1].status).toBe('ready');
    });

    it('email step is "blocked" when no contact.email', () => {
      const f = makeFoundation({
        applicationMethod: 'email' as Foundation['applicationMethod'],
        contact: {},
      });
      expect(generateApproachSteps(f)[1].status).toBe('blocked');
    });
  });

  describe('online method', () => {
    it('adds online step when method is online', () => {
      const f = makeFoundation({ applicationMethod: 'online' as Foundation['applicationMethod'] });
      expect(generateApproachSteps(f)[1].action).toBe('Online-Formular ausfüllen');
    });

    it('online step is "ready" when applicationUrl present', () => {
      const f = makeFoundation({
        applicationMethod: 'online' as Foundation['applicationMethod'],
        applicationUrl: 'https://example.ch/apply',
      });
      expect(generateApproachSteps(f)[1].status).toBe('ready');
    });

    it('online step is "blocked" when no applicationUrl', () => {
      const f = makeFoundation({
        applicationMethod: 'online' as Foundation['applicationMethod'],
        applicationUrl: undefined,
      });
      expect(generateApproachSteps(f)[1].status).toBe('blocked');
    });
  });

  describe('post method', () => {
    it('adds post step when method is post', () => {
      const f = makeFoundation({ applicationMethod: 'post' as Foundation['applicationMethod'] });
      expect(generateApproachSteps(f)[1].action).toBe('Per Post senden');
    });

    it('post step is "blocked" when no address', () => {
      const f = makeFoundation({
        applicationMethod: 'post' as Foundation['applicationMethod'],
        contact: {},
      });
      expect(generateApproachSteps(f)[1].status).toBe('blocked');
    });

    it('post step is "ready" when address present', () => {
      const f = makeFoundation({
        applicationMethod: 'post' as Foundation['applicationMethod'],
        contact: { address: 'Musterstrasse 1, 8000 Zürich' },
      });
      expect(generateApproachSteps(f)[1].status).toBe('ready');
    });
  });

  describe('deadline step', () => {
    it('adds deadline step when deadline is present', () => {
      const futureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const f = makeFoundation({ deadline: futureDate });
      const steps = generateApproachSteps(f);
      expect(steps.some((s) => s.action.includes('einreichen'))).toBe(true);
    });

    it('adds deadline step when deadlineText is present', () => {
      const f = makeFoundation({ deadlineText: 'Immer 31. März und 30. September' });
      const steps = generateApproachSteps(f);
      expect(steps.some((s) => s.detail.includes('Immer'))).toBe(true);
    });

    it('omits deadline step when no deadline info', () => {
      const f = makeFoundation({ deadline: undefined, deadlineText: undefined });
      const steps = generateApproachSteps(f);
      // Should not have deadline step — only prepare + method + nachfassen
      expect(steps).toHaveLength(3);
    });
  });

  it('step order values are sequential starting from 1', () => {
    const f = makeFoundation({ applicationMethod: 'email' as Foundation['applicationMethod'] });
    const steps = generateApproachSteps(f);
    steps.forEach((step, idx) => {
      expect(step.order).toBe(idx + 1);
    });
  });
});

// ---------------------------------------------------------------------------
// getApplicationReadiness
// ---------------------------------------------------------------------------

describe('getApplicationReadiness', () => {
  it('returns exactly 7 items', () => {
    expect(getApplicationReadiness(makeFoundation())).toHaveLength(7);
  });

  it('"Kontaktdaten vorhanden" is ready when contact.email set', () => {
    const f = makeFoundation({ contact: { email: 'info@example.ch' } });
    const items = getApplicationReadiness(f);
    const contact = items.find((i) => i.label === 'Kontaktdaten vorhanden')!;
    expect(contact.ready).toBe(true);
  });

  it('"Kontaktdaten vorhanden" is not ready when contact is empty', () => {
    const f = makeFoundation({ contact: {} });
    const items = getApplicationReadiness(f);
    expect(items.find((i) => i.label === 'Kontaktdaten vorhanden')!.ready).toBe(false);
  });

  it('"Bewerbungs-URL bekannt" is ready when applicationUrl set', () => {
    const f = makeFoundation({ applicationUrl: 'https://example.ch/apply' });
    const items = getApplicationReadiness(f);
    expect(items.find((i) => i.label === 'Bewerbungs-URL bekannt')!.ready).toBe(true);
  });

  it('"Thematische Übereinstimmung" is ready when foundation has a mapped theme', () => {
    const f = makeFoundation({ themes: ['kreislaufwirtschaft'] as Foundation['themes'] });
    const items = getApplicationReadiness(f);
    expect(items.find((i) => i.label === 'Thematische Übereinstimmung')!.ready).toBe(true);
  });

  it('"Bewerbungsweg bekannt" is not ready when method is unknown', () => {
    const f = makeFoundation({ applicationMethod: 'unknown' as Foundation['applicationMethod'] });
    expect(getApplicationReadiness(f).find((i) => i.label === 'Bewerbungsweg bekannt')!.ready).toBe(false);
  });

  it('"Bewerbungsweg bekannt" is ready when method is set', () => {
    const f = makeFoundation({ applicationMethod: 'email' as Foundation['applicationMethod'] });
    expect(getApplicationReadiness(f).find((i) => i.label === 'Bewerbungsweg bekannt')!.ready).toBe(true);
  });

  it('"Bewerbungsweg bekannt" detail uses human-readable label not raw value', () => {
    const f = makeFoundation({ applicationMethod: 'email' as Foundation['applicationMethod'] });
    const item = getApplicationReadiness(f).find((i) => i.label === 'Bewerbungsweg bekannt')!;
    expect(item.detail).toContain('Per E-Mail');
    expect(item.detail).not.toContain(': email');
  });

  it('"Bewerbungsweg bekannt" detail uses label for via_partner', () => {
    const f = makeFoundation({ applicationMethod: 'via_partner' as Foundation['applicationMethod'] });
    const item = getApplicationReadiness(f).find((i) => i.label === 'Bewerbungsweg bekannt')!;
    expect(item.detail).toContain('Über Partner');
    expect(item.detail).not.toContain('via_partner');
  });

  it('"Gesuch generiert" is always ready', () => {
    const items = getApplicationReadiness(makeFoundation());
    expect(items.find((i) => i.label === 'Gesuch generiert')!.ready).toBe(true);
  });

  it('every item has a non-empty detail string', () => {
    const items = getApplicationReadiness(makeFoundation());
    for (const item of items) {
      expect(item.detail.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// generateThemeAlignments
// ---------------------------------------------------------------------------

describe('generateThemeAlignments', () => {
  it('returns empty array for foundation with no themes', () => {
    expect(generateThemeAlignments(makeFoundation({ themes: [] }))).toHaveLength(0);
  });

  it('returns one alignment per theme', () => {
    const f = makeFoundation({
      themes: ['kreislaufwirtschaft', 'klima'] as Foundation['themes'],
    });
    expect(generateThemeAlignments(f)).toHaveLength(2);
  });

  it('each alignment has required fields', () => {
    const f = makeFoundation({ themes: ['kreislaufwirtschaft'] as Foundation['themes'] });
    const alignments = generateThemeAlignments(f);
    const a = alignments[0];
    expect(a.themeId).toBe('kreislaufwirtschaft');
    expect(typeof a.themeLabel).toBe('string');
    expect(a.themeLabel.length).toBeGreaterThan(0);
    expect(typeof a.icon).toBe('string');
    expect(typeof a.revampConnection).toBe('string');
    expect(a.revampConnection.length).toBeGreaterThan(0);
  });

  it('all 7 known ThemeIds produce alignments', () => {
    const allThemes = [
      'klima', 'kreislaufwirtschaft', 'soziale-integration',
      'digitale-bildung', 'digitale-souveraenitaet', 'zuerich', 'arbeitsintegration',
    ] as Foundation['themes'];
    const f = makeFoundation({ themes: allThemes });
    const alignments = generateThemeAlignments(f);
    expect(alignments).toHaveLength(7);
  });
});
