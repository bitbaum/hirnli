#!/usr/bin/env tsx
/**
 * Foundation Batch Research
 *
 * Processes a list of foundation candidates and prepares them for LLM-assisted analysis.
 * Generates detailed research prompts that can be analyzed by Claude or other LLMs.
 *
 * Usage:
 *   npm run research:batch -- --tier=1
 *   npm run research:batch -- --file=research/candidates.json
 *
 * Input: Either tier from validation results, or custom JSON file with:
 *   [
 *     { "name": "Foundation Name", "url": "https://...", "location": "Zürich" }
 *   ]
 *
 * Output:
 *   research/batch-analysis/YYYY-MM-DD/
 *   ├── batch-summary.json
 *   ├── foundation-1-prompt.md
 *   ├── foundation-2-prompt.md
 *   └── ...
 *
 * Workflow:
 *   1. Run this script to generate prompts
 *   2. Use Claude Code to analyze each prompt
 *   3. Save analysis results
 *   4. Review and approve/reject entries
 */

import * as fs from 'fs';
import * as path from 'path';

interface Candidate {
  name: string;
  slug?: string;
  url?: string;
  location?: string;
  foundVia?: string[];
  source?: string;
}

interface BatchJob {
  date: string;
  candidateCount: number;
  outputDir: string;
  candidates: Candidate[];
}

// ============================================================================
// LOAD CANDIDATES
// ============================================================================

function loadCandidatesFromDiscovery(): Candidate[] {
  // Load from the most recent Fundraiso discovery file
  const researchDir = path.join(process.cwd(), 'research');
  const discoveryFile = 'fundraiso-discovery-2026-02-16.json';
  const filePath = path.join(researchDir, discoveryFile);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Discovery file not found: ${discoveryFile}`);
    return [];
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Filter for Tier 1-2 candidates (Zürich-based or exact theme matches)
  return data.foundations
    .filter((f: any) =>
      f.location?.includes('Zürich') ||
      f.location?.includes('Winterthur') ||
      (f.foundVia && f.foundVia.length >= 2) // Multi-match signal
    )
    .slice(0, 20); // Limit to top 20 for manageable batch size
}

function loadCandidatesFromFile(filePath: string): Candidate[] {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${filePath}`);
    return [];
  }

  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

// ============================================================================
// GENERATE RESEARCH PROMPTS
// ============================================================================

