import { describe, it, expect } from 'vitest';
import { validateFoundationQuality } from '../foundation-quality';
import { makeFoundation, makeMinimalFoundation } from './fixtures';

describe('validateFoundationQuality', () => {
  it('returns no violations for well-researched foundation', () => {
    const violations = validateFoundationQuality([makeFoundation()]);
    expect(violations).toHaveLength(0);
  });

  it('skips unreserached (low-tier) foundations entirely', () => {
    const violations = validateFoundationQuality([makeMinimalFoundation()]);
    expect(violations).toHaveLength(0);
  });

  it('flags short purposeSummary on researched foundation', () => {
    const f = makeFoundation({ purposeSummary: 'Too short' });
    const violations = validateFoundationQuality([f]);
    const issues = violations.flatMap(v => v.issues);
    expect(issues.some(i => i.includes('purposeSummary'))).toBe(true);
  });

  it('flags short researchNotes', () => {
    const f = makeFoundation({ researchNotes: 'Brief' });
    const violations = validateFoundationQuality([f]);
    const issues = violations.flatMap(v => v.issues);
    expect(issues.some(i => i.includes('researchNotes'))).toBe(true);
  });

  it('flags missing contact', () => {
    const f = makeFoundation({ contact: undefined });
    const violations = validateFoundationQuality([f]);
    const issues = violations.flatMap(v => v.issues);
    expect(issues.some(i => i.includes('contact'))).toBe(true);
  });

  it('flags empty themes', () => {
    const f = makeFoundation({ themes: [] });
    const violations = validateFoundationQuality([f]);
    const issues = violations.flatMap(v => v.issues);
    expect(issues.some(i => i.includes('themes'))).toBe(true);
  });

  it('flags missing websiteUrl', () => {
    const f = makeFoundation({ websiteUrl: '' });
    const violations = validateFoundationQuality([f]);
    const issues = violations.flatMap(v => v.issues);
    expect(issues.some(i => i.includes('websiteUrl'))).toBe(true);
  });

  it('reports multiple issues per foundation', () => {
    const f = makeFoundation({
      purposeSummary: 'Short',
      researchNotes: 'Short',
      contact: undefined,
      themes: [],
      websiteUrl: '',
    });
    const violations = validateFoundationQuality([f]);
    expect(violations).toHaveLength(1);
    expect(violations[0].issues.length).toBeGreaterThanOrEqual(4);
  });

  it('includes slug in violation', () => {
    const f = makeFoundation({ purposeSummary: 'X', slug: 'my-stiftung' });
    const violations = validateFoundationQuality([f]);
    expect(violations[0]?.slug).toBe('my-stiftung');
  });

  it('handles empty array', () => {
    expect(validateFoundationQuality([])).toHaveLength(0);
  });
});
