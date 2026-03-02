# Codebase Audit Report

**Date**: 2026-03-02
**Auditor**: Claude Code
**Branch**: main
**Commit**: bd28b39

---

## Executive Summary

This is the first comprehensive audit of revamp-info, a fundraising intelligence platform built with Next.js 15/16 + TypeScript + Tailwind CSS v4. The codebase spans ~36,200 lines across 230 files (136 TSX + 94 TS), serving 27 page routes, 19 API routes, 78 components, and 210 statically-generated foundation profiles.

**The good:** The architecture is genuinely config-driven with clean layer separation (config/domain/hooks/components). TypeScript strict mode reports zero errors, zero `any` types, zero `@ts-ignore`. Foundation profiles as "conversation tools" are the strongest feature -- fit analysis, theme alignment, approach steps, and document generation all work from a single source of truth. The foundation data pipeline (DB -> sync -> generated TS -> UI) is reliable and proven by every build.

**The concerning:** Two security gaps remain (unprotected `/api/documents/**` route, cron secret bypass when env var unset). Mobile responsiveness has 6 critical layout breaks from bare `grid-cols-2` usage without mobile fallbacks. The homepage hero section overflows on phones. There are 17 god components exceeding 300 lines, with `FundraisingClient.tsx` at 1,072 lines being 3.5x the limit. No test suite exists. Console statements appear in 13 component files.

**Overall verdict:** A well-architected platform that delivers on its core mission but needs targeted mobile fixes, security patching, and incremental decomposition of large components.

---

## Health Score

| Area | Score | Notes |
|------|-------|-------|
| First Principles | 7.5/10 | Strong SSOT discipline, clean layer separation. Dragged down by 2 data files in `app/` imported by `lib/` (layer violation), 17 god components, and zero test coverage. |
| Best Practices | 7/10 | Zero `any`, zero `@ts-ignore`, clean TypeScript. Fails: 13 console statements in components, 1 ESLint error, 7 ESLint warnings, 6 API routes with inconsistent error format. |
| Mission Alignment | 8.5/10 | Core value chain (ingest/present/find/profile/generate) substantively implemented. Foundation profiles as conversation tools are excellent. Gaps: pitch deck, impact report, live financial ingestion. |
| Functional Correctness | 7/10 | Build passes cleanly (400 static pages). Fails: unprotected `/api/documents/**`, cron secret bypass, customizations filter bug, pagination count queries, deprecated params pattern. |
| UI/UX & Responsive | 5.5/10 | Good patterns exist (mobile nav, filter drawer, foundation cards) but 6 critical mobile layout breaks, small touch targets on kanban, missing modal ARIA, 42 low-contrast gray text instances, 10 sub-12px text instances. |
| **Overall** | **7/10** | Solid architecture and mission delivery, but mobile experience and a few security gaps need attention. |

---

## Phase 1: First Principles

### Ground Truth #1: Software Serves Humans

**Rating: GOOD**

8 unused domain exports found (dead code):

| # | Symbol | File | Lines |
|---|--------|------|-------|
| 1 | `compareScenarios` | `lib/domain/budget-calculations.ts` | :100 |
| 2 | `getCategoryPercentages` | `lib/domain/budget-calculations.ts` | :137 |
| 3 | `validateScenarioTotals` | `lib/domain/budget-calculations.ts` | :153 |
| 4 | `getStaleFoundations` | `lib/domain/foundation-research-stats.ts` | :182 |
| 5 | `getNeedsAttention` | `lib/domain/foundation-research-stats.ts` | :204 |
| 6 | `getRecommendations` | `lib/domain/foundation-recommendations.ts` | :212 |
| 7 | `calcSelfFinancingRate` | `lib/domain/calculations.ts` | :30 |
| 8 | `getFoundationTier` | `lib/domain/foundation-helpers.ts` | :204 |

