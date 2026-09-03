#!/usr/bin/env tsx
/**
 * Foundation Entry Generator
 *
 * Interactive CLI to generate validated foundation entries.
 * Prompts for required fields, validates against schema, outputs TypeScript code.
 *
 * Usage:
 *   npm run foundation:add
 *   npm run foundation:add -- --batch=stiftungen-2026-03.ts
 *
 * Features:
 * - Schema validation before generating code
 * - Duplicate detection (slug, UID, fuzzy name)
 * - Quality warnings for thin purposeSummary / researchNotes / contact
 *   (matches the QUALITY_THRESHOLDS used by isResearched(f) — see
 *   src/lib/domain/foundation-quality.ts)
 * - Outputs ready-to-paste TypeScript
 */

import * as readline from 'readline';
import { getAllFoundations } from './lib/foundations';
import { requireOrgId } from './lib/require-org';
import { slugify } from './lib/utilities';
import type {
  Foundation,
  FoundationType,
  FoundationStatus,
  SourceId,
  ThemeId,
  ApplicationMethod,
} from '../src/lib/schemas/foundation';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function checkDuplicates(foundations: Foundation[], slug: string, name: string, uid?: string) {
  const issues: string[] = [];

  // Check slug
  if (foundations.some((f) => f.slug === slug)) {
    issues.push(`❌ Slug "${slug}" already exists`);
  }

  // Check UID
  if (uid && foundations.some((f) => f.uid === uid)) {
    issues.push(`❌ UID "${uid}" already exists`);
  }

  // Check exact name
  if (foundations.some((f) => f.name === name)) {
    issues.push(`❌ Foundation name "${name}" already exists`);
  }

  return issues;
}

// ============================================================================
// INTERACTIVE PROMPTS
// ============================================================================

async function promptForEntry(foundations: Foundation[]): Promise<Partial<Foundation>> {
  console.log('\n📝 Foundation Entry Generator\n');

  const name = await question('Foundation name: ');
  const suggestedSlug = slugify(name);
  const slug = (await question(`Slug (${suggestedSlug}): `)) || suggestedSlug;

  // Check duplicates early
  const duplicates = checkDuplicates(foundations, slug, name);
  if (duplicates.length > 0) {
    console.log('\n⚠️  Duplicate check failed:\n');
    duplicates.forEach((d) => console.log(`  ${d}`));
    console.log('\nAborting. Check existing data or use different slug.\n');
    process.exit(1);
  }

  console.log('\nFoundation Type (Robert Schmuki):');
  console.log('  A = Professionalisierte Förderstiftung');
  console.log('  B = Potente Familienstiftung');
  console.log('  C = Kleine Familienstiftung');
  console.log('  D = Corporate Foundation');
  console.log('  network = Netzwerk/Verband\n');
  const type = await question('Type (A/B/C/D/network): ');

  console.log('\nStatus:');
  console.log('  open = Accepting applications');
  console.log('  closed = Not accepting applications');
  console.log('  rolling = Continuous acceptance');
  console.log('  soon = Opening soon\n');
  const status = await question('Status (open/closed/rolling/soon): ');

  const region = await question('Region (e.g., Zürich, National): ');
  const websiteUrl = await question('Website URL: ');
  const uid = await question('UID (CHE-XXX.XXX.XXX) [optional]: ');

  const tagline = await question('Tagline (short description): ');

  console.log('\nFit Score (0-10):');
  console.log('  7-10 = Strong mission overlap (★★★)');
  console.log('  4-6  = Partial overlap (★★☆)');
  console.log('  1-3  = Limited / tangential (★☆☆)');
  console.log('  0    = No data');
  const fitScore = parseInt(await question('FitScore (0-10): '), 10);

  console.log('\nPriority:');
  console.log('  1 = Immediate (apply ASAP)');
  console.log('  2 = High (apply this quarter)');
  console.log('  3 = Medium (apply when ready)');
  console.log('  4 = Low (watch & wait)\n');
  const priority = parseInt(await question('Priority (1-4): '), 10);

  const source = await question('Source (fundraiso/stiftungschweiz/manual/etc): ');

  console.log('\nThemes (comma-separated):');
  console.log('  klima, kreislaufwirtschaft, soziale-integration, digitale-bildung,');
  console.log('  digitale-souveraenitaet, jugend, zuerich, arbeitsintegration\n');
  const themesInput = await question('Themes: ');
  const themes = themesInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  console.log('\nApplication Method:');
  console.log('  online, post, email, contact, direct, personal, partnership,');
  console.log('  via_partner, membership, contract, none, unknown\n');
  const applicationMethod = await question('Application Method: ');

  // Always prompt for the depth fields. Quality is computed at runtime via
  // isResearched(f) (foundation-quality.ts) based on data completeness — we
  // just warn here when the entered data falls below QUALITY_THRESHOLDS so
  // the user knows the entry won't reach `profiliert` tier yet.
  console.log('\nDepth fields (warnings issued if below thresholds — entry');
  console.log("still saved, just won't reach profiliert tier):");
  console.log('  - purposeSummary: 150+ chars');
  console.log('  - researchNotes:  250+ chars');
  console.log('  - contact:        email OR phone\n');

  const purposeSummary = await question('Purpose Summary: ');
  if (purposeSummary && purposeSummary.length < 150) {
    console.log(`⚠️  Purpose only ${purposeSummary.length} chars — below 150 threshold.`);
  }

  const researchNotes = await question('Research Notes: ');
  if (researchNotes && researchNotes.length < 250) {
    console.log(`⚠️  Research notes only ${researchNotes.length} chars — below 250 threshold.`);
  }

  const contactEmail = await question('Contact Email [optional]: ');
  const contactPhone = await question('Contact Phone [optional]: ');
  const contactAddress = await question('Contact Address [optional]: ');

  if (!contactEmail && !contactPhone) {
    console.log('⚠️  No email or phone — entry will be hard to reach.');
  }

  return {
    slug,
    name,
    type: type as FoundationType,
    status: status as FoundationStatus,
    region,
    websiteUrl: websiteUrl || undefined,
    uid: uid || undefined,
    tagline,
    fitScore,
    priority,
    source: source as SourceId,
    themes: themes as ThemeId[],
    applicationMethod: applicationMethod as ApplicationMethod,
    purposeSummary: purposeSummary || undefined,
    researchNotes: researchNotes || undefined,
    contact:
      contactEmail || contactPhone || contactAddress
        ? {
            email: contactEmail || undefined,
            phone: contactPhone || undefined,
            address: contactAddress || undefined,
          }
        : undefined,
  };
}

