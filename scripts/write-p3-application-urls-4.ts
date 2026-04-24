/**
 * Write applicationUrl findings from 2026-04-24 research on P3 foundations with websites.
 *
 * Findings:
 *  1. start-foundation: www.startfoundation.ch is dead — real URL is www.start-foundation.com.
 *     No inbound applications accepted (they select own partners). Fix websiteUrl, set method=none.
 *  2. paul-und-anna-klaproth-stiftung: klaprothstiftung.ch has form on homepage, but this is an
 *     individual beneficiary foundation (elderly Swiss Protestants 75+), NOT an org funder.
 *     Revamp-IT ineligible. Lower fit, add note.
 *  3. vindobona: www.vindobona.ch is a minimal single-page site — only email (info@vindobona.ch).
 *     Very new (Oct 2023), no established process. Set applicationMethod=email, add email contact.
 *  4. options-for-growth-foundation: partnership model — no open application. Set method=contact.
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

async function patch(
  id: string,
  updater: (cd: Record<string, unknown>) => void,
  fitScore?: number,
): Promise<void> {
  const [row] = await sql`SELECT config_data, fit_score FROM fundraising_foundations WHERE id = ${id}`;
  if (!row) { console.log(`  ❌ NOT FOUND: ${id}`); return; }
  const cd = row.config_data as Record<string, unknown>;
  updater(cd);
  const fs = fitScore ?? (row.fit_score as number);
  await sql`
    UPDATE fundraising_foundations
    SET config_data = ${JSON.stringify(cd) as unknown}::jsonb,
        fit_score = ${fs},
        updated_at = NOW()
    WHERE id = ${id}
  `;
  console.log(`  ✅ updated: ${id}`);
}

async function main() {
  // 1. start-foundation — fix dead websiteUrl, mark no inbound applications
  console.log('\n1. start-foundation...');
  await patch('start-foundation', (cd) => {
    cd.websiteUrl = 'https://www.start-foundation.com';
    cd.applicationMethod = 'none';
    delete cd.applicationUrl;
    cd.acceptsApplications = 'no';
    cd.researchNotes = (cd.researchNotes as string | undefined) ??
      'start-foundation.com — fördert Start-up-Ökosysteme (Inkubatoren, Acceleratoren) in Europa. Wählt eigene Partnerorganisationen proaktiv aus — keine offene Bewerbung. Ursprüngliche websiteUrl (startfoundation.ch) ist eine tote Domain. Für Revamp-IT nicht relevant (tech startup focus, kein Sozial-/Umweltmandat).';
  });

  // 2. paul-und-anna-klaproth-stiftung — individual beneficiary foundation, not org funder
  console.log('\n2. paul-und-anna-klaproth-stiftung...');
  await patch('paul-und-anna-klaproth-stiftung', (cd) => {
    cd.applicationUrl = 'http://www.klaprothstiftung.ch/';
    cd.applicationMethod = 'contact'; // form on homepage, but for individuals only
    cd.acceptsApplications = 'no'; // not for organizations
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.email = 'jakob.hoehn@plplaw.ch';
    c.address = 'c/o Pestalozzi Lachenal Patry AG, Löwenstrasse 1, 8001 Zürich';
    c.phone = '+41 44 217 91 11';
    cd.contact = c;
    cd.researchNotes = 'Klaproth-Stiftung unterstützt bedürftige Schweizer Bürger:innen über 75 Jahre protestantischen Glaubens — Einzelpersonen, KEINE Organisationen. Gesuchsformular auf der Homepage. Kontakt: Dr. Jakob Höhn, Pestalozzi Lachenal Patry AG. Revamp-IT ist als Organisation nicht antragsberichtigt — Stiftungszweck richtet sich ausschliesslich an Einzelpersonen.';
    cd.purposeSummary = 'Unterstützt bedürftige Schweizer Bürgerinnen und Bürger über 75 Jahre protestantischen Glaubens mit Einzelfallhilfen. Keine Förderung von Organisationen oder Projekten.';
  }, 1); // fit→1 (individual beneficiaries only, ineligible for orgs)

  // 3. vindobona — email contact only (minimal website)
  console.log('\n3. vindobona...');
  await patch('vindobona', (cd) => {
    cd.applicationMethod = 'email';
    cd.applicationUrl = 'https://www.vindobona.ch';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.email = 'info@vindobona.ch';
    c.address = 'Masanserstrasse 35, 7000 Chur';
    cd.contact = c;
    cd.researchNotes = (cd.researchNotes && String(cd.researchNotes).length > 100)
      ? cd.researchNotes
      : 'Sehr junge Stiftung (gegr. Okt 2023), Aufsicht EDI. Website ist eine minimale Single-Page mit nur Kontaktangaben — kein Antragsformular. Kontakt: RA lic. iur. Flavia Buchli Jörimann, info@vindobona.ch. Adresse: Masanserstrasse 35, 7000 Chur. Förderbereiche: Kultur, Bildung, Antidiskriminierung, Umwelt, Kinderunterstützung, Menschenrechte, jüdische Institutionen. Kein publiziertes Bewerbungsverfahren — Anfrage per E-Mail möglich.';
  });

  // 4. options-for-growth-foundation — partnership model, no open application
  console.log('\n4. options-for-growth-foundation...');
  await patch('options-for-growth-foundation', (cd) => {
    cd.applicationMethod = 'contact';
    cd.applicationUrl = 'https://optionsforgrowth.ch';
    cd.acceptsApplications = 'unknown'; // selective partnership model, not open application
  });

  console.log('\n✅ Done.');
}
main().catch(console.error);