1 unused UI component: `FilterBar` (`components/ui/FilterBar.tsx`)
1 dead domain module: `lib/domain/fit-scoring.ts` (272 lines, only used from scripts/, not app)
2 unused config exports: `WORKSHOP_BEST_PRACTICES`, `RESEARCH_SOURCES` in `hub-space-plan.ts`
2 unused schema types: `ProofPoint`, `BudgetLineItem` (story.ts version)

### Ground Truth #2: State Defines Behavior (SSOT)

**Rating: STRONG with specific violations**

**SSOT discipline is excellent:** 42 `z.infer` derivations, types consistently derived from schemas, config centralized in `lib/config/`.

**Violations:**

| # | Issue | File | Severity |
|---|-------|------|----------|
| 1 | **Duplicate `FoundationAIContext`** | `api/ai/gesuch-section/route.ts:44` duplicates `lib/domain/ai-context.ts:14` | HIGH |
| 2 | **No Zod validation on AI endpoint** | `api/ai/gesuch-section/route.ts:59` -- `RequestBody` type with manual validation instead of `safeParse` | HIGH |
| 3 | **Hardcoded org identity in AI prompt** | `api/ai/gesuch-section/route.ts:22-42` -- addresses, metrics hardcoded instead of using `ORG_PROFILE` + `NumberSources` | HIGH |
| 4 | **Hardcoded org ID** | `api/gesuch-overrides/[slug]/route.ts:17` -- `'revamp-it'` instead of `ORG_PROFILE.slug` | HIGH |
| 5 | **Hardcoded org string** | `components/gesuch/GesuchSubmitSection.tsx:157` -- `'Revamp-IT -- Werkstatt...'` | MEDIUM |
| 6 | **6+ hardcoded label sets** | `SourceModal.tsx:13`, `DocumentCard.tsx:17`, `AddToPipelineButton.tsx:11`, `NumberInspector.tsx:14`, `api/ai/route.ts:76` | MEDIUM |
| 7 | **Inconsistent API error format** | 6 routes use `{ error }` instead of `{ success: false, error }` | MEDIUM |

### Ground Truth #3: Design for Change (Modularity)

**Rating: GOOD with one structural issue**

**Layer violation: `app/` data imported by `lib/`** -- 7 imports flow upward:

| Importer | Imports From |
|----------|-------------|
| `lib/domain/gesuch-composer.ts:40` | `@/app/fundraising/data` |
| `lib/domain/data-exporters.ts:10` | `@/app/fundraising/data` |
| `lib/config/projections.ts:18` | `@/app/fundraising/data` |
| `lib/config/documents.ts:14` | `@/app/finanzen/data` |
| `lib/config/nav.ts:6` | `@/app/finanzen/data` |
| `components/charts/AnnualTrendChart.tsx:13-14` | `@/app/finanzen/data` |

**Root cause:** `app/fundraising/data.ts` (310 lines) and `app/finanzen/data.ts` (140 lines) contain config-level data that belongs in `lib/config/`.

2 broken package.json scripts: `seed:config` and `db:setup` reference deleted files.

### Ground Truth #4: Automate the Mechanical

**Rating: GOOD**

Build pipeline well-automated (prebuild sync, quality gate). One significant gap:

- **No test suite** (HIGH) -- Zero test files, no testing framework installed. 18 domain modules with complex business logic have no automated correctness verification.
- 4 `eslint-disable` instances (all justified or on generated code).

### Ground Truth #5: Simplicity Scales

**Rating: MIXED**

**17 god components exceeding 300 lines:**

| # | File | Lines |
|---|------|-------|
| 1 | `app/fundraising/FundraisingClient.tsx` | **1,072** |
| 2 | `app/fundraising/hub/page.tsx` | 754 |
| 3 | `app/methodik/components.tsx` | 589 |
| 4 | `app/revamp-2030/page.tsx` | 554 |
| 5 | `app/finanzen/FinanzenClient.tsx` | 523 |
| 6 | `app/strategie/page.tsx` | 519 |
| 7 | `app/finanzen/components.tsx` | 433 |
| 8 | `app/fundraising/stiftungen/[slug]/gesuch/GesuchPageClient.tsx` | 429 |
| 9 | `app/fundraising/applications/[id]/page.tsx` | 428 |
| 10 | `app/fundraising/bildung/page.tsx` | 414 |
| 11 | `components/gesuch/GesuchEditPanel.tsx` | 370 |
| 12 | `lib/pdf/gesuch-onepager/index.tsx` | 353 |
| 13 | `components/fundraising/EditApplicationModal.tsx` | 346 |
| 14 | `app/fundraising/stiftungen/FoundationListClient.tsx` | 327 |
| 15 | `app/team/page.tsx` | 312 |
| 16 | `app/page.tsx` | 308 |
| 17 | `components/gesuch/GesuchSubmitSection.tsx` | 305 |

