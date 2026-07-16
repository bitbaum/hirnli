# Codebase Audit Report

**Date**: 2026-03-31
**Auditor**: Claude Code
**Branch**: main
**Commit**: d807792

## Executive Summary

The revamp-info codebase is well-architected for a config-driven fundraising platform. The foundation pipeline (DB -> sync -> generated config -> UI) is a model of SSOT. TypeScript strictness is exceptional: zero `any` types, zero `@ts-ignore`, zero `@ts-expect-error` across the entire `src/` directory. All 160 tests pass, type checking is clean, and ESLint reports only 1 warning in a generated file.

The main areas for improvement are: (1) a handful of SSOT violations where values are hardcoded instead of derived from config, (2) one unprotected API route (`/api/activity-log`), (3) touch targets that fall short of 44px in the shared Button component, and (4) two component bundles exceeding 400 lines that should be split.

Overall, the codebase demonstrates strong engineering discipline with clear separation of concerns, config-over-code data management, and consistent patterns. The issues found are rough edges, not structural problems.

## Health Score

| Area | Score | Notes |
|------|-------|-------|
| First Principles | 7.5/10 | Strong SSOT foundation pipeline. Gaps in GesuchOverridesData, competing confidence types, hardcoded CHF 35/h |
| Best Practices | 9/10 | Zero TS errors, 160 tests pass, consistent API patterns, clean lint |
| Mission Alignment | 8.5/10 | All 5 value chain stages implemented. Pitch deck and impact report pending |
| Functional Correctness | 8/10 | Solid auth, HMAC tokens, scoring. One unprotected API route |
| UI/UX & Responsive | 7/10 | Good patterns, but touch targets undersized and god components exist |
| **Overall** | **8/10** | Well-built platform with actionable rough edges |

---

## Phase 1: First Principles

### Ground Truth #1: Software Serves Humans (8/10)

Minimal dead code. A few stale migration scripts remain:
- `src/scripts/migrate-to-database.ts` -- one-time migration, no longer imported
- `src/scripts/migrate-registry.ts` -- one-time migration, no longer imported
- `src/scripts/seed-customization-rules.ts` -- seeder, not imported

### Ground Truth #2: SSOT (7/10)

**Strengths:**
- Foundation data pipeline is exemplary: DB -> sync -> generated config -> UI
- Types derived from Zod schemas throughout (`z.infer<>`)
- Foundation counts derived at runtime from `STIFTUNGEN_DATA.length` -- never hardcoded
- Org identity centralized in `ORG_PROFILE`

**Violations found:**

| Severity | Issue | Location |
|----------|-------|----------|
| Important | `GesuchOverridesData` is a plain interface, not Zod schema. 30+ consumers, read path lacks validation | `src/lib/db/schema.ts:213` |
| Important | Two competing "Confidence" types: `NumberConfidence` (5 values) vs `Confidence` (3 values) | `src/lib/config/numbers.ts:29` vs `src/lib/schemas/metric.ts:10` |
| Important | "CHF 35/h" Eigenleistung rate hardcoded in 3 components instead of referencing `EIGENLEISTUNG_CONFIG.ratePerHour` | `src/components/gesuch/BudgetSection.tsx:115`, `src/lib/pdf/gesuch-dokument/BudgetPDF.tsx:145`, `src/app/fundraising/sections/ThreeYearModel.tsx:173` |
| Important | `ThemeMetadata` is a standalone interface in the schemas directory -- misleading location | `src/lib/schemas/theme.ts:8` |
| Minor | "steuerbefreit gemaess Kanton Zuerich" hardcoded in component -- org-specific legal fact should be in `ORG_PROFILE` | `src/components/gesuch/GesuchSubmitSection.tsx:160` |
| Minor | Fit scoring dimension ranges hardcoded in component instead of derived from config | `src/components/foundation/FitAnalysis.tsx:57-63` |

### Ground Truth #3: Design for Change (7/10)

**"2 files vs 5+ files" test:**
- Adding a foundation field: 1-2 files -- excellent
- Adding a new page: 2 files (page + nav config) -- excellent
- Adding a new theme: 2-3 files -- good
- Changing Eigenleistung rate: 4+ files -- needs fix (hardcoded in 3 places + config)

**God components (>300 lines):**

