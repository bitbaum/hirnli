/**
 * Audit theme assignments for P1+P2 foundations
 *
 * Analyzes whether assigned themes match the foundation's official purpose.
 * Flags suspicious assignments for manual review.
 *
 * Run with: npx tsx scripts/audit-themes.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAllFoundations } from './lib/foundations';
import { requireOrgId } from './lib/require-org';

// A theme audit reports on one organisation's theme assignments — themes are
// that organisation's description of its own mission areas, not a fact about
// the foundation. An audit that cannot say whose assignments it examined would
// present one tenant's judgements as everyone's.
const ORG_ID = requireOrgId();

interface ThemeDefinition {
  id: string;
  keywords: string[];
  excludeKeywords?: string[];
}

// Theme definitions with expected keywords. Matched against a haystack
// of officialPurpose + purposeSummary + researchNotes so deep-research
// content (where our theme assignments are actually grounded) counts.
const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: 'klima',
    keywords: [
      'klima',
      'klimaschutz',
      'co2',
      'emission',
      'treibhausgas',
      'nachhaltigkeit',
      'energie',
    ],
    excludeKeywords: [],
  },
  {
    id: 'kreislaufwirtschaft',
    keywords: ['kreislauf', 'recycling', 'wiederverwert', 'abfall', 'circular', 'ressourcen'],
    excludeKeywords: [],
  },
  {
    id: 'soziale-integration',
    // partizipation = direct synonym for Teilhabe in German social-integration contexts
    keywords: [
      'integration',
      'sozial',
      'benachteiligt',
      'inklusion',
      'gemeinschaft',
      'teilhabe',
      'zusammenleben',
      'partizipation',
    ],
    excludeKeywords: [],
  },
  {
    id: 'digitale-bildung',
    keywords: [
      'digital',
      'bildung',
      'schul',
      'ausbildung',
      'lern',
      'pädagog',
      'unterricht',
      'medien',
    ],
    excludeKeywords: ['medizinstudium', 'medizinische ausbildung'], // avoid medical school false positives; 'medizin' alone is too broad (fires on velux "medizinische Gebiete" which correctly has digitale-bildung)
  },
  {
    id: 'digitale-souveraenitaet',
    keywords: ['daten', 'privatsphäre', 'datenschutz', 'souveränität', 'selbstbestimm', 'digital'],
    excludeKeywords: [],
  },
  {
    id: 'zuerich',
    // Kanton Zürich includes Winterthur + several districts whose foundations
    // never mention "Zürich" in their purpose text but are correctly tagged.
    keywords: ['zürich', 'zurich', 'zürcher', 'winterthur', 'meilen', 'bülach', 'dielsdorf'],
    excludeKeywords: [],
  },
  {
    id: 'arbeitsintegration',
    keywords: [
      'arbeit',
      'beschäftig',
      'arbeitslos',
      'beruf',
      'job',
      'arbeitsvermittl',
      'arbeitseinglieder',
      'arbeitsplätz',
    ],
    excludeKeywords: [],
  },
];

interface SuspiciousAssignment {
  foundationId: string;
  foundationName: string;
  priority: number;
  theme: string;
  reason: string;
  officialPurpose: string;
  allThemes: string[];
}

function checkThemeMatch(theme: string, purpose: string): { matches: boolean; reason: string } {
  const themeDef = THEME_DEFINITIONS.find((t) => t.id === theme);
  if (!themeDef) {
    return { matches: true, reason: 'Unknown theme (skipped)' };
  }

  const purposeLower = purpose.toLowerCase();

  // Check exclude keywords first
  if (themeDef.excludeKeywords) {
    for (const exclude of themeDef.excludeKeywords) {
      if (purposeLower.includes(exclude.toLowerCase())) {
        return {
          matches: false,
          reason: `Contains excluded keyword '${exclude}'`,
        };
      }
    }
  }

  // Check if ANY keyword matches
  const matchedKeywords = themeDef.keywords.filter((kw) => purposeLower.includes(kw.toLowerCase()));

  if (matchedKeywords.length === 0) {
    return {
      matches: false,
      reason: `No matching keywords (expected: ${themeDef.keywords.join(', ')})`,
    };
  }

  return {
    matches: true,
    reason: `Matched: ${matchedKeywords.join(', ')}`,
  };
}

async function auditThemes() {
  console.log('\n📊 Auditing theme assignments for P1+P2 foundations...\n');

  // Fetch P1 and P2 foundations with themes
  // Read through the shared composition rather than querying config_data.
  // Themes, researchNotes and priority are this organisation's assessment now;
  // the blob no longer carries them, so a direct query would find every
  // foundation themeless and audit nothing.
  const all = await getAllFoundations(ORG_ID);
  const rows = all
    .filter((f) => f.priority === 1 || f.priority === 2)
    .filter((f) => f.themes.length > 0)
    .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));

  console.log(`Found ${rows.length} P1+P2 foundations with themes\n`);

  const suspicious: SuspiciousAssignment[] = [];
  let totalThemeAssignments = 0;
  let totalSuspicious = 0;

  for (const row of rows) {
    const themes = row.themes;
    if (themes.length === 0) continue;

    // Build haystack from text fields. Zefix officialPurpose is often terse,
    // so check purposeSummary (our research summary) and researchNotes (our
    // fit analysis) too. Also include region + contact.address — the
    // 'zuerich' geographic theme keywords (Zürich/Zurich/Zürcher) typically
    // appear in those fields, not narrative purpose text.
    const officialPurpose = row.officialPurpose ?? '';
    const purposeSummary = row.purposeSummary ?? '';
    const researchNotes = row.researchNotes ?? '';
    const region = row.region ?? '';
    const address = row.contact?.address ?? '';
    const haystack = [officialPurpose, purposeSummary, researchNotes, region, address]
      .filter(Boolean)
      .join(' ');

    // Skip if no text content at all
    if (haystack.trim() === '') continue;

    totalThemeAssignments += themes.length;

    // Check each theme
    for (const theme of themes) {
      const check = checkThemeMatch(theme, haystack);

      if (!check.matches) {
        suspicious.push({
          foundationId: row.slug,
          foundationName: row.name,
          priority: row.priority,
          theme,
          reason: check.reason,
          officialPurpose:
            (purposeSummary || officialPurpose).slice(0, 200) +
            ((purposeSummary || officialPurpose).length > 200 ? '...' : ''),
          allThemes: themes,
        });
        totalSuspicious++;
      }
    }
  }

  console.log(`✅ Audit complete:`);
  console.log(`   Total theme assignments: ${totalThemeAssignments}`);
  console.log(`   Suspicious assignments:  ${totalSuspicious}`);
  console.log(
    `   Suspicious rate:         ${((totalSuspicious / totalThemeAssignments) * 100).toFixed(1)}%\n`,
  );

  if (suspicious.length === 0) {
    console.log('🎉 No suspicious theme assignments found!\n');
    return;
  }

  // Group by theme
  const byTheme = new Map<string, SuspiciousAssignment[]>();
  for (const item of suspicious) {
    if (!byTheme.has(item.theme)) {
      byTheme.set(item.theme, []);
    }
    byTheme.get(item.theme)!.push(item);
  }

  console.log('📋 Suspicious assignments by theme:\n');
  for (const [theme, items] of byTheme.entries()) {
    console.log(`\n🔴 ${theme} (${items.length} suspicious):\n`);
    for (const item of items.slice(0, 3)) {
      // Show first 3 per theme
      console.log(`   ${item.foundationName} (P${item.priority})`);
      console.log(`   ID: ${item.foundationId}`);
      console.log(`   All themes: ${item.allThemes.join(', ')}`);
      console.log(`   Reason: ${item.reason}`);
      console.log(`   Purpose: ${item.officialPurpose}`);
      console.log('');
    }
    if (items.length > 3) {
      console.log(`   ... and ${items.length - 3} more\n`);
    }
  }

  // Write full report
  const reportPath = 'theme-audit-report.json';
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFoundations: rows.length,
      totalThemeAssignments,
      totalSuspicious,
      suspiciousRate: (totalSuspicious / totalThemeAssignments) * 100,
    },
    byTheme: Array.from(byTheme.entries()).map(([theme, items]) => ({
      theme,
      count: items.length,
      items,
    })),
    allSuspicious: suspicious,
  };

  const fs = await import('fs');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📝 Full report written to ${reportPath}\n`);
}

auditThemes().catch(console.error);
