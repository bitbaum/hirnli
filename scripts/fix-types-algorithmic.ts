#!/usr/bin/env tsx
/**
 * Algorithmic Type Fixer — Reclassify foundation types based on name patterns and existing signals
 * No LLM needed. Pure pattern matching against Robert Schmuki's A/B/C/D criteria.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  let fixed = 0;

  // 1. Corporate-affiliated → Type D
  const corporatePatterns = ['UBS', 'Credit Suisse', 'Swisscom', 'Migros', 'Coop ', 'Nestlé', 'Novartis',
    'Roche', 'ABB', 'Zurich Insurance', 'Swiss Re', 'Swatch', 'Pfizer', 'ZKB', 'Raiffeisen',
    'PostFinance', 'SBB', 'Swisslife', 'Swiss Life', 'Helvetia', 'Baloise', 'Axpo', 'Alpiq', 'Emmi',
    'Swico', 'Sulzer', 'Bühler', 'Georg Fischer', 'Schindler', 'Hilti', 'Syngenta', 'KPMG'];

  for (const corp of corporatePatterns) {
    const rows = await sql`
      UPDATE fundraising_foundations
      SET config_data = jsonb_set(
        jsonb_set(config_data, '{type}', '"D"'),
        '{typeSource}', '"algorithmic"'
      ), updated_at = NOW()
      WHERE name ILIKE ${`%${corp}%`}
        AND config_data->>'type' != 'D'
        AND config_data->>'type' != 'network'
        AND archived = false
      RETURNING id, name
    `;
    for (const r of rows) { console.log(`CORP→D: ${r.name}`); fixed++; }
  }

  // 2. Government bodies → Type D
  const govRows = await sql`
    UPDATE fundraising_foundations
    SET config_data = jsonb_set(
      jsonb_set(config_data, '{type}', '"D"'),
      '{typeSource}', '"algorithmic"'
    ), updated_at = NOW()
    WHERE (name ILIKE 'Stadt Zürich%' OR name ILIKE 'Stadt Bern%' OR name ILIKE 'Stadt Basel%'
      OR name ILIKE 'Kanton %' OR name ILIKE '%Kanton Zürich%' OR name ILIKE '%Kanton Bern%'
      OR name ILIKE 'Fachstelle%' OR name ILIKE 'Sozialdepartement%'
      OR name ILIKE 'Bundesamt%' OR name ILIKE 'ETH %')
      AND config_data->>'type' NOT IN ('D', 'network')
      AND archived = false
    RETURNING id, name
  `;
  for (const r of govRows) { console.log(`GOV→D: ${r.name}`); fixed++; }

  // 3. Explicit family name pattern → Type B
  const familyRows = await sql`
    UPDATE fundraising_foundations
    SET config_data = jsonb_set(
      jsonb_set(config_data, '{type}', '"B"'),
      '{typeSource}', '"algorithmic"'
    ), updated_at = NOW()
    WHERE (name ILIKE '%Familie%Stiftung%' OR name ILIKE '%Familien%stiftung%'
      OR name ILIKE '%Family%Foundation%')
      AND config_data->>'type' NOT IN ('A', 'B')
      AND archived = false
    RETURNING id, name
  `;
  for (const r of familyRows) { console.log(`FAMILY→B: ${r.name}`); fixed++; }

  // 4. Foundations with board data showing Geschäftsführer → Type A
  const boardARows = await sql`
    UPDATE fundraising_foundations
    SET config_data = jsonb_set(
      jsonb_set(config_data, '{type}', '"A"'),
      '{typeSource}', '"signal-derived"'
    ), updated_at = NOW()
    WHERE jsonb_array_length(COALESCE(config_data->'boardMembers', '[]'::jsonb)) >= 5
      AND (config_data->'boardMembers')::text ILIKE '%eschäftsführer%'
      AND config_data->>'type' != 'A'
      AND archived = false
    RETURNING id, name
  `;
  for (const r of boardARows) { console.log(`BOARD→A: ${r.name}`); fixed++; }

  // 5. Known large professional Förderstiftungen → Type A
  const knownA = ['Mercator Stiftung', 'Drosos Stiftung', 'Drosos Foundation', 'Gebert Rüf',
    'Ernst Göhner', 'Leopold Bachmann', 'Binding Stiftung', 'Klimastiftung Schweiz',
    'Hasler Stiftung', 'Corymbo', 'Paul Schiller Stiftung', 'Beisheim',
    'Velux Stiftung', 'Age Stiftung', 'Avina Stiftung', 'Jacobs Foundation',
    'Oak Foundation', 'Volkart Stiftung', 'Christoph Merian Stiftung',
    'Arcas Foundation', 'Heidehof Stiftung', 'MAVA Foundation'];

  for (const name of knownA) {
    const rows = await sql`
      UPDATE fundraising_foundations
      SET config_data = jsonb_set(
        jsonb_set(config_data, '{type}', '"A"'),
        '{typeSource}', '"manual"'
      ), updated_at = NOW()
      WHERE name ILIKE ${`%${name}%`}
        AND config_data->>'type' != 'A'
        AND archived = false
      RETURNING id, name
    `;
    for (const r of rows) { console.log(`KNOWN→A: ${r.name}`); fixed++; }
  }

  // 6. Known networks
  const knownNet = ['Impact Hub', 'Kickstart Innovation', 'Ashoka', 'SEIF',
    'Social Entrepreneurship', 'Arbeitsintegration Zürich', 'Integras',
    'Pro Senectute', 'Pro Infirmis', 'Pro Juventute'];

  for (const name of knownNet) {
    const rows = await sql`
      UPDATE fundraising_foundations
      SET config_data = jsonb_set(
        jsonb_set(config_data, '{type}', '"network"'),
        '{typeSource}', '"manual"'
      ), updated_at = NOW()
      WHERE name ILIKE ${`%${name}%`}
        AND config_data->>'type' != 'network'
        AND archived = false
      RETURNING id, name
    `;
    for (const r of rows) { console.log(`NET→network: ${r.name}`); fixed++; }
  }

  // 7. "Verein" in name → likely network, not foundation
  const vereinRows = await sql`
    UPDATE fundraising_foundations
    SET config_data = jsonb_set(
      jsonb_set(config_data, '{type}', '"network"'),
      '{typeSource}', '"algorithmic"'
    ), updated_at = NOW()
    WHERE name ILIKE 'Verein %'
      AND config_data->>'type' NOT IN ('A', 'network')
      AND archived = false
    RETURNING id, name
  `;
  for (const r of vereinRows) { console.log(`VEREIN→network: ${r.name}`); fixed++; }

  console.log(`\nTotal reclassified: ${fixed}`);

  // Show type distribution after fixes
  const dist = await sql`
    SELECT config_data->>'type' as type, COUNT(*)::int as count
    FROM fundraising_foundations WHERE archived = false AND config_data IS NOT NULL
    GROUP BY config_data->>'type' ORDER BY count DESC
  `;
  console.log('\nUpdated type distribution:');
  console.table(dist);
}

main().catch(console.error);