**Positive:** The "2 files vs 5+ files" test passes for all common operations (add foundation, add status, add theme, add metric).

**Performance concern:** Data quality cron runs unscoped `select()` fetching full JSONB `configData` when only `name`/`slug` are needed.

### Ground Truth #6: Correctness Beats Speed

**Rating: STRONG**

- **TypeScript: 0 errors, 0 `any`, 0 `@ts-ignore`, 0 `@ts-expect-error`**
- 1 critical endpoint missing Zod validation (`api/ai/gesuch-section`)
- 0 test coverage for business logic
- 2 console.error in components as runtime guards (acceptable but could be build-time checks)

---

## Phase 2: Best Practices

| Check | Verdict | Details |
|-------|---------|---------|
| Console.log in production | **FAIL** | 13 `console.error` in components/pages, 38 in API routes (acceptable server-side), 31 in scripts (OK) |
| Swiss German (ss/umlauts) | **PASS** | 1 ß in auto-generated DB data (fix in source), all user-facing text uses proper umlauts |
| SQL injection / parameterized | **PASS** | All DB access via Drizzle ORM, no raw string concatenation |
| Naming conventions | **PASS** | Components PascalCase, config kebab-case, utils camelCase |
| API error handling format | **MOSTLY PASS** | 6 routes use `{ error }` instead of `{ success: false, error }` |
| TypeScript strictness | **PASS** | 0 errors, 0 any, strict mode |
| Auth checks | **MOSTLY PASS** | 1 route missing: `/api/documents/**` not in middleware matcher |
| ESLint | **FAIL** | 1 error (`react/no-unescaped-entities` in GesuchPageClient.tsx:159), 7 warnings (unused vars/imports) |

**Console statements in components (should remove or use error boundary):**

| File | Occurrences |
|------|-------------|
| `components/data/NumberWithSource.tsx:43` | 1 |
| `components/data/UnifiedNumberDisplay.tsx:90` | 1 |
| `components/fundraising/PersonalizationPreview.tsx:59` | 1 |
| `components/fundraising/EditApplicationModal.tsx:97` | 1 |
| `components/fundraising/ApplicationCard.tsx:81,86` | 2 |
| `components/fundraising/FundraisingDashboard.tsx:64` | 1 |
| `components/fundraising/ApplicationBoard.tsx:53,137` | 2 |
| `app/fundraising/applications/[id]/page.tsx:79,118,138` | 3 |
| `app/fundraising/stiftungen/FoundationListClient.tsx:96` | 1 |

**ESLint warnings:**

| File | Line | Issue |
|------|------|-------|
| `scripts/rescore.ts:110` | `slug` unused |
| `app/fundraising/applications/[id]/page.tsx:16` | `formatCHF` imported but unused |
| `app/fundraising/applications/[id]/page.tsx:59` | `foundation` assigned but unused |
| `app/gesuch/share/[token]/page.tsx:23` | `extractPurposeCore` imported but unused |
| `hooks/useGesuchOverrides.ts:31` | `savedOverrides` destructured but unused |
| `lib/config/foundations/stiftungen-generated.ts:7` | Unused eslint-disable directive |
| `lib/domain/bridge-composer.ts:15` | `TYPE_VERBS` assigned but unused |

---

## Phase 3: Mission Alignment

