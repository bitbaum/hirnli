#!/usr/bin/env tsx
/**
 * One-time migration: Extract universal fields from existing config_data
 * into the new fundraising_foundation_registry table.
 *
 * Data flow:
 *   fundraising_foundations.config_data
 *     → parse as Foundation
 *     → extract registrySchema fields → INSERT registry
 *     → SET org_id = 'revamp-it' on foundations row
 *
 * Safe to run multiple times (upserts via ON CONFLICT).
 * Zero data loss — existing config_data stays as-is.
 *
 * Usage: npx tsx src/scripts/migrate-registry.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { registrySchema } from '../lib/schemas/foundation';
import type { FoundationRegistry } from '../lib/schemas/foundation';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log('\nMigrating foundation data to registry...\n');

  // Read all foundations with config_data
  const rows = await sql`
    SELECT id, config_data
    FROM fundraising_foundations
    WHERE config_data IS NOT NULL
    ORDER BY id
  `;

  console.log(`  Found ${rows.length} foundations with config_data`);

  let migrated = 0;
  let skipped = 0;

  for (const row of rows) {
    const data = row.config_data as Record<string, unknown>;
    if (!data || typeof data !== 'object') {
      console.warn(`  Skipping ${row.id}: no config_data`);
      skipped++;
      continue;
    }

    // Extract registry fields from config_data
    const registryData: Record<string, unknown> = {
      slug: data.slug ?? row.id,
      name: data.name,
      uid: data.uid,
      websiteUrl: data.websiteUrl ?? '',
      applicationUrl: data.applicationUrl,
      region: data.region ?? '',
      contact: data.contact,
      founded: data.founded,
      capital: data.capital,
      annualBudget: data.annualBudget,
      totalBudget: data.totalBudget,
      grantExpenditure: data.grantExpenditure,
      supervisoryAuthority: data.supervisoryAuthority,
      boardMembers: data.boardMembers,
      memberships: data.memberships,
      acceptsApplications: data.acceptsApplications,
      applicationMethod: data.applicationMethod ?? 'unknown',
      applicationProcess: data.applicationProcess,
      isOperative: data.isOperative,
      isPartnership: data.isPartnership,
      isNetwork: data.isNetwork,
      requiresOpenSource: data.requiresOpenSource,
      requiresPartner: data.requiresPartner,
      requiresContract: data.requiresContract,
      status: data.status ?? 'rolling',
      deadline: data.deadline,
      deadlineText: data.deadlineText ?? 'Unbekannt',
      nextDeadline: data.nextDeadline,
      deadlines: data.deadlines,
      responseTime: data.responseTime,
      decisionCycle: data.decisionCycle,
      amount: data.amount ?? { min: null, max: null, text: 'Unbekannt' },
      criteria: data.criteria,
      smallProjects: data.smallProjects,
      pastGrantees: data.pastGrantees,
      partners: data.partners,
      events: data.events,
      members: data.members,
      stats2025: data.stats2025,
      sdgs: data.sdgs,
      sourceLinks: data.sourceLinks,
      source: data.source ?? 'manual',
      purposeSummary: data.purposeSummary,
    };

    // Validate against registrySchema (lenient — log but don't skip on failure)
    const parsed = registrySchema.safeParse(registryData);
    if (!parsed.success) {
      const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
      console.warn(`  Warning: ${row.id} registry validation: ${issues}`);
      // Still insert the raw data — the JSONB column stores it regardless
    }

    const registryObj = parsed.success ? parsed.data : registryData;
    const contact = data.contact as { email?: string; phone?: string } | undefined;

    try {
      await sql`
        INSERT INTO fundraising_foundation_registry (
          id, name, uid, website_url, region,
          contact_email, contact_phone,
          accepts_applications, application_method, is_operative,
          source, registry_data, data_quality, last_verified,
          created_at, updated_at
        ) VALUES (
          ${row.id},
          ${String(data.name || row.id)},
          ${(data.uid as string) || null},
          ${(data.websiteUrl as string) || null},
          ${(data.region as string) || null},
          ${contact?.email || null},
          ${contact?.phone || null},
          ${(data.acceptsApplications as string) || null},
          ${(data.applicationMethod as string) || null},
          ${data.isOperative != null ? Boolean(data.isOperative) : null},
          ${(data.source as string) || null},
          ${JSON.stringify(registryObj)},
          ${4},
          ${new Date().toISOString().split('T')[0]},
          ${new Date().toISOString()},
          ${new Date().toISOString()}
        )
        ON CONFLICT (id) DO UPDATE SET
          registry_data = ${JSON.stringify(registryObj)},
          name = ${String(data.name || row.id)},
          updated_at = ${new Date().toISOString()}
      `;
      migrated++;
    } catch (err) {
      console.error(`  Error migrating ${row.id}: ${err instanceof Error ? err.message : err}`);
      skipped++;
    }
  }

  // Set org_id on all existing foundations
  console.log('\n  Setting org_id = revamp-it on all foundations...');
  await sql`
    UPDATE fundraising_foundations
    SET org_id = 'revamp-it'
    WHERE org_id IS NULL OR org_id = 'revamp-it'
  `;

  // Verify
  const registryCount = await sql`SELECT count(*) as cnt FROM fundraising_foundation_registry`;
  const foundationCount = await sql`SELECT count(*) as cnt FROM fundraising_foundations`;

  console.log(`\nMigration complete:`);
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Registry rows: ${registryCount[0].cnt}`);
  console.log(`  Foundation rows: ${foundationCount[0].cnt}`);

  if (Number(registryCount[0].cnt) === Number(foundationCount[0].cnt)) {
    console.log(`  Counts match.`);
  } else {
    console.warn(`  Warning: counts differ — some foundations may lack config_data`);
  }
}

main().catch(console.error);