| File | Lines | Assessment |
|------|-------|------------|
| `src/app/methodik/components.tsx` | 589 | 10+ components in one file -- should split |
| `src/app/finanzen/components.tsx` | 433 | Multiple chart/section helpers -- should split |
| `src/app/fundraising/stiftungen/FoundationListClient.tsx` | 432 | Complex but cohesive |
| `src/app/fundraising/pipeline-methodik/page.tsx` | 423 | Content-heavy -- acceptable |
| `src/lib/domain/gesuch-composer.ts` | 355 | Core domain logic -- acceptable |
| `src/components/fundraising/EditApplicationModal.tsx` | 346 | Complex form -- borderline |

### Ground Truth #4: Automate the Mechanical (8/10)

- Foundation sync pipeline automated (`npm run sync`)
- Quality gate runs at build time
- Static params generated from data
- Format helpers (`formatCHF`, `formatPercent`) used consistently
- No `console.log` in production code -- only `console.error` for actual errors

### Ground Truth #5: Simplicity Scales (8/10)

- Config-driven architecture avoids over-engineering
- No class hierarchies -- plain functions throughout (only `FinanceDataSet` class, justified)
- Scoring config type system is elaborate (8+ interfaces) but earns its complexity

### Ground Truth #6: Correctness Beats Speed (9/10)

- **Zero `any` types** across entire `src/` -- exceptional
- **Zero `@ts-ignore` / `@ts-expect-error`**
- All API routes validate input with Zod `safeParse()`
- Middleware uses constant-time comparison
- Share tokens use HMAC-SHA256 with `timingSafeEqual`
- Only gap: `GesuchOverridesData` JSONB reads use `as` cast without runtime validation

---

## Phase 2: Best Practices

### Automated Checks

| Check | Result |
|-------|--------|
| TypeScript (`tsc --noEmit`) | PASS -- zero errors |
| ESLint | PASS -- 1 warning (generated file) |
| Tests (Vitest) | PASS -- 160/160 across 11 test files |

### Code Quality

| Category | Score | Notes |
|----------|-------|-------|
| Naming Conventions | 10/10 | All files follow PascalCase/camelCase/kebab-case conventions |
| API Error Handling | 9/10 | Consistent `{success, data/error}` across all 21 routes |
| Auth & Security | 9/10 | HMAC tokens, constant-time compare, clear public/private boundary |
| Swiss German | 9/10 | No violations in user-facing strings. Minor ae/oe/ue in code comments only |
| TypeScript Quality | 10/10 | Zero `any`, zero TODOs/FIXMEs |
| Console Hygiene | 9/10 | Only `console.error` for real errors, no debug logging |
| Separation of Concerns | 7/10 | 2 component files >400 lines. Business logic correctly in `lib/domain/` |

---

## Phase 3: Mission Alignment

### Value Chain Assessment

| Stage | Rating | Notes |
|-------|--------|-------|
| **INGEST** | Implemented (8/10) | Financial data 2018-2025 from Kivitendo. Impact metrics in config. Gap: Dec 2025 missing, manual import step |
| **PRESENT** | Implemented (9/10) | Beautiful dashboards with `PageHeader`, `WhyThisMatters`, `NumberInspector`. Every metric click-to-inspect |
| **FIND** | Implemented (8/10) | 1,692 synced foundations. Rich filtering. URL state. CSV export |
| **PROFILE** | Implemented (9/10) | Detail pages with fit narrative, theme alignment, approach steps, similar foundations |
| **GENERATE** | Implemented (8/10) | Full Gesuch PDF + one-pager + share landing page. Pitch deck and impact report pending |

### Cross-Cutting Principles

| Principle | Score | Evidence |
|-----------|-------|---------|
| Data Transparency | 9/10 | `NumberInspector` shows source, formula, confidence per metric |
| Viewer-First | 8/10 | `WhyThisMatters` on every page. Share pages strip internal UI |
| Config-Driven | 9/10 | All data in config files. 17 ORG-SPECIFIC files clearly marked |

---

## Phase 4: Improvement Roadmap

### Quick Wins (<1 hour)

1. **Add `/api/activity-log` to middleware matcher** -- Security fix. Add to `src/middleware.ts:73-84`
2. **Extract "CHF 35/h" to config reference** -- Replace 3 hardcoded instances with `EIGENLEISTUNG_CONFIG.ratePerHour`
3. **Add `taxExemption` to `ORG_PROFILE`** -- Move from `GesuchSubmitSection.tsx:160`
4. **Delete stale scripts** -- Remove `migrate-to-database.ts`, `migrate-registry.ts`, `seed-customization-rules.ts`

### Medium Effort (1-5 hours)

