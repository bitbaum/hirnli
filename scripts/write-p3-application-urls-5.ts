/**
 * P3 applicationUrl gap fixes — 2026-04-24.
 *
 * Research findings for 4 P3 foundations:
 *  - cambiata-stiftung: feeder foundation for Stiftung Mercator Schweiz (fit 5→2)
 *  - youthaid-foundation: developing countries focus (fit 5→3), email found
 *  - alice-ackermann: phone-only contact, good thematic fit (fit=4, keep)
 *  - hamasil-stiftung: operative Kulturpark operator, no applications (fit 4→2)
 *
 * Also: correct low-fit P3 gaps that don't need application research:
 *  - dcs-stiftung: chemistry/biology research, wrong theme (fit 3→1)
 *  - elsa-stiftung: no info, fit=2 already minimal
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

async function patch(
  id: string,
  updater: (cd: Record<string, unknown>) => void,
  options?: { newFitScore?: number }
): Promise<void> {
  const [row] = await sql`SELECT config_data, fit_score FROM fundraising_foundations WHERE id = ${id}`;
  if (!row) { console.log(`  ❌ NOT FOUND: ${id}`); return; }
  const cd = row.config_data as Record<string, unknown>;
  updater(cd);
  const fs = options?.newFitScore ?? (row.fit_score as number);
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
  console.log('\n1. Fixing researched P3 gaps...');

  // cambiata-stiftung: Feeder foundation — passes all funds to Stiftung Mercator Schweiz
  await patch('cambiata-stiftung', (cd) => {
    delete cd.websiteUrl; // no standalone website
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o Stiftung Mercator Schweiz, Gartenstrasse 33, 8002 Zürich';
    c.email = 'info@stiftung-mercator.ch';
    c.phone = '+41 44 206 55 80';
    cd.contact = c;
    cd.purposeSummary = 'Intermediäre Stiftung (gegr. von Meridian Foundation): leitet Mittel ausschliesslich an Stiftung Mercator Schweiz (Zürich) und Stiftung Mercator GmbH (Essen) weiter. Kein eigenständiges Förderprogramm für externe Organisationen. Die eigentliche Anlaufstelle für NGOs ist Stiftung Mercator Schweiz direkt.';
    cd.researchNotes = 'CHE-343.217.992. Cambiata ist eine Pass-through-Stiftung der Meridian Foundation, die ausschliesslich Stiftung Mercator Schweiz finanziert — dieselbe Adresse, kein separates Bewerbungsverfahren. Revamp-IT sollte direkt Stiftung Mercator Schweiz kontaktieren, nicht Cambiata.';
  }, { newFitScore: 2 });

  // youthaid-foundation: primarily developing countries, email found
  await patch('youthaid-foundation', (cd) => {
    delete cd.websiteUrl; // no confirmed Swiss website (youthaidfoundation.org is an Indian NGO)
    cd.applicationUrl = 'mailto:info@youthaid.org';
    cd.applicationMethod = 'email';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'Bahnhofstrasse 16, 8001 Zürich';
    c.email = 'info@youthaid.org';
    cd.contact = c;
    cd.purposeSummary = 'Unterstützt benachteiligte Jugendliche, primär in Entwicklungs- und Schwellenländern. Breitere Zwecke umfassen auch Bildung, Soziales, Ökologie und Kultur in der Schweiz und im Ausland. Kleine Zürich-Stiftung ohne öffentlichen Bewerbungsprozess.';
    cd.researchNotes = 'CHE-431.910.176. Primärfokus liegt auf Entwicklungsländern — Schweizer Inlandsprojekte sind Sekundärzweck. Bestätigte E-Mail: info@youthaid.org. Direkte Anfrage nötig, um zu klären, ob Schweizer NGOs in Frage kommen. Kein öffentlicher Bewerbungsweg gefunden.';
  }, { newFitScore: 3 });

  // alice-ackermann: good fit, phone-only contact (no email found)
  await patch('alice-ackermann', (cd) => {
    // websiteUrl stays as StiftungSchweiz link (registry, but best available)
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'unknown';
    // No email found — phone/postal only
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o Michael Manser, Riedstrasse 92, 9050 Appenzell';
    c.phone = '+41 33 534 99 75';
    cd.contact = c;
    cd.purposeSummary = 'Alice Ackermann Stiftung (gegr. 2018, Appenzell): Fördert Bildung, Ausbildung und berufliche Weiterentwicklung von benachteiligten Kindern, Jugendlichen und jungen Erwachsenen in der Schweiz. Unterstützt auch schweizer und kantonale Institutionen, die diese Zielgruppen betreuen.';
    cd.researchNotes = 'Kleine Stiftung ohne Website und ohne veröffentlichte E-Mail. Kontakt nur per Telefon (+41 33 534 99 75) oder Post an Michael Manser, Appenzell. Thematisch gute Überschneidung mit Revamp-ITs Arbeitsintegrations- und Digitalprogrammen für benachteiligte Jugendliche. Betrag pro Ereignis bis CHF 3,000 — wahrscheinlich kleine Zuwendungen.';
    // Keep themes: soziale-integration, digitale-bildung, arbeitsintegration — accurate
  }); // keep fit=4

  // hamasil-stiftung: operative Kulturpark operator, explicitly no applications
  await patch('hamasil-stiftung', (cd) => {
    cd.websiteUrl = 'https://www.hamasil.ch';
    cd.isOperative = true;
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'Pfingstweidstrasse 16, 8005 Zürich';
    c.email = 'info@hamasil.ch';
    c.phone = '+41 44 448 40 40';
    cd.contact = c;
    cd.purposeSummary = 'Operative Stiftung: Eigentümerin und Betreiberin des Kulturpark-Komplexes in Zürich-West (5 Liegenschaften, Pfingstweidstrasse). Beherbergt ca. 20 Zivilgesellschaftsorganisationen (UNICEF, Myclimate, ZEWO). Vergibt ausdrücklich keine Fördergesuche — sucht proaktiv langfristige Partnerschaften.';
    cd.researchNotes = 'SwissFoundations-Mitglied. Explizite Aussage: "Die Stiftung nimmt grundsätzlich keine Anträge entgegen." Operative Immobilien-/Trägerschaftsstiftung für den Kulturpark Zürich-West. Einzig mögliche Verbindung: Mietgespräch für Büroraum im Kulturpark — aber kein klassischer Förderantrag möglich.';
    cd.themes = ['soziale-integration', 'zuerich']; // remove incorrectly broad themes
  }, { newFitScore: 2 });

  console.log('\n2. Correcting clearly mismatched lower-fit P3 entries...');

  // dcs-stiftung: chemistry/biology/technology research — wrong themes
  await patch('dcs-stiftung', (cd) => {
    delete cd.websiteUrl; // no public website
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'yes';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Basel (exact address not publicly listed)';
    cd.contact = c;
    cd.purposeSummary = 'Dorit und Caspar Stürm Stiftung (gegr. 2018, Basel): fördert wissenschaftliche Forschung in Chemie, Biologie und Technologie (Pharmakologie, Diagnostik, Kosmetik); kulturelle Austauschprojekte zwischen Deutschland und der Schweiz; und junge Künstler:innen.';
    cd.researchNotes = 'CHE-141.215.768. Primärfokus auf naturwissenschaftliche Forschung (Chemie, Biologie, Pharma) und Kulturprojekte D-CH. Das DB-Thema "digitale-bildung" war eine Fehleinstufung. Kein Bezug zu Revamp-ITs Kernbereichen IT-Refurbishing, Arbeitsintegration oder digitaler Inklusion.';
    cd.themes = []; // remove digitale-bildung (wrong)
  }, { newFitScore: 1 });

  // emil-huber-stockar-stiftung: Alpine accident/ETH library focus — wrong for Revamp-IT
  await patch('emil-huber-stockar-stiftung', (cd) => {
    delete cd.websiteUrl;
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'unknown';
    cd.purposeSummary = 'Fördert alpine Unfallhilfe, Bergrettung, Ausbildungsmassnahmen zur Verhütung von Bergunfällen und Schutzm assnahmen in Berggebieten sowie die ETH-Bibliothek (Grafik-Sammlung). Kein Bezug zu IT, Kreislaufwirtschaft oder Arbeitsintegration.';
    cd.researchNotes = 'Stiftung mit sehr engem Zweck: alpine Sicherheit/Bergrettung und ETH-Bibliothekssammlung. Kein Revamp-IT-Bezug; Thema "zuerich" ist der einzige Überschneidungspunkt.';
    cd.themes = ['zuerich'];
  }, { newFitScore: 1 });

  console.log('\n✅ All done.');
}
main().catch(console.error);
