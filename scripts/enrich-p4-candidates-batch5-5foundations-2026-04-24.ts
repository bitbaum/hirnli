/**
 * Research results from 2026-04-24 — 5 P4 foundation corrections.
 *
 * Outcomes:
 *  1. Mark 1 foundation operative:
 *     - stiftung-kalaidos-fachhochschule: operative Fachhochschule, kein Grantmaker
 *  2. Correct fit scores + research notes for 4 ineligible/closed foundations:
 *     - max-roessler-stiftung: P2/fit5 → P4/fit1 (nimmt keine Gesuche entgegen — StiftungSchweiz bestätigt)
 *     - stiftung-one-health: fit6 → fit2 (Forschung mit Hochschulanbindung, kein Fit für Revamp-IT)
 *     - gottfried-schaerer-stiftung: fit5 → fit1 (rein landwirtschaftlicher Zweck ZH/TG)
 *     - chana-lutomirsky-stiftung-zuerich: fit6 → fit1 (zweckgebunden auf Beth Chana + jüdische Gemeinschaft)
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

async function patch(
  id: string,
  updater: (cd: Record<string, unknown>) => void,
  options?: { newFitScore?: number; newPriority?: number; archiveIt?: boolean }
): Promise<void> {
  const [row] = await sql`SELECT config_data, fit_score, priority FROM fundraising_foundations WHERE id = ${id}`;
  if (!row) { console.log(`  NOT FOUND: ${id}`); return; }

  if (options?.archiveIt) {
    await sql`UPDATE fundraising_foundations SET archived = true, updated_at = NOW() WHERE id = ${id}`;
    console.log(`  archived: ${id}`);
    return;
  }

  const cd = row.config_data as Record<string, unknown>;
  updater(cd);
  const newFit = options?.newFitScore ?? (row.fit_score as number);
  const newPriority = options?.newPriority ?? (row.priority as number);
  await sql`
    UPDATE fundraising_foundations
    SET config_data = ${JSON.stringify(cd) as unknown}::jsonb,
        fit_score = ${newFit},
        priority = ${newPriority},
        updated_at = NOW()
    WHERE id = ${id}
  `;
  console.log(`  updated: ${id} (fit ${row.fit_score}→${newFit}, P${row.priority}→P${newPriority})`);
}

async function main() {
  // ── 1. Mark operative ─────────────────────────────────────────────────────
  console.log('\n1. Marking operative...');

  await patch('stiftung-kalaidos-fachhochschule', (cd) => {
    cd.isOperative = true;
    cd.acceptsApplications = 'no';
    cd.websiteUrl = 'https://www.kalaidos-fh.ch/de-CH';
    cd.applicationMethod = 'none';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Jungholzstrasse 43, 8050 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Operative Stiftung: betreibt die Kalaidos Fachhochschule Schweiz — eine 2005 durch den Bundesrat akkreditierte private Fachhochschule mit berufsbegleitenden Studiengängen in Wirtschaft, Informatik, Angewandter Psychologie, Gesundheit und Sozialer Arbeit. Kein Grantprogramm für externe Organisationen.';
    cd.researchNotes = 'Eindeutig operative Stiftung: Stiftungszweck ist Aufbau, Betrieb und Förderung der Kalaidos FH als akkreditierte Schweizer FH. Kein Förderprogramm für externe NGOs. Die FH bietet selbst Weiterbildungen in Informatik an, ist aber als Geldgeber ineligibel. Fit 6→0.';
    cd.themes = [];
  }, { newFitScore: 0, newPriority: 4 });

  // ── 2. Correct fit scores and research notes ───────────────────────────────
  console.log('\n2. Correcting fit scores...');

  await patch('max-roessler-stiftung', (cd) => {
    cd.acceptsApplications = 'no';
    cd.applicationMethod = 'none';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'c/o Zürcher Kantonalbank, WFES / Stiftungen, Bahnhofstrasse 9, CH-8001 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Die Max Rössler-Stiftung fördert primär (60–80%) wissenschaftliche Forschung in der Schweiz in Mathematik, Informatik, Naturwissenschaften und Technologie — hauptsächlich über die ETH Zürich Foundation und die Marcel Benoist Stiftung. Sekundär (20–40%) unterstützt sie kulturelle Tätigkeit, insbesondere Musik (Luzerner Sinfonieorchester). Die Stiftung nimmt keine externen Gesuche entgegen.';
    cd.researchNotes = 'StiftungSchweiz bestätigt explizit: "Die Stiftung nimmt keine Gesuche entgegen." Alle Vergaben laufen intern über vorab definierte Partnerorganisationen (ETH Foundation, Marcel Benoist, Luzerner Sinfonieorchester). Der Stiftungszweck "Informatik" bezieht sich ausschliesslich auf akademische Grundlagenforschung an der ETH — nicht auf angewandte digitale Bildung oder NGO-Programme. Bisherige DB-Einstufung P2/fit5 war falsch. Kein Fit für Revamp-IT.';
    cd.themes = [];
    cd.fitScore = 1;
    cd.fit = 0;
  }, { newFitScore: 1, newPriority: 4 });

  await patch('stiftung-one-health', (cd) => {
    cd.websiteUrl = 'https://one-health.ch';
    cd.acceptsApplications = 'unknown';
    cd.applicationMethod = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Zürich, Schweiz';
    cd.contact = c;
    cd.purposeSummary = 'Die Stiftung ONE HEALTH (CHE-177.774.396) fördert die Gesundheit von Menschen und Tieren im Kontext natürlicher und sozialer Ökosysteme sowie die nachhaltige Nutzung der Umwelt und biologische Vielfalt. Forschungsprojekte in Polen und der Schweiz werden unterstützt; finanzielle Förderung setzt Zusammenarbeit mit einer Schweizer Hochschule oder steuerbefreiten Schweizer Organisation voraus.';
    cd.researchNotes = 'Website one-health.ch ist nicht öffentlich indexiert. Förderfokus: Human/Animal/Environmental Health + Forschung mit Hochschulkooperation. Revamp-IT hat keine akademische Partnerschaft und ist kein Gesundheitsprojekt. Die bisherigen Themes "digitale-bildung, klima" passten nicht zum Stiftungszweck. Kein aktives Bewerbungsverfahren nachweisbar. P4 korrekt. Fit 6→2.';
    cd.themes = [];
    cd.fitScore = 2;
    cd.fit = 0;
  }, { newFitScore: 2, newPriority: 4 });

  await patch('gottfried-schaerer-stiftung', (cd) => {
    delete cd.websiteUrl; // gs-stiftung.ch belongs to a different foundation (Geistlich-Stucki)
    cd.acceptsApplications = 'unknown';
    cd.applicationMethod = 'contact';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'c/o aurora treuhand ag, Ebmatingerstrasse 4, CH-8126 Zumikon';
    cd.contact = c;
    cd.purposeSummary = 'Die Gottfried Schärer Stiftung dient der Gemeinnützigkeit für die bäuerliche Bevölkerung in den Kantonen Zürich und Thurgau. Sie finanziert Beratung zur Existenzsicherung bäuerlicher Betriebe, Notfallhilfe für Bauernfamilien sowie Unterstützung für ältere, bedürftige und behinderte Landwirtschaftsangestellte und deren Familien.';
    cd.researchNotes = 'Ausschliesslicher Fokus auf bäuerliche/landwirtschaftliche Bevölkerung in ZH/TG — keinerlei Bezug zu digitaler Bildung, IT-Recycling, Arbeitsintegration oder Kreislaufwirtschaft. Wichtig: gs-stiftung.ch gehört der Geistlich-Stucki-Stiftung für medizinische Forschung — nicht dieser Stiftung. Bisherige Themes "zuerich, soziale-integration" waren irreführend. Kein Fit für Revamp-IT. Fit 5→1.';
    cd.themes = [];
    cd.fitScore = 1;
    cd.fit = 0;
  }, { newFitScore: 1, newPriority: 4 });

  await patch('chana-lutomirsky-stiftung-zuerich', (cd) => {
    cd.acceptsApplications = 'no';
    cd.applicationMethod = 'none';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Rechtsanwälte Pugatsch, Beethovenstrasse 11, Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Die Chana Lutomirsky Stiftung Zürich (gegr. 1980) unterstützt finanziell bedürftige Bewohner des Heims Beth Chana in Zürich durch Zuschüsse für Unterbringungs- und Betreuungskosten sowie den Heimbetrieb (BETH CHANA Verein für jüdische Behinderte). Zusätzlich fördert sie bedürftige jüdische Mitbürger durch Beiträge für medizinische Versorgung und Pflege.';
    cd.researchNotes = 'Zweckgebundene Stiftung: Förderung ausschliesslich für Bewohner des Heims Beth Chana (jüdische Behinderteneinrichtung, Bergstrasse 4, Zürich) und bedürftige jüdische Gemeinschaftsmitglieder. Kein allgemeines Förderprogramm für externe Organisationen. Die Stiftung ist faktisch ein Unterstützungsfonds für eine spezifische Einrichtung. Bisherige Themes "arbeitsintegration, soziale-integration" waren irreführend — hier nur Behindertenbetreuung/Pflegekosten gemeint. Kein Fit für Revamp-IT. Fit 6→1.';
    cd.themes = [];
    cd.fitScore = 1;
    cd.fit = 0;
  }, { newFitScore: 1, newPriority: 4 });

  console.log('\nDone. Next: npm run sync');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
