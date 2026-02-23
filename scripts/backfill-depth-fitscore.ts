#!/usr/bin/env tsx
/**
 * Backfill config_data for DB entries that predate the batch-research pipeline.
 *
 * These ~118+ entries have incomplete config_data (missing slug, name, etc.)
 * because they were loaded from stiftungen-core.ts / stiftungen-2026-02.ts
 * directly into the DB before the upsert pipeline existed.
 *
 * This script:
 * 1. Finds entries where config_data fails Zod validation
 * 2. Rebuilds complete config_data from DB columns + existing partial data
 * 3. Computes researchDepth + fitScore
 * 4. Updates config_data in place
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { foundationSchema } from '../src/lib/schemas/foundation';
import { computeFitScore as computeFitScoreDomain, fitScoreToDisplay } from '../src/lib/domain/fit-scoring';

type ResearchDepth = 'rapid' | 'standard' | 'deep';

function isZefixUrl(url: string): boolean {
  return url.includes('zefix.ch') || url.includes('uid.admin.ch');
}

function computeResearchDepth(opts: {
  hasRealWebsite: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  hasDeadline: boolean;
  hasGrantRange: boolean;
}): ResearchDepth {
  const { hasRealWebsite, hasEmail, hasPhone, hasDeadline, hasGrantRange } = opts;
  const hasContactDetail = hasEmail || hasPhone;
  if (hasRealWebsite && hasContactDetail && hasDeadline && hasGrantRange) return 'deep';
  if (hasRealWebsite && hasContactDetail) return 'standard';
  return 'rapid';
}

// FIT SCORE — Centralized in src/lib/domain/fit-scoring.ts
function computeFitScore(opts: {
  themes: string[];
  canton: string;
  city: string;
  applicationMethod: string;
  isFunder: boolean;
}): number {
  return computeFitScoreDomain(opts).fitScore;
}

// Map free-text or old applicationMethod values to valid enum values
const VALID_APP_METHODS = new Set([
  'online', 'post', 'email', 'contact', 'direct', 'personal',
  'partnership', 'via_partner', 'membership', 'contract', 'none', 'unknown',
]);

function normalizeAppMethod(m: string | undefined | null): string {
  if (!m) return 'unknown';
  if (VALID_APP_METHODS.has(m)) return m;

  const lower = m.toLowerCase();
  if (lower.includes('online') || lower.includes('website')) return 'online';
  if (lower.includes('email') || lower.includes('@')) return 'email';
  if (lower.includes('written') || lower.includes('post') || lower.includes('letter') || lower.includes('forms')) return 'post';
  if (lower.includes('invitation') || lower.includes('nominated') || lower.includes('nomination')) return 'contact';
  if (lower.includes('contact') || lower.includes('directly')) return 'contact';
  if (lower.includes('partner')) return 'partnership';
  if (lower.includes('contract') || lower.includes('service')) return 'contract';
  if (lower.includes('no application') || lower.includes('not open') || lower.includes('n/a') || lower.includes('not specified') || lower.includes('does not')) return 'none';
  if (lower.includes('membership')) return 'membership';
  if (lower.includes('competitive') || lower.includes('rfp')) return 'online';
  if (lower.includes('rolling') || lower.includes('proposal')) return 'email';
  if (lower.includes('program') || lower.includes('varies') || lower.includes('application process')) return 'unknown';
  if (lower.includes('prize') || lower.includes('donor')) return 'none';
  return 'unknown';
}

// Valid ThemeId values
const VALID_THEMES = new Set([
  'klima', 'kreislaufwirtschaft', 'soziale-integration', 'digitale-bildung',
  'digitale-souveraenitaet', 'jugend', 'zuerich', 'arbeitsintegration',
]);

function filterValidThemes(themes: unknown[]): string[] {
  return themes.filter(t => typeof t === 'string' && VALID_THEMES.has(t)) as string[];
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Read ALL foundations and find those that fail Zod validation
  const rows = await sql`
    SELECT id, name, config_data, website_url, contact_email, contact_phone,
           grant_range_min, grant_range_max, application_deadline,
           geographic_scope, fit_score, priority, research_depth,
           application_method, source, focus_areas, research_date,
           organization_type, data_quality
    FROM fundraising_foundations
  `;

  console.log(`Checking ${rows.length} entries for Zod validation...`);

  let needsRepair = 0;
  let repaired = 0;
  let errors = 0;
  const depthCounts: Record<ResearchDepth, number> = { rapid: 0, standard: 0, deep: 0 };

  for (const row of rows) {
    const cd = (row.config_data || {}) as Record<string, unknown>;

    // Check if config_data passes Zod validation
    const check = foundationSchema.safeParse(cd);
    if (check.success) continue;

    needsRepair++;

    // Rebuild complete config_data from DB columns + existing partial data
    const websiteUrl = (row.website_url || cd.websiteUrl || '') as string;
    const email = (row.contact_email || (cd.contact as Record<string, string>)?.email || '') as string;
    const phone = (row.contact_phone || (cd.contact as Record<string, string>)?.phone || '') as string;
    const address = ((cd.contact as Record<string, string>)?.address || '') as string;
    const deadline = row.application_deadline as string | null;
    const grantMin = row.grant_range_min as number | null;
    const grantMax = row.grant_range_max as number | null;
    const region = (row.geographic_scope || cd.region || 'Schweiz') as string;
    const appMethod = normalizeAppMethod(
      (cd.applicationMethod || row.application_method || 'unknown') as string
    );
    const source = (row.source || cd.source || 'manual') as string;
    const rawThemes = (cd.themes || (row.focus_areas ? JSON.parse(row.focus_areas as string) : [])) as unknown[];
    const themes = filterValidThemes(rawThemes);
    const researchDate = (row.research_date || cd.researchDate || new Date().toISOString().split('T')[0]) as string;
    const isOperative = cd.isOperative as boolean | undefined;
    const isFunder = isOperative === false || cd.isFunder === true;
    const type = (cd.type || (row.organization_type === 'network' ? 'network' : 'C')) as string;
    const needsResearch = cd.needsResearch !== undefined ? cd.needsResearch as boolean : true;
    const purposeSummary = (cd.purposeSummary || cd.tagline || '') as string;
    const tagline = (cd.tagline || (purposeSummary ? purposeSummary.substring(0, 80) : row.name)) as string;
    const researchNotes = (cd.researchNotes || '') as string;

    // Compute researchDepth
    const hasRealWebsite = !!websiteUrl && !isZefixUrl(websiteUrl);
    const hasEmail = !!email;
    const hasPhone = !!phone;
    const hasDeadline = !!deadline;
    const hasGrantRange = !!(grantMin || grantMax);
    const researchDepth = computeResearchDepth({
      hasRealWebsite, hasEmail, hasPhone, hasDeadline, hasGrantRange,
    });
    depthCounts[researchDepth]++;

    // Compute canton from region
    let canton = '';
    if (cd.canton) canton = cd.canton as string;
    else if (region.toLowerCase().includes('zürich')) canton = 'ZH';
    else if (region.toLowerCase().includes('bern')) canton = 'BE';
    else if (region.toLowerCase().includes('basel')) canton = 'BS';

    const fitScore = computeFitScore({
      themes, canton, city: region, applicationMethod: appMethod, isFunder,
    });
    const fit = fitScoreToDisplay(fitScore, researchDepth);
    const isZurich = canton === 'ZH';
    let priority: 1 | 2 | 3 | 4;
    if (fitScore >= 7 && isFunder) priority = 1;
    else if (fitScore >= 4 && (isFunder || isZurich)) priority = 2;
    else if (fitScore >= 4) priority = 3;
    else priority = 4;

    // Construct complete config_data
    const newConfigData = {
      // Registry (Layer 1) — required fields
      slug: row.id as string,
      name: row.name as string,
      websiteUrl,
      region,
      contact: {
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
        ...(address ? { address } : {}),
      },
      applicationMethod: appMethod,
      status: 'rolling' as const,
      deadlineText: deadline || (cd.deadlineText as string) || 'Unbekannt',
      amount: {
        min: grantMin ?? (cd.amount as Record<string, unknown>)?.min ?? null,
        max: grantMax ?? (cd.amount as Record<string, unknown>)?.max ?? null,
        text: (cd.amount as Record<string, unknown>)?.text
          || (grantMin || grantMax
            ? `CHF ${(grantMin || 0).toLocaleString('de-CH')} – ${(grantMax || 0).toLocaleString('de-CH')}`
            : 'Unbekannt'),
      },
      source: normalizeSource(source),
      // Optional registry fields — preserve if they exist
      ...(cd.uid ? { uid: cd.uid } : {}),
      ...(cd.officialPurpose ? { officialPurpose: cd.officialPurpose } : {}),
      ...(cd.applicationUrl ? { applicationUrl: cd.applicationUrl } : {}),
      ...(isOperative !== undefined ? { isOperative } : {}),
      ...(cd.isPartnership !== undefined ? { isPartnership: cd.isPartnership } : {}),
      ...(cd.isNetwork !== undefined ? { isNetwork: cd.isNetwork } : {}),
      ...(cd.requiresOpenSource !== undefined ? { requiresOpenSource: cd.requiresOpenSource } : {}),
      ...(cd.requiresPartner !== undefined ? { requiresPartner: cd.requiresPartner } : {}),
      ...(cd.requiresContract !== undefined ? { requiresContract: cd.requiresContract } : {}),
      ...(cd.acceptsApplications ? { acceptsApplications: cd.acceptsApplications } : {}),
      ...(cd.applicationProcess ? { applicationProcess: cd.applicationProcess } : {}),
      ...(cd.deadline ? { deadline: cd.deadline } : {}),
      ...(cd.nextDeadline ? { nextDeadline: cd.nextDeadline } : {}),
      ...(cd.deadlines ? { deadlines: cd.deadlines } : {}),
      ...(cd.responseTime ? { responseTime: cd.responseTime } : {}),
      ...(cd.decisionCycle ? { decisionCycle: cd.decisionCycle } : {}),
      ...(cd.criteria ? { criteria: cd.criteria } : {}),
      ...(cd.smallProjects ? { smallProjects: cd.smallProjects } : {}),
      ...(cd.pastGrantees ? { pastGrantees: cd.pastGrantees } : {}),
      ...(cd.partners ? { partners: cd.partners } : {}),
      ...(cd.events ? { events: cd.events } : {}),
      ...(cd.members ? { members: cd.members } : {}),
      ...(cd.stats2025 ? { stats2025: cd.stats2025 } : {}),
      ...(cd.sdgs ? { sdgs: cd.sdgs } : {}),
      ...(cd.founded ? { founded: cd.founded } : {}),
      ...(cd.capital ? { capital: cd.capital } : {}),
      ...(cd.annualBudget ? { annualBudget: cd.annualBudget } : {}),
      ...(cd.totalBudget ? { totalBudget: cd.totalBudget } : {}),
      ...(cd.grantExpenditure ? { grantExpenditure: cd.grantExpenditure } : {}),
      ...(cd.supervisoryAuthority ? { supervisoryAuthority: cd.supervisoryAuthority } : {}),
      ...(cd.boardMembers ? { boardMembers: cd.boardMembers } : {}),
      ...(cd.memberships ? { memberships: cd.memberships } : {}),
      ...(cd.sourceLinks ? { sourceLinks: cd.sourceLinks } : {}),
      ...(purposeSummary ? { purposeSummary } : {}),

      // Analysis (Layer 2) — required fields
      fit,
      fitScore,
      priority,
      type,
      themes,
      tagline,
      needsResearch,
      researchDate,
      researchDepth,
      ...(researchNotes ? { researchNotes } : {}),
      ...(cd.possiblePartners ? { possiblePartners: cd.possiblePartners } : {}),
    };

    // Validate the rebuilt config_data
    const validation = foundationSchema.safeParse(newConfigData);
    if (!validation.success) {
      const firstErrors = validation.error.issues.slice(0, 3).map(i => `${i.path.join('.')}: ${i.message}`);
      console.error(`  STILL INVALID: ${row.name} — ${firstErrors.join('; ')}`);
      errors++;
      continue;
    }

    try {
      await sql`
        UPDATE fundraising_foundations SET
          config_data = ${JSON.stringify(validation.data)},
          research_depth = ${researchDepth},
          fit_score = ${fitScore},
          priority = ${priority},
          updated_at = ${new Date().toISOString()}
        WHERE id = ${row.id}
      `;
      console.log(`  ${row.name} → repaired (fitScore=${fitScore}, fit=${fit}, P${priority}, depth=${researchDepth})`);
      repaired++;
    } catch (err) {
      console.error(`  ${row.name}: ${err instanceof Error ? err.message : err}`);
      errors++;
    }
  }

  console.log(`\nDone: ${needsRepair} needed repair, ${repaired} fixed, ${errors} errors`);
  console.log(`  Research depth: rapid=${depthCounts.rapid}, standard=${depthCounts.standard}, deep=${depthCounts.deep}`);
}

function normalizeSource(s: string): string {
  const valid = ['manual', 'fundraiso', 'stiftungschweiz', 'esa', 'zefix', 'website', 'cantonal'];
  if (valid.includes(s)) return s;
  if (s === 'automated-research') return 'esa';
  return 'manual';
}

main();
