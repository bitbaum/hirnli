#!/usr/bin/env tsx
/**
 * ZHAW Ingest — Import Zürich cantonal foundations from ZHAW dataset
 *
 * Creates draft JSONs for ZHAW foundations not yet in DB. For entries
 * already in DB, enriches them with ZHAW's richer contact data (website,
 * email, phone, address, deadlines, zielgruppe).
 *
 * The ZHAW Soziale Arbeit directory has 184 Zürich foundations with
 * contact info rarely available in the ESA register.
 *
 * Usage:
 *   npx tsx scripts/zhaw-ingest.ts [--dry-run] [--limit N]
 *
 * Pipeline:
 *   1. Read ZHAW dataset (184 entries)
 *   2. Read existing slugs from the foundation DB
 *   3. For NEW entries: generate drafts with ZHAW's rich data
 *   4. For EXISTING entries: enrich with ZHAW contact data
 *   5. Write all to research/drafts/YYYY-MM-DD/
 *   6. Then run: npx tsx scripts/foundation-upsert.ts research/drafts/YYYY-MM-DD/
 */

import * as fs from 'fs';
import * as path from 'path';
import { sql } from './lib/db';
import { computeFitScore } from '../src/lib/domain/fit-scoring';
import {
  classifyThemes,
  scoreFunderOperator,
  classifyType,
  detectApplicationMethod,
  toSlug,
  THEME_LABELS,
} from './lib/theme-classifier';

// ============================================================================
// TYPES
// ============================================================================

interface ZhawFoundation {
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  purpose: string;
  zielgruppe: string;
  gesuchstellende: string;
  einreichungstermin: string;
  empfangsstelle: string;
  beilagen: string;
}

interface ZhawData {
  source: string;
  date: string;
  edition: string;
  scope: string;
  count: number;
  foundations: ZhawFoundation[];
}

// ============================================================================
// URL & CONTACT HELPERS
// ============================================================================