| Dimension | Score | Rating |
|-----------|-------|--------|
| Data Transparency | 8/10 | **Mostly Implemented** -- NumberInspector, DataSourceBadge, 25+ metric registry entries with sources. Weak: some social metrics are estimates, `lastUpdated` often null. |
| Viewer-First Design | 8/10 | **Mostly Implemented** -- Dashboard opens with key stats, foundation profiles answer "why care?" first. Share pages tailored for foundation officers. |
| Foundation Profiles as Conversations | 10/10 | **Fully Implemented** -- FitAnalysis, theme alignment, approach steps, readiness checklists, bridge composer, gesuch composer. This is the strongest dimension. |
| Document Generation | 7/10 | **Mostly Implemented** -- 4-page Gesuch PDF, one-pager, shareable landing page. Missing: pitch deck, impact report. |
| Config-Driven Data | 10/10 | **Fully Implemented** -- DB -> sync -> generated TS, stories/metrics/nav all config-driven, 1-file rule works, clean layer separation. |
| Foundation Database Quality | 8/10 | **Mostly Implemented** -- 210 in pipeline, quality gate enforced, two-layer schema (registry + analysis). Gate warns but doesn't block. |
| Access Control | 10/10 | **Fully Implemented** -- HTTP Basic Auth middleware, HMAC-SHA256 share tokens, robots.txt blocking, clean internal/external boundary. |
| Multi-tenancy Readiness | 6/10 | **Partially Implemented** -- 23 ORG-SPECIFIC files marked, ORG_PROFILE consistently used. Gaps: 3 hardcoded org references, stories.ts deeply org-specific (by design), no automated onboarding beyond shell script. |
| **Overall** | **8.5/10** | |

**Value Chain Status:**

| Stage | Status | Evidence |
|-------|--------|----------|
| INGEST | Mostly | Financial data from CSV, metrics in config. No live Kivitendo connection. |
| PRESENT | Fully | Dashboard, MetricCards, NumberInspector, progressive disclosure. |
| FIND | Fully | 210 foundations, fit scoring engine, tier filtering, schwerpunkt discovery. |
| PROFILE | Fully | FitAnalysis, fit narratives, theme alignment, readiness checklist, bridge composer. |
| GENERATE | Mostly | 4-page Gesuch PDF, one-pager, share page. Missing: pitch deck, impact report. |

---

## Phase 4: Improvement Roadmap

### Quick Wins (< 1 hour each)

| # | What | Files | Impact |
|---|------|-------|--------|
| 1 | Fix all bare `grid-cols-2` -> `grid-cols-1 sm:grid-cols-2` | 6 files (applications/[id], FoundationDetailTabs, finanzen/components, PersonalizationPreview, ProjektbeschriebSection, bildung/page) | Mobile usability (CRITICAL) |
| 2 | Add `/api/documents/:path*` to middleware matcher | `src/middleware.ts` | Security (HIGH) |
| 3 | Add responsive hero text/padding: `p-6 md:p-12`, `text-3xl md:text-5xl` | `src/app/page.tsx:32-33` | Mobile usability (CRITICAL) |
| 4 | Fix CRON_SECRET bypass: add `if (!process.env.CRON_SECRET) return 401` | 2 cron route files | Security (MEDIUM) |
| 5 | Fix ESLint error (unescaped entity) | `GesuchPageClient.tsx:159` | Build quality (MEDIUM) |
| 6 | Remove 7 unused imports/variables | 6 files per ESLint warnings | Code cleanliness (LOW) |
| 7 | Delete 8 unused domain exports | 5 files | Dead code removal (LOW) |
| 8 | Remove 2 broken package.json scripts | `package.json` | DX (LOW) |
| 9 | Fix customizations GET filter bug | `api/customizations/route.ts:67` | Functional bug (MEDIUM) |
| 10 | Fix remaining `text-[10px]`/`text-[11px]` -> `text-xs` | 6 files, 10 instances | Accessibility (MEDIUM) |

### Medium Effort (1-5 hours each)

