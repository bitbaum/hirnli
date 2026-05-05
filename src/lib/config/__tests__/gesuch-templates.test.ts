import { describe, it, expect } from 'vitest';
import {
  TEMPLATE_TYPES,
  TEMPLATE_FOUNDATIONS,
  TYPE_TEMPLATE_KEYS,
  SCHWERPUNKT_TEMPLATE_TYPES,
  getTemplateFoundation,
  getSchwerpunktTemplate,
  getSchwerpunktStaticParams,
} from '../gesuch-templates';
import { SCHWERPUNKT_IDS } from '../schwerpunkte';

// ---------------------------------------------------------------------------
// TEMPLATE_TYPES
// ---------------------------------------------------------------------------

describe('TEMPLATE_TYPES', () => {
  it('contains A, B, C, D, network, generisch', () => {
    expect(TEMPLATE_TYPES).toContain('A');
    expect(TEMPLATE_TYPES).toContain('B');
    expect(TEMPLATE_TYPES).toContain('C');
    expect(TEMPLATE_TYPES).toContain('D');
    expect(TEMPLATE_TYPES).toContain('network');
    expect(TEMPLATE_TYPES).toContain('generisch');
  });

  it('has exactly 6 entries', () => {
    expect(TEMPLATE_TYPES).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// TEMPLATE_FOUNDATIONS
// ---------------------------------------------------------------------------

describe('TEMPLATE_FOUNDATIONS', () => {
  it('has an entry for every TEMPLATE_TYPE', () => {
    for (const type of TEMPLATE_TYPES) {
      expect(TEMPLATE_FOUNDATIONS[type], `missing template for ${type}`).toBeDefined();
    }
  });

  it('each entry is a valid Foundation with required fields', () => {
    for (const type of TEMPLATE_TYPES) {
      const f = TEMPLATE_FOUNDATIONS[type];
      expect(typeof f.slug).toBe('string');
      expect(f.slug.length).toBeGreaterThan(0);
      expect(typeof f.name).toBe('string');
      expect(typeof f.fitScore).toBe('number');
      expect(typeof f.priority).toBe('number');
      expect(Array.isArray(f.themes)).toBe(true);
    }
  });

  it('all slugs are unique', () => {
    const slugs = TEMPLATE_TYPES.map(t => TEMPLATE_FOUNDATIONS[t].slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

// ---------------------------------------------------------------------------
// TYPE_TEMPLATE_KEYS
// ---------------------------------------------------------------------------

describe('TYPE_TEMPLATE_KEYS', () => {
  it('contains A, B, C, D, network but not generisch', () => {
    expect(TYPE_TEMPLATE_KEYS).toContain('A');
    expect(TYPE_TEMPLATE_KEYS).toContain('B');
    expect(TYPE_TEMPLATE_KEYS).toContain('C');
    expect(TYPE_TEMPLATE_KEYS).toContain('D');
    expect(TYPE_TEMPLATE_KEYS).toContain('network');
    expect(TYPE_TEMPLATE_KEYS).not.toContain('generisch');
  });
});

// ---------------------------------------------------------------------------
// SCHWERPUNKT_TEMPLATE_TYPES
// ---------------------------------------------------------------------------

describe('SCHWERPUNKT_TEMPLATE_TYPES', () => {
  it('contains A, B, C but not D or network', () => {
    expect(SCHWERPUNKT_TEMPLATE_TYPES).toContain('A');
    expect(SCHWERPUNKT_TEMPLATE_TYPES).toContain('B');
    expect(SCHWERPUNKT_TEMPLATE_TYPES).toContain('C');
    expect(SCHWERPUNKT_TEMPLATE_TYPES).not.toContain('D');
    expect(SCHWERPUNKT_TEMPLATE_TYPES).not.toContain('network');
  });

  it('has exactly 3 entries', () => {
    expect(SCHWERPUNKT_TEMPLATE_TYPES).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// getTemplateFoundation
// ---------------------------------------------------------------------------

describe('getTemplateFoundation', () => {
  it('returns a Foundation for valid type A', () => {
    const f = getTemplateFoundation('A');
    expect(f).toBeDefined();
    expect(f!.type).toBe('A');
  });

  it('returns a Foundation for generisch', () => {
    const f = getTemplateFoundation('generisch');
    expect(f).toBeDefined();
    expect(f!.slug).toContain('generisch');
  });

  it('returns undefined for unknown type', () => {
    expect(getTemplateFoundation('invalid')).toBeUndefined();
    expect(getTemplateFoundation('')).toBeUndefined();
    expect(getTemplateFoundation('nachhaltigkeit')).toBeUndefined();
  });

  it('returns a Foundation for every TEMPLATE_TYPE', () => {
    for (const type of TEMPLATE_TYPES) {
      const f = getTemplateFoundation(type);
      expect(f, `missing template for ${type}`).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// getSchwerpunktTemplate
// ---------------------------------------------------------------------------

describe('getSchwerpunktTemplate', () => {
  it('returns a Foundation for valid schwerpunkt + type A', () => {
    const f = getSchwerpunktTemplate('nachhaltigkeit', 'A');
    expect(f).toBeDefined();
    expect(f!.slug).toBe('vorlage-nachhaltigkeit-a');
  });

  it('returns a Foundation for type B', () => {
    const f = getSchwerpunktTemplate('soziale-integration', 'B');
    expect(f).toBeDefined();
    expect(f!.slug).toBe('vorlage-soziale-integration-b');
  });

  it('returns a Foundation for type C', () => {
    const f = getSchwerpunktTemplate('digitale-bildung', 'C');
    expect(f).toBeDefined();
    expect(f!.slug).toBe('vorlage-digitale-bildung-c');
  });

  it('returns undefined for invalid schwerpunkt', () => {
    expect(getSchwerpunktTemplate('invalid', 'A')).toBeUndefined();
    expect(getSchwerpunktTemplate('', 'B')).toBeUndefined();
  });

  it('returns undefined for type D (not in SCHWERPUNKT_TEMPLATE_TYPES)', () => {
    expect(getSchwerpunktTemplate('nachhaltigkeit', 'D')).toBeUndefined();
  });

  it('returns undefined for type network', () => {
    expect(getSchwerpunktTemplate('nachhaltigkeit', 'network')).toBeUndefined();
  });

  it('returned Foundation has themes from the schwerpunkt', () => {
    const f = getSchwerpunktTemplate('nachhaltigkeit', 'A');
    expect(f!.themes.length).toBeGreaterThan(0);
  });

  it('returned Foundation has fitScore 10 and priority 1', () => {
    const f = getSchwerpunktTemplate('nachhaltigkeit', 'A');
    expect(f!.fitScore).toBe(10);
    expect(f!.priority).toBe(1);
  });

  it('each schwerpunkt × type produces a unique slug', () => {
    const slugs: string[] = [];
    for (const s of SCHWERPUNKT_IDS) {
      for (const t of SCHWERPUNKT_TEMPLATE_TYPES) {
        const f = getSchwerpunktTemplate(s, t);
        expect(f).toBeDefined();
        slugs.push(f!.slug);
      }
    }
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

// ---------------------------------------------------------------------------
// getSchwerpunktStaticParams
// ---------------------------------------------------------------------------

describe('getSchwerpunktStaticParams', () => {
  it('returns 4 × 3 = 12 entries', () => {
    const params = getSchwerpunktStaticParams();
    expect(params).toHaveLength(SCHWERPUNKT_IDS.length * SCHWERPUNKT_TEMPLATE_TYPES.length);
  });

  it('every entry has vorlage and type fields', () => {
    for (const p of getSchwerpunktStaticParams()) {
      expect(typeof p.vorlage).toBe('string');
      expect(typeof p.type).toBe('string');
    }
  });

  it('every vorlage is a known SCHWERPUNKT_ID', () => {
    const ids = SCHWERPUNKT_IDS as readonly string[];
    for (const p of getSchwerpunktStaticParams()) {
      expect(ids).toContain(p.vorlage);
    }
  });

  it('every type is in SCHWERPUNKT_TEMPLATE_TYPES', () => {
    const types = SCHWERPUNKT_TEMPLATE_TYPES as readonly string[];
    for (const p of getSchwerpunktStaticParams()) {
      expect(types).toContain(p.type);
    }
  });

  it('all vorlage+type combinations are unique', () => {
    const params = getSchwerpunktStaticParams();
    const keys = params.map(p => `${p.vorlage}:${p.type}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
