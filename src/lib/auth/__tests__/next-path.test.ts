/**
 * `next` decides where a browser goes after signing in, so it is a redirect
 * target assembled from a URL. Every hostile case below is a shape that leaves
 * this site while looking like a path.
 *
 * This mechanism existed before this test and did nothing at all: the guard
 * built `?next=` and the sign-in page ignored it, sending everyone to /start.
 * A parameter nobody reads is not a safe default, it is a dead feature that
 * reads as a working one.
 */

import { describe, it, expect } from 'vitest';
import { safeNextPath, DEFAULT_AFTER_SIGN_IN } from '../next-path';

describe('safeNextPath', () => {
  it('keeps a same-origin path, including its query', () => {
    expect(safeNextPath('/o/beispiel/inhalte')).toBe('/o/beispiel/inhalte');
    expect(safeNextPath('/o/beispiel/inhalte?a=WHY')).toBe('/o/beispiel/inhalte?a=WHY');
  });

  it('refuses anything that can leave this site', () => {
    for (const hostile of [
      '//evil.example',
      '//evil.example/o/x',
      '/\\evil.example',
      'https://evil.example',
      'http://evil.example',
      'javascript:alert(1)',
      '',
      'o/beispiel',
      '/o/x\nLocation: https://evil.example',
      '/o/x\r\nSet-Cookie: a=b',
    ]) {
      expect(safeNextPath(hostile), hostile).toBe(DEFAULT_AFTER_SIGN_IN);
    }
  });

  it('refuses a non-string', () => {
    for (const v of [null, undefined, 42, ['/a'], {}]) {
      expect(safeNextPath(v)).toBe(DEFAULT_AFTER_SIGN_IN);
    }
  });

  it('uses the caller fallback when given one', () => {
    expect(safeNextPath('//evil.example', '/o/x')).toBe('/o/x');
  });
});
