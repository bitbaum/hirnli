# Codebase Audit Report

**Date**: 2026-03-11
**Auditor**: Claude Code (Opus 4.6)
**Branch**: main
**Commit**: 027a7b1 (+ uncommitted bug fixes from current session)
**Previous Audit**: 2026-03-05 (fa82fcb)

---

## Executive Summary

Fourth comprehensive audit of revamp-info, a fundraising intelligence platform built with Next.js 16 + TypeScript + Tailwind CSS v4 + Zod 4. Since the last audit (6 days ago), major work was done on: scoring model simplification (19 concepts → 3), gesuch editor enhancements (anschreiben editing, auto-save, AI rewrite), comprehensive bug hunt (20+ bugs fixed across security, data integrity, and UX), and circular dependency resolution.

**Improved since last audit:** God components reduced from 20 to 8 (>300 lines) through decomposition of FundraisingClient.tsx, GesuchPageClient.tsx, and ApplicationPage. API error.message leak fixed (0 remaining, down from 1). Security hardened: constant-time comparison on all auth paths (middleware, share tokens, cron routes). Scoring model crystallized with clear 3-layer architecture documented in CLAUDE.md. Gesuch editor now supports full anschreiben editing with auto-save and AI rewrite. Circular dependency in foundations/index.ts resolved via lazy async import.

**Still concerning:** 13 scripts lack `.catch()` on `main()` calls. Duplicated interfaces across scripts (ESAFoundation in 4 active files, ResearchDepth in 4 files, slugify in 4 files). No test suite. No list virtualization for 1,300+ foundation items. Missing shared loading/error state components. `data_quality` column exists in DB but not in Drizzle schema (vestigial).

**Overall verdict:** Architecture is clean and well-documented. Security posture significantly improved. Gesuch workflow is feature-complete. The main gaps are: script cleanup/deduplication, test suite, and UI polish (shared loading states, list virtualization).

---

## Health Score

| Area | Score | Prev | Delta | Notes |
|------|-------|------|-------|-------|
| First Principles | 8/10 | 7 | +1 | God components halved (20→8). 11 unused exports. Config-driven SSOT intact. |
| Best Practices | 8.5/10 | 8 | +0.5 | 0 TS errors, 0 `any`, 0 `@ts-ignore`. ESLint: 0 errors, 4 warnings. Error leaks: 0. |
| Mission Alignment | 9/10 | 9 | = | All 5 value chain stages operational. 3 document types working. Pitch deck + impact report planned. |
| Functional Correctness | 8.5/10 | 7.5 | +1 | All auth paths constant-time. Cron routes properly excluded from middleware. 20+ bugs fixed. |
| UI/UX & Responsive | 7.5/10 | 7.5 | = | Mobile-first CSS. Touch targets 9/10. Missing shared loading/error state components. |
| **Overall** | **8.3/10** | **7.8** | **+0.5** | Security hardening + scoring simplification + bug fixes. Main debt: scripts + test suite. |

---

## Phase 1: First Principles

### Ground Truth #1: Software serves humans
- All features serve the fundraising workflow (ingest → present → find → profile → generate)
- Gesuch editor now feature-complete (anschreiben, auto-save, AI rewrite, PDF download)
- 11 unused exports identified (dead code candidates):
  - `RESEARCH_SOURCES`, `TEAM_SUMMARY`, `WORKSHOP_BEST_PRACTICES` (config)
  - `calcSelfFinancingRate`, `countAtLeast`, `getNumber`, `getRecommendations` (domain)
  - `getStatusColor`, `readinessToTier`, `themeStyleSolid`, `validateNumber` (utils)
- 10 archived scripts (3,710 lines) + 4 versioned copies that should be deleted

### Ground Truth #2: State defines behavior (SSOT)
- Foundation data pipeline SSOT intact: DB → sync → generated.ts → UI
- **Violation:** ESAFoundation interface duplicated in 4 active script files
- **Violation:** ResearchDepth type duplicated in 4 scripts (should import from schema)
- **Violation:** slugify() duplicated in 4 scripts (should use scripts/lib/)
- **Violation:** DB connection setup inline in 15+ scripts (should use shared db.ts)
- **Fixed:** `orgId` added to `ORG_PROFILE` — hardcoded `'revamp-it'` replaced in gesuch-overrides and apply-overrides
- **Fixed:** Hardcoded dashboard URL in cron emails replaced with `ORG_PROFILE.platform.url`

