# Codebase Audit Report

**Date**: 2026-03-04
**Auditor**: Claude Code
**Branch**: main
**Commit**: 9e5dec6
**Previous Audit**: 2026-03-02 (bd28b39)

---

## Executive Summary

Second comprehensive audit of revamp-info, a fundraising intelligence platform built with Next.js 15 + TypeScript + Tailwind CSS v4. Since the last audit (2 days ago), significant work was done on the homepage (story-driven redesign, workspace-oriented CTAs) and navigation (keyboard-accessible mega menus, mobile accordion, ARIA compliance).

**Improved since last audit:** Navigation accessibility is now strong — mega menus are keyboard-navigable with proper ARIA attributes, mobile nav uses accordion pattern with body scroll lock. Homepage removed unreliable metrics in favor of story-driven content with workspace CTAs pointing to fundraising tools. CollapsibleSection now has full ARIA + smooth animation. Zero `any` types, zero `@ts-ignore`, zero TypeScript errors.

**Still concerning:** 12 god components (>300 lines), with `FundraisingClient.tsx` still at 1,072 lines. ~80 unused exports and 3 entirely dead modules (~700 lines). No test suite. No `error.tsx` or `loading.tsx` files anywhere. Tabs component missing ARIA roles. 3 API routes leak `error.message` to clients. Foundation detail sidebar CTAs buried on mobile.

**Overall verdict:** Architecture is solid, mission alignment is strong, and the nav/accessibility improvements meaningfully raised the bar. The main gaps are dead code cleanup, error/loading boundaries, and continued mobile UX refinement.

---

## Health Score

| Area | Score | Prev | Delta | Notes |
|------|-------|------|-------|-------|
| First Principles | 7/10 | 7.5 | -0.5 | Deeper unused export analysis reveals ~80 dead exports, 3 dead modules (~700 lines). Offset by zero `any`, zero `@ts-ignore`. |
| Best Practices | 7.5/10 | 7 | +0.5 | Swiss German compliance improved (only 1 ß in generated data). ESLint down to 5 warnings, 0 errors. Nav heading hierarchy fixed. |
| Mission Alignment | 8.5/10 | 8.5 | = | Core value chain fully operational. Homepage now workspace-oriented (better for actual users). Education still behind auth. |
| Functional Correctness | 7/10 | 7 | = | All API routes protected by middleware. Share token secure. 3 routes leak error.message. No file size limits on import. |
| UI/UX & Responsive | 7/10 | 5.5 | +1.5 | Major nav accessibility fixes. Mobile accordion. Touch targets systematic (min-h-11). Tabs missing ARIA roles. No error.tsx/loading.tsx. |
| **Overall** | **7.5/10** | **7** | **+0.5** | Incremental improvement, mainly in accessibility and homepage clarity. |

---

## Phase 1: First Principles

### Ground Truth #1: Software serves humans
**Score: 6/10**

**God components (>300 lines) — 12 files:**

| File | Lines | Notes |
|------|-------|-------|
| `src/app/fundraising/FundraisingClient.tsx` | 1,072 | 3.5x limit. Needs splitting. |
| `src/app/fundraising/hub/page.tsx` | 754 | |
| `src/app/methodik/components.tsx` | 589 | |
| `src/app/revamp-2030/page.tsx` | 554 | |
| `src/components/layout/Nav.tsx` | 540 | Increased from rewrite, but justified (3 complex patterns) |
| `src/app/finanzen/FinanzenClient.tsx` | 523 | |
| `src/app/strategie/page.tsx` | 497 | |
| `src/app/finanzen/components.tsx` | 433 | |
| `src/app/fundraising/stiftungen/[slug]/gesuch/GesuchPageClient.tsx` | 431 | |
| `src/app/fundraising/applications/[id]/page.tsx` | 428 | |
| `src/app/fundraising/bildung/page.tsx` | 414 | |
| `src/app/fundraising/stiftungen/FoundationListClient.tsx` | 400 | |

**Dead code — ~80 unused exports, 3 entirely dead modules:**

