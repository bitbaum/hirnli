import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const slugs = readFileSync('/tmp/batch_slugs.txt', 'utf8').trim().split('\n');
  const CHUNK = 200;
  let alreadyImported = 0, notImported = 0, notInDB = 0;
  const pending: string[] = [];

  for (let i = 0; i < slugs.length; i += CHUNK) {
    const batch = slugs.slice(i, i + CHUNK);
    const rows = await sql`
      SELECT id, config_data->>'applicationResearchMethod' as method
      FROM fundraising_foundations WHERE id = ANY(${batch}::text[])
    `;
    const inDB = new Map(rows.map(r => [r.id, r.method]));
    for (const s of batch) {
      if (!inDB.has(s)) notInDB++;
      else if (inDB.get(s) === 'claude-agent') alreadyImported++;
      else { notImported++; pending.push(s); }
    }
  }
  console.log('Already imported (claude-agent):', alreadyImported);
  console.log('In DB but NOT yet imported:', notImported);
  console.log('Not in DB at all:', notInDB);
  if (pending.length > 0) {
    console.log('\nSample not-yet-imported slugs:');
    pending.slice(0, 10).forEach(s => console.log(' ', s));
  }
}
main().catch(console.error);
