/**
 * Research results from 2026-04-24 for 10 P4 rapid candidates.
 *
 * Outcomes:
 *  1. Archive walter-robert-corti-stiftung — dissolved Dec 2025 (bankruptcy)
 *  2. Mark 3 foundations as operative (run own programs, no grants):
 *     stiftung-opa (jakobs.school), stiftung-pferdehof-pfisterberg, netzwerk-stiftung
 *  3. Upgrade 3 foundations to standard depth (real website found):
 *     fwg-foundation (online application!), fairster-foundation, options-for-growth-foundation
 *  4. Fix incorrect data:
 *     baitella-eberle: wrong email removed, fitScore 7→5
 *     albert-und-ida-beer-stiftung: wrong themes (klima/kreislauf) removed
 *     dr-hans-duttweiler-hug-stiftung: fitScore 5→2 (individual welfare grants only, CHF 500 cap)
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

async function updateFoundation(
  id: string,
  updater: (cd: Record<string, unknown>) => void,
  options?: { newFitScore?: number; archiveIt?: boolean }
): Promise<void> {
  const [row] = await sql`SELECT config_data, fit_score FROM fundraising_foundations WHERE id = ${id}`;
  if (!row) { console.log(`  ❌ NOT FOUND: ${id}`); return; }

  if (options?.archiveIt) {
    await sql`UPDATE fundraising_foundations SET archived = true, updated_at = NOW() WHERE id = ${id}`;
    console.log(`  ✅ archived: ${id}`);
    return;
  }

  const cd = row.config_data as Record<string, unknown>;
  updater(cd);

  const fitScore = options?.newFitScore ?? (row.fit_score as number);
  await sql`
    UPDATE fundraising_foundations
    SET config_data = ${JSON.stringify(cd) as unknown}::jsonb,
        fit_score = ${fitScore},
        updated_at = NOW()
    WHERE id = ${id}
  `;
  console.log(`  ✅ updated: ${id}`);
}

async function main() {
  // ── 1. Archive dissolved foundation ────────────────────────────────────────
  console.log('\n1. Archiving dissolved foundation...');
  await updateFoundation('walter-robert-corti-stiftung', () => {}, { archiveIt: true });
  // Note: Dissolved Oct 2025, bankruptcy proceedings closed Dec 2025. No assets.

  // ── 2. Operative foundations (run own programs, not grant-makers) ───────────
  console.log('\n2. Marking operative foundations (isOperative=true)...');

  await updateFoundation('stiftung-opa-objective-polyglot-apprenticeship', (cd) => {
    cd.isOperative = true;
    cd.acceptsApplications = 'no';
    cd.websiteUrl = 'https://jakobs.school';
    cd.researchDepth = 'standard'; // real website found
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.email) c.email = 'info@jakobs.school';
    if (!c.address) c.address = 'Leutschenbachstrasse 75, 8050 Zürich';
    if (!c.phone) c.phone = '+41 44 244 36 40';
    cd.contact = c;
    cd.purposeSummary = 'Operative Stiftung: betreibt die Jakobs School in Zürich-Oerlikon, die Jugendliche und junge Erwachsene aus schwierigen sozialen Verhältnissen durch mehrsprachige Berufsvorbereitungskurse und Lernwerkstatt auf das Berufsleben vorbereitet. Vergibt keine Gelder an externe Organisationen.';
    cd.researchNotes = 'OPA ist eine rein operative Stiftung — betreibt eigene Programme direkt, keine Vergabe von Fördergeldern an Dritte. Die Zielgruppe (sozial benachteiligte Jugendliche, Berufsintegration) überschneidet sich mit Revamp-IT\'s Arbeit, weshalb eine Partnerschaft sinnvoll sein könnte. Als Förderer ungeeignet.';
    cd.applicationMethod = 'none';
  }, { newFitScore: 1 });

  await updateFoundation('stiftung-pferdehof-pfisterberg', (cd) => {
    cd.isOperative = true;
    cd.acceptsApplications = 'no';
    cd.websiteUrl = 'https://www.pfisterberg.ch';
    cd.researchDepth = 'standard';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.email) c.email = 'pferdehof@pfisterberg.ch';
    if (!c.address) c.address = 'Im Bachofen 23, 8610 Uster';
    cd.contact = c;
    cd.purposeSummary = 'Operative Stiftung: betreibt den Pferdehof Pfisterberg bei Uster als Ausbildungsbetrieb (Hofmitarbeiter:in PRA, 2-jährig) für Jugendliche, die keine reguläre Berufslehre absolvieren können — Fokus auf Tierpflege, Hauswirtschaft, Landwirtschaft. Keine Fördermittel für externe Organisationen.';
    cd.researchNotes = 'Rein operative Stiftung — betreibt eigenen Landwirtschaftsbetrieb als Ausbildungsstätte. Kein Förderprogramm für externe Organisationen. Fit=6 in DB ist irreführend; Revamp-IT kann hier nicht bewerben.';
    cd.applicationMethod = 'none';
  }, { newFitScore: 1 });

  await updateFoundation('netzwerk-stiftung-fuer-soziale-arbeit-sport-und-kultur', (cd) => {
    cd.isOperative = true;
    cd.acceptsApplications = 'no';
    cd.websiteUrl = 'https://netz-werk.ch';
    cd.researchDepth = 'standard';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.email) c.email = 'info@netz-werk.ch';
    if (!c.address) c.address = 'Heinrichstrasse 221, 8005 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Operative Stiftung: betreibt eigene soziale Dienstleistungen (Wohnen, Arbeit, Coaching, Schule, Kultur, Sport) für sozial benachteiligte Menschen an fünf Standorten im Grossraum Zürich. Keine Vergabe von Fördergeldern an externe Organisationen.';
    cd.researchNotes = 'Rein operative Stiftung (peer organization) — bietet direkte Sozialdienste an, vergibt keine Grants. Möglicher Kooperationspartner für Revamp-IT (ähnliche Zielgruppe), aber kein Förderer. Fit=5 in DB ist irreführend.';
    cd.applicationMethod = 'none';
  }, { newFitScore: 1 });

  // ── 3. Upgrade to standard depth — real websites found ────────────────────
  console.log('\n3. Upgrading to standard depth (real websites found)...');

  await updateFoundation('fwg-foundation', (cd) => {
    cd.websiteUrl = 'https://www.fwg-foundation.ch';
    cd.researchDepth = 'standard';
    cd.applicationUrl = 'https://www.fwg-foundation.ch/antrag/';
    cd.applicationMethod = 'online';
    cd.acceptsApplications = 'yes';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.email = 'foundation@fwg.ch';
    c.address = 'Zürichstrasse 131, 8600 Dübendorf';
    c.phone = '+41 44 510 50 00';
    cd.contact = c;
    cd.purposeSummary = 'Fördert gemeinnützige, bildungsbezogene, kulturelle und sportliche Projekte sowie die berufliche Integration in den Arbeitsmarkt, mit Schwerpunkt auf dem Gastronomie- und Hotelleriebereich. Vergibt Stipendien und zinsfreie Darlehen an FWG-Mitarbeitende sowie Projektbeiträge an externe gemeinnützige Organisationen.';
    cd.researchNotes = 'FWG = Familie Wiesner Gastronomie. Externe Organisationen können sich online bewerben (fwg-foundation.ch/antrag/) — niederschwelliger Zugang. Bisherige Förderprojekte: IPT Foundation (Stellenvermittlung), Surprise (marginalisierte Menschen). Kein IT-Projekt bisher gefördert; thematischer Fokus liegt auf Gastronomie/Hotellerie-Branche. Revamp-ITs Arbeitsintegrations-Ansatz ist anschlussfähig, aber kein idealer Fit. Bewerbung dennoch sinnvoll wegen offenem Online-Verfahren.';
  }, { newFitScore: 4 });

  await updateFoundation('fairster-foundation', (cd) => {
    cd.websiteUrl = 'https://fairsterfoundation.ch';
    cd.researchDepth = 'standard';
    cd.applicationMethod = 'email';
    cd.applicationUrl = 'https://fairsterfoundation.ch/';
    cd.acceptsApplications = 'yes';
    cd.purposeSummary = 'Engagiert sich gegen Ungerechtigkeit und Ungleichheit, insbesondere zum Nachteil von Frauen. Fördert Bildungs- und Arbeitsmarktprojekte im Globalen Süden, Flüchtlingsintegration in der Schweiz sowie gesellschaftspolitische Bewusstseinsarbeit.';
    cd.researchNotes = 'Gegründet Dez 2022, CHE-487.366.907. Bewerbung per E-Mail: Motivationsschreiben, Projektbeschreibung, 1-seitige Organisationsübersicht, Budget und Einzahlungsschein einreichen. Antrag-E-Mail ist auf Website JS-verschlüsselt — muss direkt auf fairsterfoundation.ch abgerufen werden. Fokus auf Gleichstellung/Frauenrechte und Globalem Süden; Flüchtlingsintegration in CH teilweise passend für Revamp-IT, aber kein digitaler Bildungsfokus und kein Kreislaufwirtschafts-Bezug.';
  });

  await updateFoundation('options-for-growth-foundation', (cd) => {
    cd.websiteUrl = 'https://optionsforgrowth.ch';
    cd.researchDepth = 'standard';
    cd.applicationMethod = 'email';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.email = 'paula.frese@optionsforgrowth.com';
    // address already in DB
    cd.contact = c;
    cd.purposeSummary = 'Kleine Familienstiftung (gegr. 2022, Familie Frese) zur Förderung von Bildung und beruflicher Entwicklung sozial benachteiligter Jugendlicher und junger Erwachsener in der Schweiz — primär über institutionelle Partnerorganisationen.';
    cd.researchNotes = 'Aktuell 3 Partnerorganisationen (EDUCA SWISS, Superar Suisse, YES). Partnerschaftsmodell: keine offene Bewerbung, sondern selektive Aufnahme von Institutionen. Kontakt über paula.frese@optionsforgrowth.com. Thematische Ausrichtung (Berufsqualifikation benachteiligter Jugendlicher) passt gut zu Revamp-ITs Arbeitsintegrations-Programmen. Empfehlung: als potenzielle Partnerinstitution anfragen, nicht klassisch bewerben.';
  });

  // ── 4. Fix incorrect data ──────────────────────────────────────────────────
  console.log('\n4. Fixing incorrect data...');

  // baitella-eberle: wrong email (belongs to commercial company), fit correction
  await updateFoundation('baitella-eberle', (cd) => {
    // Clear the wrong email — info@baitella.com belongs to Baitella AG (FISSO), not the foundation
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    delete c.email; // commercial company email, not foundation contact
    c.address = 'c/o Zürcher Kantonalbank, Bahnhofstrasse 9, 8001 Zürich';
    c.phone = '+41 44 292 47 13'; // ZKB Stiftungen department
    cd.contact = c;
    // Clear fundraiso registry URL
    delete cd.websiteUrl;
    cd.purposeSummary = 'Unterstützt gemeinnützige, steuerbefreite Institutionen, die Aus- und Weiterbildung von Kindern und Erwachsenen fördern, mit Schwerpunkt auf zukunftsorientierten Technologien und innovativen Ideen zugunsten von Allgemeinheit und Umwelt. Sekundärzweck: Natur- und Umweltschutz sowie humanitäre Hilfe.';
    cd.researchNotes = 'Sehr junge Stiftung (gegr. Aug 2024), verwaltet durch ZKB Stiftungen (Dr. Hansjörg Schmidt, +41 44 292 47 13). Co-Präsidenten: Gabriela Baitella-Eberle und Dr. Reto Baitella. Kein öffentlicher Antragsprozess bekannt; Stiftung ist möglicherweise noch nicht aktiv Gesuche vergabend. ACHTUNG: info@baitella.com (bisher in DB) gehört zur kommerziellen Baitella AG (FISSO IT-Handelsunternehmen), nicht zur Stiftung.';
    cd.applicationMethod = 'unknown';
  }, { newFitScore: 5 });

  // albert-und-ida-beer-stiftung: remove wrong themes (no climate/circular mandate documented)
  await updateFoundation('albert-und-ida-beer-stiftung', (cd) => {
    // Remove klima and kreislaufwirtschaft — no environmental mandate found in registry
    cd.themes = ((cd.themes as string[] | null) ?? []).filter(
      (t: string) => t !== 'klima' && t !== 'kreislaufwirtschaft'
    );
    // purposeSummary already accurate, just add note
    cd.researchNotes = 'Verwaltung über STS Rechtsanwälte AG, Theaterstrasse 2, 8001 Zürich (sts@sts-law.ch, +41 44 261 91 00). Keine öffentliche Website, keine publizierten Förderkriterien. Breiter Zweck: gemeinnützige Institutionen im Kanton Zürich + Einzelpersonenhilfe. Klima/Kreislaufwirtschaft-Themen wurden entfernt — kein entsprechendes Mandat in Registerunterlagen dokumentiert. Bewerbung per E-Mail an Kontaktadresse möglich, aber ohne Kriterien ist dies eine Kaltbewerbung.';
  });

  // dr-hans-duttweiler-hug-stiftung: fit correction (individual welfare grants only, CHF 500 cap)
  await updateFoundation('dr-hans-duttweiler-hug-stiftung', (cd) => {
    cd.purposeSummary = 'Unterstützt Menschen mit Behinderungen im Kanton Zürich durch Einzelfallhilfen (max. CHF 500/Person/Jahr) für Hilfsmittel, Führhunde und Umschulung; zusätzlich Stipendien an Musik-Studierende des Zürcher Konservatoriums und der ZHdK. Anträge nur über Sozialämter oder Wohlfahrtsorganisationen mit offiziellen Kantonsformularen.';
    cd.researchNotes = 'Verwaltet durch STS Rechtsanwälte AG (gleiche Adresse wie Beer-Stiftung). Förderhöhe maximal CHF 500 pro Person und Jahr — nur Einzelfallhilfen über Sozialämter, kein Projektförderprogramm für Organisationen. Revamp-IT könnte einzelne Klienten indirekt hierher verweisen, kann aber nicht selbst Projektfinanzierung beantragen. Musik-Stipendien irrelevant. Fit=5 in DB deutlich zu hoch.';
    cd.applicationMethod = 'contact'; // via welfare agencies
  }, { newFitScore: 2 });

  console.log('\n✅ All done.');
}
main().catch(console.error);