5. **Make `GesuchOverridesData` a Zod schema** -- Create in `src/lib/schemas/`, derive type, add runtime validation on reads
6. **Unify Confidence types** -- Merge `NumberConfidence` and `Confidence` or rename to make distinction explicit
7. **Split `methodik/components.tsx` (589 lines)** -- Extract into `methodik/components/` directory
8. **Split `finanzen/components.tsx` (433 lines)** -- Same pattern
9. **Increase Button touch targets** -- Change `md` size to guarantee 44px minimum

### Strategic Improvements

10. **Pitch deck generation** -- Phase 2 remaining
11. **Impact report from live data** -- Phase 2 remaining
12. **Section-level error boundaries** -- Add `error.tsx` to `/fundraising/` and other sections
13. **Financial data automation** -- Kivitendo API integration or scheduled import

---

## Phase 5: Functional Correctness

### Auth & Security

| Area | Score | Finding |
|------|-------|---------|
| Middleware | 9/10 | Correct constant-time comparison, comprehensive route protection |
| Share Tokens | 10/10 | HMAC-SHA256, `timingSafeEqual`, graceful degradation |
| **`/api/activity-log`** | **0/10** | **Not in middleware matcher, no internal auth** |
| Cron Routes | 10/10 | Separate Bearer token auth (CRON_SECRET) |

### Foundation Pipeline (9/10)

Correct data flow: DB (self-hosted PostgreSQL) -> `npm run sync` -> `stiftungen-generated.ts` -> UI. Quality gate at build time. Two-layer schema (registry vs analysis) properly separated.

### Scoring Model (10/10)

Config-driven computation. 3 dimensions with floors, 17 readiness checks, configurable priority formula. Pure functions consuming config.

### PDF Generation (8/10)

Both Gesuch and one-pager follow correct pattern: validate -> gate check -> compose -> apply overrides -> check readiness -> stream PDF.

---

## Phase 6: UI/UX & Responsive Design

### Mobile-First (7/10)

- 50 app files and 26 component files use responsive classes
- `FilterDrawer` for mobile filter UI
- Grid patterns: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- CsvExportModal footer: `flex-col sm:flex-row` -- correct mobile-first

### Touch Targets (5/10)

Only 22 instances of explicit 44px touch target sizing. Button sizes:
- `sm`: `py-1.5` (~30px) -- too small
- `md`: `py-2.5` (~38px) -- below 44px
- `lg`: `py-3` (~42px) -- borderline

### Loading/Empty/Error States (8/10)

- 5 `loading.tsx` files for key routes
- Global `error.tsx` and `not-found.tsx`
- Empty states in foundation list, application board, documents
- Gap: No section-level error boundaries

### Visual Hierarchy (8/10)

Consistent library: `PageHeader`, `Card`, `WhyThisMatters`, `StoryBridge`, `CTABanner`, `Badge`. 14 UI components.

---

## Action Items (Prioritized)

| # | Priority | Item | Effort | Files |
|---|----------|------|--------|-------|
| 1 | **Critical** | Add `/api/activity-log` to middleware matcher | 5 min | `src/middleware.ts` |
| 2 | High | Extract "CHF 35/h" to `EIGENLEISTUNG_CONFIG.ratePerHour` | 15 min | 3 component files |
| 3 | High | Make `GesuchOverridesData` a Zod schema | 1 hr | `src/lib/db/schema.ts`, `src/lib/schemas/`, API routes |
| 4 | High | Increase Button `md` touch target to 44px | 15 min | `src/components/ui/Button.tsx` |
| 5 | Medium | Add `taxExemption` to `ORG_PROFILE` | 15 min | `org-profile.ts`, `GesuchSubmitSection.tsx` |
| 6 | Medium | Unify or rename competing Confidence types | 30 min | `numbers.ts`, `metric.ts` |
| 7 | Medium | Split `methodik/components.tsx` (589 lines) | 1 hr | New `methodik/components/` directory |
| 8 | Medium | Split `finanzen/components.tsx` (433 lines) | 1 hr | New `finanzen/components/` directory |
| 9 | Low | Delete stale migration scripts | 5 min | 3 script files |
| 10 | Low | Derive `FitAnalysis` scoring ranges from config | 30 min | `FitAnalysis.tsx`, `fit-scoring.ts` |
| 11 | Low | Add section-level error boundaries | 30 min | New `error.tsx` files |
| 12 | Planned | Pitch deck generation | Multi-day | New PDF templates |
| 13 | Planned | Impact report from live data | Multi-day | New report templates |