### Ground Truth #3: Design for change
- Config-driven architecture properly maintained
- 2-file test passes: adding a foundation field requires only schema + config changes
- 4 versioned script copies remain (v2, v3, v3.1)

### Ground Truth #4: Automate the mechanical
- Research pipeline automates LLM research (triage → research → upsert → sync → build)
- Quality gate enforcement automated via lazy import in foundations/index.ts
- 13 scripts lack error handling (`.catch()` on main())

### Ground Truth #5: Complexity compounds
**God Components (>300 lines) — 8 files (down from 20):**

| Lines | File | Notes |
|-------|------|-------|
| 589 | `src/app/methodik/components.tsx` | 10 section components in one file |
| 445 | `src/components/gesuch/GesuchEditPanel.tsx` | FieldRow inline + AI rewrite |
| 433 | `src/app/finanzen/components.tsx` | Financial sections |
| 422 | `src/app/fundraising/pipeline-methodik/page.tsx` | Static content |
| 414 | `src/app/fundraising/bildung/page.tsx` | Static content |
| 413 | `src/app/fundraising/scoring-methodik/page.tsx` | Static content |
| 413 | `src/app/fundraising/stiftungen/FoundationListClient.tsx` | Complex client |
| 346 | `src/components/fundraising/EditApplicationModal.tsx` | Modal with forms |

**Zero `any` types, zero `@ts-ignore`, zero TODO/FIXME, zero console.log in production code.**

### Ground Truth #6: Correctness beats speed
- 0 TypeScript errors
- 20+ bugs fixed in current session (CRITICAL through LOW)
- Scoring model simplified from 19 concepts to 3 clean layers
- Security: constant-time comparison on all auth paths

---

## Phase 2: Best Practices

### Automated Checks

| Check | Result | Notes |
|-------|--------|-------|
| `npx tsc --noEmit` | PASS (0 errors) | Clean compilation |
| `npx next lint` | 0 errors, 4 warnings | 3 unused vars in scripts, 1 unused eslint-disable in generated file |
| `npm run build` | PASS | 1,359 foundation pages, 176 gesuch pages generated |

### Critical Rules Compliance

| Rule | Status | Details |
|------|--------|---------|
| No console.log in src/ | PASS | 0 instances (scripts use console legitimately) |
| Parameterized queries | PASS | Neon tagged templates + Drizzle ORM throughout |
| Swiss German (ss not ß) | PASS | No ß in user-facing code |
| TypeScript strict | PASS | 0 errors, 0 `any`, 0 `@ts-ignore` |
| API response format | PASS | All 19 routes use `{ success, data/error }` consistently |
| Error message exposure | PASS | 0 routes leak error.message (fixed in this session) |
| Naming conventions | PASS | Components PascalCase, config kebab-case, constants UPPER_SNAKE |

### Console Usage
- `console.error` in 8 component files — all in error-reporting catch blocks (acceptable)
- `console.error` in all 17 API routes — contextual server-side logging (acceptable)
- No `console.log` pollution in production code

---

## Phase 3: Mission Alignment

### Value Chain Assessment

| Stage | Status | Evidence |
|-------|--------|---------|
| 1. INGEST | Implemented | Financial data, impact metrics, foundation DB (16,623), org profile |
| 2. PRESENT | Implemented | Dashboard, financials, wirkung, methodik, team — all with click-to-inspect |
| 3. FIND | Implemented | Foundation list with filters, search, triage script, 1,359 detail pages |
| 4. PROFILE | Implemented | Fit analysis, readiness tiers, priority scoring — 3-layer config-driven model |
| 5. GENERATE | Implemented | Gesuch PDF + one-pager + share pages. 176 gesuch-ready foundations |

### Document Generation

