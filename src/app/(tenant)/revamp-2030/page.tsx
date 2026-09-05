/**
 * The old URL for what is now `/vision`.
 *
 * The route was named after one customer's project, so every tenant's
 * navigation offered it — in three locales — and the path itself put a
 * customer's name in the product's URL space. It is `/vision` now, which is
 * what the page is: where an organisation intends to be by 2030.
 *
 * This redirect stays because the old address is not ours to break. The tenant
 * registry notes that a tenant host "keeps its URLs so the SEO built up under
 * it is not thrown away"; the same argument applies one level down, to a path
 * that has been linked and indexed.
 *
 * Permanent (308), so search engines move rather than keep both.
 */

import { permanentRedirect } from 'next/navigation';

export default function LegacyVisionRoute(): never {
  permanentRedirect('/vision');
}
