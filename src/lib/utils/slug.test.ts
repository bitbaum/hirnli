import { describe, it, expect } from 'vitest';
import { toSlug } from './slug';

describe('toSlug', () => {
  it('lowercases input', () => {
    expect(toSlug('Foundation')).toBe('foundation');
    expect(toSlug('UPPERCASE')).toBe('uppercase');
  });

  it('replaces spaces and special chars with hyphens', () => {
    expect(toSlug('A B')).toBe('a-b');
    expect(toSlug('A & B')).toBe('a-b');
    expect(toSlug('A, B')).toBe('a-b');
  });

  it('collapses multiple non-alphanumeric chars into one hyphen', () => {
    expect(toSlug('A  B')).toBe('a-b');
    expect(toSlug('A -- B')).toBe('a-b');
    expect(toSlug('A (International)')).toBe('a-international');
  });

  it('preserves existing hyphens', () => {
    expect(toSlug('Revamp-IT')).toBe('revamp-it');
  });

  it('preserves numbers', () => {
    expect(toSlug('Stiftung 2030')).toBe('stiftung-2030');
    expect(toSlug('Foundation123')).toBe('foundation123');
  });

  it('strips leading and trailing hyphens', () => {
    expect(toSlug('  Foundation  ')).toBe('foundation');
    expect(toSlug('(Foundation)')).toBe('foundation');
  });

  it('converts German umlaut ä → ae', () => {
    expect(toSlug('Ärzte Stiftung')).toBe('aerzte-stiftung');
    expect(toSlug('Müller')).toBe('mueller'); // ü → ue
  });

  it('converts German umlaut ö → oe', () => {
    expect(toSlug('Österreich Stiftung')).toBe('oesterreich-stiftung');
    expect(toSlug('Stöfler')).toBe('stoefler');
  });

  it('converts German umlaut ü → ue', () => {
    expect(toSlug('Zürich')).toBe('zuerich');
    expect(toSlug('Stiftung für Bildung')).toBe('stiftung-fuer-bildung');
  });

  it('handles all three umlauts combined', () => {
    expect(toSlug('Äöü')).toBe('aeoeue');
  });

  it('converts French accent à → a', () => {
    expect(toSlug('Fondation à Paris')).toBe('fondation-a-paris');
  });

  it('converts French accent é → e', () => {
    expect(toSlug('Fondation Bénévole')).toBe('fondation-benevole');
  });

  it('converts French accent è → e', () => {
    expect(toSlug('Fondation Bière')).toBe('fondation-biere');
  });

  it('handles typical Swiss foundation names', () => {
    expect(toSlug('Zürcher Gemeinnützige Gesellschaft')).toBe(
      'zuercher-gemeinnuetzige-gesellschaft',
    );
    expect(toSlug('Stiftung für soziale Integration')).toBe('stiftung-fuer-soziale-integration');
    expect(toSlug('Kanton Zürich — Bildungsfonds')).toBe('kanton-zuerich-bildungsfonds');
  });

  it('truncates to 60 characters', () => {
    const long = 'stiftung-fuer-die-foerderung-der-allgemeinen-bildung-in-der-schweiz';
    expect(toSlug(long)).toHaveLength(60);
    expect(toSlug(long)).toBe(long.substring(0, 60));
  });

  it('truncation applies after normalization', () => {
    const input = 'A'.repeat(70);
    expect(toSlug(input)).toBe('a'.repeat(60));
  });

  it('returns empty string for all-special-character input', () => {
    expect(toSlug('!!!')).toBe('');
    expect(toSlug('...')).toBe('');
  });

  it('handles empty string', () => {
    expect(toSlug('')).toBe('');
  });

  it('handles numbers only', () => {
    expect(toSlug('123')).toBe('123');
  });

  it('handles already-valid slug', () => {
    expect(toSlug('test-slug-123')).toBe('test-slug-123');
  });

  // The accents the hand-written list never reached. This is a directory of
  // SWISS foundations — French and Italian names are ordinary here, and every
  // one of these previously produced a hyphen where a letter belonged.
  it('converts ç, which the old list omitted', () => {
    expect(toSlug('Association Française')).toBe('association-francaise');
    expect(toSlug('Fondation Provençale')).toBe('fondation-provencale');
  });

  it('converts circumflex and remaining French accents', () => {
    expect(toSlug("Fondation Côte d'Azur")).toBe('fondation-cote-d-azur');
    expect(toSlug('Fondation Hôpital')).toBe('fondation-hopital');
    expect(toSlug('Fondation Août')).toBe('fondation-aout');
  });

  it('converts Spanish and Italian accents', () => {
    expect(toSlug('Fundación Niños')).toBe('fundacion-ninos');
    expect(toSlug('Fondazione Città')).toBe('fondazione-citta');
  });

  it('expands ß, which was never handled', () => {
    expect(toSlug('Stiftung Grüße')).toBe('stiftung-gruesse');
    expect(toSlug('Straßenkinder')).toBe('strassenkinder');
  });

  it('still expands ä to ae, not a — the ordering is load-bearing', () => {
    // Decomposing before the German map would strip the diaeresis and give
    // 'bar'. This assertion is what fails if the two steps are ever merged.
    expect(toSlug('Stiftung Bär')).toBe('stiftung-baer');
    expect(toSlug('Äöü')).toBe('aeoeue');
  });

  it('leaves plain ASCII byte-identical, so stored slugs stay reproducible', () => {
    // Slugs are persisted, never recomputed on read. If ASCII output moved,
    // re-deriving one from an unchanged name would silently orphan a URL.
    expect(toSlug('Revamp-IT Stiftung 2030')).toBe('revamp-it-stiftung-2030');
  });
});
