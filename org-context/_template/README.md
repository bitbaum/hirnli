# Template — What Claude Generates for a New Org

When Claude onboards a new organization, it follows this checklist.
Each step maps to one of the 19 ORG-SPECIFIC files.

## Step-by-Step Onboarding

### Phase 1: Identity (from statutes + annual report)

- [ ] **org-profile.ts** — Extract:
  - Legal name, legal form (Verein/Stiftung/GmbH)
  - Founded year, location, address
  - Website, email, fundraising email
  - Platform name and tagline
  - Experience label (e.g. "über 10 Jahre Erfahrung")
  - Mission keywords (3-5 terms: what you do, in German)
  - Mission summary (one sentence)

### Phase 2: Themes & Schema (from mission + strategy)

- [ ] **foundation.ts (ThemeId enum)** — Define 5-8 theme categories that
  describe this org's focus areas. Examples:
  - Social org: 'soziale-integration', 'arbeitsintegration', 'jugend'
  - Environmental org: 'klima', 'biodiversitaet', 'kreislaufwirtschaft'
  - Education org: 'digitale-bildung', 'fruehfoerderung', 'berufsbildung'

- [ ] **metadata.ts** — Theme definitions with labels, icons, descriptions.
  Initialize empty NOT_RECOMMENDED list.

### Phase 3: Narratives (from annual report + strategy + website)

- [ ] **stories.ts** — For each theme, write:
  - WHY block: Why this matters (societal problem)
  - HOW block: How the org addresses it (approach)
  - WHAT block: Concrete activities and outputs
  - EVIDENCE block: Numbers, testimonials, results
  - Anecdotes: 2-3 real stories per theme

- [ ] **schwerpunkte.ts** — Strategic focus areas with priority ranking

### Phase 4: Numbers (from financials + annual report)

- [ ] **numbers.ts** — Central metrics registry:
  - Impact numbers (people helped, units produced, CO2 saved, etc.)
  - Financial numbers (budget, revenue streams, costs)
  - Team numbers (FTE, volunteers, capacity)
  - Each number needs: value, label, source methodology, confidence level

- [ ] **budget-scenarios.ts** — 3-year projections:
  - Conservative, moderate, ambitious scenarios
  - Revenue streams with growth assumptions
  - Cost categories (personnel, rent, materials, etc.)

### Phase 5: Pages (from all documents)

- [ ] **revamp-2030/page.tsx** — Vision page (rename route if needed)
- [ ] **strategie/data.ts** — Strategy data (SDGs, partnerships, capacity)
- [ ] **strategie/components.tsx** — Strategy page components
- [ ] **team/data.ts** — Team members with roles and bios
- [ ] **wie-wir-arbeiten/data.ts** — How we work page (impact methodology)
- [ ] **finanzen/FinanzenClient.tsx** — Financial dashboard (adapt chart logic)

### Phase 6: Gesuch Templates

- [ ] **gesuch-templates.ts** — Application templates tailored to org's themes
- [ ] **api/documents/gesuch/[id]/route.tsx** — Gesuch PDF with org branding

### Phase 6b: PDF Reports

- [ ] **lib/pdf/impact-report/index.tsx** — Annual Wirkungsbericht PDF:
  - Rewrite header, mission statement, environmental metrics
  - Update social impact section (Arbeitsintegration, Bildung programs)
  - Point to org's financial data source for P&L table
  - Update contact block (org name, website, fundraising email)

- [ ] **lib/pdf/pitch-deck/index.tsx** — Pitch deck PDF:
  - Rewrite all 8 slides with org's story (problem, solution, impact, financials, ask)
  - Update key metrics (devices/units, people helped, CO2 saved or org equivalent)
  - Rewrite "Why Us" slide with org's track record
  - Update contact and branding colors

### Phase 7: Scoring Config

- [ ] **fit-scoring.ts** — Adjust scoring weights for org's themes:
  - SCORING_ENGINE: weight each ThemeId based on org's mission priorities
  - PRIORITY_FORMULA: tune P1-P4 thresholds for org's pipeline size
  - READINESS_ENGINE: adjust tier thresholds if needed

### Phase 8: Values

- [ ] **value-cascade.ts** — Rewrite value chain to match org's process steps

### Phase 9: Foundation Research Pipeline

- [ ] Set `org_id` and keyword list in `scripts/foundation-upsert.ts`
- [ ] Run screening with org's keywords: `pnpm run screen` (`scripts/foundation-screen.ts`)
- [ ] Research top candidates → write drafts → upsert (pages read live — no sync step)

## Verification

After all steps:
- [ ] `pnpm run build` passes
- [ ] All pages render correctly
- [ ] Foundation profiles show correct org context
- [ ] Gesuch templates use org's narratives
- [ ] Numbers are sourced and accurate
