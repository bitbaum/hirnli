#!/usr/bin/env tsx
/**
 * Import Research Results — Apply complete foundation profiles from external research
 *
 * Reads a JSON file of research results (from ChatGPT, manual research, etc.)
 * and merges into config_data. Only writes new data — never overwrites existing
 * non-empty fields. Records provenance via sourceLinks.
 *
 * Usage:
 *   npx tsx scripts/import-research-results.ts research/results.json --dry-run
 *   npx tsx scripts/import-research-results.ts research/results.json
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { isRegistryUrl } from '../src/lib/config/registry-domains';
import { RESEARCH_METHOD_RANK as _RESEARCH_METHOD_RANK, RESEARCHED_METHODS } from '../src/lib/schemas/foundation';
// Cast to Record<string,number> so scripts can index with arbitrary string values safely
const RESEARCH_METHOD_RANK = _RESEARCH_METHOD_RANK as Record<string, number>;

const sql = neon(process.env.DATABASE_URL!);
const DRY_RUN = process.argv.includes('--dry-run');
const OVERWRITE_ABOUT = process.argv.includes('--overwrite-about'); // Force-write purposeSummary + researchNotes
const inputFile = process.argv.find(a => a.endsWith('.json'));
const methodArg = process.argv.find(a => a.startsWith('--research-method='));

// Auto-detect research method from filename if not explicitly provided:
//   *-chatgpt-agent-*.json → chatgpt-agent  (real ChatGPT VM/browser agent)
//   *-claude-agent-*.json  → claude-agent   (Claude internal Agent with web tools)
//   *-agent-*.json         → chatgpt-agent  (legacy: assumed ChatGPT agent)
//   *-search-*.json        → chatgpt-search
//   anything else          → unknown (requires explicit flag)
function detectMethodFromFilename(file: string): string | null {
  const base = file.split('/').pop() || '';
  if (base.includes('-chatgpt-agent-') || base.includes('-chatgpt-agent.')) return 'chatgpt-agent';
  if (base.includes('-claude-agent-') || base.includes('-claude-agent.')) return 'claude-agent';
  if (base.includes('-agent-') || base.includes('-agent.')) return 'chatgpt-agent'; // legacy
  if (base.includes('-search-') || base.includes('-search.')) return 'chatgpt-search';
  return null;
}

const FORCED_METHOD = methodArg
  ? methodArg.split('=')[1]
  : (inputFile ? detectMethodFromFilename(inputFile) : null);

if (!inputFile) {
  console.error('Usage: npx tsx scripts/import-research-results.ts <file.json> [--research-method=chatgpt-agent] [--dry-run]');
  console.error('  Method auto-detected from filename: *-agent-* → chatgpt-agent, *-search-* → chatgpt-search');
  process.exit(1);
}

interface ResearchResult {
  slug: string;
  // Contact
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  // Website
  website?: string | null;
  // About
  purposeSummary?: string | null;
  researchNotes?: string | null;
  founded?: number | null;
  boardMembers?: string[] | null;
  capital?: string | null;
  annualBudget?: string | null;
  grantExpenditure?: string | null;
  // Application
  applicationMethod?: string | null;
  applicationUrl?: string | null;
  applicationProcess?: string | null;
  acceptsApplications?: string | null;
  deadlineText?: string | null;
  // Grant info
  amountMin?: number | null;
  amountMax?: number | null;
  amountText?: string | null;
  pastGrantees?: string[] | null;
  smallProjects?: boolean | null;
  // Themes
  themes?: string[] | null;
  // Meta
  isOperative?: boolean | null;
  sources?: string | string[];
  // Research quality provenance
  applicationResearchMethod?: string | null;
}

// RESEARCH_METHOD_RANK and RESEARCHED_METHODS imported from schema (SSOT)

const VALID_APP_METHODS = ['online', 'email', 'post', 'contact', 'personal', 'partnership', 'via_partner', 'membership', 'contract', 'invitation', 'none', 'unknown'];
const VALID_ACCEPTS = ['yes', 'no', 'invitation_only', 'unknown'];
const VALID_THEMES = ['klima', 'kreislaufwirtschaft', 'soziale-integration', 'digitale-bildung', 'digitale-souveraenitaet', 'zuerich', 'arbeitsintegration'];

function isValidEmail(email: string): boolean {
  if (!email || email.length < 5 || email.length > 60) return false;
  if (!email.includes('@') || !email.includes('.')) return false;
  if (/[{}\\]|\.png|\.jpg|\.webp|sentry|wixpress/.test(email)) return false;
  return true;
}

/** Merge research data into existing config_data. Only fills gaps — never overwrites existing non-empty values.
 *  Exception: when incoming research method outranks existing, application fields are overwritten. */
