/**
 * Research results from 2026-04-24 for 10 P4 batch-40 candidates.
 *
 * Outcomes:
 *  1. Archive 2 non-foundations:
 *     - circular-zuerich: NOT a foundation — City of Zürich municipal program (fit was 9 = LLM error)
 *     - pep-stiftung: Dissolved Feb 2024 (bankruptcy, no assets)
 *  2. Mark 1 foundation operative:
 *     - social-gastronomy-schweiz: operative vehicle for dieCuisine cooperative, no external grants
 *  3. Correct fit scores + add research notes for 7 keep-P4 foundations:
 *     - familie-schwarz: fit 7→2 (closed, committed funds, no website)
 *     - iw-stiftung-mensch-und-zukunft: fit 7→3 (healthcare grants in practice, no website/process)
 *     - stiftung-symphasis: fit 6→4 (closed Apr 2026, fixed partner circle, international focus)
 *     - appsocial-org-stiftung: fit 6→2 (operative prosthetics focus, no application process)
 *     - creative-ai-foundation: fit 6→3 (newly operative AI events org, no public grants)
 *     - sefa-kaya-foundation: fit 6→2 (global south children's charity, no Swiss/IT fit)
 *     - stiftung-i-care-for-you: fit 6→3 (crowdfunding platform migrated to there-for-you.com)
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

async function patch(
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
  // ── 1. Archive non-foundations ─────────────────────────────────────────────
  console.log('\n1. Archiving non-foundations...');

  await patch('circular-zuerich', () => {}, { archiveIt: true });
  // "Circular Zürich" is the City of Zürich's circular economy strategy program (stadt-zuerich.ch).
  // No legal foundation entity registered. Fit score of 9 was a LLM triage error.

  await patch('pep-stiftung', () => {}, { archiveIt: true });
  // pEp Stiftung (CHE-497.782.377): bankruptcy proceedings opened 8 Feb 2024, terminated
  // 29 Feb 2024 due to lack of assets. Foundation dissolved — no longer exists.

  // ── 2. Mark operative ─────────────────────────────────────────────────────
  console.log('\n2. Marking operative...');

  await patch('social-gastronomy-schweiz', (cd) => {
    cd.isOperative = true;
    cd.acceptsApplications = 'no';
    cd.websiteUrl = 'https://socialgastronomy.org';
    cd.applicationMethod = 'none';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.email) c.email = 'communications@socialgastronomy.org';
    if (!c.address) c.address = 'c/o Innovations-Genossenschaft dieCuisine, Geerenweg 23a, 8048 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Operative Stiftung: Finanzierungsgesellschaft der Innovations-Genossenschaft dieCuisine, die soziale Gastronomie für sozialen Wandel einsetzt. Fokus auf Ernährungssicherheit, soziale Inklusion und nachhaltige Ernährung — kein IT/Digital-Fokus, kein Kreislaufwirtschafts-Bezug im Technologiebereich.';
    cd.researchNotes = 'Operative Stiftung, die als Finanzierungsinstrument für dieCuisine (Zürich-Altstetten) dient — kein eigenständiges Förderungsprogramm für externe Organisationen. Thematischer Fokus liegt auf sozialer Gastronomie/Ernährung, was keinen Bezug zu Revamp-ITs Arbeit (IT-Refurbishing, Arbeitsintegration, digitale Bildung) hat. Bewerbung nicht möglich.';
  }, { newFitScore: 1 });

  // ── 3. Correct fit scores and add research notes ───────────────────────────
  console.log('\n3. Correcting fit scores and adding research notes...');

  await patch('familie-schwarz', (cd) => {
    delete cd.websiteUrl; // no public website
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Feldblumenstrasse 19a, 8048 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Kleine Familienstiftung (gegr. 2022) — finanzielle Unterstützung von Menschen in sozialer und körperlicher Not (Jugendwohlfahrt, Pflege, Gesundheitshilfe, Wohnhilfe) sowie Bildungs- und Umweltschutzprojekte in der Schweiz und im Ausland.';
    cd.researchNotes = 'Laut Fundraiso hat die Stiftung mitgeteilt, dass sie keine unaufgeforderten Gesuche entgegennimmt und diese nicht bearbeiten wird. Die Stiftung ist klein und hat ihre verfügbaren Mittel bereits vergeben. Keine Website, keine Kontaktadresse öffentlich. Thematische Überlappung mit Revamp-IT (soziale Integration, Umweltschutz) vorhanden, aber keine Zugangsmöglichkeit.';
  }, { newFitScore: 2 });

  await patch('iw-stiftung-mensch-und-zukunft', (cd) => {
    delete cd.websiteUrl; // no public website
    cd.applicationMethod = 'unknown';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'c/o BK&P AG Treuhandgesellschaft, Balderngasse 9, 8001 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Die IW Stiftung Mensch und Zukunft (CHE-174.100.385, gegr. 2017, Zürich) fördert Ausbildung und Erziehung, freien Informationszugang, Menschenrechte, Forschung, Gesundheitsversorgung sowie Natur- und Klimaschutz in der Schweiz und im Ausland.';
    cd.researchNotes = 'Verwaltet c/o BK&P AG Treuhand, Zürich. Bekannte Förderempfänger: Kinderhospiz Schweiz (2024), Kinderspital Zürich (2023), Rotes Kreuz (2022) — Förderpraxis zeigt Gesundheits-/Kinderhilfefokus, nicht Digital/IT/Kreislaufwirtschaft. Thematisch breiter Stiftungszweck (Bildung, Informationsfreiheit, Umwelt), aber kein publiziertes Bewerbungsverfahren und keine Website. Kein direkter Revamp-IT-Fit erkennbar.';
  }, { newFitScore: 3 });

  await patch('stiftung-symphasis', (cd) => {
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    delete cd.applicationUrl;
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.email) c.email = 'Accentus-Empiris-Symphasis@ubs.com';
    if (!c.address) c.address = 'Uetlibergstrasse 231, 8045 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Symphasis ist eine UBS-nahe Dachstiftung (CHE-109.990.646), die soziale, ökologische und kulturelle Projekte unterstützt — überwiegend in Afrika, Asien und Lateinamerika; kleinerer Teil in Europa. Arbeitet seit Apr 2026 ausschliesslich mit einem festen Kreis von Partnerorganisationen.';
    cd.researchNotes = 'Explizit keine Fördergesuche entgegennehmend seit Apr 2026: "Wir haben unsere Förderstrategie angepasst und arbeiten mit einem festen Kreis von Partnerorganisationen zusammen." UBS-Infrastruktur (E-Mail-Domain). Geografischer Fokus stark auf Entwicklungsländern — passt nicht zu Revamp-ITs Schweiz/Zürich-Fokus. Wiederprüfung in 12-18 Monaten, falls sie sich wieder öffnen.';
  }, { newFitScore: 4 });

  await patch('appsocial-org-stiftung', (cd) => {
    cd.websiteUrl = 'https://appsocial.org';
    cd.applicationMethod = 'unknown';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'c/o Dr. med. Andreas Trojan, Pestalozzistrasse 58, 8032 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Die appsocial.org Stiftung (Zürich, gegr. 2014) fördert Gesundheit, Bildung und Erziehung unter Einsatz zukunftsweisender Technologien. In der Praxis liegt der Fokus auf der Unterstützung modularer und robuster Handprothesen für Kinder. Keine digitale Bildung oder IT-Refurbishing.';
    cd.researchNotes = 'Website zeigt operativen Schwerpunkt auf Handprothesen-Projekten für Kinder ("Unterstützung von modularen und robusten Handprothesen"). Kein öffentliches Bewerbungsverfahren, keine Fristen publiziert. Thematisch kein Bezug zu Revamp-ITs Kernbereichen IT, Kreislaufwirtschaft oder Arbeitsintegration.';
  }, { newFitScore: 2 });

  await patch('creative-ai-foundation', (cd) => {
    cd.websiteUrl = 'https://www.creativeaifoundation.com';
    cd.isOperative = true; // primarily runs own AI events/exhibitions
    cd.applicationMethod = 'unknown';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'c/o Heng Zhang, Blauäcker 20, 8051 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Die Creative AI Foundation (CHE-310.945.926, gegr. Jan 2025) fördert die interdisziplinäre Diskussion über Auswirkungen von KI, Robotern und neuen Technologien durch eigene Veranstaltungen (Zurich AI Festival), Ausstellungen und Community-Building. Primär operative Stiftung.';
    cd.researchNotes = 'Sehr junge Stiftung (Jan 2025). Fokus auf AI-Diskurs/Philosophie/Kunst — kein Zusammenhang mit IT-Refurbishing, Kreislaufwirtschaft oder Arbeitsintegration. Kein publiziertes Förderprogramm für externe Organisationen gefunden. Operative Tätigkeit (eigene Events) im Vordergrund.';
  }, { newFitScore: 3 });

  await patch('sefa-kaya-foundation', (cd) => {
    delete cd.websiteUrl; // social media only, no real website
    cd.applicationMethod = 'unknown';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Schieltwiesenweg 14, 8404 Winterthur';
    cd.contact = c;
    cd.purposeSummary = 'Die SEFA KAYA FOUNDATION (CHE-343.339.750, Winterthur, gegr. 2020) unterstützt bedürftige Kinder und Jugendliche in Ländern mit hoher Armut durch Sachleistungen, medizinische Versorgung, Unterkunft und Bildung. Fokus ausschliesslich auf dem globalen Süden, nicht auf der Schweiz.';
    cd.researchNotes = 'Familientiftung der Familie Kaya. Statutarischer Fokus auf Kinder in Entwicklungsländern — kein Schweiz-Bezug, kein IT/Digital/Arbeitsintegrations-Bezug. Keine Website (nur Social Media: @sefakayafoundation). Kein publiziertes Bewerbungsverfahren. Grundsätzlich nicht relevant für Revamp-IT.';
  }, { newFitScore: 2 });

  await patch('stiftung-i-care-for-you', (cd) => {
    cd.websiteUrl = 'https://www.there-for-you.com';
    cd.isOperative = true; // crowdfunding platform operator
    cd.applicationMethod = 'none'; // not a traditional grant-maker
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'c/o Lenz & Staehelin, Brandschenkestrasse 24, 8001 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Die Stiftung betrieb eine Crowdfunding-Plattform für gemeinnützige Schweizer Organisationen in den Bereichen Gesundheit, Jugendarbeitslosigkeit und Bildung. Die ursprüngliche Plattform wurde auf there-for-you.com migriert. Keine klassische Projektförderung mit eigenem Kapital.';
    cd.researchNotes = 'Crowdfunding-Infrastrukturstiftung (nicht klassischer Förderer) — vergibt keine eigenen Gelder, sondern ermöglichte Spendenkampagnen für andere NGOs. Plattform auf there-for-you.com migriert. Revamp-IT könnte theoretisch Crowdfunding-Kampagnen auf there-for-you.com führen, aber das ist kein Stiftungsbeitrag im klassischen Sinne.';
  }, { newFitScore: 3 });

  console.log('\n✅ All done.');
}
main().catch(console.error);
