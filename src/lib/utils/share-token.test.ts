import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { computeShareToken, resolveShareToken } from './share-token';

const TEST_SECRET = 'test-secret-for-unit-tests';
const SLUGS = ['stiftung-a', 'stiftung-b', 'stiftung-c'];

describe('computeShareToken', () => {
  let original: string | undefined;

  beforeEach(() => {
    original = process.env.SHARE_SECRET;
    process.env.SHARE_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.SHARE_SECRET;
    } else {
      process.env.SHARE_SECRET = original;
    }
  });

  it('returns null when SHARE_SECRET is not set', () => {
    delete process.env.SHARE_SECRET;
    expect(computeShareToken('stiftung-a')).toBeNull();
  });

  it('returns a 16-character hex string', () => {
    const token = computeShareToken('stiftung-a');
    expect(token).toMatch(/^[0-9a-f]{16}$/);
  });

  it('is deterministic — same slug always produces the same token', () => {
    expect(computeShareToken('stiftung-a')).toBe(computeShareToken('stiftung-a'));
  });

  it('produces different tokens for different slugs', () => {
    const tokens = SLUGS.map(computeShareToken);
    const unique = new Set(tokens);
    expect(unique.size).toBe(SLUGS.length);
  });

  it('is sensitive to the secret — different secret → different token', () => {
    const token1 = computeShareToken('stiftung-a');
    process.env.SHARE_SECRET = 'other-secret';
    const token2 = computeShareToken('stiftung-a');
    expect(token1).not.toBe(token2);
  });
});

describe('resolveShareToken', () => {
  let original: string | undefined;

  beforeEach(() => {
    original = process.env.SHARE_SECRET;
    process.env.SHARE_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.SHARE_SECRET;
    } else {
      process.env.SHARE_SECRET = original;
    }
  });

  it('returns null when SHARE_SECRET is not set', () => {
    delete process.env.SHARE_SECRET;
    expect(resolveShareToken('anytoken1234567', SLUGS)).toBeNull();
  });

  it('returns null for an empty slug list', () => {
    const token = computeShareToken('stiftung-a')!;
    expect(resolveShareToken(token, [])).toBeNull();
  });

  it('round-trips: resolves to the original slug', () => {
    for (const slug of SLUGS) {
      const token = computeShareToken(slug)!;
      expect(resolveShareToken(token, SLUGS)).toBe(slug);
    }
  });

  it('returns null for a token that matches no slug', () => {
    expect(resolveShareToken('0000000000000000', SLUGS)).toBeNull();
  });

  it('returns null for a token with wrong length', () => {
    const token = computeShareToken('stiftung-a')!;
    // Truncated token — length guard prevents timingSafeEqual call
    expect(resolveShareToken(token.slice(0, 8), SLUGS)).toBeNull();
  });

  it('returns null when secret changes after token was issued', () => {
    const token = computeShareToken('stiftung-a')!;
    process.env.SHARE_SECRET = 'different-secret';
    expect(resolveShareToken(token, SLUGS)).toBeNull();
  });

  it('does not confuse tokens across different slugs', () => {
    const tokenA = computeShareToken('stiftung-a')!;
    // Resolving tokenA against a list that does NOT include stiftung-a
    expect(resolveShareToken(tokenA, ['stiftung-b', 'stiftung-c'])).toBeNull();
  });
});
