/**
 * Migration Script: TypeScript + JSON → SQLite Database
 *
 * Imports foundation data from:
 * 1. TypeScript config files (107 foundations)
 * 2. JSON research files (82+ foundations)
 *
 * Run with: npx tsx src/scripts/migrate-to-database.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { db } from '../lib/db/client';
import { foundations } from '../lib/db/schema';
import { STIFTUNGEN_DATA } from '../lib/config/foundations';
import { nanoid } from 'nanoid';

// Types for JSON imports
interface JsonFoundation {
  name: string;
  websiteUrl?: string;
  location?: string;
  fitScore?: number;
  fitRationale?: string;
  focusAreas?: string[];
  grantRange?: string;
  grantRangeMin?: number;
  grantRangeMax?: number;
  applicationMethod?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  strategicFit?: string;
  deadline?: string;
  decisionTimeline?: string;
  pastGrantees?: string[];
  boardMembers?: Array<{ name: string; role: string }>;
  source?: string;
  priority?: number;
}

interface JsonBatch {
  foundations?: JsonFoundation[];
}

/**
 * Generate URL-safe slug from foundation name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    // Replace umlauts
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/à/g, 'a')
    .replace(/é/g, 'e')
    .replace(/è/g, 'e')
    // Remove special characters
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract min/max from grant range text
 */
