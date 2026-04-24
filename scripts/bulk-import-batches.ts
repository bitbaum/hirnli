/**
 * Bulk import all untracked batch research files.
 * The import script is idempotent — already-imported records are no-ops.
 * Runs batches 39-94 (claude-agent results from 2026-04-22).
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { isRegistryUrl } from '../src/lib/config/registry-domains';
import { RESEARCH_METHOD_RANK as _RESEARCH_METHOD_RANK } from '../src/lib/schemas/foundation';
const RESEARCH_METHOD_RANK = _RESEARCH_METHOD_RANK as Record<string, number>;

const sql = neon(process.env.DATABASE_URL!);
const DRY_RUN = process.argv.includes('--dry-run');

const RESULTS_DIR = resolve(__dirname, '../research/chatgpt-results');

async function importFile(file: string): Promise<{ written: number; skipped: number; notFound: number }> {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  const records: Record<string, unknown>[] = Array.isArray(raw) ? raw : raw.items ?? [];
  let written = 0, skipped = 0, notFound = 0;

  for (const rec of records) {
    const slug = rec.slug as string;
    if (!slug) continue;

    const [row] = await sql`SELECT id, config_data FROM fundraising_foundations WHERE id = ${slug}`;
    if (!row) { notFound++; continue; }

    const cd = row.config_data as Record<string, unknown>;
    const fields: string[] = [];

    // Never overwrite existing non-empty values (except researchDepth upgrade)
    const setIfEmpty = (key: string, val: unknown) => {
      if (val == null || val === '') return;
      if (cd[key] == null || cd[key] === '') { cd[key] = val; fields.push(key); }
    };

    // Website URL (skip registry/directory URLs)
    if (rec.websiteUrl || rec.website) {
      const url = (rec.websiteUrl ?? rec.website) as string;
      if (url && !isRegistryUrl(url)) {
        if (!cd.websiteUrl || cd.websiteUrl === '') {
          cd.websiteUrl = url;
          fields.push('websiteUrl');
          // Upgrade researchDepth if still rapid
          if ((cd.researchDepth as string) === 'rapid') {
            cd.researchDepth = 'standard';
            fields.push('researchDepth');
          }
        }
      }
    }

    // Application URL
    if (rec.applicationUrl) setIfEmpty('applicationUrl', rec.applicationUrl);

    // Contact (nested)
    const contact = (cd.contact as Record<string, unknown> | null) ?? {};
    let contactChanged = false;
    if (rec.email && !contact.email) { contact.email = rec.email; contactChanged = true; }
    if (rec.phone && !contact.phone) { contact.phone = rec.phone; contactChanged = true; }
    if (rec.address && !contact.address) { contact.address = rec.address; contactChanged = true; }
    if (contactChanged) { cd.contact = contact; fields.push('contact'); }

    // About
    setIfEmpty('purposeSummary', rec.purposeSummary);
    setIfEmpty('researchNotes', rec.researchNotes);
    setIfEmpty('founded', rec.founded);
    setIfEmpty('capital', rec.capital);
    setIfEmpty('annualBudget', rec.annualBudget);
    setIfEmpty('grantExpenditure', rec.grantExpenditure);

    // Application info
    if (rec.applicationMethod && !cd.applicationMethod) {
      cd.applicationMethod = rec.applicationMethod; fields.push('applicationMethod');
    }
    if (rec.acceptsApplications && !cd.acceptsApplications) {
      cd.acceptsApplications = rec.acceptsApplications; fields.push('acceptsApplications');
    }
    setIfEmpty('deadlineText', rec.deadlineText);
    setIfEmpty('applicationProcess', rec.applicationProcess);

    // Amount
    const amount = (cd.amount as Record<string, unknown> | null) ?? {};
    let amountChanged = false;
    if (rec.amountMin != null && !amount.min) { amount.min = rec.amountMin; amountChanged = true; }
    if (rec.amountMax != null && !amount.max) { amount.max = rec.amountMax; amountChanged = true; }
    if (rec.amountText && !amount.text) { amount.text = rec.amountText; amountChanged = true; }
    if (amountChanged) { cd.amount = amount; fields.push('amount'); }

    // Themes — append new ones, never shrink
    if (Array.isArray(rec.themes) && rec.themes.length > 0) {
      const existing = new Set((cd.themes as string[] | null) ?? []);
      const newThemes = (rec.themes as string[]).filter(t => !existing.has(t));
      if (newThemes.length > 0) {
        cd.themes = [...existing, ...newThemes];
        fields.push('themes');
      }
    }

    // fitScore — only upgrade, never downgrade
    if (typeof rec.fitScore === 'number' && rec.fitScore > ((cd.fitScore as number) ?? 0)) {
      cd.fitScore = rec.fitScore; fields.push('fitScore');
    }

    // Mark research method (upgrade only)
    const newMethod = 'claude-agent';
    const existingMethod = (cd.applicationResearchMethod as string) ?? 'unknown';
    const existingRank = RESEARCH_METHOD_RANK[existingMethod] ?? 0;
    const newRank = RESEARCH_METHOD_RANK[newMethod] ?? 0;
    if (newRank >= existingRank) {
      cd.applicationResearchMethod = newMethod;
      fields.push('applicationResearchMethod');
    }

    if (fields.length === 0) { skipped++; continue; }
    if (DRY_RUN) { written++; continue; }

    await sql`
      UPDATE fundraising_foundations
      SET config_data = ${JSON.stringify(cd) as unknown}::jsonb, updated_at = NOW()
      WHERE id = ${slug}
    `;
    written++;
  }

  return { written, skipped, notFound };
}

async function main() {
  const files = readdirSync(RESULTS_DIR)
    .filter(f => f.match(/^batch\d+-claude-agent-2026-04-22\.json$/))
    .sort()
    .map(f => resolve(RESULTS_DIR, f));

  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Processing ${files.length} claude-agent batch files...\n`);

  let totalWritten = 0, totalSkipped = 0, totalNotFound = 0;
  for (const file of files) {
    const { written, skipped, notFound } = await importFile(file);
    totalWritten += written;
    totalSkipped += skipped;
    totalNotFound += notFound;
    if (written > 0) process.stdout.write(`  ✅ ${file.split('/').pop()} — ${written} written, ${skipped} skipped\n`);
  }

  console.log(`\nTotal: ${totalWritten} written, ${totalSkipped} skipped, ${totalNotFound} not found`);
  if (!DRY_RUN && totalWritten > 0) console.log('\nRun npm run sync to regenerate stiftungen-generated.ts');
}
main().catch(console.error);
