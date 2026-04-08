#!/usr/bin/env tsx
/**
 * Foundation Upsert — Non-interactive DB write from draft JSON files
 *
 * Reads one or more draft JSON files (ResearchDraft shape) and upserts
 * them into fundraising_foundations (configData JSONB is SSOT).
 *
 * Computes researchDepth from data completeness:
 *   'rapid'    = ESA-only (no real website, no email/phone, mechanical summary)
 *   'standard' = has website + some contact info
 *   'deep'     = has website + email/phone + application deadline + grant range
 *
 * Called by Claude Code after analysis — not meant for manual use.
 *
 * Usage:
 *   npx tsx scripts/foundation-upsert.ts research/drafts/2026-02-18/slug.json
 *   npx tsx scripts/foundation-upsert.ts research/drafts/2026-02-18/*.json
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { neon } from '@neondatabase/serverless';
import { ResearchDraftSchema } from './lib/research-types';
import type { Foundation, FoundationRegistry } from '../src/lib/schemas/foundation';
import { computeFitScore, fitScoreToDisplay } from '../src/lib/domain/fit-scoring';

// ============================================================================
// RESEARCH DEPTH — Computed from data completeness
// ============================================================================

import { computeResearchDepth, type ResearchDepth } from './lib/utilities';

function isZefixUrl(url: string): boolean {
  return url.includes('zefix.ch') || url.includes('uid.admin.ch');
}

// FIT SCORE — Centralized in src/lib/domain/fit-scoring.ts

async function main() {
  let files = process.argv.slice(2);

  // Support directory argument: expand to all .json files in it
  if (files.length === 1 && fs.existsSync(files[0]) && fs.statSync(files[0]).isDirectory()) {
    const dir = path.resolve(files[0]);
    files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => path.join(dir, f));
    console.log(`  Expanding directory: ${files.length} JSON files`);
  }

  if (files.length === 0) {
    console.error('Usage: npx tsx scripts/foundation-upsert.ts <draft-file.json> [dir/] [more-files...]');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  let success = 0;
  let errors = 0;
  const depthCounts: Record<ResearchDepth, number> = { rapid: 0, standard: 0, deep: 0 };

  for (const file of files) {
    const fullPath = path.resolve(file);
    if (!fs.existsSync(fullPath)) {
      console.error(`  Not found: ${file}`);
      errors++;
      continue;
    }

    const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    const parsed = ResearchDraftSchema.safeParse(raw);

    if (!parsed.success) {
      console.error(`  Invalid draft: ${file} — ${parsed.error.issues[0]?.message}`);
      errors++;
      continue;
    }

    const draft = parsed.data;
    const a = draft.analysis;
    const esa = draft.queueItem.esaMatch;
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // Read ZHAW metadata if present (from zhaw-crossref.ts)
    const zhaw = (raw as Record<string, unknown>)._zhaw as {
      einreichungstermin?: string;
      zielgruppe?: string;
    } | undefined;

    // --- Compute deadline text ---
    const deadlineText = zhaw?.einreichungstermin || 'Unbekannt';

    // --- Layer 1: Registry data (universal facts) ---
    const registryData: Partial<FoundationRegistry> = {
      slug: draft.slug,
      name: draft.name,
      uid: esa.uid,
      websiteUrl: draft.queueItem.websiteUrl || '',
      officialPurpose: esa.purpose || undefined,
      region: esa.city || 'Schweiz',
      contact: {
        email: a.contactInfo.email,
        phone: a.contactInfo.phone,
        address: a.contactInfo.address,
      },
      acceptsApplications: undefined,
      applicationMethod: a.applicationMethod === 'invitation'
        ? 'contact'
        : a.applicationMethod as FoundationRegistry['applicationMethod'],
      isOperative: !a.isFunder,
      status: 'rolling',
      deadlineText,
      amount: {
        min: a.grantRange.min ?? null,
        max: a.grantRange.max ?? null,
        text: a.grantRange.typical
          ? `ca. CHF ${a.grantRange.typical.toLocaleString('de-CH')}`
          : 'Unbekannt',
      },
      source: 'esa' as const,
      purposeSummary: a.purposeSummary,
      sourceLinks: [],
    };

    // --- Quality gate: compute needsResearch ---
    // Note: hasWebsite intentionally includes Zefix/registry URLs — having the entry
    // in a public register is sufficient for the quality gate. The researchDepth check
    // is stricter (requires real website + email/phone for 'standard').
    const hasContact = !!(a.contactInfo.email || a.contactInfo.phone || a.contactInfo.address);
    const hasWebsite = !!(draft.queueItem.websiteUrl);
    const hasPurpose = a.purposeSummary.length >= 150;
    const hasNotes = a.researchNotes.length >= 250;
    const hasThemes = a.themes.length >= 1;
    const needsResearch = !(hasContact && hasWebsite && hasPurpose && hasNotes && hasThemes);

    // --- Compute researchDepth ---
    const hasRealWebsite = hasWebsite && !isZefixUrl(draft.queueItem.websiteUrl || '');
    const hasEmail = !!a.contactInfo.email;
    const hasPhone = !!a.contactInfo.phone;
    const hasDeadline = !!(zhaw?.einreichungstermin && zhaw.einreichungstermin !== 'Unbekannt');
    const hasGrantRange = !!(a.grantRange.min || a.grantRange.max);
    const researchDepth = computeResearchDepth({
      hasRealWebsite, hasEmail, hasPhone, hasDeadline, hasGrantRange,
    });
    depthCounts[researchDepth]++;

    // --- Compute fitScore 0-10 ---
    const { fitScore } = computeFitScore({
      themes: a.themes,
      canton: esa.canton || '',
      city: esa.city || '',
      applicationMethod: a.applicationMethod,
      isFunder: a.isFunder,
    });
    // Map 0-10 → display 0-3 (gated: rapid tier → fit=0)
    const fitDisplay = fitScoreToDisplay(fitScore, researchDepth === 'rapid');
    // Priority from fitScore — rapid depth → always P4
    const isFunderFlag = a.isFunder;
    const isZurich = (esa.canton === 'ZH');
    let computedPriority: 1 | 2 | 3 | 4;
    if (researchDepth === 'rapid') {
      computedPriority = 4;
    } else if (fitScore >= 7 && isFunderFlag) {
      computedPriority = 1;
    } else if (fitScore >= 4 && (isFunderFlag || isZurich)) {
      computedPriority = 2;
    } else if (fitScore >= 4) {
      computedPriority = 3;
    } else {
      computedPriority = 4;
    }

    // --- Layer 2: Merged configData (backward compat for sync pipeline) ---
    // Full config for INSERT (new entries)
    const configData: Partial<Foundation> & { researchDepth: ResearchDepth; fitScore: number } = {
      ...registryData,
      type: a.suggestedType,
      fit: fitDisplay as 0 | 1 | 2 | 3,
      fitScore,
      priority: computedPriority,
      tagline: a.purposeSummary.substring(0, 80),
      themes: a.themes,
      researchDate: today,
      needsResearch,
      researchNotes: a.researchNotes,
      researchDepth,
    };

    // NOTE: PostgreSQL || does shallow merge — nested objects (contact, amount)
    // are replaced, not deep-merged. This is acceptable because new research data
    // is typically more complete than existing. If a nested field was previously
    // set but not found in new research, it will be overwritten.

    try {
      // Upsert foundations (configData JSONB is SSOT)
      // configData is SSOT: on UPDATE, merge all fields into JSONB first,
      // then apply GREATEST/LEAST for fitScore/priority within JSONB,
      // and derive flat columns from the resulting JSONB values.
      await sql`
        INSERT INTO fundraising_foundations (
          id, name,
          fit_score, priority,
          research_depth, research_date,
          source, config_data, org_id, created_at, updated_at, archived
        ) VALUES (
          ${draft.slug}, ${draft.name},
          ${fitScore}, ${computedPriority},
          ${researchDepth}, ${today},
          ${'automated-research'}, ${JSON.stringify(configData)},
          ${'revamp-it'}, ${now}, ${now}, false
        )
        ON CONFLICT (id) DO UPDATE SET
          config_data = jsonb_set(
            jsonb_set(
              fundraising_foundations.config_data || ${JSON.stringify(configData)}::jsonb,
              '{fitScore}',
              to_jsonb(${fitScore})
            ),
            '{priority}',
            to_jsonb(${computedPriority})
          ),
          name = ${draft.name},
          fit_score = ${fitScore},
          priority = ${computedPriority},
          research_depth = CASE
            WHEN fundraising_foundations.research_depth = 'deep' THEN 'deep'
            WHEN ${researchDepth} = 'deep' THEN 'deep'
            WHEN fundraising_foundations.research_depth = 'standard' THEN 'standard'
            WHEN ${researchDepth} = 'standard' THEN 'standard'
            ELSE ${researchDepth}
          END,
          research_date = ${today},
          updated_at = ${now}
      `;

      console.log(`  ${draft.name} → DB (newFit=${fitScore}, newP=${computedPriority}, depth=${researchDepth}, needsResearch=${needsResearch})`);
      success++;
    } catch (err) {
      console.error(`  ${draft.name}: ${err instanceof Error ? err.message : err}`);
      errors++;
    }
  }

  console.log(`\nDone: ${success} upserted, ${errors} errors`);
  console.log(`  Research depth: rapid=${depthCounts.rapid}, standard=${depthCounts.standard}, deep=${depthCounts.deep}`);
  if (success > 0) {
    console.log('Next: npm run sync && npm run build');
  }
}

main().catch((err) => {
  console.error('Upsert failed:', err);
  process.exit(1);
});