function parseGrantRange(text?: string): { min: number | null; max: number | null } {
  if (!text) return { min: null, max: null };

  // Match patterns like "CHF 10'000-50'000" or "CHF 10000-50000"
  const rangeMatch = text.match(/(\d[\d']*)\s*-\s*(\d[\d']*)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1].replace(/'/g, ''));
    const max = parseInt(rangeMatch[2].replace(/'/g, ''));
    return { min, max };
  }

  // Match single amount like "CHF 50'000"
  const singleMatch = text.match(/(\d[\d']*)/);
  if (singleMatch) {
    const amount = parseInt(singleMatch[1].replace(/'/g, ''));
    return { min: amount, max: amount };
  }

  return { min: null, max: null };
}

/**
 * Migrate TypeScript foundations to database
 */
async function migrateTypescriptFoundations() {
  console.log('\n📦 Migrating TypeScript foundations...\n');

  const transformed = STIFTUNGEN_DATA.map((f) => {
    const { min, max } = parseGrantRange(f.amount.text);

    return {
      id: f.slug,
      name: f.name,
      websiteUrl: f.websiteUrl,
      contactEmail: f.contact?.email || null,
      contactPhone: f.contact?.phone || null,

      // Classification
      fitScore: f.fit, // 1-3 scale in TypeScript → will be 0-10 in database
      priority: f.priority,
      focusAreas: JSON.stringify(f.themes), // Convert ThemeId[] to JSON
      geographicScope: f.region,
      organizationType: f.type === 'network' ? 'network' : 'foundation',

      // Funding details
      grantRangeMin: min,
      grantRangeMax: max,
      typicalAmount: null,
      fundingModel: f.isPartnership ? 'partnership' : 'project',
      applicationMethod: f.applicationMethod,
      applicationDeadline: f.deadline || null,
      decisionTimeline: f.responseTime || null,

      // Strategic data
      strategicFit: f.researchNotes || null,
      applicationNotes: f.applicationProcess ? f.applicationProcess.join('\n\n') : null,
      pastGrantees: f.pastGrantees ? JSON.stringify(f.pastGrantees) : null,
      boardMembers: f.boardMembers ? JSON.stringify(f.boardMembers) : null,

      // Research metadata
      researchDepth: f.needsResearch ? 'rapid' : 'standard',
      researchDate: f.researchDate,
      researchFilePath: null,
      dataQuality: f.needsResearch ? 3 : 4, // 1-5 scale

      // Admin
      source: f.source || 'typescript-legacy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false,
    };
  });

  await db.insert(foundations).values(transformed);
  console.log(`✓ Migrated ${transformed.length} TypeScript foundations`);

  return transformed.map(f => f.name); // Return names for deduplication
}

/**
 * Migrate JSON foundations to database
 */
async function migrateJsonFoundations(existingNames: string[]) {
  console.log('\n📦 Migrating JSON research files...\n');

  const jsonFiles = [
    '/home/g/foundation-rapid-assessment-batch-1.json',
    '/home/g/foundation-rapid-assessment-batch-2.json',
    '/home/g/foundation-rapid-assessment-batch-3.json',
    '/home/g/foundation-rapid-assessment-batch-4.json',
    '/home/g/foundation-rapid-assessment-batch-5.json',
    '/home/g/foundations-consolidated-targeted-2026-02-12.json',
  ];

  let totalImported = 0;

  for (const filePath of jsonFiles) {
    try {
      const absolutePath = resolve(filePath);
      const fileContent = readFileSync(absolutePath, 'utf-8');
      const parsed = JSON.parse(fileContent);

      // Handle both array and { foundations: [] } formats
      const batch: JsonFoundation[] = Array.isArray(parsed) ? parsed : parsed.foundations || [];

      // Filter out duplicates (already in TypeScript data)
      const newFoundations = batch.filter(f => !existingNames.includes(f.name));

      if (newFoundations.length === 0) {
        console.log(`⊘ ${filePath} — all foundations already exist (skipped)`);
        continue;
      }

      const transformed = newFoundations.map(f => {
        const { min, max } = parseGrantRange(f.grantRange);

        return {
          id: generateSlug(f.name),
          name: f.name,
          websiteUrl: f.websiteUrl || null,
          contactEmail: f.contactEmail || null,
          contactPhone: f.contactPhone || null,

          // Classification
          fitScore: f.fitScore || null,
          priority: f.priority || null,
          focusAreas: f.focusAreas ? JSON.stringify(f.focusAreas) : null,
          geographicScope: f.location || null,
          organizationType: 'foundation',

          // Funding details
          grantRangeMin: f.grantRangeMin || min,
          grantRangeMax: f.grantRangeMax || max,
          typicalAmount: null,
          fundingModel: null,
          applicationMethod: f.applicationMethod || null,
          applicationDeadline: f.deadline || null,
          decisionTimeline: f.decisionTimeline || null,

          // Strategic data
          strategicFit: f.strategicFit || f.fitRationale || null,
          applicationNotes: f.notes || null,
          pastGrantees: f.pastGrantees ? JSON.stringify(f.pastGrantees) : null,
          boardMembers: f.boardMembers ? JSON.stringify(f.boardMembers) : null,

          // Research metadata
          researchDepth: filePath.includes('rapid') ? 'rapid' : 'deep',
          researchDate: new Date().toISOString().split('T')[0],
          researchFilePath: filePath,
          dataQuality: filePath.includes('rapid') ? 3 : 4,

          // Admin
          source: f.source || (filePath.includes('rapid') ? 'rapid-assessment' : 'targeted-research'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          archived: false,
        };
      });

      await db.insert(foundations).values(transformed);
      console.log(`✓ ${filePath} — imported ${transformed.length} new foundations`);
      totalImported += transformed.length;

    } catch (error) {
      console.error(`✗ ${filePath} — failed:`, error);
    }
  }

  console.log(`\n✓ Total JSON foundations imported: ${totalImported}`);
}

/**
 * Verify migration results
 */
async function verifyMigration() {
  console.log('\n📊 Verifying migration...\n');

  const total = await db.select().from(foundations);
  const highFit = total.filter(f => (f.fitScore || 0) >= 7);
  const deepResearch = total.filter(f => f.researchDepth === 'deep');
  const missingContact = total.filter(f => !f.contactEmail && !f.contactPhone);

  console.log(`Total foundations: ${total.length}`);
  console.log(`High-fit (score ≥7): ${highFit.length}`);
  console.log(`Deep research: ${deepResearch.length}`);
  console.log(`Missing contact info: ${missingContact.length}`);

  console.log('\n✓ Migration complete!\n');
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting migration to database...');

  try {
    // Step 1: Migrate TypeScript foundations
    const existingNames = await migrateTypescriptFoundations();

    // Step 2: Migrate JSON foundations (with deduplication)
    await migrateJsonFoundations(existingNames);

    // Step 3: Verify results
    await verifyMigration();

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();
