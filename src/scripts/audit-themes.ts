/**
 * Audit theme assignments for P1+P2 foundations
 *
 * Analyzes whether assigned themes match the foundation's official purpose.
 * Flags suspicious assignments for manual review.
 *
 * Run with: npx tsx src/scripts/audit-themes.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

interface ThemeDefinition {
  id: string;
  keywords: string[];
  excludeKeywords?: string[];
}

// Theme definitions with expected keywords in officialPurpose
const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: 'klima',
    keywords: ['klima', 'klimaschutz', 'co2', 'emission', 'treibhausgas', 'nachhaltigkeit', 'energie'],
    excludeKeywords: [],
  },
  {
    id: 'kreislaufwirtschaft',
    keywords: ['kreislauf', 'recycling', 'wiederverwert', 'abfall', 'circular', 'ressourcen'],
    excludeKeywords: [],
  },
  {
    id: 'soziale-integration',
    keywords: ['integration', 'sozial', 'benachteiligt', 'inklusion', 'gemeinschaft', 'teilhabe', 'zusammenleben'],
    excludeKeywords: [],
  },
  {
    id: 'digitale-bildung',
    keywords: ['digital', 'bildung', 'schul', 'ausbildung', 'lern', 'pädagog', 'unterricht', 'medien'],
    excludeKeywords: ['medizin'], // avoid medical education false positives
  },
  {
    id: 'digitale-souveraenitaet',
    keywords: ['daten', 'privatsphäre', 'datenschutz', 'souveränität', 'selbstbestimm', 'digital'],
    excludeKeywords: [],
  },
  {
    id: 'zuerich',
    keywords: ['zürich', 'zurich', 'zürcher'],
    excludeKeywords: [],
  },
  {
    id: 'arbeitsintegration',
    keywords: ['arbeit', 'beschäftig', 'arbeitslos', 'beruf', 'job', 'arbeitsvermittl', 'arbeitseinglieder', 'arbeitsplätz'],
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
  const themeDef = THEME_DEFINITIONS.find(t => t.id === theme);
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
          reason: `Contains excluded keyword '${exclude}'` 
        };
      }
    }
  }

  // Check if ANY keyword matches
  const matchedKeywords = themeDef.keywords.filter(kw => 
    purposeLower.includes(kw.toLowerCase())
  );

  if (matchedKeywords.length === 0) {
    return { 
      matches: false, 
      reason: `No matching keywords (expected: ${themeDef.keywords.join(', ')})` 
    };
  }

  return { 
    matches: true, 
    reason: `Matched: ${matchedKeywords.join(', ')}` 
  };
}

async function auditThemes() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log('\n📊 Auditing theme assignments for P1+P2 foundations...\n');

  // Fetch P1 and P2 foundations with themes
  const rows = await sql`
    SELECT
      id,
      name,
      priority,
      config_data
    FROM fundraising_foundations
    WHERE priority IN (1, 2)
      AND config_data IS NOT NULL
      AND (config_data->>'themes') IS NOT NULL
    ORDER BY priority ASC, name ASC
  `;

  console.log(`Found ${rows.length} P1+P2 foundations with themes\n`);

  const suspicious: SuspiciousAssignment[] = [];
  let totalThemeAssignments = 0;
  let totalSuspicious = 0;

  for (const row of rows) {
    // Get themes from config_data.themes (SSOT)
    const themes = row.config_data?.themes ?? [];
    if (themes.length === 0) continue;

    const officialPurpose = row.config_data?.officialPurpose ?? '';
    
    // Skip if no official purpose available
    if (!officialPurpose || officialPurpose.trim() === '') {
      continue;
    }

    totalThemeAssignments += themes.length;

    // Check each theme
    for (const theme of themes) {
      const check = checkThemeMatch(theme, officialPurpose);
      
      if (!check.matches) {
        suspicious.push({
          foundationId: row.id,
          foundationName: row.name,
          priority: row.priority ?? 0,
          theme,
          reason: check.reason,
          officialPurpose: officialPurpose.slice(0, 200) + (officialPurpose.length > 200 ? '...' : ''),
          allThemes: themes,
        });
        totalSuspicious++;
      }
    }
  }

  console.log(`✅ Audit complete:`);
  console.log(`   Total theme assignments: ${totalThemeAssignments}`);
  console.log(`   Suspicious assignments:  ${totalSuspicious}`);
  console.log(`   Suspicious rate:         ${((totalSuspicious / totalThemeAssignments) * 100).toFixed(1)}%\n`);

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
    for (const item of items.slice(0, 3)) { // Show first 3 per theme
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