function generatePromptForCandidate(candidate: Candidate, index: number): string {
  return `# Foundation Research - Candidate ${index}

**Name**: ${candidate.name}
**Location**: ${candidate.location || 'Unknown'}
**Source**: ${candidate.source || 'Fundraiso'}
${candidate.url ? `**Website**: ${candidate.url}` : ''}
${candidate.foundVia ? `**Found via keywords**: ${candidate.foundVia.join(', ')}` : ''}

---

## Research Tasks

### 1. Visit Website
${candidate.url ? `Go to: ${candidate.url}` : 'Search for the foundation website'}

Extract:
- What do they fund? (Specific themes, target groups, geographic focus)
- Application process? (Online form, email, contact only, none?)
- Do they accept external applications? (Funder vs Operator)
- Any funding amounts or deadlines mentioned?
- Contact information (email, phone, address)

### 2. Check ESA Register
Search: https://www.esa.admin.ch/de/stiftungsverzeichnis

Find:
- UID (CHE-XXX.XXX.XXX)
- Official Stiftungszweck (purpose)
- Status (active, in liquidation?)

### 3. Assess Fit for Revamp-IT

**Revamp-IT Profile**:
- Location: Zürich
- Activity: Computer refurbishment + Linux installation + donation to people in need
- Themes: Circular economy, social integration, digital education, work integration
- Target beneficiaries: People in disadvantaged situations, unemployed, refugees
- Legal form: Social enterprise (gemeinnütziger Verein)

**Assessment**:
- Is this a grant-maker or operator? (Critical: operators don't fund external projects)
- Theme alignment: Which of these apply?
  - klima (climate)
  - kreislaufwirtschaft (circular economy)
  - soziale-integration (social integration)
  - digitale-bildung (digital education)
  - jugend (youth)
  - arbeitsintegration (work integration)
  - zuerich (Zürich region)
- Fit score (1-3):
  - 3 = Excellent match
  - 2 = Good match, targeted argumentation needed
  - 1 = Limited match
- Foundation type (Robert Schmuki):
  - A = Professional grant foundation (data-driven, structured process)
  - B = Wealthy family foundation (personal interests matter)
  - C = Small family foundation (3-5 people, emotional decisions)
  - D = Corporate foundation (professional but less transparent)
  - network = Network/association (no direct funding)

### 4. Draft Summaries

**Purpose Summary (150+ chars)**:
[What does this foundation fund? Be specific about themes, target groups, geographic focus]

**Research Notes (250+ chars)**:
[Why is this a good/bad fit for Revamp-IT? Include application process insights, strategic recommendations, red flags]

### 5. Decision

**Outcome**: [Add to database | Exclude | Needs more research]
**Reason**: [Brief explanation]

If **Add to database**, provide:
- Slug (kebab-case): ${candidate.slug || candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
- UID (if found):
- Website URL:
- Application method: online | email | contact | unknown
- Themes: [list]
- Type: A | B | C | D | network
- Fit: 1 | 2 | 3
- Priority: 1 | 2 | 3 | 4
- Contact: email, phone, address

If **Exclude**, add to NOT_RECOMMENDED with reason.

---

## Output Format

\`\`\`json
{
  "candidate": "${candidate.name}",
  "decision": "add" | "exclude" | "needs_research",
  "isFunder": true | false,
  "esaUID": "CHE-XXX.XXX.XXX" | null,
  "themes": [],
  "type": "A" | "B" | "C" | "D" | "network",
  "fit": 1 | 2 | 3,
  "priority": 1 | 2 | 3 | 4,
  "purposeSummary": "",
  "researchNotes": "",
  "contact": {
    "email": "",
    "phone": "",
    "address": ""
  },
  "websiteUrl": "",
  "applicationMethod": "online" | "email" | "contact" | "unknown",
  "reasoning": ""
}
\`\`\`
`;
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

function processBatch(candidates: Candidate[]): BatchJob {
  const today = new Date().toISOString().split('T')[0];
  const outputDir = path.join(process.cwd(), 'research', 'batch-analysis', today);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n📦 Processing ${candidates.length} candidates\n`);

  const job: BatchJob = {
    date: today,
    candidateCount: candidates.length,
    outputDir,
    candidates,
  };

  // Generate prompt for each candidate
  candidates.forEach((candidate, index) => {
    const prompt = generatePromptForCandidate(candidate, index + 1);
    const fileName = `${String(index + 1).padStart(2, '0')}-${candidate.slug || candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30)}.md`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, prompt, 'utf-8');
    console.log(`  ✅ ${index + 1}. ${candidate.name}`);
  });

  // Save batch summary
  const summaryPath = path.join(outputDir, 'batch-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(job, null, 2), 'utf-8');

  console.log(`\n💾 Batch prompts saved to: ${outputDir}`);
  console.log(`📊 Summary: ${summaryPath}\n`);

  return job;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('🔬 Foundation Batch Research\n');

  const args = process.argv.slice(2);
  let candidates: Candidate[] = [];

  // Parse arguments
  let tier: number | undefined;
  let file: string | undefined;

  for (const arg of args) {
    if (arg.startsWith('--tier=')) {
      tier = parseInt(arg.substring(7), 10);
    } else if (arg.startsWith('--file=')) {
      file = arg.substring(7);
    }
  }

  if (file) {
    console.log(`📂 Loading candidates from: ${file}\n`);
    candidates = loadCandidatesFromFile(file);
  } else if (tier) {
    console.log(`📂 Loading Tier ${tier} candidates from Fundraiso discovery\n`);
    candidates = loadCandidatesFromDiscovery();
  } else {
    // Default: load from discovery
    console.log('📂 Loading candidates from most recent Fundraiso discovery\n');
    candidates = loadCandidatesFromDiscovery();
  }

  if (candidates.length === 0) {
    console.error('❌ No candidates found\n');
    process.exit(1);
  }

  const job = processBatch(candidates);

  console.log('✅ Batch preparation complete!\n');
  console.log('📋 Next steps:');
  console.log('   1. Review the generated prompts in the output directory');
  console.log('   2. Use Claude Code to analyze each foundation');
  console.log('   3. Save the analysis results as JSON files');
  console.log('   4. Run foundation-add.ts or bulk import the approved entries\n');
}

main();