| # | What | Impact |
|---|------|--------|
| 1 | **Move `app/fundraising/data.ts` and `app/finanzen/data.ts` to `lib/config/`** -- eliminates 7 upward layer violations | Architecture (HIGH) |
| 2 | **Deduplicate `FoundationAIContext` + add Zod validation to AI endpoint** | SSOT + correctness (HIGH) |
| 3 | **Build AI system prompt from config** -- compose from ORG_PROFILE + NumberSources instead of hardcoded | Multi-tenancy readiness (HIGH) |
| 4 | **Add `role="dialog" aria-modal="true"` to modals** + implement focus trap | Accessibility (HIGH) |
| 5 | **Standardize API error format** -- all routes use `{ success, error }` | Consistency (MEDIUM) |
| 6 | **Fix `APPLICATION_STATUSES` DRY violation** -- derive from config SSOT in 2 API routes | SSOT (LOW) |
| 7 | **Replace raw Tailwind grays with design tokens** -- `text-gray-300/400` -> `text-text-muted` | Accessibility + SSOT (MEDIUM) |
| 8 | **Use COUNT(*) for pagination** instead of fetching all rows | Performance (LOW) |
| 9 | **Add database indexes** on foundationId, status, fitScore, archived, orgId | Performance (LOW) |
| 10 | **Refactor `EditApplicationModal` to use shared `Modal` component** | DRY + accessibility (MEDIUM) |

### Strategic Improvements (5+ hours)

| # | What | Impact |
|---|------|--------|
| 1 | **Decompose `FundraisingClient.tsx` (1,072 lines)** into 5-8 focused sub-components | Maintainability (HIGH) |
| 2 | **Add test suite** -- start with domain logic (gesuch-composer, foundation-filter, budget-calculations, share-token) | Correctness (HIGH) |
| 3 | **Add mobile alternative for kanban board** -- list view with status dropdowns below lg: breakpoint | Mobile usability (HIGH) |
| 4 | **Implement pitch deck document type** | Mission completeness (MEDIUM) |
| 5 | **Implement impact report from live data** | Mission completeness (MEDIUM) |
| 6 | **Migrate middleware to Next.js 16 `proxy` convention** | Future-proofing (LOW) |
| 7 | **Add structured logging** -- replace console.error in API routes with Pino/Winston | Observability (LOW) |

---

## Phase 5: Functional Correctness

### Build Health: PASS
- `npm run build`: 0 errors, 0 warnings, 400 static pages generated
- `npm run sync`: 210 foundations correctly generated from DB
- TypeScript compilation: 0 errors

### Security Findings

| # | Severity | Issue | File |
|---|----------|-------|------|
| 1 | **HIGH** | `/api/documents/**` not protected by middleware -- anyone with an application ID can generate full PDFs with internal content | `middleware.ts` (missing from matcher) |
| 2 | **MEDIUM** | Cron routes accept `Authorization: Bearer undefined` when `CRON_SECRET` env var is unset | `api/cron/data-quality/route.ts:36`, `api/cron/deadline-reminder/route.ts:30` |

### Functional Bugs

| # | Severity | Issue | File |
|---|----------|-------|------|
| 1 | **MEDIUM** | Customizations GET filter only applies first condition -- ignores second when both foundationId and active filters are provided. Missing `and()` import from drizzle-orm. | `api/customizations/route.ts:67` |
| 2 | **LOW** | Pagination count queries fetch all rows into memory instead of `SELECT count(*)` | `api/applications/route.ts:104`, `api/foundations/route.ts:97` |
| 3 | **LOW** | `APPLICATION_STATUSES` defined as plain string array in 2 API routes instead of importing from config SSOT | `api/applications/route.ts:24`, `api/applications/[id]/route.ts:18` |
| 4 | **INFO** | Application detail page uses deprecated non-Promise `params` pattern (works via Proxy but generates runtime warnings) | `app/fundraising/applications/[id]/page.tsx:18` |
| 5 | **INFO** | Next.js 16 middleware deprecation warning -- should migrate to `proxy` convention | Build output |

### What's Working Well

