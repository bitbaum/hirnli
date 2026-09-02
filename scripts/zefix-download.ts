#!/usr/bin/env tsx
/**
 * Zefix Download — Fetch ALL Stiftungen from Swiss commercial register
 *
 * Uses the LINDAS SPARQL endpoint to bulk-query all foundations (legal form 0110)
 * from the Zefix linked data. Much faster than REST API pagination.
 *
 * Saves result as research/zefix-register-YYYY-MM-DD.json.
 *
 * Usage:
 *   npx tsx scripts/zefix-download.ts [--dry-run] [--limit N]
 *   npm run zefix:download
 *
 * Data source: https://lindas.admin.ch (SPARQL)
 * Legal form 0110 = Stiftung (foundation)
 * Total: ~17,800 Stiftungen in Swiss commercial register
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

interface ZefixEntry {
  name: string;
  uid: string;
  city: string;
  status: string;
  cantonalExcerptWeb: string;
}

interface ZefixRegister {
  meta: {
    source: string;
    date: string;
    total: number;
    sparqlBatches: number;
    duplicatesRemoved: number;
  };
  foundations: ZefixEntry[];
}

// ============================================================================
// SPARQL CLIENT
// ============================================================================

const SPARQL_ENDPOINT = 'https://lindas.admin.ch/query';
const BATCH_SIZE = 5000; // SPARQL can handle large result sets
const LEGAL_FORM_STIFTUNG = 'https://ld.admin.ch/ech/97/legalforms/0110';

function formatUid(rawUid: string): string {
  const clean = rawUid.replace(/[^A-Z0-9]/gi, '');
  const match = clean.match(/^(CHE)(\d{3})(\d{3})(\d{3})$/);
  if (match) return `${match[1]}-${match[2]}.${match[3]}.${match[4]}`;
  return rawUid;
}

function buildCantonalUrl(uid: string): string {
  // Standard cantonal excerpt URL pattern
  return `https://www.zefix.admin.ch/de/search/entity/welcome?uid=${uid}`;
}

async function sparqlQuery(query: string): Promise<Record<string, { value: string }>[]> {
  const url = new URL(SPARQL_ENDPOINT);
  url.searchParams.set('query', query);

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/sparql-results+json' },
  });

  if (!res.ok) {
    throw new Error(`SPARQL error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    results: { bindings: Record<string, { value: string }>[] };
  };
  return data.results.bindings;
}

async function downloadBatch(offset: number, limit: number): Promise<ZefixEntry[]> {
  const query = `
    PREFIX schema: <http://schema.org/>
    SELECT DISTINCT ?name ?uid ?city WHERE {
      GRAPH <https://lindas.admin.ch/foj/zefix> {
        ?s a schema:Organization ;
           schema:additionalType <${LEGAL_FORM_STIFTUNG}> ;
           schema:name ?name ;
           schema:identifier ?uidNode .
        FILTER(CONTAINS(STR(?uidNode), "/UID/"))
        BIND(REPLACE(STR(?uidNode), "^.*/UID/", "") AS ?uid)
        OPTIONAL {
          ?s schema:address ?addr .
          ?addr schema:addressLocality ?city .
        }
      }
    }
    ORDER BY ?name
    OFFSET ${offset}
    LIMIT ${limit}
  `;

  const bindings = await sparqlQuery(query);

  return bindings.map((b) => ({
    name: b.name?.value || '',
    uid: formatUid(b.uid?.value || ''),
    city: b.city?.value || '',
    status: 'EXISTIEREND', // SPARQL returns current/active entries
    cantonalExcerptWeb: b.uid?.value ? buildCantonalUrl(b.uid.value) : '',
  }));
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = parseInt(args.find((a) => a.startsWith('--limit='))?.split('=')[1] || '0', 10);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Zefix Download — Fetch ALL Stiftungen via SPARQL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (dryRun) console.log('  DRY RUN — will test query but not save file');
  if (limitArg > 0) console.log(`  Limit: ${limitArg} entries`);

  // First: get total count
  console.log('\n  Counting Stiftungen...');
  const countQuery = `
    PREFIX schema: <http://schema.org/>
    SELECT (COUNT(DISTINCT ?s) as ?count) WHERE {
      GRAPH <https://lindas.admin.ch/foj/zefix> {
        ?s a schema:Organization ;
           schema:additionalType <${LEGAL_FORM_STIFTUNG}> .
      }
    }
  `;
  const countResult = await sparqlQuery(countQuery);
  const totalCount = parseInt(countResult[0]?.count?.value || '0', 10);
  console.log(`  Total Stiftungen in register: ${totalCount}`);

  const effectiveLimit = limitArg > 0 ? Math.min(limitArg, totalCount) : totalCount;

  // Download in batches
  const allEntries: ZefixEntry[] = [];
  let offset = 0;
  let batch = 0;

  while (offset < effectiveLimit) {
    batch++;
    const batchLimit = Math.min(BATCH_SIZE, effectiveLimit - offset);
    console.log(`  Batch ${batch}: offset=${offset}, limit=${batchLimit}...`);

    const entries = await downloadBatch(offset, batchLimit);
    if (entries.length === 0) break;

    allEntries.push(...entries);
    offset += entries.length;

    if (entries.length < batchLimit) break; // No more results
  }

  console.log(`\n  Downloaded: ${allEntries.length} entries in ${batch} batches`);

  // Dedup by UID (SPARQL DISTINCT should handle this, but just in case)
  const seen = new Map<string, ZefixEntry>();
  for (const entry of allEntries) {
    const key = entry.uid || entry.name;
    if (!seen.has(key)) {
      seen.set(key, entry);
    }
  }
  const dedupedEntries = Array.from(seen.values());
  const duplicatesRemoved = allEntries.length - dedupedEntries.length;
  if (duplicatesRemoved > 0) {
    console.log(
      `  After dedup: ${dedupedEntries.length} unique (${duplicatesRemoved} duplicates removed)`,
    );
  }

  if (dryRun) {
    console.log('\n  DRY RUN complete. Sample entries:');
    for (const e of dedupedEntries.slice(0, 10)) {
      console.log(`    - ${e.name} (${e.uid}) — ${e.city}`);
    }
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Done!\n');
    return;
  }

  // Save to file
  const today = new Date().toISOString().split('T')[0];
  const outputDir = path.join(process.cwd(), 'research');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `zefix-register-${today}.json`);

  const register: ZefixRegister = {
    meta: {
      source: 'zefix-sparql',
      date: today,
      total: dedupedEntries.length,
      sparqlBatches: batch,
      duplicatesRemoved,
    },
    foundations: dedupedEntries,
  };

  fs.writeFileSync(outputPath, JSON.stringify(register, null, 2), 'utf-8');
  console.log(`\n  Saved: ${outputPath}`);
  console.log(`  Total: ${dedupedEntries.length} unique foundations`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Done!\n');
}

main().catch((err) => {
  console.error('Zefix download failed:', err);
  process.exit(1);
});
