/**
 * Research results from 2026-04-24 — final 4 unresearched fit=4 rapid foundations.
 *
 * Outcomes:
 *  - fondation-klik: fit 4→2 (operative CO2-compensation body, not a social grant-maker)
 *  - huber-graf-und-billeter-graf-stiftung: fit 4→1 (explicitly individuals only, no institutions)
 *  - schmid-woerner-stiftung-hoengg: fit 4→1 (Höngg residents only, individuals, no org grants)
 *  - stiftung-binelli-und-ehrsam-zuerich: fit stays 4 (funds social institutions; email found)
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
  cd.fitScore = fs; // always update config_data.fitScore to avoid trigger reversion
  await sql`
    UPDATE fundraising_foundations
    SET config_data = ${JSON.stringify(cd) as unknown}::jsonb,
        fit_score   = ${fs},
        updated_at  = NOW()
    WHERE id = ${id}
  `;
  console.log(`  ✅ updated: ${id} → fit=${fs}`);
}

async function main() {
  console.log('\nFit=4 batch 2 — 4 final unresearched candidates...\n');

  // KliK — operative CO2 compensation body under Swiss CO2 Act; not a social grant-maker
  await patch('fondation-pour-la-protection-du-climat-et-la-compensation-de', (cd) => {
    cd.websiteUrl = 'https://www.klik.ch';
    cd.isOperative = true;
    cd.applicationMethod = 'none'; // only funds certified CO2 reduction programs via tender
    cd.acceptsApplications = 'no';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    if (!c.address) c.address = 'Belpstrasse 23, 3007 Bern';
    cd.contact = c;
    cd.purposeSummary = 'KliK (Fondation pour la protection du climat et la compensation de CO2) ist die gesetzlich mandatierte Schweizer CO2-Kompensationsstiftung. Unternehmen, die über dem erlaubten CO2-Budget liegen, kompensieren über KliK. KliK finanziert zertifizierte CO2-Reduktionsprojekte (Biogas, Holzheizung, Fernwärme). Kein allgemeines NGO-Förderprogramm.';
    cd.researchNotes = 'KliK wurde 2012 im Rahmen des Schweizer CO2-Gesetzes gegründet. Fördert ausschliesslich messbare CO2-Reduktionsprojekte mit zertifizierten Emissionsreduktionen — technische Projekte (Energieeffizienz, erneuerbare Energien). Zwar hätte IT-Refurbishing einen CO2-Vorteil (verlängerte Gerätelebensdauer = weniger Produktion), aber KliK vergibt keine allgemeinen Sozialprogramm-Gelder. Kein zugänglicher Bewerbungsweg für Revamp-IT.';
    cd.themes = ['klima'];
  }, { newFitScore: 2 });

  // Individuals only — explicitly excludes institutions
  await patch('huber-graf-und-billeter-graf-stiftung', (cd) => {
    delete cd.websiteUrl;
    cd.applicationMethod = 'none'; // individuals only
    cd.acceptsApplications = 'no';
    cd.purposeSummary = 'Fördert ausschliesslich bedürftige Einzelpersonen (nicht Institutionen): blinde, taubstumme, Menschen mit Behinderungen und sonstige Bedürftige mit Wohnsitz oder Bürgerrecht im Kanton Zürich. Explizit KEINE Unterstützung für Institutionen oder Organisationen.';
    cd.researchNotes = 'Der Stiftungszweck enthält den expliziten Ausschluss: "Hilfe nur für bedürftige Einzelpersonen, nicht für Institutionen." Revamp-IT als Organisation ist strukturell nicht förderberechtigt. Kein weiterer Recherchebedarf.';
    cd.themes = ['zuerich'];
  }, { newFitScore: 1 });

  // Höngg residents only — individuals, narrow geography
  await patch('schmid-woerner-stiftung-hoengg', (cd) => {
    delete cd.websiteUrl;
    cd.applicationMethod = 'none'; // individuals only; 10-year Höngg residency required
    cd.acceptsApplications = 'no';
    cd.purposeSummary = 'Unterstützt bedürftige Personen der ehemaligen Gemeinde Höngg (Quartierbewohner mit mind. 10 Jahren Wohnsitz). Ursprünglich auf die Bürgergemeinde Höngg beschränkt, heute geografisch auf das Quartier Höngg ausgeweitet. Ausschliesslich Einzelpersonen — keine NGO-Förderung.';
    cd.researchNotes = 'Lokale Wohlfahrtsstiftung für das Höngg-Quartier (Zürich). Fördert ausschliesslich Einzelpersonen (keine Institutionen). Zugang nur für langjährige Höngg-Bewohner:innen. Kein Förderpfad für Revamp-IT als Organisation. Revamp-IT könnte einzelne Klient:innen in Höngg auf diese Stiftung hinweisen, kann selbst aber nicht bewerben.';
    cd.themes = ['zuerich'];
  }, { newFitScore: 1 });

  // Stiftung Binelli und Ehrsam — funds social institutions; keep fit=4; add email
  await patch('stiftung-binelli-und-ehrsam-zuerich', (cd) => {
    cd.applicationMethod = 'email';
    cd.acceptsApplications = 'unknown';
    const c = (cd.contact as Record<string, unknown> | null) ?? {};
    c.email = 'stiftung@binelli-group.ch';
    // Beatrice Tremp = Assistentin der Stiftung
    cd.contact = c;
    cd.purposeSummary = 'Starthilfe für konkrete Projekte von: hilfsbedürftigen Gemeinden, sozialen Institutionen, hilfsbedürftigen Familien und Einzelpersonen. Verwaltet durch die Binelli Group, Zürich. Breiter sozialer Zweck — sozialen Institutionen (= NGOs wie Revamp-IT) sind explizit Förderberechtigt.';
    cd.researchNotes = 'Kontakt: stiftung@binelli-group.ch (Beatrice Tremp, Assistentin). Binelli Group ist ein Zürcher Familienunternehmen (Medizintechnik/Orthopädie). Der Stiftungszweck nennt explizit "soziale Institutionen" als Förderberechtigung — Revamp-IT fällt darunter. Kein öffentlicher Bewerbungsweg, kein publizierter Prozess. Cold-Outreach per E-Mail empfohlen. Förderhöhe unbekannt.';
    cd.themes = ['soziale-integration', 'zuerich'];
  }); // keep fit=4

  console.log('\n✅ Done.');
}
main().catch(console.error);
