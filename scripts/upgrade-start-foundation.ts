/**
 * One-time fix: start-foundation has its real website mentioned in
 * applicationProcess ("startfoundation.ch") but websiteUrl still points to
 * zefix. Updating to the real URL upgrades research_depth to standard.
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const REAL_URL = 'https://www.startfoundation.ch';
  const SLUG = 'start-foundation';
  
  const [row] = await sql`SELECT config_data FROM fundraising_foundations WHERE id = ${SLUG}`;
  if (!row) { console.error('Not found'); process.exit(1); }
  
  const cd = row.config_data as Record<string, unknown>;
  cd.websiteUrl = REAL_URL;
  cd.researchDepth = 'standard'; // has real website now
  
  await sql`
    UPDATE fundraising_foundations
    SET config_data = ${JSON.stringify(cd)}::jsonb,
        research_depth = 'standard',
        updated_at = NOW()
    WHERE id = ${SLUG}
  `;
  
  console.log(`Updated ${SLUG}: websiteUrl=${REAL_URL}, researchDepth=standard`);
  console.log('Next: npm run sync  (priority will be recomputed)');
}
main().catch(console.error);