| Document Type | Status | Route |
|---------------|--------|-------|
| Gesuch PDF (full 4-page) | Working | `/api/pdf/gesuch/[slug]` |
| One-pager concept note | Working | `/api/pdf/gesuch/[slug]/onepager` |
| Shareable landing page | Working | `/gesuch/share/[token]` |
| Legacy Gesuch PDF | Working | `/api/documents/gesuch/[id]` |
| Pitch Deck | Not implemented | Planned Phase 2 |
| Impact Report | Not implemented | Planned Phase 2 |

### Data Transparency
- NumberInspector component: click-to-inspect on all dashboard metrics
- Methodology page: comprehensive transparency report with data gaps
- Sources cited in config files with source type (live/derived/estimated)

### Multi-tenancy Readiness
- ORG-SPECIFIC markers on 17 files (all documented)
- Registry/analysis schema split maintained
- `ORG_PROFILE.orgId` now centralizes the DB identifier (fixed in this session)
- One remaining hardcoded name: `'Andreas Hunkeler'` in legacy gesuch route (`src/app/api/documents/gesuch/[id]/route.tsx:100`)

---

## Phase 4: Improvement Roadmap

### Quick Wins (< 1 hour each)

| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| 1 | Add `overflow-x-auto` to BudgetSection tables | `src/components/gesuch/BudgetSection.tsx:64,120,153` | 10 min |
| 2 | Add `sr-only` text for fit stars in FoundationSidebar | `src/components/foundation/FoundationSidebar.tsx:152` | 5 min |
| 3 | Add `role="dialog"` and `aria-modal="true"` to FilterDrawer | `src/components/foundation/FilterDrawer.tsx:34` | 5 min |
| 4 | Add loading/error state for pipeline slugs fetch | `FoundationListClient.tsx:87-101` | 15 min |
| 5 | Add fallback for GesuchPageClient null return | `GesuchPageClient.tsx:86` | 10 min |
| 6 | Standardize focus styles (`focus-visible` everywhere) | `GesuchEditPanel.tsx:119,128`, `FoundationListClient.tsx:244` | 20 min |
| 7 | Move hardcoded contact name to ORG_PROFILE | `src/app/api/documents/gesuch/[id]/route.tsx:100` | 5 min |
| 8 | Delete 11 unused exports | See Phase 1 list | 15 min |

### Medium Effort (1-5 hours)

| # | Issue | Details | Effort |
|---|-------|---------|--------|
| 1 | Create shared `LoadingSkeleton` and `ErrorState` | Extract unified loading/error UI from scattered patterns | 2 hrs |
| 2 | Split `methodik/components.tsx` (589 lines) | Split into `methodik/sections/` directory | 2 hrs |
| 3 | Extract `FieldRow` from GesuchEditPanel | Move to `src/components/gesuch/FieldRow.tsx` | 30 min |
| 4 | Extract duplicated types to scripts/lib/ | ESAFoundation (4 files), ResearchDepth (4), slugify (4) | 1.5 hrs |
| 5 | Add `.catch()` to 13 script `main()` calls | Prevent silent failures | 30 min |
| 6 | Responsive GesuchEditPanel header | Add `flex-col sm:flex-row` for mobile stacking | 15 min |
| 7 | List virtualization for foundation list | Add `@tanstack/react-virtual` for 1,300+ items | 4 hrs |
| 8 | Add focus trapping to Modal | Implement Tab-cycling focus trap | 1.5 hrs |

### Strategic (multi-day)

| # | Initiative | Effort | Priority |
|---|-----------|--------|----------|
| 1 | Test suite (unit tests for domain logic) | 3-5 days | High |
| 2 | Pitch deck generation (Phase 2) | 3-5 days | Medium |
| 3 | Impact report from live data (Phase 2) | 3-5 days | Medium |
| 4 | Batch application submission workflow | 5-7 days | Medium |
| 5 | Multi-tenant onboarding automation (Phase 3) | 5-10 days | Low |

---

## Phase 5: Functional Correctness

### Authentication & Authorization

