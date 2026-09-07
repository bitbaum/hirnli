/**
 * Where to send someone after they sign in.
 *
 * Pure and dependency-free so both ends can share it: the guard that builds the
 * `?next=` parameter and the form that follows it. One rule in one place, for
 * the usual reason — a redirect target validated in two places is validated
 * differently in two places, and the lenient one is the one an attacker uses.
 *
 * `next` reaches `router.push()` and a server `redirect()`, so it must be a
 * path on this site and nothing else. The dangerous shapes are not obvious:
 * `//evil.example` is a protocol-relative URL a browser follows off-site, and
 * `/\evil.example` is treated as one by some of them. Requiring a single
 * leading slash and rejecting a second character that is a slash or backslash
 * covers both without trying to parse a URL that may not be one.
 */

export const DEFAULT_AFTER_SIGN_IN = '/start';

export function safeNextPath(raw: unknown, fallback: string = DEFAULT_AFTER_SIGN_IN): string {
  if (typeof raw !== 'string' || raw.length === 0) return fallback;
  if (!raw.startsWith('/')) return fallback;
  if (raw[1] === '/' || raw[1] === '\\') return fallback;
  // A control character can smuggle a newline into a Location header.
  if (/[\u0000-\u001F\u007F]/.test(raw)) return fallback;
  return raw;
}
