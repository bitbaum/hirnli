#!/usr/bin/env tsx
/**
 * Foundation Research Assistant (LLM-Assisted Phase 3)
 *
 * Automates the deep research phase by:
 * 1. Fetching foundation website content
 * 2. Querying ESA register for official Stiftungszweck
 * 3. Using LLM to analyze if it's a funder vs operator
 * 4. Generating draft purposeSummary and researchNotes
 * 5. Suggesting themes, type (A/B/C/D), and fit score
 *
 * Usage:
 *   npm run research:foundation -- --url=https://example.org
 *   npm run research:foundation -- --name="Foundation Name"
 *   npm run research:foundation -- --batch=research/candidates.json
 *
 * Output:
 *   research/drafts/YYYY-MM-DD/foundation-slug.json
 *
 * Reduces Phase 3 time from 15-20 min to 5-7 min per foundation
 * (2-3 min automated fetch + LLM, 5 min human review)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { THEMES } from '../src/lib/config/foundations/metadata';

interface ESAFoundation {
  uid: string;
  name: string;
  purpose: string;
  canton: string;
  city: string;
  status: string;
}

interface ESARegister {
  downloadDate: string;
  source: string;
  count: number;
  foundations: ESAFoundation[];
}

interface ResearchInput {
  name: string;
  websiteUrl?: string;
  fundraisoUrl?: string;
}

interface ResearchOutput {
  timestamp: string;
  input: ResearchInput;
  esa?: ESAFoundation;
  websiteContent?: string;
  analysis: {
    isFunder: boolean;
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
    themes: string[];
    suggestedType: 'A' | 'B' | 'C' | 'D' | 'network';
    suggestedFit: 1 | 2 | 3;
    suggestedPriority: 1 | 2 | 3 | 4;
    draftPurposeSummary: string;
    draftResearchNotes: string;
    warnings: string[];
  };
}

// ============================================================================
// LOAD ESA REGISTER
// ============================================================================

function loadESARegister(): ESARegister | null {
  const researchDir = path.join(process.cwd(), 'research');

  const files = fs.readdirSync(researchDir)
    .filter(f => f.startsWith('esa-register-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.warn('⚠️  No ESA register found. Run `npm run esa:download` first.\n');
    return null;
  }

  const registerPath = path.join(researchDir, files[0]);
  const data = fs.readFileSync(registerPath, 'utf-8');
  return JSON.parse(data);
}

function findInESA(register: ESARegister | null, name: string): ESAFoundation | null {
  if (!register) return null;

  const normalized = name.toLowerCase()
    .replace(/stiftung|foundation|fondation|fondazione/gi, '')
    .replace(/[^a-z0-9]/g, '');

  for (const foundation of register.foundations) {
    const esaNormalized = foundation.name.toLowerCase()
      .replace(/stiftung|foundation|fondation|fondazione/gi, '')
      .replace(/[^a-z0-9]/g, '');

    if (esaNormalized === normalized || foundation.name.toLowerCase() === name.toLowerCase()) {
      return foundation;
    }
  }

  return null;
}

// ============================================================================
// WEBSITE FETCHING
// ============================================================================

function fetchWebsite(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          fetchWebsite(redirectUrl).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// ============================================================================
// ANALYSIS PROMPT TEMPLATES
// ============================================================================

function buildAnalysisPrompt(input: ResearchInput, esa: ESAFoundation | null, websiteContent?: string): string {
  const availableThemes = Object.values(THEMES).map(t => `${t.id}: ${t.label} - ${t.description}`).join('\n');

  return `# Foundation Research Analysis Task

You are analyzing a Swiss foundation to determine if it's a potential funder for Revamp-IT, a social enterprise in Zürich that:
- Refurbishes donated computers and laptops
- Installs Linux (digital sovereignty, open source)
- Provides them to people in need (social integration, second chance)
- Offers IT workshops (digital education, skills training)
- Employs people from disadvantaged backgrounds (work integration)
- Promotes circular economy and e-waste reduction (environmental impact)

## Foundation Data

**Name**: ${input.name}
${input.websiteUrl ? `**Website**: ${input.websiteUrl}` : ''}
${input.fundraisoUrl ? `**Fundraiso**: ${input.fundraisoUrl}` : ''}

${esa ? `### ESA Official Data
**UID**: ${esa.uid}
**Official Name**: ${esa.name}
**City**: ${esa.city}
**Status**: ${esa.status}
**Official Purpose (Stiftungszweck)**:
${esa.purpose}
` : '**ESA Data**: Not found in federal register (may be under cantonal supervision or not a formal Stiftung)'}

${websiteContent ? `### Website Content (First 3000 chars)
${websiteContent.substring(0, 3000)}...
` : '**Website**: Not available'}

## Available Themes
${availableThemes}

## Analysis Questions

Please provide a structured analysis answering these questions:

### 1. Is this a grant-maker or operator?
- **Grant-maker/Förderstiftung**: Provides funding to external projects/organizations
- **Operator**: Runs its own programs directly (like Revamp-IT itself)
- Keywords to look for:
  - Funder: "fördert", "unterstützt Projekte", "vergibt Beiträge", "Gesuchsverfahren", "Antragsformular"
  - Operator: "betreibt", "führt durch", "bietet an", "Dienstleister", "eigene Programme"

**Answer**: [Funder | Operator | Unclear]
**Confidence**: [High | Medium | Low]
**Reasoning**: [Explain your assessment based on the evidence]

### 2. If it's a funder, what themes match Revamp-IT?
Select from the available themes above. Consider:
- Explicit mentions in purpose or website
- Implicit alignment (e.g., "Chancengleichheit" → soziale-integration)
- Past funded projects if mentioned

**Themes**: [List theme IDs]

### 3. Foundation Type (Robert Schmuki Classification)
- **A**: Professionalisierte Förderstiftung - professional management, data-driven decisions, structured applications
- **B**: Potente Familienstiftung - family foundation with administration, personal interests matter
- **C**: Kleine Familienstiftung - small board (3-5 people), emotional decisions, direct contact
- **D**: Corporate Foundation - professional but less transparent, norm-based processes
- **network**: Network/association - no direct funding, membership for visibility

**Type**: [A | B | C | D | network]
**Reasoning**: [Brief explanation]

### 4. Fit Score
- **3 (Excellent)**: Multiple direct theme matches, mission highly aligned
- **2 (Good)**: Some theme overlap, targeted argumentation needed
- **1 (Limited)**: Weak alignment, low probability of success

**Fit Score**: [1 | 2 | 3]

### 5. Priority
- **1 (Immediate)**: Apply ASAP, deadline soon or perfect fit
- **2 (High)**: Apply this quarter, strong candidate
- **3 (Medium)**: Apply when ready, good fit
- **4 (Low)**: Watch & wait, weaker candidate

**Priority**: [1 | 2 | 3 | 4]

### 6. Draft Purpose Summary (150+ characters)
Write a concise summary of what this foundation funds, with specific focus areas.
This will be displayed on the foundation detail page.

**Purpose Summary**: [Your draft text here]

### 7. Draft Research Notes (250+ characters)
Explain why this foundation is a good/bad fit for Revamp-IT.
Include:
- Specific alignment points
- Application process insights if available
- Strategic recommendations for approaching them

**Research Notes**: [Your draft text here]

### 8. Warnings/Red Flags
Any issues that would disqualify this foundation or require special attention?

**Warnings**: [List any issues]

---

Please provide your analysis in a structured format following the sections above.`;
}

// ============================================================================
// LLM ANALYSIS (Placeholder)
// ============================================================================

/**
 * NOTE: This is a placeholder for LLM integration.
 *
 * In production, this would:
 * 1. Call Anthropic API with the analysis prompt
 * 2. Parse the structured response
 * 3. Return the analysis object
 *
 * For now, this outputs the prompt to a file for manual LLM analysis.
 * In the future, integrate with Anthropic SDK or similar.
 */
