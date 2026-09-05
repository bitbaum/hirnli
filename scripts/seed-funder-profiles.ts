/**
 * Give every foundation a profile to start from.
 *
 * A foundation is a party on this platform, and a party with nothing to show is
 * a party in name only. This derives a DRAFT `funder_profiles` row for each
 * register entry from what the platform already researched — purpose, website,
 * contact, how to apply, typical grant size — so that when a foundation's
 * people are given accounts they find their entry already filled in and have
 * something to correct rather than a blank form.
 *
 * Every row is written with `confirmed_at = NULL`, and that is the entire
 * safety of this script. Unconfirmed rows change nothing anyone sees:
 * `applyFunderProfile()` ignores them, so the register keeps rendering exactly
 * as it does today. They become visible only when a foundation confirms, which
 * only a foundation can do.
 *
 * Idempotent, and deliberately non-destructive: a row that has been confirmed
 * or edited is never overwritten. Re-running must not undo a foundation's work.
 *
 *   DATABASE_URL=... npx tsx scripts/seed-funder-profiles.ts [--dry-run]
 */

import { sql } from './lib/db';
import { storedFunderProfileSchema } from '../src/lib/funder/profile';

type Row = { id: string; name: string; config_data: unknown };

const DRY_RUN = process.argv.includes('--dry-run');

/** Only fields a foundation would recognise as being about itself. */
function draftFrom(row: Row): unknown | null {
  const c = (row.config_data ?? {}) as Record<string, unknown>;
  const contact = (c.contact ?? {}) as Record<string, unknown>;
  const amount = (c.amount ?? {}) as Record<string, unknown>;

  const draft: Record<string, unknown> = {
    foundationId: row.id,
    name: row.name,
  };

  if (typeof c.purposeSummary === 'string' && c.purposeSummary.trim()) {
    draft.purpose = c.purposeSummary.slice(0, 4000);
  }
  if (typeof c.websiteUrl === 'string' && /^https?:\/\//.test(c.websiteUrl)) {
    draft.website = c.websiteUrl;
  }
  if (typeof c.applicationMethod === 'string') draft.applicationMethod = c.applicationMethod;
  if (typeof c.region === 'string' && c.region.trim()) draft.geography = c.region.slice(0, 500);

  const email = typeof contact.email === 'string' ? contact.email : undefined;
  const phone = typeof contact.phone === 'string' ? contact.phone : undefined;
  const address = typeof contact.address === 'string' ? contact.address : undefined;
  if (email || phone || address) {
    draft.contact = {
      ...(email && email.includes('@') ? { email } : {}),
      ...(phone ? { phone } : {}),
      ...(address ? { address } : {}),
    };
  }

  const min = typeof amount.min === 'number' ? Math.max(0, Math.trunc(amount.min)) : undefined;
  const max = typeof amount.max === 'number' ? Math.max(0, Math.trunc(amount.max)) : undefined;
  if (min !== undefined) draft.grantMin = min;
  if (max !== undefined) draft.grantMax = max;

  // Validate before writing. A draft that cannot be read back is worse than no
  // draft: the reader would fall back to "the foundation has not spoken", and
  // nobody would know a row was there at all.
  const parsed = storedFunderProfileSchema.safeParse(draft);
  return parsed.success ? parsed.data : null;
}

async function main() {
  const rows = (await sql`
    SELECT id, name, config_data FROM fundraising_foundations WHERE archived = false
  `) as Row[];

  let written = 0;
  let skippedInvalid = 0;

  for (const row of rows) {
    const draft = draftFrom(row);
    if (!draft) {
      skippedInvalid += 1;
      continue;
    }
    if (DRY_RUN) {
      written += 1;
      continue;
    }

    // Never overwrite a foundation's own work: only fill in rows that do not
    // exist, and leave confirmed or edited ones exactly as they are.
    await sql`
      INSERT INTO funder_profiles (foundation_id, profile)
      VALUES (${row.id}, ${JSON.stringify(draft)}::jsonb)
      ON CONFLICT (foundation_id) DO NOTHING
    `;
    written += 1;
  }

  console.log(
    `${DRY_RUN ? '[dry run] ' : ''}foundations: ${rows.length}, drafts: ${written}, ` +
      `unusable: ${skippedInvalid}`,
  );
  console.log(
    'All drafts are UNCONFIRMED — nothing changes on any page until a foundation says so.',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
