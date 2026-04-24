/**
 * Research results from 2026-04-24 for 10 P4 batch-42 candidates.
 *
 * Outcomes:
 *  1. Mark 1 foundation operative (runs own programs, no external grants):
 *     - stiftung-muetterhilfe: maternal family services operator, no grants
 *  2. Correct fit scores + add research notes for 9 foundations:
 *     - michael-kohn-stiftung: fit 6→3 (4-sphere; mail undeliverable; IT = ETH academic, not NGO)
 *     - stiftung-pfizer-forschungspreis: fit 6→0 (biomedical research prizes, scientists only)
 *     - stiftung-zur-foerderung-sozialwissenschaftlicher-forschung-u: fit 6→1 (world-sociology, no NGO fit)
 *     - aline-andrea-rutz-stiftung: fit 5→2 (closed to new applications since 2016)
 *     - arte-terra-clima-foundation: fit 5→1 (climate art/science, explicit "no applications")
 *     - asmallworld-foundation: fit 5→1 (developing countries only — not Switzerland)
 *     - baasch-medicus-stiftung-zuerich: fit 5→0 (neurology prize for academic neurologists)
 *     - costas-and-eleni-venieri-charitable-foundation: fit 5→2 (private family foundation, no public grants)
 *     - dr-adrian-otto-naegeli-stiftung: fit 5→3 (health/Bildung for disadvantaged, weak fit)
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

  await patch('stiftung-muetterhilfe', (cd) => {
    cd.isOperative = true;
    cd.acceptsApplications = 'no';
    cd.applicationMethod = 'none';
    cd.websiteUrl = 'https://www.muetterhilfe.ch';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'c/o Verein Arche Zürich, Hohlstrasse 489, 8048 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Operative Stiftung: betreibt seit 1932 Beratungs- und Unterstützungsangebote (Sozialberatung, Elternarbeit, therapeutische Begleitung, Online-Beratung) für Mütter, Väter und Familienmitglieder während Schwangerschaft, Geburt und Kleinkindphase in der ganzen Schweiz. Keine Fördergelder an externe Organisationen.';
    cd.researchNotes = 'Vollständig operative Dienstleistungsorganisation für Familien in Krisensituationen (seit 1932). Kein Bezug zu Revamp-ITs Kernbereichen IT-Refurbishing, Kreislaufwirtschaft oder Arbeitsintegration. Nicht zugänglich als Förderstiftung.';
    cd.themes = [];
  }, { newFitScore: 0 });

  // ── 2. Correct fit scores and add research notes ───────────────────────────
  console.log('\n2. Correcting fit scores and adding research notes...');

  await patch('michael-kohn-stiftung', (cd) => {
    delete cd.websiteUrl; // no public website
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o Rechtsanwälte Pugatsch, Beethovenstrasse 11, 8002 Zürich';
    // Note: mail reportedly returned as undeliverable (possibly dormant)
    cd.contact = c;
    cd.purposeSummary = 'Vier-Säulen-Stiftung: (1) Zuwendungen an gemeinnützige/humanitäre Schweizer Organisationen; (2) Stärkung der jüdischen Minderheit / Toleranzförderung; (3) Wohlfahrt und Koexistenz in Israel; (4) wissenschaftliche Zusammenarbeit zwischen Schweizer Hochschulen (v.a. ETH) in Energie, IT und Infrastruktur. Keine öffentliche Website.';
    cd.researchNotes = 'CHE-112.047.434. Vier Wirkungskreise: humanitär/gemeinnützig CH, jüdische Gemeinschaft, Israel-Wohlfahrt, akademische IT/Energie-Forschung ETH. Fundraiso vermerkt: Post unzustellbar an Zürcher Adresse — möglicherweise inaktiv. IT-Bezug betrifft akademische Hochschulforschung, nicht NGO-Digitalprogramme. Für Revamp-IT strukturell schwer zugänglich.';
    // digitale-bildung, zuerich, soziale-integration — keep zuerich + soziale, remove digitale-bildung
    cd.themes = (cd.themes as string[] | null ?? []).filter(
      (t: string) => t !== 'digitale-bildung'
    );
  }, { newFitScore: 3 });

  await patch('stiftung-pfizer-forschungspreis', (cd) => {
    cd.websiteUrl = 'https://www.pfizerforschungspreis.ch';
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'c/o Pfizer AG, Schärenmoosstrasse 99, 8052 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Fördert klinische Forschung und Grundlagenforschung in Herz-Kreislauf, Rheumatologie/Immunologie, Infektiologie, Neurowissenschaften und Urologie/Nephrologie durch jährliche Forschungspreise (je CHF 15,000) ausschliesslich an Wissenschaftler:innen ≤45 Jahre an Schweizer Forschungsinstituten.';
    cd.researchNotes = 'Jährlicher Forschungspreis der Pfizer AG Schweiz für akademische Biomedizin-Forscher:innen unter 45 Jahren. NGOs können sich nicht bewerben. Das Thema "digitale-bildung" im DB war eine LLM-Fehleinstufung — keinerlei Bezug zu Digital-Literacy, IT oder Sozialarbeit. Für Revamp-IT strukturell nicht zugänglich.';
    cd.themes = []; // remove all incorrectly assigned themes
  }, { newFitScore: 0 });

  await patch('stiftung-zur-foerderung-sozialwissenschaftlicher-forschung-u', (cd) => {
    delete cd.websiteUrl; // no dedicated website (hosted c/o Cultur Prospectiv)
    cd.applicationMethod = 'unknown';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'c/o Cultur Prospectiv CP-Institut AG, Stadelhoferstrasse 26, 8001 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Fördert Forschungsprojekte, wissenschaftliche Tagungen und Publikationen zur Analyse der Weltgesellschaft und ihres Wandels (globale Systeme, gesellschaftliche Transformation). Zuwendungen an Forschende und Forschungsgruppen, nicht an operative NGOs.';
    cd.researchNotes = 'CHE-110.410.021. Akademische Soziologie-Forschungsstiftung (gegr. 1982), eng verbunden mit Cultur Prospectiv think tank, Zürich. Finanziert Weltgesellschafts-Forschung — keine operative Sozialarbeit. Das Thema "digitale-bildung" war eine LLM-Fehleinstufung. Für Revamp-ITs NGO-Programme nicht relevant.';
    cd.themes = (cd.themes as string[] | null ?? []).filter(
      (t: string) => t !== 'digitale-bildung'
    );
  }, { newFitScore: 1 });

  await patch('aline-andrea-rutz-stiftung', (cd) => {
    delete cd.websiteUrl; // no public website
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Tobeleggstrasse 14, 8049 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Kleine Zürcher Stiftung (gegr. 1999) zur Unterstützung von Kindern und Jugendlichen aus benachteiligten Verhältnissen sowie Institutionen, die diesen zugute kommen. Fokus: Ausbildung und Integration. Seit mind. 2016 keine neuen Projekte aus finanziellen Gründen.';
    cd.researchNotes = 'CHE-110.407.740. Fundraiso vermerkt (2016): "Unsere kleine Stiftung kann aus finanziellen Gründen leider keine neuen Projekte berücksichtigen." — de facto geschlossen für neue Förderanträge. Kein öffentlicher Bewerbungsweg, keine E-Mail. Für Revamp-IT nicht zugänglich.';
  }, { newFitScore: 2 });

  await patch('arte-terra-clima-foundation', (cd) => {
    cd.websiteUrl = 'https://www.arteterraclima.org';
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Binzstrasse 23, 8045 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Fördert die künstlerisch-wissenschaftliche Auseinandersetzung mit Klimawandel, Ökologie und Nachhaltigkeit. Betreibt eigene Veranstaltungen, Publikationen und kollaborative Plattformen; wählt Partner proaktiv selbst aus. Nimmt ausdrücklich keine Förderanträge entgegen.';
    cd.researchNotes = 'Website arteterraclima.org (gegr. 2022, Zürich) trägt die explizite Aussage: "Wir bitten Sie daher, uns keine Förderanträge zuzustellen. Die Stiftung wird nicht darauf eingehen." Thematischer Fokus auf Kunst-Klima-Dialog — keinerlei Überschneidung mit IT-Refurbishing, Arbeitsintegration oder digitaler Bildung von Revamp-IT.';
    // klima is correct, remove any other wrongly assigned themes
    cd.themes = ['klima'];
  }, { newFitScore: 1 });

  await patch('asmallworld-foundation', (cd) => {
    cd.websiteUrl = 'https://www.asmallworldfoundation.org';
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Seidengasse 20, 8001 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Philanthropischer Arm des Luxusreise-Netzwerks aSmallWorld. Fördert Bildung, Kinderhilfe und Umweltschutz-Projekte ausschliesslich in Entwicklungs- und Schwellenländern. Keine Projekte in der Schweiz. Bekannte Partner: charity:water, Plan International, New Light Kolkata.';
    cd.researchNotes = 'aSmallWorld Foundation (gegr. 2013, Zürich) finanziert Projekte in Entwicklungsländern — Schweizer NGOs kommen geografisch nicht in Frage. Themen "kreislaufwirtschaft", "digitale-bildung" und "klima" aus DB waren LLM-Fehlzuordnungen. Für Revamp-IT grundsätzlich nicht relevant.';
    cd.themes = ['soziale-integration']; // Keep soziale-integration (barely), remove others
  }, { newFitScore: 1 });

  await patch('baasch-medicus-stiftung-zuerich', (cd) => {
    cd.websiteUrl = 'https://www.b-m-stiftung.ch';
    cd.applicationMethod = 'none'; // only for academic neurologists, not NGOs
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'c/o RA Gerhard Niggli, Seefeldstrasse 45, 8008 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Vergibt jährlich ein 2-Jahres-Forschungsstipendium (50/50 mit klinischer Institution) für klinisch-neurologische Forschung in der Schweiz, exklusiv an Neurolog:innen ≤45 Jahre mit akademischer Karriere. Bewerbung via SAMW (Schweizerische Akademie der Medizinischen Wissenschaften).';
    cd.researchNotes = 'CHE-109.640.815. Reines neurologisches Forschungsprisat für akademische Neurolog:innen — NGOs können sich nicht bewerben. Das DB-Thema "zuerich" trifft zu (Sitz), "digitale-bildung" war falsch. Für Revamp-IT vollständig irrelevant.';
    cd.themes = ['zuerich'];
  }, { newFitScore: 0 });

  await patch('costas-and-eleni-venieri-charitable-foundation', (cd) => {
    delete cd.websiteUrl; // no public website found
    cd.applicationMethod = 'unknown';
    cd.acceptsApplications = 'unknown';
    cd.purposeSummary = 'Private Zürcher Familienstiftung (griechischstämmig, steuerbefreit Kanton ZH): unterstützt Menschen in sozialen, medizinischen, Bildungs- und Kulturbereichen, fördert Spitzenleistungen in Literatur/Wissenschaft/Kunst/sozialer Solidarität, und schützt streunende/misshandelte Tiere.';
    cd.researchNotes = 'Keine öffentliche Website oder Kontaktadresse gefunden. Kanton-ZH-Liste 2026 bestätigt Steuerbefreiung. Hauptfokus: Kultur, Wissenschaft, Tierscbutz — die Themen "klima" und "kreislaufwirtschaft" aus DB waren LLM-Fehleinstufungen. Wahrscheinlich private Vergabestiftung ohne öffentliches Bewerbungsprogramm.';
    cd.themes = (cd.themes as string[] | null ?? []).filter(
      (t: string) => !['klima', 'kreislaufwirtschaft', 'digitale-bildung'].includes(t)
    );
  }, { newFitScore: 2 });

  await patch('dr-adrian-otto-naegeli-stiftung', (cd) => {
    delete cd.websiteUrl; // no public website (distinct from unrelated otto-naegeli-preis.ch)
    cd.applicationMethod = 'unknown';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Zwirnerstrasse 214, c/o Patrizia Maggiore, 8041 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Fördert Volksgesundheit und Bildung für benachteiligte Gruppen (v.a. Kinder und Jugendliche mit besonderen Bedürfnissen), tierversuchsfreie universitäre und nicht-industrielle medizinische Forschung sowie Tierschutz für Hauskatzen. Bundesaufsicht (EDI).';
    cd.researchNotes = 'CHE-489.739.037, Bundesaufsicht EDI, Zürich. Keine öffentliche Website gefunden (nicht zu verwechseln mit otto-naegeli-preis.ch — andere Stiftung). Primärer Fokus: Volksgesundheit und medizinische Forschung ohne Tierversuche; "Bildung benachteiligter Gruppen" hat marginale Überschneidung mit Revamp-ITs Digitale-Bildung-Programm, aber kein IT-Bezug. Kein publiziertes Bewerbungsverfahren.';
    // Keep soziale-integration (marginal fit), remove incorrectly assigned digitale-bildung if present
    cd.themes = (cd.themes as string[] | null ?? []).filter(
      (t: string) => t !== 'digitale-bildung'
    );
  }, { newFitScore: 3 });

  console.log('\n✅ All done.');
}
main().catch(console.error);
