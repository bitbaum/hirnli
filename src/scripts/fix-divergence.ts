/**
 * Fix flat↔configData divergence
 *
 * Syncs flat DB columns FROM config_data (prefer config_data as source of truth).
 * Logs all changes for auditing.
 *
 * Run with: npx tsx src/scripts/fix-divergence.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

interface FoundationRow {
  id: string;
  name: string;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  fit_score: number | null;
  config_data: Record<string, unknown> | null;
}

interface DivergenceReport {
  foundationId: string;
  foundationName: string;
  changes: Array<{
    field: string;
    flatValue: unknown;
    configValue: unknown;
  }>;
}

async function fixDivergence() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log('\n📊 Scanning for flat↔configData divergences...\n');

  // Fetch all foundations
  const rows = await sql`
    SELECT 
      id, 
      name,
      website_url, 
      contact_email, 
      contact_phone, 
      fit_score,
      config_data
    FROM fundraising_foundations
    WHERE config_data IS NOT NULL
  `;

  console.log(`Found ${rows.length} foundations to check\n`);

  const divergences: DivergenceReport[] = [];
  let totalDivergent = 0;
  let totalChanges = 0;

  for (const row of rows) {
    const configData = row.config_data as Record<string, unknown>;
    const changes: DivergenceReport['changes'] = [];

    // Field mappings: flat DB column → config_data path
    const mappings = [
      {
        flatField: 'website_url',
        flatValue: row.website_url,
        configPath: 'websiteUrl',
        configValue: configData.websiteUrl as string | undefined,
      },
      {
        flatField: 'contact_email',
        flatValue: row.contact_email,
        configPath: 'contact.email',
        configValue: (configData.contact as Record<string, unknown> | undefined)?.email as string | undefined,
      },
      {
        flatField: 'contact_phone',
        flatValue: row.contact_phone,
        configPath: 'contact.phone',
        configValue: (configData.contact as Record<string, unknown> | undefined)?.phone as string | undefined,
      },
      {
        flatField: 'fit_score',
        flatValue: row.fit_score,
        configPath: 'fitScore',
        configValue: configData.fitScore as number | undefined,
      },
    ];

    // Check each mapping for divergence
    for (const mapping of mappings) {
      const flatVal = mapping.flatValue ?? null;
      const configVal = mapping.configValue ?? null;

      // Normalize for comparison (treat undefined/null as equivalent)
      if (flatVal !== configVal) {
        changes.push({
          field: mapping.flatField,
          flatValue: flatVal,
          configValue: configVal,
        });
      }
    }

    if (changes.length > 0) {
      divergences.push({
        foundationId: row.id,
        foundationName: row.name,
        changes,
      });
      totalDivergent++;
      totalChanges += changes.length;
    }
  }

  console.log(`\n✅ Scan complete:`);
  console.log(`   ${totalDivergent} foundations with divergences`);
  console.log(`   ${totalChanges} total field divergences\n`);

  if (divergences.length === 0) {
    console.log('🎉 No divergences found. Database is in sync!\n');
    return;
  }

  // Show sample divergences
  console.log('📋 Sample divergences (first 5):\n');
  for (const div of divergences.slice(0, 5)) {
    console.log(`   ${div.foundationName} (${div.foundationId}):`);
    for (const change of div.changes) {
      console.log(`      ${change.field}: "${change.flatValue}" → "${change.configValue}"`);
    }
    console.log('');
  }

  // Prompt for confirmation
  console.log(`\n⚠️  About to update ${totalChanges} fields across ${totalDivergent} foundations.`);
  console.log('   This will sync flat columns FROM config_data (config_data wins).\n');

  // In a real script, you'd add a confirmation prompt here
  // For now, proceeding automatically (you can add readline prompt if needed)

  console.log('🔧 Applying fixes...\n');

  let updated = 0;
  for (const div of divergences) {
    const configData = rows.find(r => r.id === div.foundationId)?.config_data as Record<string, unknown>;
    
    // Build update object
    const updates: Record<string, unknown> = {};
    
    for (const change of div.changes) {
      switch (change.field) {
        case 'website_url':
          updates.website_url = change.configValue;
          break;
        case 'contact_email':
          updates.contact_email = change.configValue;
          break;
        case 'contact_phone':
          updates.contact_phone = change.configValue;
          break;
        case 'fit_score':
          updates.fit_score = change.configValue;
          break;
      }
    }

    // Apply updates field by field (neon tagged template doesn't support dynamic SET)
    if (updates.website_url !== undefined) {
      await sql`UPDATE fundraising_foundations SET website_url = ${updates.website_url}, updated_at = NOW() WHERE id = ${div.foundationId}`;
    }
    if (updates.contact_email !== undefined) {
      await sql`UPDATE fundraising_foundations SET contact_email = ${updates.contact_email}, updated_at = NOW() WHERE id = ${div.foundationId}`;
    }
    if (updates.contact_phone !== undefined) {
      await sql`UPDATE fundraising_foundations SET contact_phone = ${updates.contact_phone}, updated_at = NOW() WHERE id = ${div.foundationId}`;
    }
    if (updates.fit_score !== undefined) {
      await sql`UPDATE fundraising_foundations SET fit_score = ${updates.fit_score}, updated_at = NOW() WHERE id = ${div.foundationId}`;
    }

    updated++;
    
    if (updated % 100 === 0) {
      console.log(`   Updated ${updated}/${divergences.length} foundations...`);
    }
  }

  console.log(`\n✅ Fixed ${totalChanges} divergences across ${updated} foundations\n`);

  // Write detailed log
  const logPath = 'divergence-fix-log.json';
  const log = {
    timestamp: new Date().toISOString(),
    totalFoundations: rows.length,
    divergentFoundations: totalDivergent,
    totalChanges,
    divergences,
  };

  const fs = await import('fs');
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
  console.log(`📝 Detailed log written to ${logPath}\n`);
}

fixDivergence().catch(console.error);