- Auth model is clear and documented -- internal/external split well-thought-out
- Share token system is cryptographically sound (HMAC-SHA256)
- Every API route has try/catch with proper error responses
- Every mutation route uses Zod validation (except the AI endpoint)
- Data pipeline (DB -> sync -> generated TS -> UI) is reliable
- Foundation quality gate runs at import time
- All page components handle 404 cases with `notFound()`
- Activity logging on all mutations
- robots.txt correctly disallows internal and share paths

---

## Phase 6: UI/UX & Responsive Design

### CRITICAL -- Broken Mobile Layouts (6 findings)

| # | Issue | File | Lines | Fix |
|---|-------|------|-------|-----|
| C1 | `grid-cols-2` without mobile fallback (5 grids) | `app/fundraising/applications/[id]/page.tsx` | 220, 241, 264, 302, 357 | `grid-cols-1 sm:grid-cols-2` |
| C2 | Hero `text-5xl` + `p-12` overflows on 375px | `app/page.tsx` | 32-33 | `p-6 md:p-12`, `text-3xl md:text-5xl` |
| C3 | `min-w-[300px]` flex child causes overflow | `app/strategie/components.tsx` | 20 | `min-w-0 sm:min-w-[300px]` |
| C4 | `grid-cols-2` without mobile fallback | `components/fundraising/PersonalizationPreview.tsx` | 167 | `grid-cols-1 sm:grid-cols-2` |
| C5 | `grid-cols-2` without mobile fallback | `app/fundraising/stiftungen/[slug]/FoundationDetailTabs.tsx` | 198 | `grid-cols-1 sm:grid-cols-2` |
| C6 | `grid-cols-2` without mobile fallback | `app/finanzen/components.tsx` | 166 | `grid-cols-1 sm:grid-cols-2` |

### HIGH -- Significant Usability Issues (8 findings)

| # | Issue | File |
|---|-------|------|
| H1 | Kanban board (1600px+ wide) unusable on mobile -- no alternative view | `components/fundraising/ApplicationBoard.tsx` |
| H2 | Kanban action buttons use `p-1` (28x28px) -- below 44x44px minimum | `components/fundraising/ApplicationCard.tsx:126-141` |
| H3 | `grid-cols-2` without `grid-cols-1` base | `components/gesuch/ProjektbeschriebSection.tsx:76` |
| H4 | `grid-cols-2` without mobile fallback | `components/foundation/filters/ResearchStatsGrid.tsx:13` |
| H5 | `min-w-[280px]` forces overflow on mobile | `app/preismodell/page.tsx:162` |
| H6 | FundraisingClient (1072 lines) with only 15 responsive breakpoints | `app/fundraising/FundraisingClient.tsx` |
| H7 | No `role="dialog"` or `aria-modal` on any modal | `components/ui/Modal.tsx`, `EditApplicationModal.tsx` |
| H8 | No `sr-only` text anywhere in codebase | Codebase-wide |

### MEDIUM -- Polish Issues (8 findings)

| # | Issue | Details |
|---|-------|---------|
| M1 | 10 instances of `text-[10px]`/`text-[11px]` (below 12px minimum) | CollapsibleSection, CountdownTimer, Column, AddToPipelineButton, FilterSidebar, FoundationListClient |
| M2 | 172 uses of `text-xs` (12px) across components -- high density of small text | Pattern awareness |
| M3 | 42 instances of raw Tailwind grays (`text-gray-300/400/500`) instead of design tokens | Contrast + SSOT violation |
| M4 | `EditApplicationModal` duplicates Modal pattern instead of using shared component | DRY violation |
| M5 | Nav mega menu `w-[640px]` may clip on 1024px screens | `components/layout/Nav.tsx:31` |
| M6 | `PageHeader` uses `p-8` without mobile scaling | `components/layout/PageHeader.tsx:13` |
| M7 | God components (17 files > 300 lines) are maintenance risk for UI quality | See Phase 1 list |
| M8 | Table component has no empty state | `components/ui/Table.tsx` |

### LOW -- Nice-to-Have (6 findings)