| Route | Auth | Method | Status |
|-------|------|--------|--------|
| `/fundraising/**` | HTTP Basic Auth | Middleware | PASS |
| `/api/pdf/**` | HTTP Basic Auth | Middleware | PASS |
| `/api/applications/**` | HTTP Basic Auth | Middleware | PASS |
| `/api/gesuch-overrides/**` | HTTP Basic Auth | Middleware | PASS |
| `/api/ai/**` | HTTP Basic Auth | Middleware | PASS |
| `/api/export/**` | HTTP Basic Auth | Middleware | PASS |
| `/api/foundations/**` | HTTP Basic Auth | Middleware | PASS |
| `/api/customizations/**` | HTTP Basic Auth | Middleware | PASS |
| `/api/documents/**` | HTTP Basic Auth | Middleware | PASS |
| `/api/cron/**` | Bearer CRON_SECRET | Route-level | PASS (fixed: removed from middleware, added timingSafeEqual) |
| `/gesuch/share/**` | HMAC token | Public by design | PASS |
| Public pages | None | Intentional | PASS |

### Security Hardening (Fixed in This Session)

| Fix | Before | After |
|-----|--------|-------|
| Middleware password | `===` comparison | `safeEqual()` constant-time (Edge compatible) |
| Share token | `===` comparison | `crypto.timingSafeEqual` |
| Cron routes | Blocked by middleware Basic Auth | Own Bearer token auth, excluded from middleware |
| Cron secret | `!==` comparison | `crypto.timingSafeEqual` |
| Import slug collisions | Name-based dedup only | Slug-based dedup + within-batch collision detection |
| One-pager error leak | `error.message` exposed | Generic error message only |
| rescore.ts priority | Simplified heuristic overwrote DB | Only updates fitScore, preserves existing priority |

### Gesuch Workflow Verification

| Component | Status | Notes |
|-----------|--------|-------|
| 3-step wizard | PASS | Focus → Review/Edit → Submit |
| Override persistence | PASS | Auto-save on blur/navigation, useRef for stale closure fix |
| Anschreiben editing | PASS | 4 fields (subject, opening, themeAlignment, closing) |
| PDF generation | PASS | Full gesuch + one-pager with overrides applied |
| Share page | PASS | HMAC token, no double override, robots noindex |
| Zod validation | PASS | API schema includes anschreiben fields (critical fix) |

### API Routes (19 total)

All routes checked for: auth middleware, error handling, input validation, response format consistency.

**Remaining findings:**

| Severity | Finding | File | Notes |
|----------|---------|------|-------|
| MEDIUM | Applications DELETE is hard delete | `src/app/api/applications/[id]/route.ts:228` | Consider soft delete |
| LOW | ILIKE search unescaped wildcards | `src/app/api/foundations/route.ts:70` | Low risk (auth-protected) |
| LOW | No rate limiting on AI rewrite | `src/app/api/ai/gesuch-section/route.ts` | Mitigated by auth |
| LOW | `data_quality` column not in Drizzle schema | `src/lib/db/schema.ts` (absent) | Vestigial, scripts use raw SQL |

### Data Integrity

- Upsert logic: `GREATEST`/`LEAST` for fitScore/priority (never downgrades)
- Foreign key constraints: present on all references
- Shallow JSONB merge documented as acceptable tradeoff
- Circular dependency resolved via lazy async import

---

## Phase 6: UI/UX & Responsive Design