function mergeIntoConfig(cd: Record<string, unknown>, r: ResearchResult): { changed: boolean; fields: string[] } {
  const fields: string[] = [];

  // Determine if incoming research method outranks existing
  const incomingMethod = r.applicationResearchMethod || 'unknown';
  const existingMethod = (cd.applicationResearchMethod as string) || 'unknown';
  const incomingRank = RESEARCH_METHOD_RANK[incomingMethod] ?? 0;
  const existingRank = RESEARCH_METHOD_RANK[existingMethod] ?? 0;
  const incomingIsResearched = (RESEARCHED_METHODS as string[]).includes(incomingMethod);
  const existingIsResearched = (RESEARCHED_METHODS as string[]).includes(existingMethod);
  // Upgrade when strictly higher rank OR when moving from unresearched → researched.
  // This handles the equal-rank case: claude-agent(2) vs chatgpt-search(2) — both rank 2
  // but only claude-agent is in RESEARCHED_METHODS, so it should win.
  const isUpgrade = incomingRank > existingRank || (incomingIsResearched && !existingIsResearched);

  // Helper: set if target is empty/missing
  function setIfEmpty(path: string, value: unknown) {
    if (value === null || value === undefined) return;
    if (typeof value === 'string' && value.trim() === '') return;
    if (Array.isArray(value) && value.length === 0) return;

    // Navigate to parent
    const parts = path.split('.');
    let target = cd;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!target[parts[i]]) target[parts[i]] = {};
      target = target[parts[i]] as Record<string, unknown>;
    }

    const key = parts[parts.length - 1];
    const existing = target[key];
    // Only set if existing is empty
    if (existing === null || existing === undefined || existing === '' ||
        (Array.isArray(existing) && existing.length === 0)) {
      target[key] = value;
      fields.push(path);
    }
  }

  // Contact
  if (r.email && isValidEmail(r.email)) setIfEmpty('contact.email', r.email.toLowerCase());
  if (r.phone) setIfEmpty('contact.phone', r.phone);
  if (r.address) setIfEmpty('contact.address', r.address);

  // Website (only upgrade from registry URL)
  if (r.website) {
    const current = cd.websiteUrl as string || '';
    if (!current || isRegistryUrl(current)) {
      cd.websiteUrl = r.website;
      fields.push('websiteUrl');
    }
  }

  // About — overwrite with agent data when upgrading (agent > groq-pipeline quality)
  // --overwrite-about forces overwrite even if same method (for backfills)
  if (r.purposeSummary) {
    if (isUpgrade || OVERWRITE_ABOUT) { cd.purposeSummary = r.purposeSummary; fields.push('purposeSummary'); }
    else setIfEmpty('purposeSummary', r.purposeSummary);
  }
  if (r.researchNotes) {
    if (isUpgrade || OVERWRITE_ABOUT) { cd.researchNotes = r.researchNotes; fields.push('researchNotes'); }
    else setIfEmpty('researchNotes', r.researchNotes);
  }
  if (r.founded) setIfEmpty('founded', r.founded);
  // boardMembers: schema expects [{name, role}], accept string[] and wrap
  if (r.boardMembers?.length) {
    const normalized = r.boardMembers.map(m =>
      typeof m === 'string' ? { name: m, role: 'Stiftungsrat' } : m
    );
    setIfEmpty('boardMembers', normalized);
  }
  if (r.capital) setIfEmpty('capital', r.capital);
  if (r.annualBudget) setIfEmpty('annualBudget', r.annualBudget);
  if (r.grantExpenditure) setIfEmpty('grantExpenditure', r.grantExpenditure);

  // Application process — override 'unknown' OR when incoming method outranks existing
  if (r.applicationMethod && VALID_APP_METHODS.includes(r.applicationMethod)) {
    const current = cd.applicationMethod as string | undefined;
    if (!current || current === 'unknown' || isUpgrade) {
      cd.applicationMethod = r.applicationMethod;
      fields.push('applicationMethod');
    }
  }
  // Application URL, process, accepts, deadline — overwrite when upgrading quality
  if (isUpgrade) {
    if (r.applicationUrl) { cd.applicationUrl = r.applicationUrl; fields.push('applicationUrl'); }
    if (r.applicationProcess) {
      const asArray = typeof r.applicationProcess === 'string' ? [r.applicationProcess] : r.applicationProcess;
      cd.applicationProcess = asArray; fields.push('applicationProcess');
    }
    if (r.acceptsApplications && VALID_ACCEPTS.includes(r.acceptsApplications)) {
      cd.acceptsApplications = r.acceptsApplications; fields.push('acceptsApplications');
    }
    if (r.deadlineText) { cd.deadlineText = r.deadlineText; fields.push('deadlineText'); }
  } else {
    if (r.applicationUrl) setIfEmpty('applicationUrl', r.applicationUrl);
    // applicationProcess: schema expects string[], accept string and wrap
    if (r.applicationProcess) {
      const asArray = typeof r.applicationProcess === 'string' ? [r.applicationProcess] : r.applicationProcess;
      setIfEmpty('applicationProcess', asArray);
    }
    if (r.acceptsApplications && VALID_ACCEPTS.includes(r.acceptsApplications)) {
      setIfEmpty('acceptsApplications', r.acceptsApplications);
    }
    if (r.deadlineText) setIfEmpty('deadlineText', r.deadlineText);
  }

  // Track research method (always upgrade, never downgrade)
  const validMethods = Object.keys(RESEARCH_METHOD_RANK) as string[];
  if (validMethods.includes(incomingMethod) && isUpgrade) {
    cd.applicationResearchMethod = incomingMethod;
    fields.push('applicationResearchMethod');
  } else if (!cd.applicationResearchMethod && incomingMethod !== 'unknown') {
    cd.applicationResearchMethod = incomingMethod;
    fields.push('applicationResearchMethod');
  }

  // Grant info
  if (r.amountMin != null || r.amountMax != null || r.amountText) {
    if (!cd.amount) cd.amount = {};
    const amount = cd.amount as Record<string, unknown>;
    if (r.amountMin != null && !amount.min) { amount.min = r.amountMin; fields.push('amount.min'); }
    if (r.amountMax != null && !amount.max) { amount.max = r.amountMax; fields.push('amount.max'); }
    if (r.amountText && !amount.text) { amount.text = r.amountText; fields.push('amount.text'); }
  }
  if (r.pastGrantees?.length) setIfEmpty('pastGrantees', r.pastGrantees);
  // smallProjects: schema expects {max, text}, accept boolean and skip (can't infer amount)
  if (r.smallProjects != null && typeof r.smallProjects === 'object') {
    setIfEmpty('smallProjects', r.smallProjects);
  }

  // Themes (merge, don't replace, filter against enum)
  if (r.themes?.length) {
    const validThemes = r.themes.filter(t => VALID_THEMES.includes(t));
    if (validThemes.length > 0) {
      const existing = (cd.themes || []) as string[];
      const merged = [...new Set([...existing, ...validThemes])];
      if (merged.length > existing.length) {
        cd.themes = merged;
        fields.push('themes');
      }
    }
  }

  // Operative status
  if (r.isOperative != null && cd.isOperative === undefined) {
    cd.isOperative = r.isOperative;
    fields.push('isOperative');
  }

  return { changed: fields.length > 0, fields };
}

