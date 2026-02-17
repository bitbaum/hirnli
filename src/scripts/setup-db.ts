/**
 * Database Setup Script
 *
 * Creates all fundraising_* tables in Neon PostgreSQL.
 * Safe to run multiple times (uses CREATE TABLE IF NOT EXISTS).
 *
 * Run: npm run db:setup
 */

import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function setupDb() {
  console.log('🚀 Setting up fundraising_* tables in Neon...\n');

  await sql`
    CREATE TABLE IF NOT EXISTS fundraising_foundations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      website_url TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      fit_score INTEGER,
      priority INTEGER,
      focus_areas TEXT,
      geographic_scope TEXT,
      organization_type TEXT,
      grant_range_min INTEGER,
      grant_range_max INTEGER,
      typical_amount INTEGER,
      funding_model TEXT,
      application_method TEXT,
      application_deadline TEXT,
      decision_timeline TEXT,
      strategic_fit TEXT,
      application_notes TEXT,
      past_grantees TEXT,
      board_members TEXT,
      research_depth TEXT,
      research_date TEXT,
      research_file_path TEXT,
      data_quality INTEGER,
      source TEXT,
      created_at TEXT DEFAULT now()::TEXT,
      updated_at TEXT DEFAULT now()::TEXT,
      archived BOOLEAN DEFAULT false
    )
  `;
  console.log('✓ fundraising_foundations');

  await sql`
    CREATE TABLE IF NOT EXISTS fundraising_applications (
      id TEXT PRIMARY KEY,
      foundation_id TEXT NOT NULL REFERENCES fundraising_foundations(id),
      status TEXT NOT NULL,
      requested_amount INTEGER,
      project_focus TEXT,
      customization_notes TEXT,
      contact_date TEXT,
      submission_date TEXT,
      decision_expected TEXT,
      decision_date TEXT,
      awarded_amount INTEGER,
      funding_period TEXT,
      success_factors TEXT,
      rejection_reason TEXT,
      gesuch_version TEXT,
      documents_sent TEXT,
      assigned_to TEXT,
      priority_level INTEGER,
      created_at TEXT DEFAULT now()::TEXT,
      updated_at TEXT DEFAULT now()::TEXT
    )
  `;
  console.log('✓ fundraising_applications');

  await sql`
    CREATE TABLE IF NOT EXISTS fundraising_customization_rules (
      id TEXT PRIMARY KEY,
      foundation_id TEXT REFERENCES fundraising_foundations(id),
      condition_type TEXT NOT NULL,
      condition_value TEXT NOT NULL,
      action_type TEXT NOT NULL,
      action_value TEXT NOT NULL,
      rationale TEXT,
      priority INTEGER DEFAULT 50,
      active BOOLEAN DEFAULT true,
      created_at TEXT DEFAULT now()::TEXT
    )
  `;
  console.log('✓ fundraising_customization_rules');

  await sql`
    CREATE TABLE IF NOT EXISTS fundraising_activity_log (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      action_details TEXT,
      performed_by TEXT,
      timestamp TEXT DEFAULT now()::TEXT
    )
  `;
  console.log('✓ fundraising_activity_log');

  await sql`
    CREATE TABLE IF NOT EXISTS fundraising_contacts (
      id TEXT PRIMARY KEY,
      foundation_id TEXT NOT NULL REFERENCES fundraising_foundations(id),
      contact_type TEXT,
      contact_value TEXT NOT NULL,
      contact_name TEXT,
      contact_role TEXT,
      validated BOOLEAN DEFAULT false,
      validation_date TEXT,
      is_primary BOOLEAN DEFAULT false,
      notes TEXT,
      created_at TEXT DEFAULT now()::TEXT
    )
  `;
  console.log('✓ fundraising_contacts');

  console.log('\n✅ All tables created successfully.');
}

setupDb().catch((err) => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
