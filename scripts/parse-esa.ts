/**
 * ESA Stiftungsverzeichnis Parser
 *
 * Parses the ESA Excel download and filters foundations by keyword
 * relevance to Revamp-IT's 8 themes.
 *
 * Usage: npx tsx scripts/parse-esa.ts
 * Output: scripts/output/esa-candidates.json
 */

import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Existing foundations — exclude from results
const EXISTING_NAMES = new Set([
  'klimastiftung schweiz',
  'ernst göhner stiftung',
  'sophie und karl binding stiftung',
  'stiftung baugarten zürich',
  'mercator stiftung schweiz',
  'hirschmann stiftung',
  'drosos stiftung',
  'hasler stiftung',
  'zkb philanthropie stiftung',
  'arbeitsintegration zürich',
  'stiftung zürich-jobs',
  'max kohler stiftung',
  'glückskette',
  'minerva stiftung',
  'prototype fund schweiz',
  'stadt zürich klimup',
  'stiftung stellennetz',
  'stiftung climatoor',
  'z43 netzero stiftung',
  'stiftung stopp klimakrise - kurt de lorenzo',
  'familie schwarz stiftung',
  'baitella-eberle stiftung',
  'foundation regina',
  'stiftung futuri',
  'erde 2.0 stiftung',
  'responsability foundation',
  'landscape resilience fund',
  'stiftung rethink!',
  'stiftung globility circle',
  'stiftung fair recycling',
  'stiftung für wirtschaft und gesellschaft',
  'svc stiftung für das unternehmertum',
  'netzwerk sds',
  'ch open',
  'innosuisse',
  'swico innovationsfonds',
]);

const EXISTING_UIDS = new Set([
  'CHE-310.604.106', 'CHE-298.041.207', 'CHE-281.354.514', 'CHE-391.558.817',
  'CHE-466.408.960', 'CHE-389.062.085', 'CHE-449.768.771', 'CHE-325.640.105',
  'CHE-443.701.461', 'CHE-389.004.225', 'CHE-485.173.674', 'CHE-190.533.848',
  'CHE-114.571.634', 'CHE-114.639.568', 'CHE-344.116.046', 'CHE-217.027.356',
]);

// Theme-keyword mapping for German text
const THEME_KEYWORDS: Record<string, string[]> = {
  klima: ['klima', 'umwelt', 'nachhaltigkeit', 'co2', 'ökologie', 'ökologisch', 'umweltschutz', 'klimaschutz', 'natur'],
  kreislaufwirtschaft: ['kreislauf', 'recycling', 'wiederverwend', 'reparatur', 'abfall', 'ressourcen', 'zirkul'],
  'soziale-integration': ['sozial', 'integration', 'benachteiligt', 'chancengleich', 'inklusion', 'bedürftig', 'armut'],
  'digitale-bildung': ['digital', 'bildung', 'informatik', 'technologie', 'computer', 'ausbildung', 'weiterbildung', 'erziehung'],
  'digitale-souveraenitaet': ['open source', 'souverän', 'quelloffen', 'linux', 'open-source'],
  jugend: ['jugend', 'jugendlich', 'junge erwachsen', 'junge menschen', 'kinder und jugend'],
  zuerich: ['zürich', 'zürch'],
  arbeitsintegration: ['arbeit', 'beruf', 'beschäftigung', 'arbeitsmarkt', 'erwerbstätigkeit', 'arbeitsintegration', 'berufsbildung'],
};

interface ESARow {
  name: string;
  uid: string;
  purpose: string;
  zefixLink: string;
  hrDate: number | string;
  sitz: string;
}

interface Candidate {
  name: string;
  uid: string;
  purpose: string;
  sitz: string;
  zefixLink: string;
  matchedThemes: string[];
  matchedKeywords: string[];
  themeCount: number;
}

function parseESA(): void {
  const filePath = join(__dirname, 'esa-stiftungsverzeichnis.xlsx');
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

  // Skip header row
  const dataRows: ESARow[] = rows.slice(1).map((row) => ({
    name: String(row[0] || ''),
    uid: String(row[1] || ''),
    purpose: String(row[2] || ''),
    zefixLink: String(row[3] || ''),
    hrDate: row[4] || '',
    sitz: String(row[5] || ''),
  }));

  console.log(`Total ESA entries: ${dataRows.length}`);

  // Filter out existing foundations
  const filtered = dataRows.filter((row) => {
    const nameLower = row.name.toLowerCase().trim();
    if (EXISTING_NAMES.has(nameLower)) return false;
    if (EXISTING_UIDS.has(row.uid)) return false;
    return true;
  });
  console.log(`After excluding existing: ${filtered.length}`);

  // Keyword match against purpose text
  const candidates: Candidate[] = [];

  for (const row of filtered) {
    if (!row.purpose) continue;

    const purposeLower = row.purpose.toLowerCase();
    const matchedThemes: string[] = [];
    const matchedKeywords: string[] = [];

    for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
      for (const kw of keywords) {
        if (purposeLower.includes(kw)) {
          if (!matchedThemes.includes(theme)) matchedThemes.push(theme);
          if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
        }
      }
    }

    // At least 2 theme overlaps for relevance
    if (matchedThemes.length >= 2) {
      candidates.push({
        name: row.name,
        uid: row.uid,
        purpose: row.purpose.replace(/\r\n/g, ' ').replace(/\n/g, ' ').substring(0, 500),
        sitz: row.sitz,
        zefixLink: row.zefixLink,
        matchedThemes,
        matchedKeywords,
        themeCount: matchedThemes.length,
      });
    }
  }

  // Sort by theme count (most matches first), then by Zürich preference
  candidates.sort((a, b) => {
    // Zurich foundations first within same theme count
    const aZh = a.matchedThemes.includes('zuerich') ? 1 : 0;
    const bZh = b.matchedThemes.includes('zuerich') ? 1 : 0;
    if (b.themeCount !== a.themeCount) return b.themeCount - a.themeCount;
    return bZh - aZh;
  });

  console.log(`Candidates with 2+ theme matches: ${candidates.length}`);
  console.log(`\nTop 10 by theme count:`);
  for (const c of candidates.slice(0, 10)) {
    console.log(`  [${c.themeCount}] ${c.name} (${c.sitz}) - themes: ${c.matchedThemes.join(', ')}`);
  }

  // Theme distribution
  const themeCounts: Record<string, number> = {};
  for (const c of candidates) {
    for (const t of c.matchedThemes) {
      themeCounts[t] = (themeCounts[t] || 0) + 1;
    }
  }
  console.log(`\nTheme distribution among candidates:`);
  for (const [t, count] of Object.entries(themeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t}: ${count}`);
  }

  // Write output
  const outPath = join(__dirname, 'output', 'esa-candidates.json');
  writeFileSync(outPath, JSON.stringify(candidates, null, 2));
  console.log(`\nWritten ${candidates.length} candidates to ${outPath}`);
}

parseESA();
