#!/usr/bin/env tsx
import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const dryRun = process.argv.includes('--dry-run');

async function main() {
  const dupes = await sql`
    SELECT config_data->>'uid' as uid, array_agg(id) as ids
    FROM fundraising_foundations 
    WHERE config_data->>'uid' IS NOT NULL AND config_data->>'uid' != ''
      AND (archived = false OR archived IS NULL)
      AND (data_confidence IS NULL OR data_confidence != 'unverified')
    GROUP BY config_data->>'uid' HAVING count(*) > 1`;

  console.log(`Found ${dupes.length} duplicate groups\n`);
  let mergedCount = 0, archivedCount = 0;

  for (const dupe of dupes) {
    const rows = await sql`
      SELECT id, name, fit_score, contact_email, contact_phone, contact_address, website_url
      FROM fundraising_foundations WHERE id = ANY(${dupe.ids})`;

    rows.sort((a, b) => {
      const fd = (Number(b.fit_score) || 0) - (Number(a.fit_score) || 0);
      if (fd !== 0) return fd;
      const cs = (r: any) => [r.contact_email, r.contact_phone, r.contact_address].filter(Boolean).length;
      return cs(b) - cs(a);
    });

    const w = rows[0], losers = rows.slice(1);
    const email = w.contact_email || losers.find(l => l.contact_email)?.contact_email || null;
    const phone = w.contact_phone || losers.find(l => l.contact_phone)?.contact_phone || null;
    const addr = w.contact_address || losers.find(l => l.contact_address)?.contact_address || null;
    const web = (w.website_url && !String(w.website_url).includes('zefix')) ? w.website_url 
      : losers.find(l => l.website_url && !String(l.website_url).includes('zefix'))?.website_url || w.website_url;

    console.log(`${dupe.uid}: KEEP ${w.id} (fit=${w.fit_score}), ARCHIVE ${losers.map(l=>l.id).join(', ')}`);

    if (!dryRun) {
      await sql`UPDATE fundraising_foundations 
        SET contact_email = ${email}, contact_phone = ${phone}, 
            contact_address = ${addr}, website_url = ${web}
        WHERE id = ${w.id}`;
      mergedCount++;
      
      for (const l of losers) {
        await sql`UPDATE fundraising_foundations SET archived = true WHERE id = ${l.id}`;
        archivedCount++;
      }
    }
  }
  console.log(`\n${mergedCount} merged, ${archivedCount} archived${dryRun ? ' (DRY RUN)' : ''}`);
}
main().catch(console.error);