| Module | Lines | Status |
|--------|-------|--------|
| `src/lib/domain/foundation-recommendations.ts` | 263 | **Entirely unused** — zero imports |
| `src/lib/config/hub-image-prompts.ts` | 175 | **Entirely unused** — zero imports |
| `src/lib/config/fit-scoring.ts` (SCORING_ENGINE) | ~250 | Main export never imported (only READINESS_ENGINE + PRIORITY_FORMULA used) |
| `src/lib/domain/fit-scoring.ts` (computeFitScore etc.) | ~200 | 5 exports unused |
| `src/lib/domain/budget-calculations.ts` | — | 6 of 11 exports unused |
| `src/lib/config/stories.ts` | — | 8 exports unused |
| `src/lib/config/projections.ts` | — | 7 exports unused |
| `src/lib/domain/foundation-research-stats.ts` | — | 4 of 6 exports unused |
| `src/lib/domain/foundation-search.ts` | — | 4 of 6 exports unused |
| `src/lib/utils/format.ts` | — | 6 exports unused |

**32 untracked screenshot PNGs** (~7.5 MB) in project root — debug artifacts that should be gitignored or deleted.

**Positive:**
- Zero `any` types across entire codebase
- Zero `@ts-ignore` or `@ts-expect-error`
- Only 4 `eslint-disable` uses (2 in auto-generated files, 2 justified)

### Ground Truth #2: State defines behavior (SSOT)
**Score: 7/10**

**Duplicate interfaces (3 violations):**
- `FilterChip` defined identically in `FilterBar.tsx:5`, `FilterSidebar.tsx:14`, `CheckboxFilterGroup.tsx:5`
- `ThemeMetadata` defined identically in `GesuchHeroSection.tsx:3`, `anschreiben-composer.ts:13`, `gesuch-composer.ts:47`
- `FoundationAIContext` in `api/ai/gesuch-section/route.ts:44` duplicates `lib/domain/ai-context.ts:14`

**Layer violation — lib/ imports from app/ (3 files):**
- `src/lib/config/documents.ts:14` → imports from `@/app/finanzen/data`
- `src/lib/config/nav.ts:6` → imports from `@/app/finanzen/data`
- `src/lib/domain/data-exporters.ts:10` → imports from `@/app/fundraising/data`

**Type labels inline instead of config:**
- `src/app/api/ai/gesuch-section/route.ts:76-81` — `typeLabels` A/B/C/D defined inline; canonical `TYPE_LABELS` lives in `metadata.ts`

**Positive:**
- Foundation types exemplary — all derived from Zod via `z.infer<>`
- Foundation data pipeline (DB → sync → generated → UI) is clean SSOT
- 22+ type derivations from Zod schemas across schema files

### Ground Truth #3: Design for change
**Score: 8/10**

- [ISSUE] `app/finanzen/data.ts` and `app/team/data.ts` should be in `lib/config/` — multiple lib/ files import from them
- [GOOD] Adding a foundation = 1 DB entry + `npm run sync`. Dynamic routing handles everything.
- [GOOD] Adding a page = route file + NAV_STRUCTURE entry
- [GOOD] Registry/analysis layer split enables multi-tenancy

### Ground Truth #4: Automate the mechanical
**Score: 7/10**

- [ISSUE] No `predev` script — developers must manually `npm run sync` before `npm run dev`
- [ISSUE] No test suite at all (zero test files across 234 source files)
- [ISSUE] No `error.tsx` or `not-found.tsx` at app level
- [ISSUE] CSV helpers duplicated in `api/export/fundraising-pipeline/route.ts` instead of using shared `data-exporters.ts`
- [GOOD] 17 npm scripts for foundation pipeline (research, screening, import, sync, validation)
- [GOOD] `prebuild` hook ensures sync before every build

### Ground Truth #5: Simplicity scales
**Score: 7/10**

- [ISSUE] Fit scoring over-engineered: 750+ lines across 2 files, main `SCORING_ENGINE` and `computeFitScore` never used
- [ISSUE] `foundation-recommendations.ts` is 263 lines of YAGNI
- [ISSUE] `hub-image-prompts.ts` is 175 lines never imported
- [GOOD] Overall architecture passes "explain it in one sentence" test
- [GOOD] Page structure flat and predictable

### Ground Truth #6: Correctness beats speed
**Score: 7/10**

