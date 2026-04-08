#!/usr/bin/env tsx
/**
 * ⚠️  CAUTION: Direct DB writer — no provenance tracking.
 * Data written by this script has no source/confidence metadata.
 * ALWAYS run with --dry-run first and verify output manually.
 *
 * Deep Enrichment — Extract classification signals + structured data from foundation websites
 *
 * Fetches website content, sends to LLM with Robert Schmuki's classification criteria,
 * extracts: board members, capital, application process, past grantees, type signals.
 * Updates configData JSONB directly (SSOT).
 *
 * Usage:
 *   npx tsx scripts/deep-enrich.ts --limit=10 --dry-run
 *   npx tsx scripts/deep-enrich.ts --limit=50
 *   npx tsx scripts/deep-enrich.ts --slug=mercator
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { fetchRaw, stripHtml } from './lib/web-extract';
import { THEMES } from '../src/lib/config/foundations/metadata';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY not set');
  process.exit(1);
}

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] ?? '10');
const SLUG_FILTER = args.find(a => a.startsWith('--slug='))?.split('=')[1];

const themeList = Object.values(THEMES).map(t => `${t.id}: ${t.label}`).join(', ');

function buildPrompt(name: string, esaPurpose: string, websiteText: string): string {
  return `# Stiftungsanalyse: ${name}

Du analysierst eine Schweizer Stiftung anhand ihres Webauftritts und offiziellen Zwecks.
Extrahiere FAKTEN — keine Vermutungen. Wenn du etwas nicht findest, schreibe null.

## Offizieller Stiftungszweck (ESA/Zefix)
${esaPurpose || 'Nicht verfügbar'}

## Website-Inhalt
${websiteText.substring(0, 6000)}

## Aufgabe: Extrahiere folgende strukturierte Daten als JSON

{
  "boardMembers": [{"name": "Vorname Nachname", "role": "Präsident|Geschäftsführer|Mitglied|..."}],
  "capital": "CHF-Betrag als Text oder null",
  "annualBudget": "CHF-Betrag als Text oder null",
  "grantExpenditure": "Jährliche Fördersumme als Text oder null",
  "pastGrantees": ["Name geförderter Organisation 1", "..."],
  "applicationProcess": ["Schritt 1", "Schritt 2", "..."],
  "applicationMethod": "online|email|direct|partnership|post|contact|none|unknown",
  "hasApplicationForm": true/false,
  "hasAnnualReport": true/false,
  "hasGeschaeftsstelle": true/false,
  "acceptsExternalApplications": true/false,
  "criteria": {"nature": "Förderkriterien Natur/Umwelt oder null", "education": "Förderkriterien Bildung oder null"},
  "deadlineText": "Eingabefrist als Text oder null",
  "partners": ["Partnerorganisation 1", "..."],
  "sdgs": [1, 4, 8, 12],

  "typeSignals": {
    "boardSize": Anzahl Stiftungsräte (Zahl oder null),
    "hasFamilyName": true wenn Stiftungsname einen Familiennamen enthält,
    "isCompanyAffiliated": true wenn Firmenname erkennbar (UBS, Migros, Swisscom etc.),
    "hasGeschaeftsstelle": true wenn professionelle Geschäftsstelle mit Mitarbeitenden,
    "hasApplicationForm": true wenn Online-Gesuchsformular vorhanden,
    "hasAnnualReport": true wenn Jahresbericht/Tätigkeitsbericht veröffentlicht,
    "capitalRange": "small" (<5 Mio) | "medium" (5-50 Mio) | "large" (>50 Mio) | "unknown",
    "websiteQuality": "none" | "basic" | "professional"
  },

  "suggestedType": "A|B|C|D|network",
  "typeReasoning": "Kurze Begründung der Typ-Einschätzung anhand Robert Schmuki Kriterien:
    A = Potente, professionalisierte Förderstiftung (professionelle Geschäftsführung, Projektsteuerung, Analysen & Normen)
    B = Potente Familienstiftung mit Verwaltung (Stiftungsrat = Entscheidungsträger, persönliche Interessen, Family Office/Anwalt)
    C = Kleine bis mittlere Familienstiftung (3-5 Stiftungsräte, direkte Gesuchsannahme, wenig Ausschüttungspotential, emotional)
    D = Corporate Foundation (professionelle Geschäftsführung, Zweckpräzisierung, Norm-Prozesse, wenig Transparenz)
    network = Netzwerk/Verband (keine direkte Förderung)",

  "suggestedFit": 0-10,
  "fitReasoning": "Passung zu Revamp-IT (Kreislaufwirtschaft, Arbeitsintegration, digitale Bildung, Zürich)",
  "themes": ["${themeList.split(', ').map(t => t.split(':')[0]).join('", "')}"],
  "purposeSummary": "150+ Zeichen: Was fördert diese Stiftung konkret?",
  "researchNotes": "250+ Zeichen: Ehrliche Einschätzung der Passung zu Revamp-IT"
}

WICHTIG:
- NUR valides JSON zurückgeben, KEIN Kommentar
- Schweizer Schriftdeutsch (ss statt ß)
- boardMembers: NUR wenn auf Website oder in Handelsregister gefunden
- capital: NUR wenn explizit erwähnt
- pastGrantees: NUR wenn explizit erwähnt
- themes: NUR aus dieser Liste wählen: ${themeList}
- Wenn nichts gefunden → null oder leeres Array []`;
}

async function callGroq(prompt: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'Du bist ein Schweizer Stiftungsexperte. Antworte NUR mit validem JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('  Groq API error:', res.status, err.substring(0, 200));
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('  No JSON found in response');
      return null;
    }

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('  LLM error:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const html = await fetchRaw(url);
    const text = stripHtml(html);
    // Also try subpages for more context
    const subpages = ['/kontakt', '/contact', '/foerderung', '/stiftung', '/ueber-uns', '/about', '/gesuche', '/projekte'];
    let combined = text;

    for (const sub of subpages.slice(0, 3)) { // Try first 3 subpages
      try {
        const subUrl = new URL(sub, url).href;
        const subHtml = await fetchRaw(subUrl);
        combined += '\n\n--- ' + sub + ' ---\n' + stripHtml(subHtml);
      } catch {
        // Subpage doesn't exist, skip
      }
    }

    return combined.substring(0, 8000);
  } catch {
    return '';
  }
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  // Get enrichment targets
  let whereClause = `archived = false
    AND config_data->>'websiteUrl' IS NOT NULL
    AND config_data->>'websiteUrl' != ''
    AND (config_data->>'fitScore')::int >= 3`;

  if (SLUG_FILTER) {
    whereClause = `id = '${SLUG_FILTER}' AND archived = false`;
  }

  const rows = await sql`
    SELECT id, name,
      config_data->>'websiteUrl' as website,
      config_data->>'officialPurpose' as purpose,
      config_data->>'purposeSummary' as purpose_summary,
      config_data as config_data,
      jsonb_array_length(COALESCE(config_data->'boardMembers', '[]'::jsonb)) as board_count
    FROM fundraising_foundations
    WHERE ${sql.unsafe(whereClause)}
    ORDER BY (config_data->>'fitScore')::int DESC, (config_data->>'priority')::int ASC
    LIMIT ${LIMIT}
  `;

  console.log(`Deep enrichment: ${rows.length} foundations (${DRY_RUN ? 'DRY RUN' : 'LIVE'})`);
  console.log('');

  let enriched = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const slug = row.id as string;
    const name = row.name as string;
    const website = row.website as string;
    const purpose = (row.purpose || row.purpose_summary || '') as string;
    const cd = (row.config_data || {}) as Record<string, unknown>;

    console.log(`[${i + 1}/${rows.length}] ${name} (${website})`);

    // Fetch website
    const websiteText = await fetchWebsiteContent(website);
    if (!websiteText || websiteText.length < 100) {
      console.log('  ⚠ Website fetch failed or too short, skipping');
      skipped++;
      continue;
    }
    console.log(`  Fetched ${websiteText.length} chars`);

    // Call LLM
    const prompt = buildPrompt(name, purpose, websiteText);
    const result = await callGroq(prompt);

    if (!result) {
      errors++;
      continue;
    }

    console.log(`  Type: ${result.suggestedType} (${result.typeReasoning ? (result.typeReasoning as string).substring(0, 80) : 'no reasoning'})`);
    console.log(`  Fit: ${result.suggestedFit}, Board: ${(result.boardMembers as unknown[])?.length ?? 0}, Capital: ${result.capital || 'unknown'}`);

    if (DRY_RUN) {
      enriched++;
      continue;
    }

    // Merge into configData (SSOT)
    const updates: Record<string, unknown> = {};

    // Only update fields where we got new data (don't overwrite existing good data with nulls)
    if (result.boardMembers && (result.boardMembers as unknown[]).length > 0) {
      updates.boardMembers = result.boardMembers;
    }
    if (result.capital) updates.capital = result.capital;
    if (result.annualBudget) updates.annualBudget = result.annualBudget;
    if (result.grantExpenditure) updates.grantExpenditure = result.grantExpenditure;
    if (result.pastGrantees && (result.pastGrantees as unknown[]).length > 0) {
      updates.pastGrantees = result.pastGrantees;
    }
    if (result.applicationProcess && (result.applicationProcess as unknown[]).length > 0) {
      updates.applicationProcess = result.applicationProcess;
    }
    if (result.applicationMethod && result.applicationMethod !== 'unknown') {
      updates.applicationMethod = result.applicationMethod;
    }
    if (result.criteria) {
      const c = result.criteria as Record<string, unknown>;
      const clean: Record<string, string> = {};
      if (c.nature && c.nature !== 'null') clean.nature = c.nature as string;
      if (c.education && c.education !== 'null') clean.education = c.education as string;
      if (Object.keys(clean).length > 0) updates.criteria = clean;
    }
    if (result.deadlineText) updates.deadlineText = result.deadlineText;
    if (result.partners && (result.partners as unknown[]).length > 0) {
      updates.partners = result.partners;
    }
    if (result.sdgs && (result.sdgs as unknown[]).length > 0) {
      updates.sdgs = result.sdgs;
    }
    if (result.typeSignals) updates.typeSignals = result.typeSignals;
    if (result.hasApplicationForm != null) updates.hasApplicationForm = result.hasApplicationForm;
    if (result.hasAnnualReport != null) updates.hasAnnualReport = result.hasAnnualReport;
    if (result.hasGeschaeftsstelle != null) updates.hasGeschaeftsstelle = result.hasGeschaeftsstelle;
    if (result.acceptsExternalApplications != null) updates.acceptsExternalApplications = result.acceptsExternalApplications;

    // Type: only upgrade confidence, don't downgrade
    if (result.suggestedType) {
      updates.type = result.suggestedType;
      updates.typeSource = 'signal-derived';
      updates.typeReasoning = result.typeReasoning;
    }

    // FitScore: use GREATEST to never downgrade
    const newFit = typeof result.suggestedFit === 'number' ? result.suggestedFit : 0;
    const existingFit = (cd.fitScore as number) || 0;
    const finalFit = Math.max(existingFit, newFit);

    // Purpose/notes: only update if new version is longer
    const existingPurpose = (cd.purposeSummary as string) || '';
    const newPurpose = (result.purposeSummary as string) || '';
    if (newPurpose.length > existingPurpose.length) {
      updates.purposeSummary = newPurpose;
    }

    const existingNotes = (cd.researchNotes as string) || '';
    const newNotes = (result.researchNotes as string) || '';
    if (newNotes.length > existingNotes.length) {
      updates.researchNotes = newNotes;
    }

    // Themes: merge, don't replace
    const existingThemes = (cd.themes as string[]) || [];
    const newThemes = (result.themes as string[]) || [];
    const allThemes = [...new Set([...existingThemes, ...newThemes])].filter(
      t => Object.keys(THEMES).includes(t)
    );
    if (allThemes.length > 0) updates.themes = allThemes;

    // Apply updates to configData via jsonb merge
    const mergedConfig = { ...cd, ...updates, fitScore: finalFit };

    await sql`
      UPDATE fundraising_foundations
      SET
        config_data = ${JSON.stringify(mergedConfig)}::jsonb,
        fit_score = ${finalFit},
        research_depth = CASE
          WHEN research_depth = 'deep' THEN 'deep'
          ELSE 'standard'
        END,
        research_date = ${new Date().toISOString().split('T')[0]},
        updated_at = NOW()
      WHERE id = ${slug}
    `;

    enriched++;
    console.log(`  ✓ Updated (fit: ${existingFit}→${finalFit}, ${Object.keys(updates).length} fields)`);

    // Rate limit: Groq free tier = 12K TPM, each request ~3-4K tokens
    // Need ~20s between requests to stay under limit
    await new Promise(r => setTimeout(r, 20000));
  }

  console.log(`\nDone: ${enriched} enriched, ${skipped} skipped, ${errors} errors`);
  if (enriched > 0 && !DRY_RUN) {
    console.log('Next: npm run sync && npm run build');
  }
}

main().catch(console.error);
