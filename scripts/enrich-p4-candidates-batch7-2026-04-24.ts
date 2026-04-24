/**
 * Research results from 2026-04-24 for 12 P4 batch-44 candidates.
 * This is the FINAL fit≥5 rapid-triage batch — exhausts all remaining candidates.
 *
 * Outcomes:
 *  Batch 44A:
 *  - jean-anderson-studenten-sos-stiftung: fit 5→1 (ETH/UZH student scholarships only, no org funding)
 *  - jizchak-und-denise-schaechter-stiftung: fit 5→5 (can fund Sozialwerke+steuerbefreite Institutionen; contact found)
 *  - joseph-stiftung: fit 5→3 (can fund institutions but narrow focus: sick/elderly/children, not IT)
 *  - kanthari-foundation-switzerland: fit 5→2 (fellowship funder for intl kanthari/BBW alumni, not general NGOs)
 *  - kohler-friederich-stiftung: fit 5→4 (website found; currently CLOSED to new applications)
 *  - kolianda-stiftung: fit 5→1 (Einelternfamilien in Wallisellen only; no org funding)
 *  Batch 44B:
 *  - liveyourdream-foundation: fit 5→3 (individual dream projects, not NGO grant-maker focus)
 *  - luiza-penha-walter-renteiro-stiftung: fit 5→4 (institutions allowed, but Bezirk Meilen geo-constraint)
 *  - max-wiederkehr-stiftung: fit stays 5 (sozial disadvantaged youth + Berufsbildung; can fund institutions)
 *  - maya-behn-eschenburg-stiftung: fit 5→0 + archived (DISSOLVED 2025-11-19)
 *  - mekkihelp-stiftung: fit 5→1 (explicitly closed to new applications; only continues existing projects)
 *  - oscar-seeger-stiftung: fit 5→3 (community foundation; funds NGOs in Küsnacht + Stadt Zürich)
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

async function patch(
  id: string,
  updater: (cd: Record<string, unknown>) => void,
  options?: { newFitScore?: number; archive?: boolean }
): Promise<void> {
  const [row] = await sql`SELECT config_data, fit_score FROM fundraising_foundations WHERE id = ${id}`;
  if (!row) { console.log(`  ❌ NOT FOUND: ${id}`); return; }
  const cd = row.config_data as Record<string, unknown>;
  updater(cd);
  const fs = options?.newFitScore ?? (row.fit_score as number);
  if (options?.archive) {
    await sql`
      UPDATE fundraising_foundations
      SET config_data = ${JSON.stringify(cd) as unknown}::jsonb,
          fit_score = ${fs},
          archived = true,
          updated_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE fundraising_foundations
      SET config_data = ${JSON.stringify(cd) as unknown}::jsonb,
          fit_score = ${fs},
          updated_at = NOW()
      WHERE id = ${id}
    `;
  }
  console.log(`  ✅ updated${options?.archive ? ' (archived)' : ''}: ${id}`);
}

async function main() {
  console.log('\nBatch 44A...');

  // ETH/UZH student scholarships only — no org funding
  await patch('jean-anderson-studenten-sos-stiftung', (cd) => {
    delete cd.websiteUrl;
    cd.applicationMethod = 'none'; // individuals only; no org applications
    cd.acceptsApplications = 'no';
    cd.purposeSummary = 'Gewährt Stipendien an begabte, finanziell schwache in- und ausländische Studierende der ETH Zürich und Universität Zürich. Ausschliesslich Einzelpersonen — kein Förderprogramm für Organisationen oder NGOs.';
    cd.researchNotes = 'CHE-402.502.533. Reine Individualstipendien-Stiftung (ETH/UZH). Organisationen wie Revamp-IT sind strukturell nicht förderberechtigt. DB-Fit von 5 war eine LLM-Fehleinschätzung.';
    cd.themes = ['zuerich'];
  }, { newFitScore: 1 });

  // Can fund Sozialwerke + steuerbefreite Institutionen — real potential; contact found
  await patch('jizchak-und-denise-schaechter-stiftung', (cd) => {
    delete cd.websiteUrl; // only Zefix URL in DB — no real website
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'Rainstrasse 77, 8038 Zürich';
    c.email = 'daniel.schaechter@swissonline.ch';
    c.phone = '+41 44 481 78 52';
    cd.contact = c;
    cd.purposeSummary = 'Wohltätige Stiftung: unterstützt bedürftige Einzelpersonen und Familien sowie Sozialwerke mit gleicher/ähnlicher Zwecksetzung und steuerbefreite Institutionen (Wohnungsbau, Bildung, Jugendliche, Kunst). Breiter Wohltätigkeitszweck — NGOs mit ähnlichem Mandat können sich qualifizieren.';
    cd.researchNotes = 'CHE-112.655.935. Kontakt: daniel.schaechter@swissonline.ch, +41 44 481 78 52, Rainstrasse 77, 8038 Zürich. Kein öffentlicher Bewerbungsweg. Zweck umfasst explizit "Sozialwerke" und "steuerbefreite Institutionen" — Revamp-IT als gemeinnützige steuerbefreite Organisation fällt darunter. Thematisch breiter als unser Kernmandat, aber Sozialintegration und Bildung sind Überschneidungspunkte. Cold-Outreach via E-Mail empfohlen.';
    cd.themes = ['soziale-integration'];
  }, { newFitScore: 5 });

  // Can fund social/church institutions — but narrow focus on sick/elderly/children
  await patch('joseph-stiftung', (cd) => {
    delete cd.websiteUrl; // only Zefix URL
    cd.applicationMethod = 'unknown';
    cd.acceptsApplications = 'unknown';
    cd.purposeSummary = 'Gemeinnützige Stiftung: unterstützt Kinder, Jugendliche, betagte und kranke Menschen in bescheidenen Verhältnissen — direkt oder über soziale und kirchliche Institutionen. Primärfokus auf Fürsorge/Pflege; kein Bezug zu digitaler Bildung, IT oder Arbeitsintegration.';
    cd.researchNotes = 'CHE-112.399.519. Kein öffentlicher Bewerbungsweg oder Website gefunden. Kein Kontakt in öffentlichen Registern. Stiftungszweck erlaubt "über soziale Institutionen" — Revamp-IT könnte sich qualifizieren, aber Primärfokus liegt auf Fürsorge/Pflege (Kinder, Betagte, Kranke), nicht IT oder Arbeitsintegration. Thematische Überschneidung schwach.';
    cd.themes = ['soziale-integration'];
  }, { newFitScore: 3 });

  // Fellowship funder for kanthari/Braille Without Borders alumni — not a general NGO funder
  await patch('kanthari-foundation-switzerland', (cd) => {
    cd.websiteUrl = 'https://www.kanthari.ch';
    cd.applicationMethod = 'none'; // not a general grant-maker; funds individual fellows, not orgs
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'Florastrasse 14, 8008 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Schweizer Unterstützungsstiftung für die internationalen Organisationen "kanthari" (Kerala, Indien) und "Braille Without Borders" — fördert Inklusion von Menschen mit Behinderung, Kriegsüberlebenden und ehemaligen Strassenkindern. Kein eigenständiges Förderprogramm für externe Schweizer NGOs.';
    cd.researchNotes = 'CHE-115.234.398. Website kanthari.ch. Primärmodell: Individualstipendien für soziale Unternehmer:innen (20-25 Stipendiaten/Jahr) am kanthari-Campus in Kerala (Indien). Nicht-Alumni-NGOs wie Revamp-IT können sich nicht direkt bewerben. Kein Bezug zu Revamp-ITs IT-Refurbishing/Kreislaufwirtschaft-Mission.';
    cd.themes = ['soziale-integration'];
  }, { newFitScore: 2 });

  // Can fund institutions + projects; currently closed to new applications
  await patch('kohler-friederich-stiftung', (cd) => {
    cd.websiteUrl = 'https://www.kohler-friederich-stiftung.ch';
    cd.applicationMethod = 'none'; // currently not accepting new applications (per website)
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o smarti treuhand gmbh, Frau S. Marti, Zürcherstrasse 29, 8620 Wetzikon';
    c.email = 'info@kohler-friederich-stiftung.ch';
    c.phone = '+41 44 932 32 00';
    cd.contact = c;
    cd.purposeSummary = 'Fördert Kinder und Jugendliche im In- und Ausland finanziell, bildungsmässig und gesundheitlich. Kann Direktunterstützung leisten sowie bewährte Institutionen und Projekte unterstützen. Aktuell: KEINE neuen Gesuche entgegengenommen (interne Umstellung).';
    cd.researchNotes = 'CHE-113.711.559. Website kohler-friederich-stiftung.ch. Explizit: aktuell keine neuen Anträge (interne Veränderungen). Kontakt: info@kohler-friederich-stiftung.ch, +41 44 932 32 00, c/o smarti treuhand gmbh, Wetzikon. Wenn wieder geöffnet: Bildungs- und Sozialkomponente für benachteiligte Jugendliche hätte thematische Überschneidung mit Revamp-IT. Auf Wiederöffnung überwachen.';
    cd.themes = ['soziale-integration', 'digitale-bildung'];
  }, { newFitScore: 4 });

  // Very narrow mandate: Einelternfamilien in Wallisellen only — no NGO funding
  await patch('kolianda-stiftung', (cd) => {
    cd.websiteUrl = 'https://kolianda-stiftung.ch';
    cd.applicationMethod = 'none'; // funds individuals/families directly, not NGOs
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.phone = '044 832 62 65';
    c.email = 'gesellschaft@wallisellen.ch';
    c.address = 'Zentralstrasse 9, 8304 Wallisellen';
    cd.contact = c;
    cd.purposeSummary = 'Fördert sozial benachteiligte Einelternfamilien in Wallisellen (Subsidiaritätsprinzip): direkte materielle, finanzielle und Sachunterstützung für Eltern und Kinder. Ausschliesslich Einzelpersonen/Familien als Zielgruppe — keine NGO-Förderung.';
    cd.researchNotes = 'Website kolianda-stiftung.ch. Kontakt: gesellschaft@wallisellen.ch, 044 832 62 65, Zentralstrasse 9, 8304 Wallisellen. Sehr enger Zweck: Einelternfamilien in Wallisellen. Keine Förderung für Organisationen. Für Revamp-IT nicht relevant.';
    cd.themes = ['soziale-integration', 'zuerich'];
  }, { newFitScore: 1 });

  console.log('\nBatch 44B...');

  // Individual dream projects primarily — poor NGO fit
  await patch('liveyourdream-foundation', (cd) => {
    cd.websiteUrl = 'https://liveyourdream.foundation';
    cd.applicationUrl = 'https://liveyourdream.foundation/traumprojekt-einreichen/';
    cd.applicationMethod = 'online';
    cd.acceptsApplications = 'yes';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o Lustenberger + Partners KLG, Wiesenstrasse 8, 8008 Zürich';
    c.email = 'contact@liveyourdream.foundation';
    cd.contact = c;
    cd.purposeSummary = 'Fördert junge Menschen bei der Verwirklichung beruflicher und persönlicher Ziele ("Traumprojekte"): finanzielle Unterstützung + Mentoring + professionelle Beratung + Netzwerkzugang. Setzt eigene Projekte um und unterstützt andere Organisationen/Einzelpersonen. Gegr. 2015, Zürich.';
    cd.researchNotes = 'Website liveyourdream.foundation. Online-Bewerbungsformular "Traumprojekt einreichen". Förderprofil liegt klar bei individuellen Abenteuerprojekten junger Menschen (Weltrekordflüge, Expeditionen, Sport). Revamp-IT als etablierte NGO mit 30+ Mitarbeitenden passt nicht in dieses Profil. Technisch ist "andere Organisationen" im Zweck erwähnt — für eine Cold-Outreach-E-Mail möglicherweise vertretbar, aber keine Priorität.';
    cd.themes = ['soziale-integration', 'arbeitsintegration'];
  }, { newFitScore: 3 });

  // Geographic constraint: Bezirk Meilen only — viable if Meilen impact shown
  await patch('luiza-penha-walter-renteiro-stiftung-fuer-die-jugend-des-bez', (cd) => {
    delete cd.websiteUrl; // no public website
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'yes';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o kjz Meilen, Lea Keller, General-Wille-Strasse 59, 8706 Feldmeilen';
    c.phone = null; // not publicly listed
    cd.contact = c;
    cd.purposeSummary = 'Fördert Kinder und Jugendliche des Bezirks Meilen (Küsnacht, Zollikon, Herrliberg, Meilen — Ostufer Zürichsee): Zuwendungen an Institutionen mit gemeinnütziger Zielsetzung UND direkt an Einzelpersonen. Verwaltet via Amt für Jugend und Berufsberatung Kanton Zürich (kjz Meilen). Keine festen Fristen.';
    cd.researchNotes = 'CHE-101.756.704. Verwaltet durch kjz Meilen (Lea Keller, General-Wille-Strasse 59, 8706 Feldmeilen). Explizit: "Zuwendungen an Institutionen mit gemeinnütziger Zielsetzung" — Revamp-IT qualifiziert. Kernhürde: geografische Beschränkung auf Bezirk Meilen. Revamp-IT operiert in Zürich-Wiedikon, weit von Meilen. Nur relevant, wenn ein spezifisches Projekt für Meilen-Jugendliche (z.B. Digitaler Bildungs-Workshop in Meilen) nachgewiesen werden kann.';
    cd.themes = ['soziale-integration', 'zuerich'];
  }, { newFitScore: 4 });

  // Good thematic match — Berufsbildung + sozial disadvantaged youth
  await patch('max-wiederkehr-stiftung', (cd) => {
    delete cd.websiteUrl; // no public website
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o Linco AG, Conrad-Ferdinand-Meyer-Strasse 14, 8002 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Unterstützt sozial benachteiligte und bedürftige Schweizer Kinder und Jugendliche: direkte Zuwendungen sowie Unterstützung gemeinnütziger Institutionen und Einzelprojekte — mit Schwerpunkt auf beruflicher Weiterbildung (Berufsbildung). Verwaltet durch Linco AG (Lienhardt-Bankiersfamilie), Zürich.';
    cd.researchNotes = 'CHE-101.690.560. c/o Linco AG, Conrad-Ferdinand-Meyer-Strasse 14, 8002 Zürich. Kein öffentlicher Bewerbungsweg — Kaltkontakt via schriftliches Gesuch an Linco AG. Berufsbildungsfokus passt gut zu Revamp-ITs Arbeitsintegrations-Programm (IT-Ausbildung für Marginalisierte). Zielgruppe "Kinder und Jugendliche" ist zu eng für Revamp-ITs erwachsene Arbeitsintegrations-Teilnehmende — Digitale Bildung für benachteiligte Jugendliche ist der stärkere Anknüpfungspunkt.';
    cd.themes = ['soziale-integration', 'arbeitsintegration'];
  }); // keep fit=5

  // DISSOLVED 2025-11-19 — archive completely
  await patch('maya-behn-eschenburg-stiftung', (cd) => {
    delete cd.websiteUrl;
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    cd.purposeSummary = 'AUFGELÖST 2025-11-19. Ehemaliger Zweck: wohltätige Unterstützung von Kindern/Jugendlichen (Erziehung, Schulung), medizinische Versorgung Zürich, Menschenrechte (Lateinamerika-Fokus). Stiftung existiert nicht mehr.';
    cd.researchNotes = 'CHE-114.019.609. Laut Handelsregister am 19. November 2025 aufgelöst. Keine Anträge möglich. Aus aktivem Pipeline entfernen.';
    cd.themes = [];
  }, { newFitScore: 0, archive: true });

  // Explicitly closed to new applications — only continues existing projects
  await patch('mekkihelp-stiftung', (cd) => {
    delete cd.websiteUrl;
    cd.applicationMethod = 'none'; // explicitly not accepting new proposals
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o Streiff von Kaenel AG, Dr. Adrian von Kaenel, Bahnhofstrasse 67, 8620 Wetzikon ZH';
    cd.contact = c;
    cd.purposeSummary = 'Verbesserung der Lebensbedingungen benachteiligter Menschen in der Schweiz und in Entwicklungs-/Schwellenländern (Schwerpunkt Kinder/Jugend-Bildung); Tierschutz und Lebensraumschutz. EXPLIZIT GESCHLOSSEN: unterstützt nur noch bereits laufende Projekte; nimmt keine neuen Anfragen entgegen.';
    cd.researchNotes = 'CHE-115.188.858. Explizite Aussage: "unterstützt nur noch bereits akzeptierte Projekte und nimmt keine neuen Anfragen entgegen." Stiftung wird erst nach dem Tod der Initianten wieder aktiv. Revamp-IT hat keine Möglichkeit, in den Förderkreis einzutreten.';
    cd.themes = ['soziale-integration'];
  }, { newFitScore: 1 });

  // Small community foundation — funds Zürich NGOs but nurses-first mandate
  await patch('oscar-seeger-stiftung', (cd) => {
    delete cd.websiteUrl; // no public website; municipal admin
    cd.applicationMethod = 'contact';
    cd.acceptsApplications = 'yes';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o Gemeindeverwaltung Küsnacht, Obere Dorfstrasse 32, 8700 Küsnacht ZH';
    c.email = 'finanzen@kuesnacht.ch';
    c.phone = '+41 44 913 12 01';
    cd.contact = c;
    cd.purposeSummary = 'Zweizweck-Stiftung (gegr. 1962): (1) finanzielle Besserstellung reformierter Krankenschwestern; (2) Zuwendungen an gemeinnützige Organisationen in der Gemeinde Küsnacht sowie in der Stadt Zürich. Verwaltet durch Gemeindeverwaltung Küsnacht (Seraina Thalmann-Romer). UID: CHE-110.104.883.';
    cd.researchNotes = 'finanzen@kuesnacht.ch, +41 44 913 12 01. Zweites Mandat ("gemeinnützige Organisationen in Küsnacht + Stadt Zürich") öffnet theoretisch Türen für Revamp-IT als Zürich-NGO. Primärmandat (reformierte Krankenschwestern) und kleine Gemeindestiftungs-Struktur deuten auf bescheidene Beträge und Präferenz für bekannte lokale Empfänger hin. Schriftliche Anfrage an finanzen@kuesnacht.ch möglich, aber niedrige Priorität.';
    cd.themes = ['soziale-integration', 'zuerich'];
  }, { newFitScore: 3 });

  console.log('\n✅ All done.');
}
main().catch(console.error);
