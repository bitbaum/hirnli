/**
 * Fix leo-future: method=none was set because no website was found,
 * but the foundation IS a grant-maker (4 pillars: health/education/sport/sustainability).
 * Correct to method=unknown so it appears in applicationUrl gap list and can be researched.
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const [row] = await sql`SELECT config_data, fit_score FROM fundraising_foundations WHERE id = 'leo-future'`;
  const cd = row.config_data as Record<string, unknown>;
  cd.applicationMethod = 'unknown'; // was 'none' — incorrect; means "not found", not "refuses applications"
  cd.acceptsApplications = 'unknown';
  // Research the foundation further: Zug-based, 4 pillars (Gesundheit, Bildung, Sport/Kultur, Nachhaltigkeit)
  // Themes are well-aligned with Revamp-IT — worth finding website and contact
  await sql`
    UPDATE fundraising_foundations
    SET config_data = ${JSON.stringify(cd) as unknown}::jsonb, updated_at = NOW()
    WHERE id = 'leo-future'
  `;
  console.log('✅ Fixed leo-future: method none→unknown');
}
main().catch(console.error);
