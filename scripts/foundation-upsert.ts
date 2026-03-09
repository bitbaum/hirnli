#!/usr/bin/env tsx
/**
 * Foundation Upsert — Non-interactive DB write from draft JSON files
 *
 * Reads one or more draft JSON files (ResearchDraft shape) and upserts
 * them into both tables:
 *   1. fundraising_foundation_registry — universal facts (org-agnostic)
 *   2. fundraising_foundations — org-specific analysis + merged configData
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

type ResearchDepth = 'rapid' | 'standard' | 'deep';

function computeResearchDepth(opts: {
  hasRealWebsite: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  hasDeadline: boolean;
  hasGrantRange: boolean;
  hasAddress: boolean;
}): ResearchDepth {
  const { hasRealWebsite, hasEmail, hasPhone, hasDeadline, hasGrantRange } = opts;
  const hasContactDetail = hasEmail || hasPhone;

  if (hasRealWebsite && hasContactDetail && hasDeadline && hasGrantRange) return 'deep';
  if (hasRealWebsite && hasContactDetail) return 'standard';
  return 'rapid';
}

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
      hasRealWebsite, hasEmail, hasPhone, hasDeadline, hasGrantRange, hasAddress: !!a.contactInfo.address,
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
    // Priority from fitScore
    const isFunderFlag = a.isFunder;
    const isZurich = (esa.canton === 'ZH');
    let computedPriority: 1 | 2 | 3 | 4;
    if (fitScore >= 7 && isFunderFlag) computedPriority = 1;
    else if (fitScore >= 4 && (isFunderFlag || isZurich)) computedPriority = 2;
    else if (fitScore >= 4) computedPriority = 3;
    else computedPriority = 4;

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

    // Merge-safe config for UPDATE (existing entries) — omit fitScore/priority
    // so existing (potentially better) values in config_data are preserved.
    // SQL columns use GREATEST/LEAST separately.
    const { fitScore: _fs, priority: _p, fit: _f, ...mergeConfigData } = configData;

    try {
      // Upsert registry (Layer 1)
      await sql`
        INSERT INTO fundraising_foundation_registry (
          id, name, uid, official_purpose, website_url, region,
          contact_email, contact_phone, application_method, is_operative,
          source, registry_data, data_quality, last_verified,
          created_at, updated_at
        ) VALUES (
          ${draft.slug}, ${draft.name}, ${esa.uid || null},
          ${esa.purpose || null}, ${draft.queueItem.websiteUrl || null},
          ${esa.city || 'Schweiz'},
          ${a.contactInfo.email || null}, ${a.contactInfo.phone || null},
          ${a.applicationMethod}, ${!a.isFunder},
          ${'esa'}, ${JSON.stringify(registryData)}, ${4}, ${today},
          ${now}, ${now}
        )
        ON CONFLICT (id) DO UPDATE SET
          registry_data = ${JSON.stringify(registryData)},
          name = ${draft.name},
          uid = ${esa.uid || null},
          official_purpose = ${esa.purpose || null},
          website_url = COALESCE(NULLIF(${draft.queueItem.websiteUrl || null}, ''), fundraising_foundation_registry.website_url),
          contact_email = COALESCE(${a.contactInfo.email || null}, fundraising_foundation_registry.contact_email),
          contact_phone = COALESCE(${a.contactInfo.phone || null}, fundraising_foundation_registry.contact_phone),
          updated_at = ${now}
      `;

      // Upsert foundations (Layer 2 — merged view)
      await sql`
        INSERT INTO fundraising_foundations (
          id, name, website_url, contact_email, contact_phone,
          fit_score, priority, focus_areas, geographic_scope, organization_type,
          application_method, research_depth, research_date, data_quality,
          grant_range_min, grant_range_max, application_deadline,
          source, config_data, org_id, created_at, updated_at, archived
        ) VALUES (
          ${draft.slug}, ${draft.name}, ${draft.queueItem.websiteUrl || null},
          ${a.contactInfo.email || null}, ${a.contactInfo.phone || null},
          ${fitScore}, ${computedPriority}, ${JSON.stringify(a.themes)},
          ${esa.city || 'Schweiz'}, ${a.suggestedType === 'network' ? 'network' : 'foundation'},
          ${a.applicationMethod}, ${researchDepth}, ${today}, ${4},
          ${(a.grantRange.min as number) || null}, ${(a.grantRange.max as number) || null},
          ${zhaw?.einreichungstermin || null},
          ${'automated-research'}, ${JSON.stringify(configData)},
          ${'revamp-it'}, ${now}, ${now}, false
        )
        ON CONFLICT (id) DO UPDATE SET
          config_data = fundraising_foundations.config_data || ${JSON.stringify(mergeConfigData)}::jsonb,
          name = ${draft.name},
          website_url = COALESCE(NULLIF(${draft.queueItem.websiteUrl || null}, ''), fundraising_foundations.website_url),
          contact_email = COALESCE(${a.contactInfo.email || null}, fundraising_foundations.contact_email),
          contact_phone = COALESCE(${a.contactInfo.phone || null}, fundraising_foundations.contact_phone),
          fit_score = GREATEST(fundraising_foundations.fit_score, ${fitScore}),
          priority = LEAST(fundraising_foundations.priority, ${computedPriority}),
          focus_areas = ${JSON.stringify(a.themes)},
          research_depth = CASE
            WHEN fundraising_foundations.research_depth = 'deep' THEN 'deep'
            WHEN ${researchDepth} = 'deep' THEN 'deep'
            WHEN fundraising_foundations.research_depth = 'standard' THEN 'standard'
            WHEN ${researchDepth} = 'standard' THEN 'standard'
            ELSE ${researchDepth}
          END,
          research_date = ${today},
          grant_range_min = COALESCE(${(a.grantRange.min as number) || null}, fundraising_foundations.grant_range_min),
          grant_range_max = COALESCE(${(a.grantRange.max as number) || null}, fundraising_foundations.grant_range_max),
          application_deadline = COALESCE(${zhaw?.einreichungstermin || null}, fundraising_foundations.application_deadline),
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

main();
