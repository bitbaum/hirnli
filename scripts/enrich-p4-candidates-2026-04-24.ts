/**
 * Enrich P4 rapid foundations based on research from 2026-04-24.
 * Actions:
 *  1. Archive stopp-klimakrise (confirmed duplicate of stiftung-stopp-klimakrise-kurt-de-lorenzo)
 *  2. Fix fuchs-eugster: LLM triage over-scored (8→5) and wrong theme (digitale-bildung→remove)
 *  3. Enrich cammac-stiftung: applicationUrl + email + purposeSummary + notes found
 *  4. Enrich climatoor: purposeSummary + address + notes (no website found; stays rapid)
 *  5. Enrich erde-2-0: purposeSummary + address + notes (family foundation, no public access)
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // ─── 1. Archive duplicate ─────────────────────────────────────────────────
  console.log('\n1. Archiving stopp-klimakrise (duplicate)...');
  const r1 = await sql`
    UPDATE fundraising_foundations
    SET archived = true, updated_at = NOW()
    WHERE id = 'stopp-klimakrise'
    RETURNING id
  `;
  console.log(r1.length ? `  ✅ archived stopp-klimakrise` : `  ❌ NOT FOUND`);

  // ─── 2. Correct fuchs-eugster ─────────────────────────────────────────────
  // LLM triage assigned fit=8 and digitale-bildung theme incorrectly.
  // Actual focus: child/youth medical costs, music education, cultural heritage.
  // Not a match for digital education or IT programs.
  // Correct: fit=5, remove digitale-bildung theme, clear wrong websiteUrl (stiftungschweiz profile).
  console.log('\n2. Correcting fuchs-eugster (fitScore 8→5, remove digitale-bildung theme)...');
  const [fe] = await sql`SELECT config_data FROM fundraising_foundations WHERE id = 'fuchs-eugster'`;
  if (!fe) { console.log('  ❌ NOT FOUND'); }
  else {
    const cd = fe.config_data as Record<string, unknown>;
    // Correct fitScore
    cd.fitScore = 5;
    // Remove digitale-bildung theme (wrong — their education focus is musical, not digital)
    cd.themes = ((cd.themes as string[] | null) ?? []).filter(t => t !== 'digitale-bildung');
    // Clear stiftungschweiz profile URL — not a real website
    delete cd.websiteUrl;
    // Update purposeSummary with accurate data
    cd.purposeSummary = 'Drei Förderbereiche: (1) Kinder- und Jugendhilfe — nicht gedeckte Kosten für medizinische Massnahmen, Therapie und Integration von Kindern/Jugendlichen in ZH/AR/SH; (2) Musikalische Bildung für begabte Jugendliche; (3) Kulturelles Erbe — Museen, historische Dampfschiffe, Eisenbahnen, Berglandschaften in Ostschweiz und Kanton Zürich.';
    cd.researchNotes = 'Stiftung Fuchs-Eugster, gegründet 2010, beaufsichtigt durch Eidg. Departement des Innern. Verwaltet durch WildbachPartner AG, Wildbachstrasse 46, 8008 Zürich. Diskretionäre Vergabe, Entscheide müssen Antragstellern nicht begründet werden. Keine öffentliche E-Mail-Adresse, keine eigene Website. Fit für Revamp-IT: Schwach — primärer Fokus liegt auf medizinischen Einzelfallhilfen und Musikförderung, nicht auf digitaler Integration oder NGO-Projektfinanzierung. Der soziale Integrationsaspekt ist am ehesten relevant, aber Zielgruppe sind Kinder/Jugendliche mit medizinischem Bedarf, nicht Arbeitsintegration für Erwachsene.';
    await sql`
      UPDATE fundraising_foundations
      SET config_data = ${JSON.stringify(cd) as unknown}::jsonb,
          fit_score = 5,
          updated_at = NOW()
      WHERE id = 'fuchs-eugster'
    `;
    console.log('  ✅ fuchs-eugster corrected');
  }

  // ─── 3. Enrich cammac-stiftung ────────────────────────────────────────────
  // Found: online application portal + email + twice-yearly cycle
  console.log('\n3. Enriching cammac-stiftung...');
  const [cam] = await sql`SELECT config_data FROM fundraising_foundations WHERE id = 'cammac-stiftung'`;
  if (!cam) { console.log('  ❌ NOT FOUND'); }
  else {
    const cd = cam.config_data as Record<string, unknown>;
    // Only set if empty
    const setIfEmpty = (key: string, val: unknown) => {
      if (val == null || val === '') return;
      if (cd[key] == null || cd[key] === '') { cd[key] = val; }
    };
    setIfEmpty('applicationUrl', 'https://www.gemeinnuetzige-stiftungen.ch/de-ch/cammac-stiftung/gesucheingabe/');
    if (!cd.applicationMethod || cd.applicationMethod === 'unknown') cd.applicationMethod = 'online';
    if (!cd.acceptsApplications) cd.acceptsApplications = 'yes';
    // Contact
    const contact = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!contact.email) { contact.email = 'CAMMAC-Stiftung@vontobel.com'; cd.contact = contact; }
    if (!contact.address) { contact.address = 'c/o Bank Vontobel AG, Gotthardstrasse 43, 8002 Zürich'; cd.contact = contact; }
    setIfEmpty('purposeSummary', 'Fördert Institutionen, die sich mit Früherfassung, Förderung, Schulung, Ausbildung, Beschäftigung, Eingliederung und Betreuung von Kindern, Jugendlichen und bedürftigen Erwachsenen mit Lernstörungen oder mehrfacher Behinderung befassen. Zusätzlich: Institutionen mit christlicher Ausrichtung oder als Ort der Stille, Besinnung und Begegnung.');
    if (!cd.researchNotes || String(cd.researchNotes).length < 100) {
      cd.researchNotes = 'CHE-110.153.717. Verwaltet durch Bank Vontobel AG (Kontaktperson: Bettina Boss). Präsident: Christian Glesti. Gesuche werden zweimal jährlich angenommen (Frühling: Deadline ~24. März; Herbst: offen) — nur von gemeinnützigen Organisationen, nicht von Einzelpersonen. Antragsverfahren über gemeinnuetzige-stiftungen.ch. Fit für Revamp-IT: Arbeitsintegrations-Aspekt (Beschäftigung und Eingliederung benachteiligter Erwachsener) passt direkt zu Revamp-ITs IT-Ausbildungs- und Arbeitsprogrammen für marginalisierte Menschen. Christliche Ausrichtung nicht Revamp-ITs Fokus, aber der Eingliederungs-Track ist eigenständig anwendbar. Bewerbung sinnvoll mit Fokus auf Arbeitsintegration.';
    }
    setIfEmpty('deadlineText', 'Zweimal jährlich — Frühling ca. 24. März, Herbst offen');
    await sql`
      UPDATE fundraising_foundations
      SET config_data = ${JSON.stringify(cd) as unknown}::jsonb, updated_at = NOW()
      WHERE id = 'cammac-stiftung'
    `;
    console.log('  ✅ cammac-stiftung enriched');
  }

  // ─── 4. Enrich climatoor ──────────────────────────────────────────────────
  console.log('\n4. Enriching climatoor...');
  const [cli] = await sql`SELECT config_data FROM fundraising_foundations WHERE id = 'climatoor'`;
  if (!cli) { console.log('  ❌ NOT FOUND'); }
  else {
    const cd = cli.config_data as Record<string, unknown>;
    if (!cd.purposeSummary || String(cd.purposeSummary).length < 100) {
      cd.purposeSummary = 'Fördert Umwelt- und Klimaschutz, um einen Beitrag gegen den Klimawandel und zur Erhaltung und nachhaltigen Verbesserung der Lebens- und Umweltqualität für künftige Generationen zu leisten. Mittel: Unterstützung von Schutzprojekten, Förderung von Wissenschaft und Forschung, Aufklärung und Bildung im In- und Ausland (inkl. Entwicklungsländer).';
    }
    if (!cd.researchNotes || String(cd.researchNotes).length < 100) {
      cd.researchNotes = 'Junge Stiftung (gegründet März 2023), CHE-xxx, verwaltet durch Balmer-Etienne AG, Bederstrasse 66, 8002 Zürich. Präsident: André Frei. Keine eigene Website, kein publiziertes Bewerbungsverfahren — operiert wahrscheinlich proaktiv (Direktengagement). Thematische Passung mit Revamp-IT hervorragend (Kreislaufwirtschaft, Klimaschutz), aber kein öffentlicher Zugangsweg. Kontakt nur postalisch über c/o Adresse möglich; Beziehungsaufbau über André Frei empfohlen.';
    }
    const contact = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!contact.address) { contact.address = 'c/o Balmer-Etienne AG, Bederstrasse 66, 8002 Zürich'; cd.contact = contact; }
    await sql`
      UPDATE fundraising_foundations
      SET config_data = ${JSON.stringify(cd) as unknown}::jsonb, updated_at = NOW()
      WHERE id = 'climatoor'
    `;
    console.log('  ✅ climatoor enriched');
  }

  // ─── 5. Enrich erde-2-0 ──────────────────────────────────────────────────
  console.log('\n5. Enriching erde-2-0...');
  const [erde] = await sql`SELECT config_data FROM fundraising_foundations WHERE id = 'erde-2-0'`;
  if (!erde) { console.log('  ❌ NOT FOUND'); }
  else {
    const cd = erde.config_data as Record<string, unknown>;
    if (!cd.purposeSummary || String(cd.purposeSummary).length < 100) {
      cd.purposeSummary = 'Fördert gemeinnützige Zwecke zum Wohl Dritter durch Unterstützung wissenschaftlicher und sozialer Projekte. Kernfokus: globale menschliche Gesundheit und Resilienz durch Förderung wissenschaftlicher Ideen, Methoden, Technologien und Strategien zur Anpassung an eine sich verändernde Welt — Schwerpunkte Klimawissenschaften, Ernährungs-, Energie- und Wassersicherheit, natürliche Ökosysteme und technologische Innovation, primär aus der Schweiz.';
    }
    if (!cd.researchNotes || String(cd.researchNotes).length < 100) {
      cd.researchNotes = 'CHE-443.701.461. Sehr junge Stiftung (gegründet 17.12.2023), domiziliert c/o Centralis Switzerland GmbH, Kanzleistrasse 18, 8004 Zürich. Präsident: David A.M. Wallerstein (US-Bürger, Zumikon ZH) — Familienstiftung. Keine eigene Website, kein publiziertes Förderverfahren, alle Kontakte auf Registern geschwärzt. Wahrscheinlich operative Familienstiftung ohne offenen Bewerbungsaufruf. Kontakt nur postalisch möglich. Für Revamp-IT: thematisch teilweise passend (Umwelt/Klimawandel), aber kein Arbeitsintegrations- oder Digitalisierungsaspekt erkennbar, und kein öffentlicher Zugangsweg.';
    }
    const contact = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!contact.address) { contact.address = 'c/o Centralis Switzerland GmbH, Kanzleistrasse 18, 8004 Zürich'; cd.contact = contact; }
    await sql`
      UPDATE fundraising_foundations
      SET config_data = ${JSON.stringify(cd) as unknown}::jsonb, updated_at = NOW()
      WHERE id = 'erde-2-0'
    `;
    console.log('  ✅ erde-2-0 enriched');
  }

  console.log('\n✅ Done.');
}
main().catch(console.error);
