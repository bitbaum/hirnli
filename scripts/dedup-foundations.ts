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
      SELECT id, name, fit_score, config_data
      FROM fundraising_foundations WHERE id = ANY(${dupe.ids})`;

    rows.sort((a, b) => {
      const fd = (Number(b.fit_score) || 0) - (Number(a.fit_score) || 0);
      if (fd !== 0) return fd;
      const cs = (r: any) => {
        const c = r.config_data?.contact || {};
        return [c.email, c.phone, c.address].filter(Boolean).length;
      };
      return cs(b) - cs(a);
    });

    const w = rows[0], losers = rows.slice(1);
    const wContact = (w.config_data as any)?.contact || {};
    const wWeb = (w.config_data as any)?.websiteUrl;
    const email = wContact.email || losers.find(l => (l.config_data as any)?.contact?.email)?.config_data?.contact?.email || null;
    const phone = wContact.phone || losers.find(l => (l.config_data as any)?.contact?.phone)?.config_data?.contact?.phone || null;
    const addr = wContact.address || losers.find(l => (l.config_data as any)?.contact?.address)?.config_data?.contact?.address || null;
    const web = (wWeb && !String(wWeb).includes('zefix')) ? wWeb
      : losers.find(l => { const u = (l.config_data as any)?.websiteUrl; return u && !String(u).includes('zefix'); })?.config_data?.websiteUrl || wWeb;

    console.log(`${dupe.uid}: KEEP ${w.id} (fit=${w.fit_score}), ARCHIVE ${losers.map(l=>l.id).join(', ')}`);

    if (!dryRun) {
      // Merge best contact data into winner's config_data
      const cd = (w.config_data || {}) as Record<string, unknown>;
      if (!cd.contact) cd.contact = {};
      const contact = cd.contact as Record<string, string | null>;
      if (email) contact.email = email;
      if (phone) contact.phone = phone;
      if (addr) contact.address = addr;
      if (web) cd.websiteUrl = web;
      await sql`UPDATE fundraising_foundations
        SET config_data = ${JSON.stringify(cd)}::jsonb, updated_at = NOW()
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
