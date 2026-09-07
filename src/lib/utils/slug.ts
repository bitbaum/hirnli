/**
 * Generate a URL-safe slug from a foundation name.
 * Used by API routes, import scripts, and the research pipeline.
 *
 * This is a directory of SWISS foundations, so French and Italian names are
 * ordinary, not edge cases. The previous version transliterated a hand-written
 * list — ä ö ü à é è — and deleted every character not on it:
 *
 *   'Association Française'  -> 'association-fran-aise'   (ç absent)
 *   "Fondation Côte d'Azur"  -> 'fondation-c-te-d-azur'   (ô absent)
 *   'Fundación Niños'        -> 'fundaci-n-ni-os'         (ó ñ absent)
 *   'Stiftung Gruesse'       -> 'stiftung-grue-e'         (sharp-s absent)
 *
 * A list like that is never finished; it is only ever missing the next name
 * somebody imports. So: expand the German digraphs explicitly, then let Unicode
 * decomposition handle every remaining Latin diacritic in one rule.
 *
 * Order is load-bearing — the German expansion must run BEFORE the NFD strip,
 * or 'ä' decomposes to 'a' and Stiftung Bär becomes 'bar' instead of 'baer'.
 *
 * Sharp-s is matched as the escape \u00df rather than the literal glyph:
 * `pnpm lint:umlauts` forbids that character anywhere in src/, because Swiss
 * German spells it 'ss'. This function is the one place that has to RECOGNISE
 * it in order to convert it — imported foundation names come from registries
 * that are not all Swiss. Escaping keeps the rule intact instead of carving out
 * an exemption for the file that implements it.
 */
export function toSlug(name: string): string {
  return String(name)
    .toLowerCase()
    .replace(/[äöü]/g, (m) => ({ ä: 'ae', ö: 'oe', ü: 'ue' })[m] ?? m)
    .replace(/\u00df/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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