| # | Issue |
|---|-------|
| L1 | Only 5 `focus:`/`focus-visible:` instances in components (gap in page-level elements) |
| L2 | Only 12 ARIA attributes total -- missing `aria-live`, `aria-describedby`, `role="status"` |
| L3 | Only 9 proper `flex-col sm:flex-row` responsive patterns in entire codebase |
| L4 | FilterDrawer close button `p-1.5` (32x32px) -- below 44px minimum |
| L5 | `app/fundraising/bildung/page.tsx:367` -- another bare `grid-cols-2` |
| L6 | No `aria-live` regions for dynamic content (loading states, error messages) |

### Positive Patterns

- Navigation: proper mobile hamburger menu with body scroll lock and min-h-11 touch targets
- FilterDrawer: `max-w-[85vw]` prevents overflow, body scroll lock, proper backdrop
- FoundationCard: correct `flex-col sm:flex-row` responsive pattern
- Gesuch sections: mostly use `grid-cols-1 sm:grid-cols-2` correctly
- Modal.tsx: handles Escape key and body scroll lock
- Design tokens: coherent semantic color system in globals.css
- MetricGrid: dynamically computes responsive grid classes

---

## Action Items (Prioritized)

### Priority 1: Security (do first)

1. Add `'/api/documents/:path*'` to middleware matcher in `src/middleware.ts`
2. Add `if (!process.env.CRON_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })` before bearer token comparison in both cron routes

### Priority 2: Critical Mobile Fixes (quick wins, high impact)

3. Fix all bare `grid-cols-2` -> `grid-cols-1 sm:grid-cols-2` across 8 files (C1, C4, C5, C6, H3, H4, L5)
4. Add responsive hero text/padding in `page.tsx`: `p-6 md:p-12`, `text-3xl md:text-5xl`, `text-lg md:text-2xl`
5. Fix `min-w-[300px]` overflow in `strategie/components.tsx` and `min-w-[280px]` in `preismodell/page.tsx`
6. Fix remaining `text-[10px]`/`text-[11px]` -> `text-xs` (10 instances across 6 files)

### Priority 3: Functional Bugs

7. Fix customizations GET filter: import `and` from drizzle-orm and use `and(...conditions)` instead of `conditions[0]`
8. Fix ESLint error in `GesuchPageClient.tsx:159` (unescaped entity)
9. Remove 7 unused imports/variables per ESLint warnings

### Priority 4: Architecture (medium effort, high value)

10. Move `app/fundraising/data.ts` and `app/finanzen/data.ts` to `lib/config/` -- eliminates 7 layer violations
11. Deduplicate `FoundationAIContext` -- delete inline definition in route.ts, import from `lib/domain/ai-context.ts`
12. Add Zod validation to AI endpoint (`api/ai/gesuch-section`)
13. Build AI system prompt from `ORG_PROFILE` + `NumberSources` instead of hardcoded

### Priority 5: Accessibility

14. Add `role="dialog" aria-modal="true" aria-labelledby="modal-title"` to Modal and EditApplicationModal
15. Replace raw Tailwind grays (`text-gray-300/400`) with design token equivalents (`text-text-muted`)
16. Add minimum touch target sizes (`min-h-11 min-w-11`) to kanban action buttons

### Priority 6: Code Quality

17. Standardize API error format: all routes use `{ success: false, error }` consistently
18. Delete 8 unused domain exports, 1 unused component (FilterBar), 1 dead module (domain/fit-scoring.ts)
19. Remove 2 broken package.json scripts (`seed:config`, `db:setup`)
20. Use `SELECT count(*)` for pagination instead of fetching all rows

### Priority 7: Strategic (longer term)

21. Decompose `FundraisingClient.tsx` (1,072 lines) into focused sub-components
22. Add test suite starting with domain logic (gesuch-composer, foundation-filter, budget-calculations)
23. Add mobile alternative view for kanban board (list with status dropdowns)
24. Refactor `EditApplicationModal` to use shared `Modal` component
25. Implement pitch deck and impact report document types