### Responsive Design: 8/10
- Mobile-first approach confirmed (187 responsive breakpoint classes)
- Grid layouts properly responsive (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- 9 hardcoded pixel widths — all justified (min-width for flex children, desktop-only elements)
- Financial tables have mobile card alternatives (`hidden sm:block` / `sm:hidden`)

### Touch Targets: 9/10
- 44px minimum enforced on 20+ interactive elements via `min-h-11`
- 1 issue: AI preset buttons in GesuchEditPanel are ~24px tall on mobile

### States: 6.5/10
- Loading states present in ~60% of async components
- No shared `LoadingSkeleton` or `ErrorState` component
- Mix of plain text and skeleton patterns (inconsistent)
- `GesuchPageClient` returns `null` when data not ready (blank page)
- FoundationListClient pipeline fetch has no loading/error feedback

### Accessibility: 7/10
- `lang="de-CH"` on `<html>` element
- 21 `aria-label` instances, 19 ARIA `role` attributes
- 123 semantic HTML elements (main, section, article, etc.)
- Tabs component has proper ARIA patterns
- Modal handles Escape key but lacks focus trapping
- Only 1 `sr-only` text in entire codebase (should be more)
- Focus styles inconsistent (`focus:` vs `focus-visible:`)

### Performance
- Foundation list: progressive loading (50 at a time), no virtualization
- Charts: dynamically imported with skeleton fallbacks
- Generated file: 500KB+ (BABEL deoptimises but build succeeds)

---

## Changes Since Last Audit (2026-03-05)

### Scoring Model
- Simplified from 19 overlapping concepts to 3 clean layers (Fit, Readiness, Priority)
- All config in `src/lib/config/fit-scoring.ts` — zero magic numbers in domain engines
- Documented in CLAUDE.md § Scoring Model

### Gesuch Editor
- Added full anschreiben editing (4 fields: subject, opening, themeAlignment, closing)
- Auto-save on step navigation
- Save error display with user feedback
- Reset confirmation dialog
- Fixed stale closure bug (useRef pattern)
- Fixed Zod schema silently stripping anschreiben overrides (CRITICAL)

### Security
- Constant-time comparison on: middleware password, share tokens, cron secrets
- Cron routes excluded from Basic Auth (have own Bearer token auth)
- Import slug collision handling (slug-based dedup + within-batch detection)
- One-pager error leak fixed
- rescore.ts no longer overwrites priorities with simplified heuristic

### Bug Fixes (20+)
- CRITICAL: API Zod schema stripping anschreiben overrides
- HIGH: fitScore=0 showing 1 star, config_data drift on PATCH, import `||` treating 0 as falsy
- MEDIUM: PostBlock address duplication, CHF 0 budget, double override on share page, stale closure, case-sensitive search, division by zero in budget
- LOW: Dead `invitation` method in scoring, stale scoring-methodik text, parseInt NaN guards, pagination count performance

### Improved Metrics
- God components: 20 → 8
- API error.message leaks: 1 → 0
- Security: 5 timing attack vectors → 0
- ESLint errors: 1 → 0

### Regressed Metrics
- None identified

---

## Action Items (Prioritized)

### Immediate (This Week)

1. [x] Fix all timing attack vectors — DONE (middleware, share token, cron routes)
2. [x] Fix API error.message leak — DONE (one-pager route)
3. [x] Fix circular dependency — DONE (lazy async import)
4. [x] Centralize org ID — DONE (ORG_PROFILE.orgId)
5. [ ] Add `overflow-x-auto` to BudgetSection tables
6. [ ] Add `sr-only` text for fit stars in FoundationSidebar
7. [ ] Add loading state for pipeline slugs fetch in FoundationListClient
8. [ ] Delete 11 unused exports

### Short Term (Next Sprint)

9. [ ] Create shared `LoadingSkeleton` and `ErrorState` components
10. [ ] Split `methodik/components.tsx` (589 lines)
11. [ ] Extract `FieldRow` from GesuchEditPanel
12. [ ] Extract duplicated types to scripts/lib/ (ESAFoundation, ResearchDepth, slugify)
13. [ ] Add `.catch()` to 13 script `main()` calls
14. [ ] Consider soft delete for applications (currently hard delete)

### Medium Term (March-April 2026)

15. [ ] Begin test suite — start with domain logic in lib/domain/ (highest ROI)
16. [ ] List virtualization for foundation list (@tanstack/react-virtual)
17. [ ] Implement pitch deck generation (Phase 2 remaining)
18. [ ] Implement impact report generation (Phase 2 remaining)
19. [ ] Add focus trapping to Modal component
20. [ ] Standardize focus styles (focus-visible everywhere)

### Long Term (Q2 2026)

21. [ ] Multi-tenant architecture preparation (Phase 3)
22. [ ] Full E2E test suite with Playwright
23. [ ] Comprehensive accessibility audit with screen reader testing
24. [ ] Batch application submission workflow

---

*Report generated by Claude Code (Opus 4.6) on 2026-03-11*