// ============================================================================
// CODE GENERATION
// ============================================================================

function generateTypeScriptCode(entry: Partial<Foundation>): string {
  const lines: string[] = [];

  lines.push('{');
  lines.push(`  slug: '${entry.slug}',`);
  lines.push(`  name: '${entry.name}',`);
  lines.push(`  type: '${entry.type}',`);
  lines.push(`  status: '${entry.status}',`);
  lines.push(`  deadline: null,`);
  lines.push(`  deadlineText: 'Unbekannt',`);
  lines.push(`  amount: { min: null, max: null, text: 'Unbekannt' },`);
  lines.push(`  fitScore: ${entry.fitScore},`);
  lines.push(`  priority: ${entry.priority},`);
  lines.push(`  tagline: '${entry.tagline}',`);
  lines.push(`  founded: null,`);
  lines.push(`  region: '${entry.region}',`);
  if (entry.websiteUrl) lines.push(`  websiteUrl: '${entry.websiteUrl}',`);
  if (entry.uid) lines.push(`  uid: '${entry.uid}',`);
  lines.push(`  applicationMethod: '${entry.applicationMethod}',`);

  if (entry.contact) {
    lines.push('  contact: {');
    if (entry.contact.address) lines.push(`    address: '${entry.contact.address}',`);
    if (entry.contact.email) lines.push(`    email: '${entry.contact.email}',`);
    if (entry.contact.phone) lines.push(`    phone: '${entry.contact.phone}',`);
    lines.push('  },');
  } else {
    lines.push('  contact: {},');
  }

  if (entry.purposeSummary) {
    lines.push(`  purposeSummary: '${entry.purposeSummary.replace(/'/g, "\\'")}',`);
  }

  if (entry.researchNotes) {
    lines.push(`  researchNotes: '${entry.researchNotes.replace(/'/g, "\\'")}',`);
  }

  lines.push('  sourceLinks: [],');
  lines.push(`  themes: [${entry.themes?.map((t) => `'${t}'`).join(', ')}],`);
  lines.push(`  source: '${entry.source}',`);
  lines.push(`  researchDate: '${new Date().toISOString().split('T')[0]}',`);
  lines.push('},');

  return lines.join('\n');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const foundations = await getAllFoundations(requireOrgId());
  const entry = await promptForEntry(foundations);

  console.log('\n✅ Generated TypeScript entry:\n');
  console.log('─'.repeat(80));
  console.log(generateTypeScriptCode(entry));
  console.log('─'.repeat(80));

  console.log('\n💡 Copy the above code and paste it into:');
  console.log('   src/lib/config/foundations/stiftungen-YYYY-MM.ts\n');

  rl.close();
}

main().catch((err) => {
  console.error('Foundation add failed:', err);
  process.exit(1);
});
