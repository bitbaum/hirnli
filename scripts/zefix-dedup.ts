#!/usr/bin/env tsx
/**
 * One-off: Remove 28 cross-source duplicate foundations from DB.
 * Keeps the higher-priority source version (manual > website > esa > zefix).
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

const DUPLICATES_TO_REMOVE = [
  'b-atrice-ederer-weber-stiftung',
  'drosos-stiftung',
  'eckenstein-geigy-stiftung',
  'ernst-goehner-stiftung',
  'fondation-charles-l-opold-mayer-pour-le-progr-s-humain-fph',
  'fondation-indi-go',
  'fondation-jean-jacques-et-felicia-lopez-loreta-pour-l-excell',
  'fondation-lombard-odier',
  'fondation-myriam-et-ren-haeberli',
  'gebert-ruef-stiftung',
  'gruetli-stiftung-zuerich',
  'hans-eggenberger-stiftung',
  'hasler-stiftung',
  'hirschmann-stiftung',
  'klimastiftung-schweiz',
  'leopold-bachmann-stiftung',
  'max-kohler-stiftung',
  'paul-schiller-stiftung',
  'sinnovativ-stiftung-fuer-soziale-innovation',
  'sophie-und-karl-binding-stiftung',
  'stiftung-bruderklaus-au-waedenswil',
  'stiftung-fuer-kultur-und-jugend',
  'stiftung-myclimate',
  'stiftung-pro-jugend-und-berufsbildung-schweiz',
  'stiftung-zuerich-jobs',
  'swo-docu-swiss-welfare-organisation',
  'ubs-stiftung-fuer-soziales-und-ausbildung',
  'z-zurich-foundation',
];

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log(`Removing ${DUPLICATES_TO_REMOVE.length} duplicate entries...`);

  for (const slug of DUPLICATES_TO_REMOVE) {
    await sql`DELETE FROM fundraising_foundations WHERE id = ${slug}`;
    await sql`DELETE FROM fundraising_foundation_registry WHERE id = ${slug}`;
  }

  const count = await sql`SELECT COUNT(*) as cnt FROM fundraising_foundations`;
  console.log(`Done. Remaining foundations: ${count[0].cnt}`);
}

main().catch(e => { console.error(e); process.exit(1); });