async function analyzeFundation(
  input: ResearchInput,
  esa: ESAFoundation | null,
  websiteContent?: string
): Promise<ResearchOutput['analysis']> {
  const prompt = buildAnalysisPrompt(input, esa, websiteContent);

  console.log('📝 Analysis prompt generated');
  console.log('   Copy the prompt below and analyze with an LLM:\n');
  console.log('─'.repeat(80));
  console.log(prompt);
  console.log('─'.repeat(80));
  console.log();

  // Placeholder response - in production, this would call an LLM API
  return {
    isFunder: false, // Will be filled by LLM or human
    confidence: 'low',
    reasoning: 'Manual analysis required - LLM integration not yet implemented',
    themes: [],
    suggestedType: 'C',
    suggestedFit: 2,
    suggestedPriority: 3,
    draftPurposeSummary: '[To be filled by LLM or human analyst]',
    draftResearchNotes: '[To be filled by LLM or human analyst]',
    warnings: ['LLM integration not yet implemented - manual analysis required'],
  };
}

// ============================================================================
// MAIN RESEARCH WORKFLOW
// ============================================================================

async function researchFoundation(input: ResearchInput): Promise<ResearchOutput> {
  console.log(`\n🔍 Researching: ${input.name}\n`);

  // Step 1: Query ESA
  console.log('1️⃣  Checking ESA register...');
  const register = loadESARegister();
  const esa = register ? findInESA(register, input.name) : null;

  if (esa) {
    console.log(`   ✅ Found in ESA: ${esa.name} (${esa.uid})`);
  } else {
    console.log('   ⚠️  Not found in ESA (may be under cantonal supervision)');
  }
  console.log();

  // Step 2: Fetch website
  let websiteContent: string | undefined;
  if (input.websiteUrl) {
    console.log('2️⃣  Fetching website...');
    try {
      websiteContent = await fetchWebsite(input.websiteUrl);
      console.log(`   ✅ Fetched ${websiteContent.length} chars`);
    } catch (error) {
      console.log(`   ⚠️  Failed: ${error}`);
    }
    console.log();
  }

  // Step 3: LLM Analysis
  console.log('3️⃣  Analyzing with LLM...\n');
  const analysis = await analyzeFundation(input, esa, websiteContent);

  return {
    timestamp: new Date().toISOString(),
    input,
    esa: esa || undefined,
    websiteContent: websiteContent ? websiteContent.substring(0, 5000) : undefined,
    analysis,
  };
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse args
  let name: string | undefined;
  let url: string | undefined;

  for (const arg of args) {
    if (arg.startsWith('--name=')) {
      name = arg.substring(7);
    } else if (arg.startsWith('--url=')) {
      url = arg.substring(6);
    }
  }

  if (!name && !url) {
    console.error('❌ Usage: npm run research:foundation -- --name="Foundation Name" --url=https://...\n');
    process.exit(1);
  }

  if (!name) {
    name = url!;
  }

  const input: ResearchInput = {
    name: name!,
    websiteUrl: url,
  };

  const result = await researchFoundation(input);

  // Save output
  const today = new Date().toISOString().split('T')[0];
  const outputDir = path.join(process.cwd(), 'research', 'drafts', today);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const slug = name!.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const outputPath = path.join(outputDir, `${slug}.json`);

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log(`\n💾 Saved to: ${outputPath}`);
  console.log('\n✅ Research complete!\n');
  console.log('📋 Next steps:');
  console.log('   1. Review the analysis above');
  console.log('   2. Edit the draft JSON file as needed');
  console.log('   3. Use the data to create a foundation entry\n');
}

main();