async function main() {
  const raw = readFileSync(inputFile!, 'utf-8');
  // Handle both array and object with array
  let results: ResearchResult[];
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    results = parsed;
  } else if (parsed.results && Array.isArray(parsed.results)) {
    results = parsed.results;
  } else {
    console.error('Expected a JSON array or { results: [...] }');
    process.exit(1);
  }

  // Apply forced research method override (e.g. --research-method=chatgpt-agent)
  if (FORCED_METHOD) {
    results = results.map(r => ({ ...r, applicationResearchMethod: FORCED_METHOD }));
  }

  console.log(`=== Import Research Results ===`);
  console.log(`Input: ${inputFile} (${results.length} entries)`);
  console.log(`Research method: ${FORCED_METHOD || 'from data or unknown'}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;
  let totalFields = 0;

  for (const r of results) {
    if (!r.slug) { skipped++; continue; }

    const [row] = await sql`SELECT config_data FROM fundraising_foundations WHERE id = ${r.slug}`;
    if (!row?.config_data) {
      console.log(`  ❌ ${r.slug}: not found in DB`);
      notFound++;
      continue;
    }

    const cd = row.config_data as Record<string, unknown>;
    const { changed, fields } = mergeIntoConfig(cd, r);

    if (!changed) {
      skipped++;
      continue;
    }

    // Add provenance sourceLink
    if (!cd.sourceLinks) cd.sourceLinks = [];
    const links = cd.sourceLinks as { source: string; url: string; label?: string }[];
    const sources = Array.isArray(r.sources) ? r.sources.join(', ') : (r.sources || 'external research');
    if (!links.some(l => l.label?.includes('Research 2026'))) {
      links.push({
        source: 'manual',
        url: r.website || '',
        label: `Research 2026-04: ${sources}`,
      });
    }

    console.log(`  ✅ ${r.slug}: +${fields.length} fields (${fields.join(', ')})`);
    totalFields += fields.length;

    if (!DRY_RUN) {
      await sql`
        UPDATE fundraising_foundations
        SET config_data = ${JSON.stringify(cd)}::jsonb,
            updated_at = NOW()
        WHERE id = ${r.slug}
      `;
    }
    updated++;
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Updated: ${updated} foundations`);
  console.log(`New fields: ${totalFields} total`);
  console.log(`Skipped: ${skipped} (no new data)`);
  console.log(`Not found: ${notFound}`);
  if (!DRY_RUN && updated > 0) {
    console.log('\nNext: npm run sync && npm run build');
  }
}

main().catch(console.error);
