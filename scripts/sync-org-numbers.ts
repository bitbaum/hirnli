/**
 * Sync shared org numbers from revampit's Neon DB
 *
 * Reads the 9 overlapping entries from the org_numbers table and generates
 * a TypeScript file that NUMBERS_REGISTRY imports. This ensures both projects
 * share the same source of truth for these values.
 *
 * Usage: npm run sync-numbers
 * Requires: DATABASE_URL env var pointing to revampit's Neon PostgreSQL
 *
 * Run this 1-2x/year during number audits, then commit the generated file.
 */

import { Pool } from 'pg'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required.')
  console.error('Set it to revampit\'s Neon PostgreSQL connection string.')
  console.error('Example: DATABASE_URL=postgresql://... npx tsx scripts/sync-org-numbers.ts')
  process.exit(1)
}

// Maps org_numbers DB key → NUMBERS_REGISTRY key in revamp-info
const SHARED_KEYS: Record<string, string> = {
  co2_savings_per_device: 'CO2_SAVED_PER_LAPTOP',
  reuse_rate: 'REUSE_RATE',
  device_lifespan_extension_years: 'DEVICE_LIFESPAN_EXTENSION',
  people_helped_total: 'PEOPLE_HELPED',
  founding_year: 'FOUNDING_YEAR',
  annual_budget_chf: 'CURRENT_BUDGET',
  team_fte: 'TEAM_CORE_FTE',
  avg_device_price_chf: 'AVG_DEVICE_PRICE',
  devices_sold_per_year: 'DEVICES_YEAR_CURRENT',
}

const DB_KEYS = Object.keys(SHARED_KEYS)

interface OrgNumberRow {
  key: string
  value: string
  numeric_value: number | null
}

async function sync() {
  const pool = new Pool({ connectionString: DATABASE_URL })

  try {
    const placeholders = DB_KEYS.map((_, i) => `$${i + 1}`).join(', ')
    const result = await pool.query<OrgNumberRow>(
      `SELECT key, value, numeric_value FROM org_numbers WHERE key IN (${placeholders})`,
      DB_KEYS
    )

    if (result.rows.length === 0) {
      console.error('No matching rows found in org_numbers table.')
      console.error('Expected keys:', DB_KEYS.join(', '))
      process.exit(1)
    }

    // Build the values object
    const entries: string[] = []
    const found = new Set<string>()

    for (const row of result.rows) {
      const registryKey = SHARED_KEYS[row.key]
      if (!registryKey) continue
      found.add(row.key)

      // Use the display value (string) for non-numeric entries like "100+"
      // Use numeric_value for numeric entries
      if (row.numeric_value != null) {
        entries.push(`  ${registryKey}: ${row.numeric_value},`)
      } else {
        entries.push(`  ${registryKey}: '${row.value}',`)
      }
    }

    // Warn about missing keys
    const missing = DB_KEYS.filter(k => !found.has(k))
    if (missing.length > 0) {
      console.warn(`WARNING: ${missing.length} keys not found in DB:`, missing.join(', '))
    }

    // Special case: PEOPLE_HELPED uses the display value "100+" not numeric 100
    // Find the people_helped_total row and override with display value
    const peopleRow = result.rows.find(r => r.key === 'people_helped_total')
    if (peopleRow) {
      const idx = entries.findIndex(e => e.includes('PEOPLE_HELPED'))
      if (idx !== -1) {
        entries[idx] = `  PEOPLE_HELPED: '${peopleRow.value}',`
      }
    }

    const now = new Date().toISOString().split('T')[0]
    const output = `// AUTO-GENERATED — DO NOT EDIT MANUALLY
// Source: org_numbers table (Neon PostgreSQL)
// Last synced: ${now}
// Run: npm run sync-numbers

export const SHARED_ORG_NUMBERS = {
${entries.join('\n')}
} as const
`

    const outPath = resolve(__dirname, '../src/lib/config/shared-org-numbers.generated.ts')
    writeFileSync(outPath, output, 'utf-8')
    console.log(`Synced ${found.size}/${DB_KEYS.length} values to ${outPath}`)
    console.log('Values:', Object.fromEntries(
      result.rows
        .filter(r => found.has(r.key))
        .map(r => [SHARED_KEYS[r.key], r.numeric_value ?? r.value])
    ))
  } catch (error) {
    console.error('Sync failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

sync()
