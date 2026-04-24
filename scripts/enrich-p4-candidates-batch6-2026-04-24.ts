/**
 * Research results from 2026-04-24 for 10 P4 batch-43 candidates.
 *
 * Outcomes:
 *  1. Correct fit scores + add research notes for 10 foundations:
 *     Batch 43A:
 *     - economic-foundation-zuerich-park-side: fit 5→1 (regional brand foundation, not a grant-maker)
 *     - ernst-wilhelm-meier-stiftung: fit 5→4 (dual mandate; ZH disadvantaged people component fits)
 *     - fritz-gerber-stiftung: fit 5→1 (individuals 10-25 only, orgs excluded)
 *     - geschwister-maeder-stiftung: fit 5→0 (Catholic chaplaincy only; ALL themes wrong)
 *     - gottfried-und-ursula-schaeppi-jecklin-stiftung: fit stays 5 (broad Bildung+Kultur ZH; law firm contact found)
 *     Batch 43B:
 *     - gottlieb-naef-stiftung: fit 5→3 (international/rural focus, not Zürich urban)
 *     - guenther-caspar-stiftung-buero-ehrbar: fit 5→2 (closed distributor to large national orgs)
 *     - hans-wegmann-stiftung: fit 5→1 (student grants only, not for NGOs)
 *     - harald-naegeli-stiftung: fit 5→1 (art legacy foundation, zero IT/social fit)
 *     - iduna-stiftung: fit 5→4 (Swiss component real; digital inclusion for disadvantaged youth)
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
  console.log('\nBatch 43A...');

  // Regional brand foundation — not a grant-maker
  await patch('economic-foundation-zuerich-park-side', (cd) => {
    cd.websiteUrl = 'https://www.zurichparkside.ch';
    cd.isOperative = true;
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o Verein Standortförderung Zimmerberg-Sihltal, 8810 Horgen';
    c.email = 'info@zurichparkside.ch';
    c.phone = '+41 44 687 21 21';
    cd.contact = c;
    cd.purposeSummary = 'Operative Stiftung: besitzt und verwaltet die Marke ZURICH PARK SIDE® für die Wirtschaftsregion Zimmerberg-Sihltal. Unterstützt andere Organisationen bei der Stiftungsgründung und der Standortpositionierung — kein eigenständiges Förderprogramm.';
    cd.researchNotes = 'CHE-115.958.496. Website zurichparkside.ch/zurichparkside.org (Coming soon) bestätigt: Es handelt sich um eine Standortmarke-Stiftung für Zimmerberg-Sihltal, nicht um einen Fördergeber. Das DB-Fit von 5 war ein LLM-Irrtum durch "gemeinnützige Stiftungen" im Zwecktext.';
    cd.themes = ['zuerich'];
  }, { newFitScore: 1 });

  // Dual mandate: mountain communities + disadvantaged ZH people
  await patch('ernst-wilhelm-meier-stiftung', (cd) => {
    delete cd.websiteUrl; // no public website
    cd.applicationMethod = 'unknown';
    cd.acceptsApplications = 'unknown';
    // No email or phone found in any register
    cd.purposeSummary = 'Zwei Mandate: (1) nachhaltige und innovative Projekte für die Schweizer Bergbevölkerung; (2) Unterstützung benachteiligter und bedürftiger Menschen im Grossraum Zürich. Der zweite Zweck umfasst innovative/nachhaltige Projekte — Revamp-ITs IT-Refurbishing-Arbeitsintegration fällt potenziell darunter.';
    cd.researchNotes = 'CHE-224.533.699. Keine öffentliche Website, kein Kontakt in öffentlichen Registern. Zweiter Zweck (benachteiligte Menschen im Grossraum Zürich, nachhaltige Projekte) hat thematische Überschneidung mit Revamp-IT. Direkte Kontaktrecherche nötig (Zefix-Adresse, Stiftungsrat). Noch nicht recherchierter Förderpfad.';
  }, { newFitScore: 4 });

  // Individuals only (10-25 years), orgs excluded
  await patch('fritz-gerber-stiftung-fuer-begabte-junge-menschen', (cd) => {
    cd.websiteUrl = 'https://www.fritz-gerber-stiftung.ch';
    cd.applicationMethod = 'none'; // no org applications (individuals only)
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'Stampfenbachstrasse 125, 8006 Zürich';
    c.email = 'info@fritz-gerber-stiftung.ch';
    c.phone = '+41 44 260 53 83';
    cd.contact = c;
    cd.purposeSummary = 'Fördert begabte junge Menschen (10–25 Jahre, Wohnsitz Schweiz) durch finanzielle Beiträge zur Aus- und Weiterbildung in Sport, Handwerk und Kultur. Fördert ausdrücklich nur Einzelpersonen — Institutionen/NGOs nur in sehr begründeten Ausnahmefällen.';
    cd.researchNotes = 'Website fritz-gerber-stiftung.ch. Explizit: "Institutionen sollen dagegen nur in begründeten Ausnahmefällen von einer Unterstützung profitieren können." Stipendien CHF 5,000–20,000/Person. Das DB-Thema "arbeitsintegration" war falsch. Revamp-IT ist als NGO strukturell nicht förderberechtigt.';
    cd.themes = []; // remove arbeitsintegration (wrong) and any other misclassified themes
  }, { newFitScore: 1 });

  // Catholic chaplaincy only — ALL themes were LLM hallucinations
  await patch('geschwister-maeder-stiftung', (cd) => {
    delete cd.websiteUrl;
    cd.applicationMethod = 'unknown';
    cd.acceptsApplications = 'unknown';
    cd.purposeSummary = 'Fördert ausschliesslich die katholische Studentenseelsorge an den Zürcher Hochschulen und das Katholische Akademikerhaus Zürich. Kirchliche Institutionsstiftung ohne Bezug zu IT, Kreislaufwirtschaft oder Sozialintegration.';
    cd.researchNotes = 'Enger kirchlicher Stiftungszweck: Katholische Hochschulseelsorge Zürich. Alle DB-Themen (klima, kreislaufwirtschaft, soziale-integration, digitale-bildung, digitale-souveraenitaet) waren LLM-Fehlzuordnungen. Für Revamp-IT vollständig irrelevant.';
    cd.themes = ['zuerich']; // only accurate tag
  }, { newFitScore: 0 });

  // Broad Bildung+Kultur ZH — keep fit=5, update contact (no real website found)
  await patch('gottfried-und-ursula-schaeppi-jecklin-stiftung', (cd) => {
    delete cd.websiteUrl; // Zefix URL was a registry placeholder
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'Horgen, Kanton Zürich';
    c.email = 'basel@dufo.ch'; // c/o Dufour Advokatur (foundation administrator)
    cd.contact = c;
    cd.purposeSummary = 'Gemeinnützige Stiftung (CHE-109.988.916): Fördert Bildung und Kultur in weitem Sinne, auf dem Gebiet der ganzen Schweiz mit Schwerpunkt Kanton Zürich, insbesondere in Bereichen, in denen staatliche Förderung fehlt. Verwaltet durch Dufour Advokatur, Basel.';
    cd.researchNotes = 'Professionell verwaltete Privatstiftung (c/o Dufour Advokatur, basel@dufo.ch). Das "weiter Bildungsbegriff"-Mandat und der Fokus auf staatlich unterversorgte Bereiche passt zu Revamp-ITs Digitaler Bildung für einkommensschwache Bevölkerung in Zürich. Kein öffentlicher Bewerbungsweg — explorative Anfrage via dufo.ch empfohlen.';
    // themes: zuerich, digitale-bildung — keep both (accurate)
  }); // keep fit=5

  console.log('\nBatch 43B...');

  // International/rural focus, not Zürich urban
  await patch('gottlieb-naef-stiftung', (cd) => {
    cd.websiteUrl = 'https://www.gottliebnaef.org';
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'yes';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'Bahnhofplatz 18, c/o Probst Partner AG, 8400 Winterthur';
    cd.contact = c;
    cd.purposeSummary = 'Fördert Bildung und Ausbildung (schulisch und beruflich) für Kinder und Jugendliche, insbesondere in ländlichen Armutsgebieten in Portugal, Tunesien, Slowakei, Frankreich, Nepal und der Schweiz. Schwerpunkt liegt auf internationalem Entwicklungskontext.';
    cd.researchNotes = 'Website gottliebnaef.org. Akzeptiert Anträge von Grassroots-Organisationen und grösseren Institutionen. Primärfokus ist ländliche Armut im internationalen Kontext — Zürich städtisches Revamp-IT-Profil passt nicht zum Hauptmandat. Kein IT- oder Kreislaufwirtschafts-Bezug.';
    cd.themes = ['soziale-integration', 'arbeitsintegration']; // remove incorrectly assigned themes
  }, { newFitScore: 3 });

  // Closed distributor to large national organizations
  await patch('guenther-caspar-stiftung-buero-ehrbar', (cd) => {
    delete cd.websiteUrl; // no public website
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'Weinbergstrasse 79, c/o Rudolf Ehrbar, 8006 Zürich';
    c.phone = '+41 44 391 89 59';
    cd.contact = c;
    cd.purposeSummary = 'Diskretionäre Familienstiftung: fördert national tätige Grossorganisationen (Pro Juventute, Pro Infirmis, Pro Senectute, Krebsliga, Médecins sans Frontières). Verwaltet durch Rudolf Ehrbar (Büro Ehrbar). Kein öffentlicher Bewerbungsweg; keine kalten Anfragen.';
    cd.researchNotes = 'CHE-109.693.243. Vergibt an bekannte Schweizer Dachorganisationen (Pro Juventute, Pro Infirmis, SRK). Keine Website, kein publiziertes Bewerbungsverfahren — typische diskrete Familienlegacy-Stiftung. Revamp-IT entspricht nicht dem Förderprofil (keine Grossorganisation).';
  }, { newFitScore: 2 });

  // Student grants only, not for NGOs
  await patch('hans-wegmann-stiftung', (cd) => {
    delete cd.websiteUrl;
    cd.applicationMethod = 'none'; // not accessible to NGOs — only to schools/students
    cd.acceptsApplications = 'no';
    cd.purposeSummary = 'Gewährt Finanzbeiträge für integrative Förderung von einzelnen Schüler:innen im Stadtkreis Zürich (Limmattal) im Rahmen der kantonalen Sonderpädagogikverordnung (VSM). Ausschliesslich für Einzelpersonen und Schulen — keine NGO-Förderung.';
    cd.researchNotes = 'Stiftungszweck ist auf Einzelschüler:innen mit sonderpädagogischem Bedarf in Zürcher Stadtkreisschulen beschränkt. Anträge laufen über Schulkreise, nicht über NGOs. Revamp-IT hat keine Förderberechtigung.';
    cd.themes = []; // remove all — misleading for NGO pipeline
  }, { newFitScore: 1 });

  // Art legacy foundation — zero IT/social fit
  await patch('harald-naegeli-stiftung', (cd) => {
    cd.websiteUrl = 'https://www.haraldnaegelistiftung.ch';
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Wilfriedstrasse 12, 8032 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Pflegt und verwaltet das künstlerische Werk von Harald Naegeli (dem "Sprayer von Zürich"). Sekundärer Zweck: Natur-, Tier- und Klimaschutz. Gegründet 2021 — kleine junge Stiftung, primär operative Kunstlegacy-Stiftung.';
    cd.researchNotes = 'Website haraldnaegelistiftung.ch. Kernmandat: Erhalt und Ausstellung der Naegeli-Kunstwerke. Das "klima"-Thema ist peripher und nicht auf IT/Kreislaufwirtschaft anwendbar. Null Überschneidung mit Revamp-ITs Mission.';
    cd.themes = ['klima']; // keep klima (technically in purpose, but irrelevant for Revamp-IT)
  }, { newFitScore: 1 });

  // Swiss youth education component fits; keep at 4
  await patch('iduna-stiftung', (cd) => {
    cd.websiteUrl = 'https://www.idunastiftung.ch';
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'yes';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'Zeltweg 11, 8032 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Fördert benachteiligte Kinder und Jugendliche in der Schweiz, Schweden sowie in Asien (Myanmar, Thailand, Laos, Kambodscha, Vietnam): Bildungszugang, Gesundheit, Wohnen. Kann externe Partnerorganisationen materiell und personell unterstützen. Zürich-basiert.';
    cd.researchNotes = 'Website idunastiftung.ch. Schweizer Komponente (benachteiligte Jugendliche, Bildungszugang) hat echte Überschneidung mit Revamp-ITs Digitaler Bildung für einkommensschwache Jugendliche. Kontakt: Dr. Esther Omlin (Board). Primärfokus liegt auf Südostasien — Schweizer NGO-Antrag möglich aber nicht Priorität des Fonds.';
    cd.themes = ['soziale-integration', 'digitale-bildung'];
  }, { newFitScore: 4 });

  console.log('\n✅ All done.');
}
main().catch(console.error);
