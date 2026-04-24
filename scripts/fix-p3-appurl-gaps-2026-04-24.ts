/**
 * Fix APPLICATION URL GAPS for 5 P3 foundations (alice-ackermann is the known
 * structural gap — phone only, no email, no appUrl — left untouched).
 *
 * Root cause: all 5 have method='contact' or 'unknown' but no applicationUrl.
 * For 4 of them, the contact IS an email — method should be 'email' so the audit
 * no longer flags them as missing applicationUrls (email is a valid application path).
 * For leo-future, the website has persistent SSL errors; email is the only channel.
 *
 * Outcomes:
 *  - leo-future: method 'unknown'→'email'; add StiftungSchweiz/Fundraiso URLs as websiteUrl
 *  - dcs-stiftung: method 'contact'→'email' (has info@dcs.ch)
 *  - elsa-stiftung: method 'contact'→'email' (has elsa@elsa.org); update websiteUrl
 *  - fondation-honegger: method 'contact'→'email' (has info@honegger.ch); update websiteUrl
 *  - emil-huber-stockar-stiftung: method 'contact'→'email' (has info@gs.ethz.ch)
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

async function patch(
  id: string,
  updater: (cd: Record<string, unknown>) => void,
): Promise<void> {
  const [row] = await sql`SELECT config_data, fit_score FROM fundraising_foundations WHERE id = ${id}`;
  if (!row) { console.log(`  ❌ NOT FOUND: ${id}`); return; }
  const cd = row.config_data as Record<string, unknown>;
  updater(cd);
  await sql`
    UPDATE fundraising_foundations
    SET config_data = ${JSON.stringify(cd) as unknown}::jsonb,
        updated_at  = NOW()
    WHERE id = ${id}
  `;
  console.log(`  ✅ updated: ${id}`);
}

async function main() {
  console.log('\nFixing P3 applicationMethod gaps...\n');

  // Leo Future Foundation — website SSL broken; email only
  await patch('leo-future', (cd) => {
    cd.applicationMethod = 'email';
    // Use StiftungSchweiz directory URL as proxy since website is down
    cd.websiteUrl = 'https://stiftungen.stiftungschweiz.ch/organisation/leo-future-foundation';
    cd.researchNotes = 'Gegr. 2022, Sitz Zug. Website leofuturefoundation.ch dauerhaft nicht erreichbar (SSL-Fehler). Vier Pfeiler: Gesundheit (Kinder/Jugend), Bildung (Berufszugang, Stipendien, Inklusion), Sport & Kultur, Nachhaltigkeit. Kontakt ausschliesslich per E-Mail: info@leofuturefoundation.ch. Bildungs- und Inklusionsaspekt hat thematische Überschneidung mit Revamp-IT (Berufszugang für Benachteiligte).';
  });

  // DCS Stiftung — has email; no public website known
  await patch('dcs-stiftung', (cd) => {
    cd.applicationMethod = 'email';
    cd.researchNotes = (cd.researchNotes as string || '') + '\nApplicationsmethod auf email korrigiert (info@dcs.ch). Kein öffentlicher Bewerbungsprozess dokumentiert; Direktkontakt per E-Mail.';
  });

  // Elsa Stiftung — has email; private foundation, no public process
  await patch('elsa-stiftung', (cd) => {
    cd.applicationMethod = 'email';
    // Remove StiftungSchweiz directory link — not the foundation's own website
    if (cd.websiteUrl === 'https://stiftungen.stiftungschweiz.ch/organisation/elsa-stiftung') {
      delete cd.websiteUrl;
    }
  });

  // Fondation Honegger — has email; family foundation, no public process
  await patch('fondation-honegger', (cd) => {
    cd.applicationMethod = 'email';
    // Remove Fundraiso directory link — not the foundation's own website
    if (cd.websiteUrl === 'https://www.fundraiso.com/en/organisations/fondation-honegger') {
      delete cd.websiteUrl;
    }
  });

  // Emil Huber-Stockar Stiftung — has email; alpine/ETH focus, no public process
  await patch('emil-huber-stockar-stiftung', (cd) => {
    cd.applicationMethod = 'email';
  });

  console.log('\n✅ Done. Run: npm run audit to verify gaps list');
}
main().catch(console.error);
