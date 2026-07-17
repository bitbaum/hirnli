/**
 * Foundation data reader for standalone pipeline scripts.
 *
 * Same query/filter/validation as src/lib/db/foundations-repo.ts (the app's
 * read layer), but without unstable_cache — that's a Next.js server API and
 * doesn't work outside a Next request/build context, which is exactly the
 * environment these `tsx` scripts run in. Scripts are one-shot, so an
 * uncached query per run is fine.
 */

import { sql } from './db';
import { foundationSchema, type Foundation } from '../../src/lib/schemas/foundation';

export async function getAllFoundations(): Promise<Foundation[]> {
  const rows = await sql<{ config_data: unknown }>`
    SELECT config_data FROM fundraising_foundations
    WHERE (archived = false OR archived IS NULL)
      AND (data_confidence IS NULL OR data_confidence != 'unverified')
  `;

  const valid: Foundation[] = [];
  for (const row of rows) {
    const parsed = foundationSchema.safeParse(row.config_data);
    if (parsed.success) valid.push(parsed.data);
  }
  valid.sort((a, b) => a.slug.localeCompare(b.slug));
  return valid;
}
