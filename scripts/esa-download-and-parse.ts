#!/usr/bin/env tsx
/**
 * ESA Foundation Registry Download & Parse
 *
 * Downloads the official ESA (Eidgenössische Stiftungsaufsicht) Excel file
 * containing all foundations under federal supervision, parses it, and saves
 * as JSON for fast validation lookups.
 *
 * Usage:
 *   npm run esa:download
 *
 * Output:
 *   research/esa-register-YYYY-MM-DD.json
 *
 * Data extracted per foundation:
 * - UID (CHE-XXX.XXX.XXX)
 * - Name
 * - Stiftungszweck (purpose)
 * - Canton
 * - Status
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as XLSX from 'xlsx';

// ESA Foundation Registry - updated 14.01.2026
// Note: This URL may change when they publish a new version. Check https://www.esa.admin.ch/de/stiftungsverzeichnis for updates.
const ESA_EXCEL_URL = 'https://backend.esa.admin.ch/fileservice/sdweb-docs-prod-esaadminch-files/files/2026/01/20/ca6bcb70-475e-445c-8cae-898ae8768858.xlsx';
const OUTPUT_DIR = path.join(process.cwd(), 'research');
const TEMP_FILE = path.join(OUTPUT_DIR, 'esa-temp.xlsx');

interface ESAFoundation {
  uid: string;
  name: string;
  purpose: string;
  canton: string;
  city: string;
  status: string;
}

// ============================================================================
// DOWNLOAD
// ============================================================================

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          console.log(`Following redirect to: ${redirectUrl}`);
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete partial file
      reject(err);
    });
  });
}

// ============================================================================
// PARSE
// ============================================================================

function parseExcel(filePath: string): ESAFoundation[] {
  console.log('📖 Parsing Excel file...');

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON (first row is headers)
  const rawData: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet);

  console.log(`   Found ${rawData.length} rows`);

  // Map to our structure
  // Expected columns (may vary): UID, Name, Zweck, Kanton, Ort, Status, etc.
  const foundations: ESAFoundation[] = [];

  for (const row of rawData) {
    // Try to identify columns by common headers
    // Note: Exact header names may vary - adjust based on actual file
    const uid = (row['UID'] || row['UID-Nummer'] || row['Unternehmens-Identifikationsnummer'] || '') as string;
    const name = (row['Name'] || row['Stiftungsname'] || row['Stiftung'] || '') as string;
    const purpose = (row['Zweck'] || row['Stiftungszweck'] || row['Purpose'] || '') as string;
    const canton = (row['Kanton'] || row['Canton'] || '') as string;
    const city = (row['Ort'] || row['Stadt'] || row['Sitz'] || '') as string;
    const status = (row['Status'] || 'aktiv') as string;

    if (uid && name) {
      foundations.push({
        uid: uid.toString().trim(),
        name: name.toString().trim(),
        purpose: purpose.toString().trim(),
        canton: canton.toString().trim(),
        city: city.toString().trim(),
        status: status.toString().trim(),
      });
    }
  }

  console.log(`   Parsed ${foundations.length} valid foundations\n`);
  return foundations;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🇨🇭 ESA Foundation Registry Download\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Download Excel file
  console.log('📥 Downloading ESA Excel file...');
  console.log(`   URL: ${ESA_EXCEL_URL}\n`);

  try {
    await downloadFile(ESA_EXCEL_URL, TEMP_FILE);
    console.log('✅ Download complete\n');
  } catch (error) {
    console.error('❌ Download failed:', error);
    process.exit(1);
  }

  // Parse Excel
  let foundations: ESAFoundation[];
  try {
    foundations = parseExcel(TEMP_FILE);
  } catch (error) {
    console.error('❌ Parse failed:', error);
    console.error('\nThis may indicate the Excel file structure has changed.');
    console.error('Please inspect the file manually and update column mappings.\n');
    process.exit(1);
  }

  // Save as JSON
  const today = new Date().toISOString().split('T')[0];
  const outputPath = path.join(OUTPUT_DIR, `esa-register-${today}.json`);

  const output = {
    downloadDate: today,
    source: ESA_EXCEL_URL,
    count: foundations.length,
    foundations,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log('💾 Saved to:', outputPath);
  console.log(`   Total foundations: ${foundations.length}\n`);

  // Cleanup temp file
  fs.unlinkSync(TEMP_FILE);

  // Show sample
  console.log('📊 Sample entries:\n');
  foundations.slice(0, 3).forEach((f) => {
    console.log(`  ${f.name}`);
    console.log(`    UID: ${f.uid}`);
    console.log(`    Canton: ${f.canton}`);
    console.log(`    Purpose: ${f.purpose.substring(0, 80)}...`);
    console.log();
  });

  console.log('✅ Done!\n');
}

main().catch((err) => {
  console.error('ESA download failed:', err);
  process.exit(1);
});
