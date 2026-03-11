/**
 * Share Token Utility — SSOT for HMAC-based shareable gesuch URLs
 *
 * Tokens are derived at runtime from SHARE_SECRET — no DB storage needed.
 * Each foundation gets one stable, unguessable token.
 *
 * URL shape: /gesuch/share/[token]
 * e.g.       /gesuch/share/a3f8c2d91e4b7605
 */

import { createHmac, timingSafeEqual } from 'crypto';

/** Length of the hex token (first N chars of HMAC-SHA256) */
const TOKEN_LENGTH = 16;

/**
 * Compute the share token for a foundation slug.
 * Returns null if SHARE_SECRET is not configured.
 */
export function computeShareToken(slug: string): string | null {
  const secret = process.env.SHARE_SECRET;
  if (!secret) return null;
  return createHmac('sha256', secret).update(slug).digest('hex').slice(0, TOKEN_LENGTH);
}

/**
 * Resolve a token back to its foundation slug.
 * Returns null if the token is invalid or SHARE_SECRET is not set.
 */
export function resolveShareToken(
  token: string,
  allSlugs: string[],
): string | null {
  const secret = process.env.SHARE_SECRET;
  if (!secret) return null;

  for (const slug of allSlugs) {
    const expected = createHmac('sha256', secret).update(slug).digest('hex').slice(0, TOKEN_LENGTH);
    // Constant-time comparison to prevent timing side-channel attacks
    if (expected.length === token.length &&
        timingSafeEqual(Buffer.from(expected), Buffer.from(token))) {
      return slug;
    }
  }
  return null;
}
