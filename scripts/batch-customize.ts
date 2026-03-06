#!/usr/bin/env tsx
/**
 * Batch Customize — Generate tailored foundation bridges via Groq
 *
 * For P1/P2 foundations flagged by gesuch-audit:
 *   1. Loads foundation data + composed Gesuch content
 *   2. Calls Groq to generate a tailored foundationBridge paragraph
 *   3. Writes to gesuchOverrides table (direct DB write)
 *
 * The foundationBridge is the key paragraph explaining why Revamp-IT and
 * this specific foundation are a great match. Generic bridges hurt quality.
 *
 * Usage:
 *   npx tsx scripts/batch-customize.ts
 *   npx tsx scripts/batch-customize.ts --dry-run
 *   npx tsx scripts/batch-customize.ts --priority=1
 *   npx tsx scripts/batch-customize.ts --slugs=drosos-stiftung,gebert-ruef-stiftung
 *   npx tsx scripts/batch-customize.ts research/audit/2026-03-05.json
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { neon } from '@neondatabase/serverless';
import { nanoid } from 'nanoid';
import { callGroq } from './lib/groq-client';
import { STIFTUNGEN_DATA } from '../src/lib/config/foundations/index';
import { hasGesuchPage } from '../src/lib/domain/foundation-helpers';
import { composeGesuch } from '../src/lib/domain/gesuch-composer';
import { computePriorityScore } from '../src/lib/domain/foundation-scores';
import { THEMES } from '../src/lib/config/foundations/metadata';
import type { Foundation } from '../src/lib/schemas/foundation';

// ============================================================================
// CLI args
// ============================================================================

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const PRIORITY_FILTER = parseInt(args.find(a => a.startsWith('--priority='))?.split('=')[1] || '0', 10) || 0;
const SLUGS_ARG = args.find(a => a.startsWith('--slugs='))?.split('=')[1];
const SLUG_LIST = SLUGS_ARG ? SLUGS_ARG.split(',') : null;
const AUDIT_FILE = args.find(a => a.endsWith('.json') && !a.startsWith('--'));
const DELAY_MS = parseInt(args.find(a => a.startsWith('--delay='))?.split('=')[1] || '2000', 10);

// ============================================================================
// Groq prompt for foundation bridge generation
// ============================================================================

const SYSTEM_PROMPT = `Du bist Spezialist für Stiftungsgesuche in der Schweiz. Du schreibst den "Foundation Bridge" — einen Absatz, der erklärt, warum Revamp-IT und eine bestimmte Stiftung besonders gut zusammenpassen.

## Über Revamp-IT
- Sozialunternehmen in Zürich, gemeinnütziger Verein seit 2009
- Drei Kernbereiche: Kreislaufwirtschaft (IT-Geräte refurbishen), Arbeitsintegration (Praktikumsplätze für Benachteiligte), Digitale Bildung (Linux-Kurse, Workshops)
- ~150 Geräte/Jahr repariert, ~285 kg CO₂ pro Gerät eingespart
- 8-10 Praktikumsplätze, 100+ Praktikant:innen seit 2009
- Standort Zürich (Badenerstrasse + Birmensdorferstrasse)

## Aufgabe
Schreibe einen überzeugenden Absatz (3-5 Sätze, 100-200 Wörter), der:
1. Die Stiftung beim NAMEN nennt
2. Spezifische Überschneidungen zwischen Stiftungszweck und Revamp-IT aufzeigt
3. Konkrete Zahlen/Fakten von Revamp-IT einbaut
4. Professionell und partnerschaftlich klingt (kein Betteln)
5. Zeigt, dass wir die Stiftung verstehen

## Schreibregeln
- Schweizer Schriftdeutsch (ss statt ß, echte Umlaute ä ö ü)
- Professionell, präzise, faktenbasiert
- Gib NUR den Absatz zurück — kein Kommentar, keine Überschrift, keine Erklärung`;

function buildBridgePrompt(foundation: Foundation): string {
  const themeLabels = foundation.themes
    .map(id => THEMES[id]?.label)
    .filter(Boolean)
    .join(', ');

  const lines: string[] = [];
  lines.push(`## Stiftung: ${foundation.name}`);
  if (foundation.purposeSummary) lines.push(`Stiftungszweck: ${foundation.purposeSummary}`);
  if (foundation.researchNotes) lines.push(`Strategische Einschätzung: ${foundation.researchNotes}`);
  if (themeLabels) lines.push(`Gemeinsame Themen: ${themeLabels}`);
  if (foundation.type) lines.push(`Stiftungstyp: ${foundation.type}`);
  if (foundation.amount?.text) lines.push(`Förderbetrag: ${foundation.amount.text}`);
  if (foundation.pastGrantees?.length) {
    lines.push(`Bisherige Empfänger: ${foundation.pastGrantees.slice(0, 5).join(', ')}`);
  }

  lines.push('');
  lines.push('Schreibe den Foundation-Bridge-Absatz für diese Stiftung.');

  return lines.join('\n');
}

// ============================================================================
// Select foundations to customize
// ============================================================================

function selectFoundations(): Foundation[] {
  // Option 1: Explicit slug list
  if (SLUG_LIST) {
    const slugSet = new Set(SLUG_LIST);
    return STIFTUNGEN_DATA.filter(f => slugSet.has(f.slug));
  }

  // Option 2: From audit file (foundations flagged with bridge issues)
  if (AUDIT_FILE) {
    const fullPath = path.resolve(AUDIT_FILE);
    if (!fs.existsSync(fullPath)) {
      console.error(`Audit file not found: ${AUDIT_FILE}`);
      process.exit(1);
    }
    const audit = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    const flaggedSlugs = new Set(
      (audit.results as { slug: string; issues: string[] }[])
        .filter(r => r.issues.some(i => i.includes('Bridge text')))
        .map(r => r.slug)
    );
    return STIFTUNGEN_DATA.filter(f => flaggedSlugs.has(f.slug));
  }

  // Option 3: All Gesuch-ready P1/P2 foundations with generic bridges
  return STIFTUNGEN_DATA.filter(f => {
    if (!hasGesuchPage(f)) return false;
    const computed = computePriorityScore(f);
    if (PRIORITY_FILTER > 0) return computed.level === PRIORITY_FILTER;
    return computed.level <= 2;
  }).filter(f => {
    // Check if bridge is generic (doesn't mention foundation name)
    const composed = composeGesuch(f);
    if (!composed.ready) return false;
    const bridge = composed.foundationBridge.toLowerCase();
    const nameParts = f.name.toLowerCase().split(/[\s-]+/).filter(p => p.length > 3);
    return !nameParts.some(part => bridge.includes(part));
  });
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY not set. Check .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const foundations = selectFoundations();

  console.log(`Batch Customize: ${foundations.length} foundations`);
  if (DRY_RUN) console.log('  DRY RUN — will process first 3 only, no DB writes');

  const items = DRY_RUN ? foundations.slice(0, 3) : foundations;
  let success = 0;
  let errors = 0;

  for (let i = 0; i < items.length; i++) {
    const foundation = items[i];
    const progress = `[${i + 1}/${items.length}]`;

    // Generate bridge text via Groq
    const userPrompt = buildBridgePrompt(foundation);
    console.log(`  ${progress} ${foundation.name} — calling Groq...`);

    const result = await callGroq(SYSTEM_PROMPT, userPrompt, {
      maxTokens: 512,
      temperature: 0.4,
      timeoutMs: 30_000,
    });

    if (!result.ok) {
      console.error(`  ${progress} ${foundation.name} — Groq error: ${result.error}`);
      errors++;
      await sleep(DELAY_MS * 2);
      continue;
    }

    const bridgeText = result.content!.trim();

    // Validate: must mention foundation name and be substantial
    const nameParts = foundation.name.toLowerCase().split(/[\s-]+/).filter(p => p.length > 3);
    const mentionsName = nameParts.some(part => bridgeText.toLowerCase().includes(part));
    if (!mentionsName) {
      console.warn(`  ${progress} ${foundation.name} — WARNING: generated bridge doesn't mention foundation name`);
    }
    if (bridgeText.length < 80) {
      console.warn(`  ${progress} ${foundation.name} — WARNING: bridge too short (${bridgeText.length} chars)`);
    }

    if (DRY_RUN) {
      console.log(`  ${progress} ${foundation.name} — DRY RUN`);
      console.log(`    Bridge (${bridgeText.length} chars): ${bridgeText.substring(0, 120)}...`);
      success++;
      await sleep(DELAY_MS);
      continue;
    }

    // Upsert to gesuchOverrides table
    try {
      const overridesData = JSON.stringify({ foundationBridge: bridgeText });

      // Check if override already exists
      const existing = await sql`
        SELECT id, overrides FROM fundraising_gesuch_overrides
        WHERE foundation_id = ${foundation.slug}
          AND org_id = 'revamp-it'
        LIMIT 1
      `;

      if (existing.length > 0) {
        // Merge: preserve existing overrides, update foundationBridge
        const current = (existing[0].overrides || {}) as Record<string, unknown>;
        current.foundationBridge = bridgeText;
        await sql`
          UPDATE fundraising_gesuch_overrides
          SET overrides = ${JSON.stringify(current)},
              updated_at = NOW()
          WHERE id = ${existing[0].id}
        `;
      } else {
        const id = nanoid();
        await sql`
          INSERT INTO fundraising_gesuch_overrides (id, foundation_id, org_id, overrides, created_at, updated_at)
          VALUES (${id}, ${foundation.slug}, 'revamp-it', ${overridesData}::jsonb, NOW(), NOW())
        `;
      }

      console.log(`  ${progress} ${foundation.name} → DB (${bridgeText.length} chars)`);
      success++;
    } catch (err) {
      console.error(`  ${progress} ${foundation.name} — DB error: ${err instanceof Error ? err.message : err}`);
      errors++;
    }

    // Rate limit
    if (i < items.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Summary
  console.log(`\nBatch Customize complete: ${success} success, ${errors} errors`);
  if (success > 0 && !DRY_RUN) {
    console.log(`  Foundation bridges written to gesuchOverrides table`);
    console.log(`  These will be loaded at render time — no rebuild needed`);
  }
}

import { sleep } from './lib/utilities';

main().catch(err => {
  console.error('Batch customize failed:', err);
  process.exit(1);
});
