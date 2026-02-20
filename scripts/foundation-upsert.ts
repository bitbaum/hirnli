#!/usr/bin/env tsx
/**
 * Foundation Upsert — Non-interactive DB write from draft JSON files
 *
 * Reads one or more draft JSON files (ResearchDraft shape) and upserts
 * them into both tables:
 *   1. fundraising_foundation_registry — universal facts (org-agnostic)
 *   2. fundraising_foundations — org-specific analysis + merged configData
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

async function main() {
  const files = process.argv.slice(2);

  if (files.length === 0) {
    console.error('Usage: npx tsx scripts/foundation-upsert.ts <draft-file.json> [more-files...]');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  let success = 0;
  let errors = 0;

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
      deadlineText: 'Unbekannt',
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
    const hasContact = !!(a.contactInfo.email || a.contactInfo.phone);
    const hasWebsite = !!(draft.queueItem.websiteUrl);
    const hasPurpose = a.purposeSummary.length >= 150;
    const hasNotes = a.researchNotes.length >= 250;
    const hasThemes = a.themes.length >= 1;
    const needsResearch = !(hasContact && hasWebsite && hasPurpose && hasNotes && hasThemes);

    // --- Layer 2: Merged configData (backward compat for sync pipeline) ---
    const configData: Partial<Foundation> = {
      ...registryData,
      type: a.suggestedType,
      fit: a.suggestedFit as 1 | 2 | 3,
      priority: a.suggestedPriority as 1 | 2 | 3 | 4,
      tagline: a.purposeSummary.substring(0, 80),
      themes: a.themes,
      researchDate: today,
      needsResearch,
      researchNotes: a.researchNotes,
    };

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
          updated_at = ${now}
      `;

      // Upsert foundations (Layer 2 — merged view)
      await sql`
        INSERT INTO fundraising_foundations (
          id, name, website_url, contact_email, contact_phone,
          fit_score, priority, focus_areas, geographic_scope, organization_type,
          application_method, research_depth, research_date, data_quality,
          source, config_data, org_id, created_at, updated_at, archived
        ) VALUES (
          ${draft.slug}, ${draft.name}, ${draft.queueItem.websiteUrl || null},
          ${a.contactInfo.email || null}, ${a.contactInfo.phone || null},
          ${a.suggestedFit}, ${a.suggestedPriority}, ${JSON.stringify(a.themes)},
          ${esa.city || 'Schweiz'}, ${a.suggestedType === 'network' ? 'network' : 'foundation'},
          ${a.applicationMethod}, ${'standard'}, ${today}, ${4},
          ${'automated-research'}, ${JSON.stringify(configData)},
          ${'revamp-it'}, ${now}, ${now}, false
        )
        ON CONFLICT (id) DO UPDATE SET
          config_data = ${JSON.stringify(configData)},
          name = ${draft.name},
          fit_score = ${a.suggestedFit},
          priority = ${a.suggestedPriority},
          research_date = ${today},
          updated_at = ${now}
      `;

      console.log(`  ${draft.name} → DB (fit=${a.suggestedFit}, priority=${a.suggestedPriority})`);
      success++;
    } catch (err) {
      console.error(`  ${draft.name}: ${err instanceof Error ? err.message : err}`);
      errors++;
    }
  }

  console.log(`\nDone: ${success} upserted, ${errors} errors`);
  if (success > 0) {
    console.log('Next: npm run sync && npm run build');
  }
}

main();