- [ISSUE] AI route (`api/ai/gesuch-section`) has no Zod validation on request body
- [ISSUE] No global error boundary (`error.tsx`)
- [ISSUE] No custom 404 page (`not-found.tsx`)
- [ISSUE] `console.error` in 3 client catch blocks with no user-visible feedback
- [GOOD] All mutation API routes (POST/PUT/PATCH) have Zod validation
- [GOOD] All API routes have try/catch with structured error responses
- [GOOD] Cron routes verify CRON_SECRET (defense-in-depth)

---

## Phase 2: Best Practices Compliance

### Critical Rules

| Rule | Status | Details |
|------|--------|---------|
| No console.log | **PASS** | Zero `console.log` in production code. 13 `console.error` in client components (advisory). |
| Swiss German (ss not ß) | **FAIL** | 1 ß in `stiftungen-generated.ts:11` ("ausschließlich"). Comes from upstream DB data. |
| TypeScript strict | **PASS** | `npx tsc --noEmit` → 0 errors |
| ESLint | **FAIL** | 5 warnings, 0 errors. Unused imports: `getQualityTier` (2 files), `readinessToTier`, unused eslint-disable, unused `slug` in script. |
| Naming conventions | **PASS** | All files follow PascalCase/camelCase/kebab-case conventions |
| API error format | **FAIL** | 4 export routes return `{ error }` without `success` field |
| Auth on protected routes | **PASS** | All API routes covered by middleware matcher |
| Types from schemas | **FAIL** | 2 violations: `FoundationAIContext` and `PersonalizedGesuch` duplicated locally instead of imported from domain |
| `lint:umlauts` script | **MISSING** | Script referenced in CLAUDE.md does not exist in package.json |

### Violations Summary

| Severity | Count | Details |
|----------|-------|---------|
| Rule violations | 12 | 1 ß + 5 lint warnings + 4 export format + 2 duplicate types |
| Advisory | 13 | `console.error` in client components |

---

## Phase 3: Mission/Vision Alignment

| Area | Rating | Key Evidence | Primary Gap |
|------|--------|-------------|-------------|
| Fundraising Workflow | **Implemented** | Full pipeline: discovery → profiling → Gesuch → kanban → PDF. ApplicationBoard with drag-and-drop. | Pitch deck, impact report not yet built |
| Data Transparency | **Implemented** | NumberInspector on every metric. Methodology page with 9 sections. Sources cited. | No automated test for number traceability |
| Environmental Impact | **Implemented** | CO₂/E-Waste with Fraunhofer sourcing. Honest about estimation limits (25% directly measurable). | Devices estimated from revenue, not counted |
| Education & Digital Inclusion | **Partially** | Bildung program page exists under /fundraising/bildung/ | Behind auth — no public education content |
| Financial Transparency | **Implemented** | Multi-year P&L from Kivitendo. Public access. Account-level drill-down. | Manual Excel import (lastImport: 2026-01-11) |
| Swiss Context | **Implemented** | CHF everywhere, de-CH locale, Zürich address, ss not ß | 1 ß in generated data |
| Foundation Profiles as Presentations | **Implemented** | HMAC share tokens, GesuchShareView, fit analysis, theme alignment | Full profiles auth-gated; only Gesuch share is public |
| Config-Driven Architecture | **Implemented** | 14 ORG-SPECIFIC files documented. new-org.sh script. org-context templates. | No CI validation of onboarding flow |

**Mission alignment is the strongest area.** The core value chain (Ingest → Present → Find → Profile → Generate) is fully operational. The weakest mission area is education/digital inclusion — a core mission keyword that only exists as an internal planning page.

---

## Phase 4: Improvement Roadmap

### Quick Wins (<1 hour each)

| # | Action | Impact | Files |
|---|--------|--------|-------|
| 1 | Delete dead modules: `foundation-recommendations.ts`, `hub-image-prompts.ts` | -438 lines dead code | 2 files |
| 2 | Fix 5 ESLint warnings (unused imports) | Clean lint | 4 files |
| 3 | Fix export routes to use `{ success: false, error }` format | API consistency | 4 files |
| 4 | Add `not-found.tsx` at app level | Branded 404 | 1 file |
| 5 | Add `error.tsx` at app level | Error recovery | 1 file |
| 6 | Fix ß in stiftungen-generated.ts source data | Swiss German compliance | DB record |
| 7 | Delete 32 screenshot PNGs from project root | -7.5 MB repo bloat | .gitignore + delete |
| 8 | Extract `ThemeMetadata` to shared type | Eliminate 3×3 duplication | 4 files |
| 9 | Extract `FilterChip` to shared type | Eliminate 3× duplication | 4 files |
| 10 | Import `TYPE_LABELS` from metadata.ts in AI route | SSOT | 1 file |

