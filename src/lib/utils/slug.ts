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

/**
 * The organisation part of a download filename, e.g. "revampit-stiftungen.csv".
 *
 * Three export routes each carried their own copy of this expression, all
 * derived from a compile-time org name. Now that the name comes from the
 * request's tenant it has to be computed per request, and computing it three
 * ways is how the same download ends up named differently depending on which
 * endpoint produced it.
 *
 * Deliberately not `toSlug`: that inserts hyphens and transliterates umlauts
 * for URLs, and these filenames have always been the unhyphenated form. Keeping
 * them that way means an existing download does not silently change its name.
 */
export function toFilePrefix(orgName: string): string {
  return orgName.toLowerCase().replace(/[^a-z0-9]/g, '');
}
