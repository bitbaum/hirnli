# Org Context — New Organization Onboarding

This directory holds the raw input documents that Claude Code uses to
rewrite the 19 ORG-SPECIFIC files for a new organization.

## How It Works

1. Clone this repo for your Verein
2. Drop your documents into `org-context/<your-org>/`
3. Ask Claude Code: "Onboard this org using the docs in org-context/<your-org>"
4. Claude reads everything, rewrites the 19 files, runs the pipeline
5. Push to Vercel — done

## What Documents to Provide

Drop as many of these as you have into your org folder:

| Document | What Claude Extracts | Required? |
|----------|---------------------|-----------|
| **Statutes / Satzungen** | Legal name, form, purpose, founding year | Yes |
| **Annual Report / Jahresbericht** | Impact numbers, financials, stories | Yes |
| **Website export or URL** | Mission, team, services, projects | Yes |
| **Team bios** | Names, roles, backgrounds | Yes |
| **Budget / financial plan** | Revenue streams, costs, projections | Recommended |
| **Strategy document** | Vision, goals, focus areas, SDGs | Recommended |
| **Past grant applications** | Writing style, project descriptions | Helpful |
| **Partner/donor list** | Existing relationships, credibility | Helpful |
| **Photos/branding** | Logo, color scheme | Optional |

**Minimum viable input:** Statutes + annual report + website URL.
Claude can work with less, but more context = better output.

## What Claude Does With These

Claude reads all documents and rewrites these 19 ORG-SPECIFIC files:

### Identity & Data
1. `src/lib/config/org-profile.ts` — Legal identity, contact, mission keywords
2. `src/lib/config/numbers.ts` — Central metrics registry (impact, financials, team)
3. `src/lib/config/budget-scenarios.ts` — 3-year funding models and projections

### Content & Narrative
4. `src/lib/config/stories.ts` — WHY/HOW/WHAT/EVIDENCE narratives per theme
5. `src/lib/config/schwerpunkte.ts` — Strategic focus areas and priorities

### Foundation Research
6. `src/lib/schemas/foundation.ts` — ThemeId enum (org's focus area categories)
7. `src/lib/config/foundations/metadata.ts` — Theme definitions, NOT_RECOMMENDED list
8. `src/lib/config/gesuch-templates.ts` — Gesuch document templates
9. `src/lib/config/fit-scoring.ts` — Priority formula and scoring weights

### Pages
10. `src/app/revamp-2030/page.tsx` — Vision/mission/strategy page
11. `src/app/strategie/data.ts` — Strategy page data
12. `src/app/strategie/components.tsx` — Strategy page components
13. `src/app/team/data.ts` — Team members and roles
14. `src/app/wie-wir-arbeiten/data.ts` — How we work page data
15. `src/app/finanzen/FinanzenClient.tsx` — Financial dashboard

### Documents & PDFs
16. `src/app/api/documents/gesuch/[id]/route.tsx` — Gesuch PDF generation
17. `src/lib/pdf/impact-report/index.tsx` — Annual impact report PDF template
18. `src/lib/pdf/pitch-deck/index.tsx` — Pitch deck PDF template

### Values
19. `src/lib/config/value-cascade.ts` — Value chain specific to org's process

### After Rewriting
- Run `scripts/new-org.sh` or manually: reseed foundation DB with new research
- `npm run sync && npm run build`
- Push to Vercel

## Directory Structure

```
org-context/
├── README.md              ← You are here
├── _template/
│   └── README.md          ← Checklist of what Claude generates
├── revamp-it/             ← Reference: current org (docs live in the 19 files)
└── <your-org>/            ← Drop your documents here
    ├── statuten.pdf
    ├── jahresbericht-2025.pdf
    ├── website-url.txt
    └── ...
```
