/**
 * Research results from 2026-04-24 for 9 fit=4 P4 rapid candidates (all thematically relevant ones).
 *
 * Outcomes:
 *  - sozialdepartement-der-stadt-zuerich-fondsverwaltung: fit 4→0 (individual emergency aid only)
 *  - stiftung-der-islamischen-jugend: fit 4→0 (Muslim community only, religious mandate)
 *  - stiftung-egger-looser: fit 4→1 (mountain youth individual scholarships only)
 *  - corvus-stiftung: fit 4→2 (humanitarian aid international, no IT/digital)
 *  - stiftung-cequality: fit 4→2 (CareLeaver operative foundation, not a funder)
 *  - hilfswerk-heks: fit 4→2 (operative NGO/charity, not a funder; peer not donor)
 *  - kk-sonnenschein-stiftung: fit 4→3 (no grants to third parties; family foundation)
 *  - blauer-planet: fit stays 4 (suspended "im Aufbau"; revisit 12-18 months)
 *  - stiftung-amos: fit 4→6 (Arbeitsintegration match; can fund orgs; warm intro needed)
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
  console.log(`  ✅ updated: ${id} → fit=${fs}`);
}

async function main() {
  console.log('\nFit=4 batch 1 — obvious non-fits...');

  // City of Zürich emergency aid funds — individuals only, no NGO grants
  await patch('sozialdepartement-der-stadt-zuerich-fondsverwaltung', (cd) => {
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    cd.purposeSummary = 'Verwaltung diverser Nothilfefonds der Stadt Zürich für vorübergehend in Not geratene Zürcher Einwohner:innen. Ausschliesslich Direkthilfe an Einzelpersonen — keine Förderung für NGOs oder Institutionen.';
    cd.researchNotes = 'Fonds des Sozialdepartements Stadt Zürich. Hilfeleistungen nur an Einzelpersonen in vorübergehender Notlage. Keine institutionelle Förderung. Für Revamp-IT als NGO nicht förderberechtigt.';
    cd.themes = ['zuerich'];
  }, { newFitScore: 0 });

  // Muslim community only — religious mandate, not open to secular NGOs
  await patch('stiftung-der-islamischen-jugend', (cd) => {
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    cd.purposeSummary = 'Fördert religiöse und ideelle Anliegen der Muslime in der Schweiz: Moscheen, Gemeinschaftszentren, Kinderkrippen, Bibliotheken, Integration. Ausschliesslich für die muslimische Gemeinschaft.';
    cd.researchNotes = 'CHE-109.990.244. Religiöse Zweckbindung — Förderung ausschliesslich für die muslimische Community. Weltliche Organisationen wie Revamp-IT sind nicht förderberechtigt.';
    cd.themes = ['soziale-integration'];
  }, { newFitScore: 0 });

  // Mountain youth only — individual scholarships, wrong geography
  await patch('stiftung-egger-looser', (cd) => {
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    cd.purposeSummary = 'Ermöglicht Jugendlichen aus unbemittelten Berggebietsfamilien Ausbildung, Zweitausbildung oder Weiterbildung. Ausschliesslich Individualstipendien — keine NGO-Förderung.';
    cd.researchNotes = 'CHE-101.655.782. Enge Zielgruppe: Jugendliche aus Berggebieten, Einzelstipendien. Geografische Inkompatibilität (Berggebiet vs. Zürich-Stadt) und keine Förderung für Organisationen.';
    cd.themes = [];
  }, { newFitScore: 1 });

  // International humanitarian aid — no IT/digital/Kreislaufwirtschaft angle
  await patch('corvus-stiftung', (cd) => {
    cd.applicationMethod = 'unknown';
    cd.acceptsApplications = 'unknown';
    cd.purposeSummary = 'Linderung menschlicher Not im In- und Ausland: Armut, Hunger, Trinkwasser, medizinische Versorgung, elementare Ausbildung, Klimaanpassung. Nebenzweck: verantwortungsvoller Umgang mit Tieren und Natur.';
    cd.researchNotes = 'CHE-109.551.927. Primärfokus humanitäre Grundversorgung international (Hunger, Wasser, Medizin). Kein IT-Refurbishing-, Digitale-Bildungs- oder Kreislaufwirtschafts-Bezug. Schwache thematische Überschneidung für Revamp-IT.';
    cd.themes = ['soziale-integration'];
  }, { newFitScore: 2 });

  // CareLeaver operative foundation — service delivery, not a funder
  await patch('stiftung-cequality', (cd) => {
    cd.websiteUrl = 'https://cequality.ch';
    cd.isOperative = true;
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'Ueberlandstrasse 109, 8600 Dübendorf';
    cd.contact = c;
    cd.purposeSummary = 'Operative Stiftung: erbringt professionelle Übergangsbegleitung für CareLeaver (junge Erwachsene aus Kinderheimen/Pflegefamilien). Service-Delivery-Organisation — vergibt keine Fördermittel an externe NGOs.';
    cd.researchNotes = 'CHE-440.081.610. cequality.ch. Ueberlandstrasse 109, 8600 Dübendorf. Rein operative Stiftung (Beratung, Coaching für CareLeaver). Kein Förderprogramm für externe Organisationen. Zielgruppe CareLeaver hat Überschneidung mit Revamp-ITs Klientel — potentieller Kooperationspartner für Programmteilnehmende, aber kein Fördergeber.';
    cd.themes = ['soziale-integration', 'arbeitsintegration'];
  }, { newFitScore: 2 });

  // HEKS — operative NGO charity, not a funder; peer organisation
  await patch('hilfswerk-der-evangelisch-reformierten-kirche-schweiz-heks', (cd) => {
    cd.websiteUrl = 'https://www.heks.ch';
    cd.isOperative = true;
    cd.applicationMethod = 'none';
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'Seminarstrasse 28, 8042 Zürich';
    c.email = 'info@heks.ch';
    c.phone = '+41 44 360 88 00';
    cd.contact = c;
    cd.purposeSummary = 'Hilfswerk der Evangelisch-reformierten Kirche Schweiz: betreibt eigene Programme (60 Projekte in 16 Kantonen) zu Arbeitsintegration, soziale Einbindung, Kreislaufwirtschaft (Eco Impulse). Empfängt Gelder von Stiftungen/Kantonen — vergibt selbst keine Fördermittel an externe NGOs.';
    cd.researchNotes = 'CHE-111.751.619. info@heks.ch, +41 44 360 88 00, Seminarstrasse 28, 8042 Zürich. HEKS ist eine operative NGO/Charity — kein Fördergeber. Sie betreiben Eco Impulse (Kreislaufwirtschaft + Sozialintegration) und MosaiQ (Arbeitsintegration Zürich) — direkte thematische Konkurrenz zu Revamp-IT. Kein Kategorienfehler: Revamp-IT kann nicht bei HEKS einen Förderbeitrag beantragen. Potentieller Kooperationspartner für gemeinsame Projekte (z.B. Kantonsgesuche).';
    cd.themes = ['soziale-integration', 'arbeitsintegration'];
  }, { newFitScore: 2 });

  // KK Sonnenschein — no grants to third parties (family foundation, likely dormant)
  await patch('kk-sonnenschein-stiftung', (cd) => {
    delete cd.websiteUrl;
    cd.applicationMethod = 'none'; // confirmed: no grants to third parties
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o Pestalozzi Rechtsanwälte AG, Feldeggstrasse 4, 8008 Zürich';
    cd.contact = c;
    cd.purposeSummary = 'Fördert Ausbildung von talentierten, gesellschaftlich benachteiligten Jugendlichen und jungen Erwachsenen in Kultur, Kunst, Sport, Gesundheit, Politik. Kann Ausbildungsstätten errichten. KEIN Förderprogramm für externe Dritte bestätigt.';
    cd.researchNotes = 'CHE-115.958.527. c/o Pestalozzi Rechtsanwälte AG, Feldeggstrasse 4, 8008 Zürich. Fundraiso/StiftungSchweiz bestätigen: "aktuell keine Zuwendungen an Dritte." Wahrscheinlich ruhende oder rein operative Familienstiftung. Kein Revamp-IT-Förderpfad.';
    cd.themes = ['arbeitsintegration', 'soziale-integration'];
  }, { newFitScore: 3 });

  // Blauer Planet — suspended (im Aufbau), genuine thematic fit, revisit later
  await patch('blauer-planet', (cd) => {
    delete cd.websiteUrl; // no public website found
    cd.applicationMethod = 'contact'; // written letter only when reopens
    cd.acceptsApplications = 'no'; // currently suspended
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'c/o Moser Keiser, Hostett 1, 6055 Alpnach Dorf';
    cd.contact = c;
    cd.purposeSummary = 'Fördert Projekte und Institutionen in: Umwelt/Natur (3/4 Budget): Klimaschutz, Naturschutz; Menschen in Armut (1/4 Budget): Gesundheit und Bildung; kirchliches Kulturgut. Kann steuerbefreite Drittorganisationen unterstützen. Schweizweit + international. AKTUELL SISTIERT (im Aufbau).';
    cd.researchNotes = 'CHE-157.513.088. c/o Moser Keiser, Hostett 1, 6055 Alpnach Dorf. Keine Website. Explizit: "aktuell keine Gesuche entgegennehmen (im Aufbau)." Thematische Überschneidung mit Revamp-IT real: Kreislaufwirtschaft → Umwelt-Pillar; Digitale Bildung für Benachteiligte → Menschen-in-Armut-Pillar. Nur schriftlicher Kontakt. In 12-18 Monaten erneut prüfen.';
    cd.themes = ['klima', 'kreislaufwirtschaft', 'soziale-integration', 'digitale-bildung'];
  }); // keep fit=4 (genuine but blocked)

  // Stiftung Amos — Arbeitsintegration match + funds external orgs; warm intro needed
  await patch('stiftung-amos', (cd) => {
    delete cd.websiteUrl;
    cd.applicationMethod = 'contact'; // family foundation, personal network
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.address = 'Malerweg 2, 3600 Thun';
    cd.contact = c;
    cd.purposeSummary = 'Hilfe für Menschen in Notsituationen: Infrastruktur, Bildung, Schulung. Konkret: Arbeitsintegration für Arbeitslose und benachteiligte Jugendliche durch Wiedereingliederung in die Arbeitswelt; Schuldenberatung. Unterstützt auch externe Partnerorganisationen in gleichen Bereichen.';
    cd.researchNotes = 'CHE-283.836.178. Malerweg 2, 3600 Thun. Familienstiftung (Bachmann-Familie: Ernst/Präs., Patrick/VP, Monika). Kein öffentlicher Bewerbungsweg. Stiftungszweck deckt "Wiedereingliederung in die Arbeitswelt" und "Unterstützung von Organisationen in gleichen Bereichen" — direkter Arbeitsintegrations-Fit mit Revamp-IT. Zugang nur über persönliche Einführung. Bernischer Schwerpunkt trotz nationalem Mandat.';
    cd.themes = ['soziale-integration', 'arbeitsintegration'];
  }, { newFitScore: 6 });

  console.log('\n✅ Done.');
}
main().catch(console.error);
