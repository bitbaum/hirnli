/**
 * These pin the property that makes content safe to share between tenants:
 * a stored string may not carry any organisation's facts, only slots for them.
 *
 * The production `org_content.stories` row was seeded from a TypeScript module
 * that interpolated at import time, so it contains "über 23 Jahren Erfahrung"
 * and "seit 2003" as literal text. Reading that for a second tenant would put
 * the first tenant's founding year into a Gesuch. Templating is what stops it,
 * and these tests are what stop templating from quietly not working.
 */

import { describe, it, expect } from 'vitest';
import { fillContent, fillTemplate, placeholdersIn, templateValues } from '../interpolate';
import { makeMinimalTenant, makeTenant } from '@/lib/domain/__tests__/fixtures';

describe('fillTemplate', () => {
  it('fills a placeholder from the tenant', () => {
    const values = templateValues(makeTenant({ name: 'Beispiel-Verein' }));
    expect(fillTemplate('Wir sind {{name}}.', values)).toBe('Wir sind Beispiel-Verein.');
  });

  it('tolerates whitespace inside the braces', () => {
    const values = templateValues(makeTenant({ founded: 1999 }));
    expect(fillTemplate('seit {{ founded }}', values)).toBe('seit 1999');
  });

  it('fills the same placeholder everywhere it appears', () => {
    const values = templateValues(makeTenant({ name: 'X' }));
    expect(fillTemplate('{{name}} und {{name}}', values)).toBe('X und X');
  });

  it('THROWS on an unknown placeholder rather than leaving a hole', () => {
    const values = templateValues(makeTenant());
    // A typo must not survive into a document as empty text or as the literal
    // braces — both look like content and neither is.
    expect(() => fillTemplate('gegründet {{foundedYear}}', values)).toThrow(/Unknown content/);
  });

  it('THROWS when the tenant has no value for a known placeholder', () => {
    const values = templateValues(makeMinimalTenant());
    expect(() => fillTemplate('Besuchen Sie uns: {{address}}', values)).toThrow(/has not set/);
  });

  it('leaves text without placeholders untouched', () => {
    const values = templateValues(makeTenant());
    expect(fillTemplate('Keine Platzhalter hier.', values)).toBe('Keine Platzhalter hier.');
  });
});

describe('derived facts are computed, never stored', () => {
  it('fills yearsActive and experienceLabel from the tenant, not from the text', () => {
    // The whole point: these two change with the calendar. A stored copy is
    // right until 31 December and wrong on 1 January.
    const young = templateValues(makeTenant({ founded: 2025, yearsActive: 1 }));
    const old = templateValues(makeTenant({ founded: 2003, yearsActive: 23 }));

    expect(fillTemplate('{{yearsActive}} Jahre', young)).toBe('1 Jahre');
    expect(fillTemplate('{{yearsActive}} Jahre', old)).toBe('23 Jahre');
  });

  it('gives two tenants two different results from one template', () => {
    const template = '{{name}}, {{legalForm}} in {{location}} seit {{founded}}.';
    const a = fillTemplate(template, templateValues(makeTenant()));
    const b = fillTemplate(
      template,
      templateValues(makeMinimalTenant({ name: 'Andere', location: 'Bern' })),
    );

    expect(a).not.toBe(b);
    expect(b).toContain('Andere');
    expect(b).toContain('Bern');
  });
});

describe('fillContent', () => {
  it('walks nested objects and arrays', () => {
    const block = {
      intro: 'Wir sind {{name}}.',
      sections: [{ text: 'seit {{founded}}' }, { text: 'in {{location}}' }],
      meta: { nested: { deep: '{{name}}' } },
    };

    const filled = fillContent(block, makeTenant({ name: 'Z', founded: 2010 }));

    expect(filled.intro).toBe('Wir sind Z.');
    expect(filled.sections[0].text).toBe('seit 2010');
    expect(filled.meta.nested.deep).toBe('Z');
  });

  it('leaves non-strings as themselves', () => {
    // Numbers in content are values, not prose. Stringifying them here would
    // break every consumer that does arithmetic on them.
    const filled = fillContent({ count: 42, ok: true, missing: null, list: [1, 2] }, makeTenant());
    expect(filled).toEqual({ count: 42, ok: true, missing: null, list: [1, 2] });
  });

  it('does not touch object keys', () => {
    const filled = fillContent({ '{{name}}': 'value' }, makeTenant());
    expect(Object.keys(filled)).toEqual(['{{name}}']);
  });
});

describe('placeholdersIn', () => {
  it('reports every placeholder a block uses', () => {
    const found = placeholdersIn({
      a: 'x {{name}} y',
      b: ['{{founded}}', { c: '{{name}}' }],
      d: 7,
    });
    expect([...found].sort()).toEqual(['founded', 'name']);
  });
});