### Medium Effort (1–5 hours each)

| # | Action | Impact | Files |
|---|--------|--------|-------|
| 1 | Add ARIA roles to Tabs component (`role="tablist"`, `role="tab"`, `role="tabpanel"`) | Accessibility — affects Finanzen, Foundation Detail | 1 component + consumers |
| 2 | Move `app/finanzen/data.ts` → `lib/config/financial-data.ts` | Fix layer violation | ~6 files |
| 3 | Move `app/team/data.ts` → `lib/config/team.ts` | Fix layer violation | ~4 files |
| 4 | Add `loading.tsx` files for key route groups | Perceived performance | ~5 files |
| 5 | Add Zod validation to AI gesuch-section route | Correctness | 1 file |
| 6 | Prune unused exports from budget-calculations, stories, projections, format | -500+ lines dead code | ~6 files |
| 7 | Surface foundation sidebar CTAs on mobile (sticky bar or reorder) | Mobile UX | 1-2 files |
| 8 | Fix touch targets: FilterPill close (16px), YearSelector (32px), Tabs (36px) | Mobile accessibility | 3 files |
| 9 | Add `sr-only` text for visual-only indicators (star ratings, progress bars) | Screen reader accessibility | ~5 files |
| 10 | Add `lint:umlauts` script to package.json | Automated Swiss German checking | 1 file |

### Strategic (>5 hours)

| # | Action | Impact | Priority |
|---|--------|--------|----------|
| 1 | Split `FundraisingClient.tsx` (1,072 lines) into focused components | Maintainability | High |
| 2 | Add test suite for critical domain logic (fit scoring, gesuch composition, budget calculations) | Correctness | High |
| 3 | Add `predev` sync + create structured logger (replace console.error) | Developer experience | Medium |
| 4 | Make education content publicly accessible (public /bildung route) | Mission alignment | Medium |
| 5 | Implement pitch deck and impact report document types | Mission completeness | Medium |
| 6 | Add CSP, HSTS, Referrer-Policy, Permissions-Policy security headers | Security hardening | Medium |
| 7 | Replace `parseInt` with Zod validation on all API query params | Correctness | Low |
| 8 | Use timing-safe comparison in middleware password check | Security hardening | Low |

---

## Phase 5: Functional Correctness

### Authentication & Authorization

**Mechanism:** HTTP Basic Auth via `src/middleware.ts`. Password-only check (username ignored). `INTERNAL_PASSWORD` from env.

**Protected routes (all via middleware matcher):**
`/fundraising/**`, `/api/pdf/**`, `/api/applications/**`, `/api/gesuch-overrides/**`, `/api/ai/**`, `/api/export/**`, `/api/foundations/**`, `/api/customizations/**`, `/api/cron/**`, `/api/documents/**`

**Public routes (intentional):** `/`, `/finanzen`, `/wirkung`, `/methodik`, `/preismodell`, `/strategie`, `/team`, `/operations`, `/dokumente`, `/wie-wir-arbeiten`, `/revamp-2030`, `/gesuch/share/[token]`

**Improvement since last audit:** `/api/documents/**` is now protected (was missing from matcher).

**Issues:**
- `middleware.ts:55` — Password comparison uses `===` (not timing-safe). Low practical risk but should use `crypto.timingSafeEqual`.
- `middleware.ts:42` — When `INTERNAL_PASSWORD` is unset, all routes are open. Intentional for local dev but no failsafe for accidental production misconfiguration.

### API Routes Summary

