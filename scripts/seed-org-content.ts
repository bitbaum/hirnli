/**
 * Seed org CONTENT tables from the ORG-SPECIFIC TypeScript configs.
 *
 * Mirrors today's compile-time tenant content into org_content / org_scoring
 * rows for revamp-it. Idempotent — re-run after editing the TS configs, until
 * the readers migrate to the DB and the configs retire.
 *
 * ── WHY THIS NO LONGER TOUCHES org_profiles ──────────────────────────────────
 *
 * It used to, and doing so would now take the site down.
 *
 * `org_profiles` stopped being a mirror the moment `getTenantById()` started
 * reading it: it is the live source of every tenant's identity, on every
 * request. Seeding it from the constant this migration exists to retire would
 * overwrite live data with a copy — backwards on its own terms.
 *
 * Worse, the copy is invalid. `storedTenantProfileSchema` is `.strict()` and
 * deliberately has no room for `yearsActive` or `experienceLabel`, because both
 * are arithmetic on `founded` and a stored copy goes wrong on 1 January.
 * That constant carried both. Postgres would accept the row happily; the next
 * request would call `parseTenant()`, get "Unrecognized keys", and throw — and
 * `getTenantById()` throws rather than falling back, on purpose. Every page,
 * 500, from running a script whose own header said to re-run it freely.
 *
 * A tenant's identity is edited in the database. There is no code path back.
 *
 * Run with: npx tsx scripts/seed-org-content.ts   (needs DB tunnel — see docs/DEPLOYMENT.md)
 */

import { sql } from './lib/db';
import { requireOrgId } from './lib/require-org';
import { SCORING_ENGINE, READINESS_ENGINE } from '../src/lib/config/fit-scoring';
import { STORIES_CONTENT } from '../src/lib/config/stories';
import { NUMBERS_REGISTRY } from '../src/lib/config/numbers';
import { SCHWERPUNKTE } from '../src/lib/config/schwerpunkte';
import { TEMPLATE_FOUNDATIONS } from '../src/lib/config/gesuch-templates';
import { THEMES } from '../src/lib/config/foundations/metadata';

// Whose content this is, stated rather than inherited from a constant — the
// same rule as every other script here, and what lets this seed a second tenant.
const ORG_ID = requireOrgId();

/** Content blocks keyed exactly like their future readers will ask for them */
const CONTENT_BLOCKS: Record<string, unknown> = {
  stories: STORIES_CONTENT,
  numbers: NUMBERS_REGISTRY,
  schwerpunkte: SCHWERPUNKTE,
  'gesuch-templates': TEMPLATE_FOUNDATIONS,
  themes: THEMES,
};

async function main() {
  console.log(`\nSeeding org content for '${ORG_ID}'...\n`);

  // org_profiles is deliberately NOT written here. See the header.
  const [{ exists }] = await sql<{ exists: boolean }>`
    SELECT EXISTS (SELECT 1 FROM org_profiles WHERE org_id = ${ORG_ID}) AS exists
  `;
  if (!exists) {
    throw new Error(
      `No org_profiles row for '${ORG_ID}'. Identity is edited in the database, ` +
        'not seeded from code — insert the row first, then re-run this to seed its content.',
    );
  }

  for (const [key, value] of Object.entries(CONTENT_BLOCKS)) {
    await sql`
      INSERT INTO org_content (org_id, key, locale, value, updated_at)
      VALUES (${ORG_ID}, ${key}, 'de', ${JSON.stringify(value)}::jsonb, now())
      ON CONFLICT (org_id, key, locale) DO UPDATE
        SET value = EXCLUDED.value, version = org_content.version + 1, updated_at = now()
    `;
    console.log(`  org_content['${key}']: upserted`);
  }

  await sql`
    INSERT INTO org_scoring (org_id, engine, readiness, updated_at)
    VALUES (${ORG_ID}, ${JSON.stringify(SCORING_ENGINE)}::jsonb, ${JSON.stringify(READINESS_ENGINE)}::jsonb, now())
    ON CONFLICT (org_id) DO UPDATE
      SET engine = EXCLUDED.engine, readiness = EXCLUDED.readiness, updated_at = now()
  `;
  console.log('  org_scoring: upserted');

  const [counts] = await sql<{ profiles: string; content: string; scoring: string }>`
    SELECT
      (SELECT COUNT(*) FROM org_profiles)::text AS profiles,
      (SELECT COUNT(*) FROM org_content)::text  AS content,
      (SELECT COUNT(*) FROM org_scoring)::text  AS scoring
  `;
  console.log(
    `\nDone. org_profiles=${counts.profiles} org_content=${counts.content} org_scoring=${counts.scoring}\n`,
  );
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
