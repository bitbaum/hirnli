/**
 * Seed org content tables from the ORG-SPECIFIC TypeScript configs.
 *
 * Phase C step 1 (docs/HIRNLI-REPLATFORM-PLAN.md §3.2): converts today's
 * compile-time tenant content into revamp-it rows in org_profiles /
 * org_content / org_scoring. Idempotent (upserts) — re-run after editing
 * the TS configs until readers migrate to the DB and the configs retire.
 *
 * Run with: npx tsx scripts/seed-org-content.ts   (needs DB tunnel — see docs/DEPLOYMENT.md)
 */

import { sql } from './lib/db';
import { ORG_PROFILE } from '../src/lib/config/org-profile';
import { SCORING_ENGINE, READINESS_ENGINE } from '../src/lib/config/fit-scoring';
import { CORE_FACTS, GESUCH_TEXT, WHY, ANSCHREIBEN_TEMPLATES, PARTNER_HIGHLIGHTS } from '../src/lib/config/stories';
import { NUMBERS_REGISTRY } from '../src/lib/config/numbers';
import { SCHWERPUNKTE } from '../src/lib/config/schwerpunkte';
import { TEMPLATE_FOUNDATIONS } from '../src/lib/config/gesuch-templates';
import { THEMES } from '../src/lib/config/foundations/metadata';

const ORG_ID = ORG_PROFILE.orgId;

/** Content blocks keyed exactly like their future readers will ask for them */
const CONTENT_BLOCKS: Record<string, unknown> = {
  stories: { CORE_FACTS, GESUCH_TEXT, WHY, ANSCHREIBEN_TEMPLATES, PARTNER_HIGHLIGHTS },
  numbers: NUMBERS_REGISTRY,
  schwerpunkte: SCHWERPUNKTE,
  'gesuch-templates': TEMPLATE_FOUNDATIONS,
  themes: THEMES,
};

async function main() {
  console.log(`\nSeeding org content for '${ORG_ID}'...\n`);

  await sql`
    INSERT INTO org_profiles (org_id, profile, default_locale, updated_at)
    VALUES (${ORG_ID}, ${JSON.stringify(ORG_PROFILE)}::jsonb, 'de', now())
    ON CONFLICT (org_id) DO UPDATE
      SET profile = EXCLUDED.profile, updated_at = now()
  `;
  console.log('  org_profiles: upserted');

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
  console.log(`\nDone. org_profiles=${counts.profiles} org_content=${counts.content} org_scoring=${counts.scoring}\n`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