| Route | Auth | Validation | Error Handling | Issues |
|-------|------|-----------|----------------|--------|
| POST /api/applications | ✅ | ✅ Zod | ✅ try/catch | `APPLICATION_STATUSES` duplicated locally |
| GET /api/applications | ✅ | ❌ No query param validation | ✅ | `parseInt` on params without NaN check; count via `.length` not `COUNT(*)` |
| PATCH /api/applications/[id] | ✅ | ✅ Zod | ✅ | Same status duplication |
| DELETE /api/applications/[id] | ✅ | ✅ existence check | ✅ | — |
| GET /api/applications/dashboard | ✅ | N/A | ✅ | Non-null assertion on `decisionExpected` |
| POST /api/foundations | ✅ | ✅ Zod | ✅ | — |
| GET /api/foundations | ✅ | ❌ No query param validation | ✅ | LIKE special chars not escaped; `parseInt` NaN |
| PUT /api/foundations/[id] | ✅ | ✅ Zod (full) | ✅ | — |
| PATCH /api/foundations/[id] | ✅ | ✅ Zod (partial) | ✅ | — |
| DELETE /api/foundations/[id] | ✅ | ✅ existence | ✅ | Soft delete (archive) ✅ |
| POST /api/foundations/import | ✅ | ✅ Zod per-item | ✅ | No file size limit |
| PUT /api/gesuch-overrides/[slug] | ✅ | ✅ Zod | ✅ | Clean implementation |
| POST /api/ai/gesuch-section | ✅ | ❌ Manual checks only | ✅ | No Zod schema; body type asserted |
| GET /api/export/* (4 routes) | ✅ | N/A | ✅ | Error format missing `success` field |
| POST /api/customizations | ✅ | ✅ Zod | ✅ | — |
| POST /api/customizations/apply | ✅ | ✅ Zod | ✅ | Leaks `error.message` to client |
| GET /api/cron/* (2 routes) | ✅✅ | N/A | ✅ | Double auth (middleware + CRON_SECRET) |
| GET /api/pdf/gesuch/[slug] | ✅ | ✅ slug + schwerpunkt | ✅ | Leaks `error.message` to client |
| GET /api/documents/gesuch/[id] | ✅ | ✅ existence | ✅ | Leaks `error.message` to client |

### Share Token Security

`src/lib/utils/share-token.ts` — HMAC-SHA256(slug, SHARE_SECRET), truncated to 16 hex chars (64 bits).

- Token space is 2^64 — infeasible to brute-force but below 128-bit recommendation
- `resolveShareToken` uses non-timing-safe comparison (low practical risk)
- Returns `null` if `SHARE_SECRET` unset (fail-safe)
- Share page returns 404 on invalid tokens (no enumeration)

### Security Headers

Present: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`
Missing: `Content-Security-Policy`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`

No `NEXT_PUBLIC_*` env vars used. All secrets server-side only. `.env*.local` in `.gitignore`.

---

## Phase 6: UI/UX & Responsive Design

### Mobile-First Design — 8/10

**Good:**
- Consistent mobile-first grid patterns (`grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-4`)
- P&L table has dedicated mobile card view
- Foundation list has mobile search/sort/filter row + FilterDrawer

**Issues:**
- `FoundationListClient.tsx:187` — Priority distribution grid uses `grid-cols-4` without mobile breakpoint
- `Nav.tsx:101` — MegaMenu `w-[640px]` may clip near lg breakpoint
- `finanzen/components.tsx:419-430` — MonthlyBreakdownTable totals row not responsive
- Foundation detail sidebar CTAs buried on mobile (below all tab content)

### Touch Targets — 9/10

**Good:**
- Systematic `min-h-11` (44px) across mobile nav, filter sidebar, accordion buttons
- Mobile hamburger: `min-h-11 min-w-11`

**Issues:**
- `FilterBar.tsx:27-39` — Filter chip buttons ~28-30px (below 44px)
- `FoundationListClient.tsx:389-398` — FilterPill close button ~16px
- `YearSelector.tsx:14` — Buttons ~32px
- `Tabs.tsx:26` — Buttons ~36-38px

### Accessibility — 7/10

**Good (improved since last audit):**
- Nav mega menus: `aria-haspopup`, `aria-expanded`, `aria-controls`, `role="menu"`, `role="menuitem"`
- MobileAccordion: `aria-expanded`, `aria-controls`, `role="region"`, proper `aria-label`
- CollapsibleSection: `aria-expanded`, `aria-controls`, `aria-labelledby`, `role="region"`
- 79 ARIA attributes across 22 files
- 35 `focus-visible:` occurrences across 15 files
- Decorative icons consistently `aria-hidden="true"`
- Icon-only buttons have `aria-label`

**Issues:**
- **Tabs component missing ARIA roles** — no `role="tablist"`, `role="tab"`, `role="tabpanel"`. Affects Finanzen, Foundation Detail.
- **Zero `sr-only` usage** — star ratings, progress bars, visual indicators have no screen reader text
- `text-[9px]` and `text-[11px]` in FoundationSidebar/FoundationCard — below readable minimum (12px)
- `text-text-muted` (#697882) — 4.3:1 contrast, passes AA but fails AAA for small text

### Loading/Empty/Error States — 5/10

**Good:**
- Charts dynamically imported with `ChartSkeleton` loading
- Foundation list has thorough empty state with filter reset
- FundraisingDashboard has empty state

**Issues:**
- **Zero `error.tsx` files** in entire app — runtime errors show unstyled Next.js page
- **Zero `loading.tsx` files** — no loading indicators during page transitions
- **No custom `not-found.tsx`** — default Next.js 404
- Pipeline data fetch error shows no user feedback (only `console.error`)

---

## Action Items (Prioritized)

### Critical (do first)

1. **Add `error.tsx` at app level** — runtime errors currently crash to unstyled page
2. **Add `not-found.tsx` at app level** — branded 404 experience
3. **Add ARIA roles to Tabs component** — WCAG violation on multiple key pages
4. **Fix 4 export routes** — add `success` field to error responses

### High Priority

5. **Delete dead modules** — `foundation-recommendations.ts` (263 lines), `hub-image-prompts.ts` (175 lines)
6. **Extract shared types** — `ThemeMetadata` and `FilterChip` (eliminate 6 duplicate interfaces)
7. **Add Zod validation to AI route** — request body currently unvalidated
8. **Move financial/team data to lib/config/** — fix layer violation
9. **Add `loading.tsx`** for key route groups (fundraising, stiftungen, finanzen)
10. **Fix touch targets** — FilterPill (16px), YearSelector (32px), Tabs (36px)

### Medium Priority

11. **Surface sidebar CTAs on mobile** for foundation detail page
12. **Add `sr-only` text** for visual indicators (stars, progress bars)
13. **Prune ~60 unused exports** from budget-calculations, stories, projections, etc.
14. **Split FundraisingClient.tsx** (1,072 lines) into focused components
15. **Add `lint:umlauts` script** (referenced in CLAUDE.md but doesn't exist)
16. **Fix ß in generated data** — normalize "ausschließlich" → "ausschliesslich" in DB
17. **Add security headers** — CSP, Referrer-Policy, Permissions-Policy
18. **Delete 32 screenshot PNGs** from project root

### Low Priority

19. **Add test suite** for critical domain logic
20. **Replace `parseInt` with Zod** on API query parameters
21. **Use `crypto.timingSafeEqual`** in middleware password check
22. **Add `predev` script** for automatic sync before dev server
23. **Make education content public** (aligns with mission keyword "digitale Bildung")

---

## Comparison with Previous Audit (2026-03-02)

| Area | Previous | Current | Change |
|------|----------|---------|--------|
| Overall | 7/10 | 7.5/10 | +0.5 |
| First Principles | 7.5/10 | 7/10 | -0.5 (deeper dead code analysis) |
| Best Practices | 7/10 | 7.5/10 | +0.5 |
| Mission Alignment | 8.5/10 | 8.5/10 | = |
| Functional Correctness | 7/10 | 7/10 | = |
| UI/UX & Responsive | 5.5/10 | 7/10 | +1.5 |

**Resolved since last audit:**
- `/api/documents/**` now protected by middleware ✅
- Homepage hero overflow on mobile ✅
- Homepage duplicate metrics removed ✅
- "Deep Dive" English jargon replaced ✅
- Nav mega menus keyboard-accessible ✅
- Mobile nav flat list → accordion ✅
- CollapsibleSection ARIA + keyboard ✅
- `<h4>` in nav replaced with `<span>` ✅

**New issues found:**
- Deeper dead code analysis reveals ~80 unused exports (prev: 8)
- 3 entirely dead modules totaling ~700 lines
- Tabs component missing ARIA roles
- Zero `sr-only` usage in entire codebase
- `text-[9px]` / `text-[11px]` below readable minimum
- 3 API routes leak `error.message` to clients
