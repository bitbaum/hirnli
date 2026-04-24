/**
 * Research results from 2026-04-24 for 10 P4 batch-41 candidates.
 *
 * Outcomes:
 *  1. Mark 4 foundations operative (run own programs, no external grants):
 *     - jane-goodall: African wildlife conservation, own programs only
 *     - jugendhof: anthroposophical youth therapy facility in Wetzikon
 *     - kurt-imhof: funds only fög/UZH research, not open to external orgs
 *     - stiftung-kalaidos: operates Kalaidos Fachhochschule, not a funder
 *  2. Correct fit scores + add research notes for 6 keep-P4 foundations:
 *     - forschungsstiftung-IT: fit 6→4 (IT/society research, no public process)
 *     - karl-margrith-wiederkehr: fit 6→3 (children's care/hospitals, no process)
 *     - stiftung-one-health: fit 6→2 (health/biodiversity, university partnership req'd)
 *     - max-roessler-stiftung: fit 6→1 (CLOSED: "nimmt keine Gesuche entgegen")
 *     - gottfried-schaerer-stiftung: fit 5→1 (farming-only, fix wrong website URL)
 *     - chana-lutomirsky-stiftung: fit 6→1 (earmarked for one specific Jewish care home)
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
  // ── 1. Mark operative ─────────────────────────────────────────────────────
  console.log('\n1. Marking operative foundations...');

  await patch('jane-goodall-institut-schweiz-stiftung-fuer-forschung-bildun', (cd) => {
    cd.isOperative = true;
    cd.acceptsApplications = 'no';
    cd.applicationMethod = 'none';
    cd.websiteUrl = 'https://www.janegoodall.ch';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.email) c.email = 'info@janegoodall.ch';
    cd.contact = c;
    cd.purposeSummary = 'Operative Stiftung: führt eigene Schutzprojekte für Schimpansen und Menschenaffen in Uganda, Guinea und Südafrika sowie das Jugendprogramm Roots & Shoots für Umweltbildung durch. Sammelt Spenden für eigene Programme — vergibt keine Fördergelder an externe Organisationen.';
    cd.researchNotes = 'Vollständig operative NGO — eigene Tierschutz- und Bildungsprogramme in Afrika; die Website zeigt ausschliesslich Spendenaufrufe, keine Förderbewerbungen. Thematische Überschneidung mit Revamp-IT nicht vorhanden. Stiftung ist selbst auf Zuwendungen angewiesen.';
    // Remove incorrectly assigned themes
    cd.themes = (cd.themes as string[] | null ?? []).filter(
      (t: string) => !['kreislaufwirtschaft', 'soziale-integration', 'digitale-bildung', 'klima'].includes(t)
    );
  }, { newFitScore: 1 });

  await patch('jugendhof-stiftung-fuer-anthroposophisch-begruendete-krisenb', (cd) => {
    cd.isOperative = true;
    cd.acceptsApplications = 'no';
    cd.applicationMethod = 'none';
    cd.websiteUrl = 'https://jugendhof.ch';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Eichholzstrasse 156, 8623 Wetzikon ZH';
    cd.contact = c;
    cd.purposeSummary = 'Operative Trägerstiftung des Projekts Jugend-Lichtung Eichholz in Wetzikon ZH — ein therapeutisch-pädagogisches Wohnprojekt für Jugendliche in seelischen Krisen auf anthroposophischer Grundlage. Sammelt Spenden für eigene Einrichtung; vergibt keine Fördergelder.';
    cd.researchNotes = 'Stiftung ist die institutionelle Hülle für ein einzelnes anthroposophisches Therapieprojekt (jugendlichtung.ch). Alle Spenden fliessen in den eigenen Neubau und Betrieb. Kein thematischer Bezug zu Revamp-IT (IT, Kreislaufwirtschaft, Arbeitsintegration).';
    cd.themes = [];
  }, { newFitScore: 1 });

  await patch('kurt-imhof-stiftung-fuer-medienqualitaet', (cd) => {
    cd.isOperative = true;
    cd.acceptsApplications = 'no';
    cd.applicationMethod = 'none';
    cd.websiteUrl = 'https://www.kurt-imhof-stiftung.ch';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.email = 'kontakt@foeg.uzh.ch';
    c.phone = '+41 44 635 21 11';
    c.address = 'c/o fög, Universität Zürich, Andreasstrasse 15, 8050 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Operative Stiftung: finanziert ausschliesslich das fög (Forschungszentrum Öffentlichkeit und Gesellschaft) der Universität Zürich. Geförderte Projekte: Jahrbuch Qualität der Medien, Medienkompetenz-Tool CHECK NEWS, Abstimmungsmonitor. Vergibt keine Fördergelder an externe Organisationen.';
    cd.researchNotes = 'De facto operativer Finanzierungsarm des fög/UZH. Sucht selbst Donatoren für eigene Forschung — ist kein Fördergeber. Kein Bezug zu Revamp-IT (IT-Refurbishing, Arbeitsintegration, digitale Inklusion).';
    cd.themes = (cd.themes as string[] | null ?? []).filter((t: string) => t !== 'digitale-bildung');
  }, { newFitScore: 1 });

  await patch('stiftung-kalaidos-fachhochschule', (cd) => {
    cd.isOperative = true;
    cd.acceptsApplications = 'no';
    cd.applicationMethod = 'none';
    cd.websiteUrl = 'https://www.kalaidos-fh.ch/de-CH';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Jungholzstrasse 43, 8050 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Operative Stiftung: Gründerin und Trägerin der Kalaidos Fachhochschule Schweiz (akkreditiert) mit Studiengängen in Wirtschaft, Informatik, Pädagogik, Gesundheit und Soziale Arbeit. Bildungsinstitution — keine Förderstiftung.';
    cd.researchNotes = 'Betreibt eine akkreditierte Schweizer Fachhochschule. Ist eine Bildungsanbieterin, keine Förderstiftung. Kein Bezug zu Revamp-IT als potenziellem Förderempfänger.';
    cd.themes = [];
  }, { newFitScore: 0 });

  // ── 2. Correct fit scores and add research notes ───────────────────────────
  console.log('\n2. Correcting fit scores and adding research notes...');

  await patch('forschungsstiftung-fuer-informationstechnologie-und-gesellsc', (cd) => {
    delete cd.websiteUrl; // no discoverable public website (zefix URL in DB is wrong)
    cd.applicationMethod = 'unknown';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Zeughausstrasse 43, 8004 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Fördert Forschung und Lehre im Bereich Informationstechnologie und Gesellschaft. Schwerpunkte: sicherer und nutzbringender Einsatz von IT, insbesondere für Menschen mit Behinderungen, sowie Bildung und Wissenschaft. Sitz: Zürich.';
    cd.researchNotes = 'CHE-105.419.223. Keine öffentliche Website gefunden. Fundraiso listet drei Förderbereiche: Behinderte, Bildung und Forschung/Wissenschaft. Fördert primär wissenschaftliche Analysen und barrierefreie IT — nicht operative Arbeitsintegration oder Kreislaufwirtschaft. Kein publizierter Bewerbungsweg; wahrscheinlich Direktkontakt oder Einladungsverfahren.';
  }, { newFitScore: 4 });

  await patch('karl-margrith-wiederkehr-stiftung', (cd) => {
    delete cd.websiteUrl; // no website (zefix URL in DB is wrong)
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Obere Reppischstrasse 15, 8953 Dietikon ZH';
    cd.contact = c;
    cd.purposeSummary = 'Fördert aus Erträgnissen des Stiftungsvermögens gemeinnützige Kinder- und Jugendorganisationen in der Schweiz. Bekannte Fördernehmer: Universitäts-Kinderspital Zürich, Stiftung Jugend und Wohnen, Kinderhilfe Sternschnuppe.';
    cd.researchNotes = 'CHE-296.112.138, Dietikon ZH. Keine Website. Stiftungsrat (Philipp Müller, Marco Meroni) entscheidet diskretionär. Bisherige Fördernehmer sind Kinderspitäler, Jugendheime und Kinderhilfswerke — klassische Sozialeinrichtungen, nicht digitale Bildungs- oder Integrationsprojekte. Kein strukturierter Bewerbungsweg.';
    // Remove digitale-bildung theme (was likely a misclassification)
    cd.themes = (cd.themes as string[] | null ?? []).filter((t: string) => t !== 'digitale-bildung');
  }, { newFitScore: 3 });

  await patch('stiftung-one-health', (cd) => {
    // Keep websiteUrl = https://one-health.ch (confirmed real website, though not publicly indexed)
    cd.applicationMethod = 'unknown';
    cd.acceptsApplications = 'unknown';
    cd.purposeSummary = 'Fördert die Gesundheit von Menschen und Tieren in natürlichen und sozialen Ökosystemen sowie die nachhaltige Nutzung der Umwelt und biologischen Vielfalt. Fördert Forschungsprojekte (Polen und Schweiz) in Zusammenarbeit mit Schweizer Universitäten oder steuerbefreiten Organisationen.';
    cd.researchNotes = 'CHE-177.774.396. Website one-health.ch nicht öffentlich indexiert. Fokus auf Gesundheit/Biodiversität, Forschungsprojekte, Partnerschaft mit Schweizer Hochschulen erforderlich. Kein Bezug zu Revamp-ITs Kernbereichen IT, Kreislaufwirtschaft oder Arbeitsintegration.';
    // Remove incorrectly assigned themes
    cd.themes = (cd.themes as string[] | null ?? []).filter(
      (t: string) => !['digitale-bildung', 'klima'].includes(t)
    );
  }, { newFitScore: 2 });

  await patch('max-roessler-stiftung', (cd) => {
    delete cd.websiteUrl; // no public website (zefix URL in DB is wrong)
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'c/o ETH Foundation, Rämistrasse 101, 8092 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Fördert primär (60-80%) wissenschaftliche Forschung in Mathematik, Informatik und Naturwissenschaften an Schweizer Hochschulen; sekundär Unterstützung des Luzerner Sinfonieorchesters. Vergibt KEINE Gesuche — arbeitet ausschliesslich mit vordefinierten Partnerorganisationen.';
    cd.researchNotes = 'StiftungSchweiz bestätigt explizit: "Die Stiftung nimmt keine Gesuche entgegen." Förderung geht an ETH Foundation und Luzerner Sinfonieorchester. "Informatik" im Stiftungszweck bezieht sich auf akademische Hochschulforschung, nicht auf NGO-Programme. Für Revamp-IT strukturell nicht zugänglich.';
    // Remove incorrectly assigned themes
    cd.themes = (cd.themes as string[] | null ?? []).filter(
      (t: string) => !['digitale-bildung', 'zuerich'].includes(t)
    );
  }, { newFitScore: 1 });

  await patch('gottfried-schaerer-stiftung', (cd) => {
    delete cd.websiteUrl; // gs-stiftung.ch belongs to a different foundation (Geistlich-Stucki)
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Kanton Zürich / Thurgau (exact address not publicly listed)';
    cd.contact = c;
    cd.purposeSummary = 'Fördert ausschliesslich die bäuerliche Bevölkerung in den Kantonen Zürich und Thurgau: Hofberatung, Soforthilfe für Landwirtschaftsfamilien, Unterstützung älterer und behinderter Landwirt:innen. Kein Bezug zu IT, Kreislaufwirtschaft oder Arbeitsintegration.';
    cd.researchNotes = 'Enger Zweck: Landwirtschaftliche Bevölkerung in ZH/TG. Keine Website (gs-stiftung.ch gehört zur Geistlich-Stucki-Stiftung — andere Stiftung). Kein strukturierter Bewerbungsweg. Null Überschneidung mit Revamp-ITs Mission.';
    // Remove incorrectly assigned themes
    cd.themes = (cd.themes as string[] | null ?? []).filter(
      (t: string) => !['soziale-integration', 'zuerich'].includes(t)
    );
  }, { newFitScore: 1 });

  await patch('chana-lutomirsky-stiftung', (cd) => {
    delete cd.websiteUrl;
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    cd.purposeSummary = 'Zweckgebundene Stiftung zur finanziellen Unterstützung von Insassen des jüdischen Altersheims «Beth Chana» in Zürich sowie bedürftiger jüdischer Mitbürger:innen. Kein offenes Förderprogramm für externe Organisationen.';
    cd.researchNotes = 'Vollständig zweckgebunden für eine einzige Institution (Beth Chana Altersheim, Zürich) und die jüdische Gemeinde. Kein Förderprogramm für NGOs. Themen "arbeitsintegration" und "soziale-integration" waren LLM-Fehlzuordnungen — der Stiftungszweck hat keinen Arbeitsintegrations-Bezug.';
    // Remove incorrectly assigned themes
    cd.themes = [];
  }, { newFitScore: 1 });

  console.log('\n✅ All done.');
}
main().catch(console.error);