function normalizeUrl(url: string): string {
  if (!url) return '';
  url = url.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

function extractWebsite(zhaw: ZhawFoundation): string {
  if (zhaw.website) return normalizeUrl(zhaw.website);
  // Sometimes website is embedded in the purpose field
  const match = zhaw.purpose.match(/(?:www\.[a-z0-9-]+\.[a-z]{2,})/i);
  if (match) return normalizeUrl(match[0]);
  return '';
}

function extractEmail(zhaw: ZhawFoundation): string {
  if (zhaw.email) return zhaw.email.trim();
  // Sometimes email is embedded in the purpose field
  const match = zhaw.purpose.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (match) return match[0];
  return '';
}

// ============================================================================
// DRAFT GENERATION (NEW ZHAW ENTRIES)
// ============================================================================

function generatePurposeSummary(zhaw: ZhawFoundation): string {
  const parts: string[] = [];
  const cleanPurpose = zhaw.purpose.replace(/\s+/g, ' ').trim();

  // Remove embedded email/website from purpose text
  const purposeText = cleanPurpose
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
    .replace(/www\.[a-z0-9-]+\.[a-z]{2,}/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  parts.push(`${zhaw.name} (${zhaw.city}, Kanton Zürich): ${purposeText}`);

  if (zhaw.zielgruppe) {
    parts.push(`Zielgruppe: ${zhaw.zielgruppe}.`);
  }

  let summary = parts.join(' ');
  if (summary.length < 150) {
    summary += ` Die Stiftung hat Sitz in ${zhaw.zip} ${zhaw.city} und ist im ZHAW-Verzeichnis Fonds und Stiftungen (${zhaw.city}) gelistet.`;
  }

  return summary.substring(0, 600);
}

function generateResearchNotes(
  zhaw: ZhawFoundation,
  themes: string[],
  type: string,
  funder: number,
  operator: number,
): string {
  const parts: string[] = [];
  const purposeLower = zhaw.purpose.toLowerCase();

  // Key activities
  const activities: string[] = [];
  if (purposeLower.includes('förderung')) activities.push('Förderung');
  if (purposeLower.includes('forschung')) activities.push('Forschung');
  if (purposeLower.includes('unterstützung')) activities.push('Unterstützung');
  if (purposeLower.includes('ausbildung') || purposeLower.includes('bildung'))
    activities.push('Bildung');
  if (purposeLower.includes('projekt')) activities.push('Projektarbeit');
  if (purposeLower.includes('stipend')) activities.push('Stipendien');
  if (purposeLower.includes('sozial')) activities.push('Sozialarbeit');

  if (activities.length > 0) {
    parts.push(`${zhaw.name}: Tätigkeitsschwerpunkte — ${activities.slice(0, 4).join(', ')}.`);
  } else {
    parts.push(`${zhaw.name}: Stiftung mit Sitz in ${zhaw.city}.`);
  }

  // Funder/operator
  const isFunder = funder > operator;
  if (isFunder) {
    parts.push('Stiftungszweck enthält Förderbegriffe — wahrscheinlich Vergabestiftung.');
  } else if (operator >= 2) {
    parts.push('Stiftung scheint primär operativ tätig. Prüfen, ob externe Förderung möglich ist.');
  } else {
    parts.push('Keine klare Funder-/Operator-Zuordnung aus dem Stiftungszweck erkennbar.');
  }

  // Themes
  if (themes.length > 0) {
    parts.push(
      `Thematische Anknüpfungspunkte: ${themes.map((t) => THEME_LABELS[t] || t).join(', ')}.`,
    );
  } else {
    parts.push('Keine direkten thematischen Anknüpfungspunkte für Revamp-IT erkannt.');
  }

  // ZHAW-specific enrichment
  if (zhaw.zielgruppe) {
    parts.push(`Zielgruppe laut ZHAW-Verzeichnis: ${zhaw.zielgruppe}.`);
  }
  if (zhaw.gesuchstellende) {
    parts.push(`Gesuchstellende: ${zhaw.gesuchstellende}.`);
  }
  if (zhaw.einreichungstermin) {
    parts.push(`Einreichungstermin: ${zhaw.einreichungstermin}.`);
  }

  // Geographic
  parts.push(`Sitz: ${zhaw.address}, ${zhaw.zip} ${zhaw.city} (Kanton Zürich).`);

  // Type strategy
  const strategies: Record<string, string> = {
    A: 'Typ A (professionalisiert): Strukturiertes Gesuch mit Impact-Daten empfohlen.',
    B: 'Typ B (Familienstiftung): Persönlicher Kontakt und Beziehungsaufbau prioritär.',
    C: 'Typ C (kleine Stiftung): Direkter, emotionaler Ansatz. Kurzes Gesuch.',
    D: 'Typ D (Corporate): Alignment mit Unternehmenszielen darstellen.',
    network: 'Netzwerk/Verband: Mitgliedschaft oder Partnerschaft anstreben.',
  };
  if (strategies[type]) parts.push(strategies[type]);

  parts.push(
    'Aus ZHAW-Verzeichnis Fonds und Stiftungen (Kanton Zürich) importiert. Kontaktdaten aus ZHAW, ergänzende Recherche empfohlen.',
  );

  return parts.join(' ');
}

function generateDraft(zhaw: ZhawFoundation): object {
  const slug = toSlug(zhaw.name);
  const purposeLower = zhaw.purpose.toLowerCase();
  const nameLower = zhaw.name.toLowerCase();
  const { funder, operator } = scoreFunderOperator(zhaw.purpose);
  const themes = classifyThemes(purposeLower, nameLower);
  const type = classifyType(zhaw.purpose, zhaw.name, funder, operator);
  const applicationMethod = detectApplicationMethod(zhaw.purpose);
  const isFunder = funder > operator;

  const website = extractWebsite(zhaw);
  const email = extractEmail(zhaw);

  const { fitScore } = computeFitScore({
    themes,
    canton: 'ZH',
    city: zhaw.city,
    applicationMethod,
    isFunder,
  });
  const suggestedFit: 1 | 2 | 3 = fitScore >= 7 ? 3 : fitScore >= 4 ? 2 : 1;

  const purposeSummary = generatePurposeSummary(zhaw);
  const researchNotes = generateResearchNotes(zhaw, themes, type, funder, operator);

  return {
    slug,
    name: zhaw.name,
    timestamp: new Date().toISOString(),
    queueItem: {
      name: zhaw.name,
      slug,
      tier: 3,
      evScore: 0.2,
      websiteUrl: website,
      esaMatch: {
        uid: '',
        name: zhaw.name,
        purpose: zhaw.purpose,
        canton: 'ZH',
        city: zhaw.city,
        status: 'aktiv',
      },
      candidate: {
        name: zhaw.name,
        slug,
        location: `${zhaw.city}, ZH`,
        foundVia: ['zhaw-ingest'],
      },
    },
    analysis: {
      isFunder,
      funderConfidence: funder >= 3 ? 'high' : funder >= 2 ? 'medium' : 'low',
      reasoning: `Import aus ZHAW-Verzeichnis Fonds und Stiftungen (Kanton Zürich). Funder-Score: ${funder}, Operator-Score: ${operator}.`,
      themes,
      suggestedType: type,
      suggestedFit,
      suggestedPriority: fitScore >= 7 ? 2 : fitScore >= 4 ? 3 : 4,
      purposeSummary,
      researchNotes,
      applicationMethod,
      contactInfo: {
        email: email || undefined,
        phone: zhaw.phone || undefined,
        address: zhaw.address ? `${zhaw.address}, ${zhaw.zip} ${zhaw.city}` : undefined,
      },
      grantRange: {},
      warnings: ['ZHAW-Import — Kontaktdaten aus ZHAW-Verzeichnis, keine eigene Website-Recherche'],
    },
    _zhaw: {
      source: 'zhaw-soziale-arbeit-2024-25',
      einreichungstermin: zhaw.einreichungstermin || undefined,
      zielgruppe: zhaw.zielgruppe || undefined,
      gesuchstellende: zhaw.gesuchstellende || undefined,
      beilagen: zhaw.beilagen || undefined,
      website: website || undefined,
      email: email || undefined,
      phone: zhaw.phone || undefined,
    },
    _meta: {
      source: 'zhaw-ingest',
      importDate: new Date().toISOString().split('T')[0],
    },
  };
}

// ============================================================================
// ENRICHMENT (EXISTING ENTRIES)
// ============================================================================

function isZefixUrl(url: string): boolean {
  return url.includes('zefix.ch') || url.includes('uid.admin.ch');
}

function enrichExistingDraft(
  draftPath: string,
  zhaw: ZhawFoundation,
): { enriched: boolean; fields: string[] } {
  const raw = JSON.parse(fs.readFileSync(draftPath, 'utf-8'));
  const fields: string[] = [];

  const website = extractWebsite(zhaw);
  const email = extractEmail(zhaw);

  // Website — prefer ZHAW over Zefix placeholder
  if (website && (!raw.queueItem?.websiteUrl || isZefixUrl(raw.queueItem.websiteUrl))) {
    raw.queueItem.websiteUrl = website;
    fields.push('website');
  }

  // Email
  if (email && !raw.analysis?.contactInfo?.email) {
    if (!raw.analysis.contactInfo) raw.analysis.contactInfo = {};
    raw.analysis.contactInfo.email = email;
    fields.push('email');
  }

  // Phone
  if (zhaw.phone && !raw.analysis?.contactInfo?.phone) {
    if (!raw.analysis.contactInfo) raw.analysis.contactInfo = {};
    raw.analysis.contactInfo.phone = zhaw.phone;
    fields.push('phone');
  }

  // Address
  if (zhaw.address && zhaw.city) {
    const address = `${zhaw.address}, ${zhaw.zip} ${zhaw.city}`;
    if (!raw.analysis?.contactInfo?.address) {
      if (!raw.analysis.contactInfo) raw.analysis.contactInfo = {};
      raw.analysis.contactInfo.address = address;
      fields.push('address');
    }
  }

  // ZHAW metadata
  raw._zhaw = {
    source: 'zhaw-soziale-arbeit-2024-25',
    einreichungstermin: zhaw.einreichungstermin || undefined,
    zielgruppe: zhaw.zielgruppe || undefined,
    gesuchstellende: zhaw.gesuchstellende || undefined,
    beilagen: zhaw.beilagen || undefined,
    website: website || undefined,
    email: email || undefined,
    phone: zhaw.phone || undefined,
  };

  if (fields.length > 0) {
    fs.writeFileSync(draftPath, JSON.stringify(raw, null, 2));
    return { enriched: true, fields };
  }

  // Still write _zhaw metadata even if no contact fields changed
  fs.writeFileSync(draftPath, JSON.stringify(raw, null, 2));
  return { enriched: false, fields: [] };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = parseInt(args.find((a) => a.startsWith('--limit='))?.split('=')[1] || '0', 10);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ZHAW Ingest — Import Zürich cantonal foundations');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1. Read ZHAW data
  const zhawPath = path.join(process.cwd(), 'research', 'zhaw-fonds-stiftungen-2024-25.json');
  if (!fs.existsSync(zhawPath)) {
    console.error(`  ZHAW data not found: ${zhawPath}`);
    process.exit(1);
  }
  const zhawData: ZhawData = JSON.parse(fs.readFileSync(zhawPath, 'utf-8'));
  console.log(`\n  ZHAW foundations: ${zhawData.foundations.length}`);

  // 2. Read existing slugs from the foundation DB (id column IS the slug)
  const existingRows = await sql<{ id: string }>`SELECT id FROM fundraising_foundations`;
  const existingSlugs = new Set(existingRows.map((r) => r.id));
  console.log(`  Existing in DB: ${existingSlugs.size} slugs`);

  // 3. Prepare output directory
  const today = new Date().toISOString().split('T')[0];
  const outDir = path.join(process.cwd(), 'research', 'drafts', today);
  if (!dryRun) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 4. Process ZHAW foundations
  let newDrafts = 0;
  let enriched = 0;
  let skippedExists = 0;
  let withThemes = 0;
  let withoutThemes = 0;

  const toProcess = limitArg > 0 ? zhawData.foundations.slice(0, limitArg) : zhawData.foundations;
  if (limitArg > 0) console.log(`  Limit applied: processing ${toProcess.length}`);
  if (dryRun) console.log('  DRY RUN — no files will be written');

  for (const zhaw of toProcess) {
    const slug = toSlug(zhaw.name);
    const draftPath = path.join(outDir, `${slug}.json`);

    if (existingSlugs.has(slug)) {
      // Existing entry — try to enrich with ZHAW data
      if (!dryRun && fs.existsSync(draftPath)) {
        const result = enrichExistingDraft(draftPath, zhaw);
        if (result.enriched) {
          enriched++;
        }
      } else if (!dryRun) {
        // Draft doesn't exist in today's batch but is in DB — create enriched draft
        // so upsert can update the DB entry with ZHAW contact data
        const draft = generateDraft(zhaw);
        fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2));
        enriched++;
      }
      skippedExists++;
      continue;
    }

    // New entry — generate fresh draft
    const draft = generateDraft(zhaw);
    const themes = (draft as { analysis: { themes: string[] } }).analysis.themes;
    if (themes.length > 0) withThemes++;
    else withoutThemes++;

    if (!dryRun) {
      fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2));
    }
    newDrafts++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  New drafts created:  ${newDrafts}`);
  console.log(`  Existing enriched:   ${enriched}`);
  console.log(`  Already in DB:       ${skippedExists}`);
  console.log(`  With themes:         ${withThemes}`);
  console.log(`  Without themes:      ${withoutThemes}`);
  if (!dryRun && (newDrafts > 0 || enriched > 0)) {
    console.log(`  Output: ${outDir}/`);
    console.log(`\n  Next steps:`);
    console.log(`    npx tsx scripts/foundation-upsert.ts ${outDir}/`);
  }
  console.log('  Done!\n');
}

main().catch((err) => {
  console.error('ZHAW ingest failed:', err);
  process.exit(1);
});
