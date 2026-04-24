/**
 * Close P2 applicationUrl gaps — 2026-04-24.
 *
 * Findings from targeted P2 gap research:
 *  - foundation-regina (fit=8): Very new (2024), no website, exact Revamp-IT keywords.
 *    Contact via STAIGER Rechtsanwälte AG (foundation domicile).
 *  - util-stiftung (fit=7→5): DB purpose overstated — actual focus is Asia (Arbeitsplätze in Asien),
 *    not Swiss Arbeitsintegration. Contact via Interhold AG domicile.
 *  - michael-kohn (fit=7→3): Jewish community + Israel + ETH academic IT. Mail possibly undeliverable.
 *    Law firm email confirmed: spugatsch@rp-law.ch.
 *  - z43-netzero (fit=5): Very new (2024) climate/biomedical research foundation.
 *    Email confirmed: info@z43netzero.org. Kreislaufwirtschaft IT ≠ their focus.
 *
 *  Also: archive michael-kohn-stiftung (P4) — confirmed duplicate of michael-kohn (P2).
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
  console.log('\n1. Fixing P2 applicationUrl gaps...');

  // foundation-regina (fit=8): CHE-449.768.771, new 2024, exact fit for Revamp-IT
  await patch('foundation-regina', (cd) => {
    delete cd.websiteUrl; // fundraiso.com URL was a registry URL — remove it
    cd.applicationUrl = 'mailto:info@staiger.law';
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o STAIGER Rechtsanwälte AG, Talacker 41, 8001 Zürich';
    c.email = 'info@staiger.law';
    cd.contact = c;
    cd.purposeSummary = 'Fördert Personen, Institutionen und Projekte in der Schweiz in den Bereichen Energie, neue Technologien, Informationstechnologie, Infrastruktur und Umweltschutz sowie soziale/kulturelle Projekte und Personen in finanzieller Not. Kann auch Schweizer Hochschulen und angeschlossene Institutionen fördern.';
    cd.researchNotes = 'CHE-449.768.771. Sehr neue Stiftung (gegr. Jan/März 2024), noch kein öffentlicher Bewerbungsweg. Board: Dr. Marc Bernheim (Präsident), Dr. Rolf Halonbrenner, Michael Pesaro. Exaktes Themenportfolio (IT + Kreislaufwirtschaft + soziale Integration) entspricht Revamp-ITs Mission — höchste strategische Priorität für direkten Kontakt per Brief. Kein öffentlicher Bewerbungsweg bisher; Kontakt via STAIGER Rechtsanwälte (Domizil).';
  });

  // util-stiftung (fit=7→5): Asia focus — DB summary was misleading
  await patch('util-stiftung', (cd) => {
    delete cd.websiteUrl; // no public website
    cd.applicationUrl = 'mailto:treuhand@interhold.ch';
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o Interhold AG, Bellerivestrasse 29, 8008 Zürich';
    c.email = 'treuhand@interhold.ch';
    cd.contact = c;
    cd.purposeSummary = 'Fördert Social Entrepreneurship mit Fokus auf Schaffung von Ausbildungs- und Arbeitsplätzen für benachteiligte Menschen, primär in Asien. Unterstützt zusätzlich Armutshilfe, Sozialintegration, medizinische Forschung und weitere gemeinnützige Zwecke. Kein öffentlicher Bewerbungsweg.';
    cd.researchNotes = 'CHE-156.035.413, gegr. 2020, c/o Interhold AG Zürich. Primärer geografischer Fokus liegt auf Asien ("Schaffung von Arbeitsplätzen für Menschen in Asien") — die frühere DB-Zusammenfassung suggerierte irrtümlich Schweizer Arbeitsintegrationsfokus. Für Revamp-ITs Schweiz-Aktivitäten nur marginal relevant. Kontaktpfad: treuhand@interhold.ch (Domizilhalter).';
  }, { newFitScore: 5 });

  // michael-kohn (fit=7→3): Jewish community + ETH IT, email found
  await patch('michael-kohn', (cd) => {
    delete cd.websiteUrl; // no public website
    cd.applicationUrl = 'mailto:spugatsch@rp-law.ch';
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'yes';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o Rechtsanwälte Pugatsch, Beethovenstrasse 11, 8002 Zürich';
    c.email = 'spugatsch@rp-law.ch';
    c.phone = '+41 44 286 50 10';
    cd.contact = c;
    cd.purposeSummary = 'Vier-Säulen-Stiftung: (1) humanitäre/gemeinnützige CH-Organisationen; (2) jüdische Minderheit / Toleranzförderung; (3) Wohlfahrt und Koexistenz in Israel; (4) wissenschaftliche Zusammenarbeit Schweizer Hochschulen (ETH) in Energie, IT, Infrastruktur. Akzeptiert Gesuche via Rechtsanwaltskanzlei.';
    cd.researchNotes = 'Keine öffentliche Website. Bevollmächtigte Kanzlei: Rechtsanwälte Pugatsch, spugatsch@rp-law.ch. Post war laut früheren Meldungen z.T. unzustellbar — möglicherweise teilweise inaktiv. IT-Bezug betrifft akademische ETH-Forschung, nicht NGO-Digitalprogramme. Jüdische Gemeinschaft und Israel-Fokus dominieren zwei der vier Säulen; thematische Überschneidung mit Revamp-IT ist begrenzt.';
    cd.themes = (cd.themes as string[] | null ?? []).filter(
      (t: string) => t !== 'digitale-bildung'
    );
  }, { newFitScore: 3 });

  // z43-netzero (fit=5): email confirmed, remove registry websiteUrl
  await patch('z43-netzero', (cd) => {
    delete cd.websiteUrl; // fundraiso registry URL — remove
    cd.applicationUrl = 'mailto:info@z43netzero.org';
    cd.applicationMethod = 'email';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'Zeughausstrasse 43, 8004 Zürich';
    c.email = 'info@z43netzero.org';
    cd.contact = c;
    cd.purposeSummary = 'Sehr neue Stiftung (gegr. Juli 2024) aus dem Z43-Forschungscluster (IT\'IS Foundation, SPEAG, ZMT). Fördert Massnahmen zur nachhaltigen Reduktion der Klimaauswirkungen menschlicher Aktivitäten — Schwerpunkt auf technischer Klimaneutralität, erneuerbarer Energie und nachhaltiger Infrastruktur.';
    cd.researchNotes = 'CHE-[neu], gegr. Juli 2024. Z43-Cluster = biomedizinische Ingenieursforschung (EMF, SPEAG). NetZero ist ein Klimafokus-Spin-off. Primärthemen sind Klimatechnologie und Energie — kein Bezug zu IT-Refurbishing, Arbeitsintegration oder Digitaler Bildung von Revamp-IT. Kontakt: info@z43netzero.org (bestätigt). Kein öffentlicher Vergabeprozess bisher bekannt.';
  });

  // Archive michael-kohn-stiftung — confirmed duplicate of michael-kohn (P2)
  // Both resolve to Rechtsanwälte Pugatsch, Beethovenstrasse 11, Zürich
  console.log('\n2. Archiving confirmed duplicate...');
  await sql`
    UPDATE fundraising_foundations
    SET archived = true, updated_at = NOW()
    WHERE id = 'michael-kohn-stiftung'
  `;
  console.log('  ✅ archived: michael-kohn-stiftung (duplicate of michael-kohn P2)');

  console.log('\n✅ All done.');
}
main().catch(console.error);
