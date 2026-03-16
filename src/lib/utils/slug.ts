/**
 * Generate a URL-safe slug from a foundation name.
 * Handles German umlauts and French accented characters.
 * Used by API routes, import scripts, and research pipeline.
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/à/g, 'a')
    .replace(/é/g, 'e')
    .replace(/è/g, 'e')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}
