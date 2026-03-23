# Codebase Audit Report

**Date**: 2026-03-19
**Auditor**: Claude Code (Opus 4.6)
**Branch**: main
**Commit**: 802b8d1 (+ uncommitted Gesuch workflow improvements)
**Previous Audit**: 2026-03-11 (027a7b1)

---

## Executive Summary

Fifth comprehensive audit of revamp-info, a fundraising intelligence platform built with Next.js 16 + TypeScript + Tailwind CSS v4 + Zod 4. Since the last audit (8 days ago), 10 major Gesuch workflow improvements were implemented: AI auto-draft, pipeline auto-creation, activity logging, version history, readiness scoring, submission checklist, required fields validation, schwerpunkt-aware share links, and a "Meine Gesuche" dashboard. 18 files modified, 9 new files created, +422 lines net.

**Improved since last audit:** Gesuch ↔ Pipeline connected (auto-creates draft on first save). Activity logging throughout (override saves, status changes). Version history with rollback. AI system prompt now config-driven (no hardcoded org metrics). Status transitions enforce required fields (submissionDate, awardedAmount, rejectionReason). Share pages preserve schwerpunkt choice. New "Meine Gesuche" dashboard. Modal component already has focus trapping (was listed as missing — verified present with Tab cycling and focus restoration).

**Still concerning:** No test suite (most critical gap). 13 scripts lack `.catch()`. Duplicated interfaces in scripts. No list virtualization. Some newer components (RequiredFieldsModal, OverrideHistory) need full ARIA markup. Silent error swallowing in `useGesuchOverrides` (`.catch(() => {})`). `alert()`/`confirm()` still used in 2 places.

**Overall verdict:** Architecture remains clean and well-documented. The Gesuch workflow is now fully integrated with the pipeline and has rich features (AI drafting, readiness checks, version history, activity timeline). The main gaps are: test suite, structured logging, and accessibility polish on newer components.

---

## Health Score

| Area | Score | Prev | Delta | Notes |
|------|-------|------|-------|-------|
| First Principles | 8.5/10 | 8 | +0.5 | SSOT intact. Pipeline ↔ Gesuch connected. Config-driven AI prompt. |
| Best Practices | 9/10 | 8.5 | +0.5 | 0 TS errors, 0 `any`, 0 `@ts-ignore`. All API routes structured. Required fields validation. |
| Mission Alignment | 9/10 | 9 | = | All 5 value chain stages operational. 3 document types + schwerpunkt-aware share links. |
| Functional Correctness | 8/10 | 8.5 | -0.5 | Auth solid. New features work. But: silent error swallowing, alert() usage, no error boundaries on new routes. |
| UI/UX & Responsive | 8.5/10 | 7.5 | +1 | Modal focus trapping verified. New components follow responsive patterns. Missing empty states for filtered results. |
| **Overall** | **8.5/10** | **8.3** | **+0.2** | 10 Gesuch improvements shipped. Main debt: test suite + accessibility polish. |

---

## Phase 1: First Principles

### Ground Truth #1: Software serves humans
**Score: 9/10** — Every feature maps to the fundraising workflow. New improvements directly serve user needs: AI auto-draft saves manual effort, readiness checklist guides users, activity timeline provides visibility, "Meine Gesuche" dashboard gives overview. No dead features found.

### Ground Truth #2: State defines behavior (SSOT)
**Score: 9/10** — Exemplary SSOT discipline:
- Foundation pipeline: DB → sync → generated.ts → UI (unchanged, working)
- AI system prompt now assembled from `ORG_PROFILE.missionAreas` (was hardcoded)
- Pipeline auto-created from gesuch save (single source of workflow state)
- Activity log as SSOT for version history (snapshots stored in actionDetails)
- `application-statuses.ts` now SSOT for required fields per status transition

**Remaining violations** (from previous audit, unchanged):
- ESAFoundation interface duplicated in 4 script files
- ResearchDepth type duplicated in 4 scripts
- slugify() duplicated in 4 scripts
- DB connection setup inline in 15+ scripts

### Ground Truth #3: Design for change
**Score: 8.5/10** — Config-driven architecture properly maintained. Adding a status transition rule = 1 config entry in `application-statuses.ts`. Adding a readiness check = 1 entry in `gesuch-readiness.ts`. The `computeGesuchReadiness()` function is a pure domain function with no HTTP or UI dependencies.

### Ground Truth #4: Automate the mechanical
**Score: 7.5/10** — Pipeline entry auto-created on first gesuch save. AI auto-draft generates 3 fields in one click. Readiness score computed automatically from data completeness. But: no automated tests, no CI checks beyond build, 13 scripts still lack error handling.

### Ground Truth #5: Complexity compounds
**Score: 9/10** — No new god components introduced. New files are focused:
- `gesuch-readiness.ts`: 80 lines, pure function
- `ActivityTimeline.tsx`: ~90 lines, single responsibility
- `SubmissionChecklist.tsx`: ~50 lines, local state only
- `RequiredFieldsModal.tsx`: ~100 lines, focused modal

God components from previous audit remain (8 files > 300 lines), unchanged.

### Ground Truth #6: Correctness beats speed
**Score: 7.5/10** — Required fields validation prevents invalid status transitions. Readiness checks verify data completeness before submission. TypeScript strict mode catches type errors. But: no test suite means correctness relies entirely on the type system. Silent `.catch(() => {})` in useGesuchOverrides swallows errors.

---

## Phase 2: Best Practices

### Automated Checks

| Check | Result | Notes |
|-------|--------|-------|
| `npx tsc --noEmit` | PASS (0 errors) | Clean compilation with all 9 new files |
| `npm run build` | PASS | All static pages generated successfully |
| `npx next lint` | 0 errors | Clean |

### Critical Rules Compliance

| Rule | Status | Details |
|------|--------|---------|
| No console.log in src/ | PASS | 0 instances in production code |
| Parameterized queries | PASS | Drizzle ORM throughout, new activity-log route included |
| Swiss German (ss not ß) | PASS | All new UI strings use real umlauts |
| TypeScript strict | PASS | 0 errors, 0 `any`, 0 `@ts-ignore` |
| API response format | PASS | All routes (including 3 new ones) use `{ success, data/error }` |
| Error message exposure | PASS | Generic error messages in all API responses |
| Naming conventions | PASS | All new files follow conventions |
| Auth on protected routes | PASS | New routes covered by existing middleware matcher |

### New Code Quality

| Aspect | Status | Notes |
|--------|--------|-------|
| Activity log API | PASS | Proper query params validation, limit capping, structured response |
| Gesuch readiness | PASS | Pure domain function, no side effects, clear check definitions |
| Required fields modal | PASS | Handles all field types (text, number, date), re-submits on success |
| Override history | PASS | Fetches activity log, computes field diffs, supports rollback via PUT |
| Pipeline auto-creation | PASS | Fire-and-forget with ref guard against repeated calls |

---

## Phase 3: Mission Alignment

### Value Chain Assessment

| Stage | Status | Evidence |
|-------|--------|---------|
| 1. INGEST | Implemented | Financial data, impact metrics, foundation DB (16,623), org profile with missionAreas |
| 2. PRESENT | Implemented | Dashboard, financials, wirkung, methodik, team — all with click-to-inspect |
| 3. FIND | Implemented | Foundation list with filters, search, triage pipeline, 1,377+ detail pages |
| 4. PROFILE | Implemented | Fit analysis, readiness tiers, priority scoring, gesuch readiness checks |
| 5. GENERATE | Implemented | Gesuch PDF + one-pager + share pages + AI auto-draft + version history |

### Document Generation

| Document Type | Status | Notes |
|---------------|--------|-------|
| Gesuch PDF (full 4-page) | Working | With override merging |
| One-pager concept note | Working | With override merging |
| Shareable landing page | Working | Now schwerpunkt-aware via `?s=` param |
| AI auto-draft | Working | Generates foundationBridge + 2 anschreiben fields |
| Pitch Deck | Not yet | Planned Phase 2 |
| Impact Report | Not yet | Planned Phase 2 |

### Gesuch Workflow Completeness

| Feature | Status | Improvement # |
|---------|--------|---------------|
| AI system prompt from config | Done | #1 |
| Pipeline auto-creation | Done | #2 |
| Activity logging | Done | #3 |
| Version history + rollback | Done | #4 |
| AI auto-draft (1-click) | Done | #5 |
| Readiness scoring | Done | #6 |
| Submission checklist | Done | #7 |
| Required fields on status change | Done | #8 |
| Schwerpunkt in share links | Done | #9 |
| "Meine Gesuche" dashboard | Done | #10 |

### Data Transparency
- NumberInspector: click-to-inspect on all dashboard metrics
- Methodology page: comprehensive transparency report
- AI prompt: sources and metrics from ORG_PROFILE (no hidden hardcoded values)
- Readiness checklist: transparent about what's missing

### Swiss Context
- CHF currency throughout
- Swiss German with real umlauts (ä ö ü, ss not ß)
- Zurich address from ORG_PROFILE
- 4-digit postal codes

---

## Phase 4: Improvement Roadmap

### Quick Wins (< 1 hour each)

| # | Issue | File | Priority |
|---|-------|------|----------|
| 1 | ShareButton clipboard missing error handler (silent failure on HTTPS) | `components/ui/ShareButton.tsx:8` | User Impact |
| 2 | RequiredFieldsModal lacks `role="dialog"`, `aria-modal`, `aria-labelledby` | `components/fundraising/RequiredFieldsModal.tsx:66` | User Impact |
| 3 | ErrorAlert missing `aria-live="polite"` for screen reader announcements | `components/ui/ErrorAlert.tsx:22` | User Impact |
| 4 | FoundationListClient has no "0 results" empty state for filtered results | `components/foundation/FoundationListClient.tsx` | User Impact |
| 5 | WhyThisMatters uses hardcoded `border-blue-200`, `bg-blue-50` instead of tokens | `components/layout/WhyThisMatters.tsx:21` | Code Quality |
| 6 | Add `overflow-x-auto` to BudgetSection tables | `components/gesuch/BudgetSection.tsx:64,120,153` | Code Quality |
| 7 | Add `sr-only` text for fit stars in FoundationSidebar | `components/foundation/FoundationSidebar.tsx:152` | Code Quality |
| 8 | Delete 11 unused exports from previous audit | Various config/domain/utils files | Code Quality |
| 9 | Missing null check in financial export for empty org name | `app/api/export/financial/route.ts:10` | Code Quality |
| 10 | ShareButton should have `title` tooltip for clipboard action | `components/ui/ShareButton.tsx:18` | Nice-to-have |

### Medium Effort (1-5 hours each)

| # | Issue | Effort | Priority |
|---|-------|--------|----------|
| 1 | **Test suite setup** — Jest for scoring engine, format utils, API validation | 4-5h | Mission Impact |
| 2 | **Structured logging** — Replace console.error with request IDs across 18+ API routes | 3-4h | Mission Impact |
| 3 | **Fix silent error swallowing** in useGesuchOverrides `.catch(() => {})` → error state | 1h | User Impact |
| 4 | **Replace alert()/confirm()** in useApplicationForm and GesuchEditPanel with Modal | 2h | User Impact |
| 5 | **Add error.tsx + not-found.tsx boundaries** for dynamic route segments | 2h | User Impact |
| 6 | **Foundation data build-time Zod validation** on generated stiftungen-generated.ts | 2h | Mission Impact |
| 7 | **Extract duplicated script types** (ESAFoundation ×4, ResearchDepth ×4, slugify ×4) to scripts/lib/ | 1.5h | Code Quality |
| 8 | **Add `.catch()` to 13 script `main()` calls** | 30m | Code Quality |
| 9 | **RequiredFieldsModal field validation** — Zod-based constraints beyond truthiness | 1h | Code Quality |
| 10 | **Split methodik/components.tsx** (589 lines) into sections/ directory | 2h | Code Quality |

### Strategic Improvements

| # | Improvement | Effort | Priority |
|---|-------------|--------|----------|
| 1 | **E2E test suite** — Playwright for gesuch workflow, pipeline, PDF generation, share pages | 5-8h | Mission Impact |
| 2 | **Comprehensive accessibility audit** — axe DevTools, aria-live regions, semantic dialog | 4-6h | Mission Impact |
| 3 | **API rate limiting** — Per-IP limits on sensitive routes | 2h | Security |
| 4 | **List virtualization** — @tanstack/react-virtual for 1,300+ foundation items | 4h | Performance |
| 5 | **Pitch deck generation** (Phase 2 remaining) | 3-5 days | Medium |
| 6 | **Impact report from live data** (Phase 2 remaining) | 3-5 days | Medium |

### Recommended Execution Order

**Week 1**: Quick wins 1-7 + Medium #3 (silent error catch) — ~8 hours
**Week 2**: Medium #1 (test setup) + Medium #2 (structured logging) — ~8 hours
**Week 3**: Medium #4-6 (alert migration, error boundaries, build validation) — ~6 hours
**Month 2**: Strategic #1 (E2E tests) + Strategic #2 (accessibility) — ~12 hours

---

## Phase 5: Functional Correctness

### Authentication & Authorization

| Route Pattern | Auth Method | Status |
|---------------|-------------|--------|
| `/fundraising/**` | HTTP Basic Auth (middleware) | PASS |
| `/api/pdf/**` | HTTP Basic Auth (middleware) | PASS |
| `/api/applications/**` | HTTP Basic Auth (middleware) | PASS |
| `/api/gesuch-overrides/**` | HTTP Basic Auth (middleware) | PASS |
| `/api/activity-log` | HTTP Basic Auth (middleware) | PASS (new) |
| `/api/ai/**` | HTTP Basic Auth (middleware) | PASS |
| `/api/export/**` | HTTP Basic Auth (middleware) | PASS |
| `/api/foundations/**` | HTTP Basic Auth (middleware) | PASS |
| `/api/cron/**` | Bearer CRON_SECRET (route-level) | PASS |
| `/gesuch/share/**` | HMAC-SHA256 token (public) | PASS |
| Public pages | None (intentional) | PASS |

### Gesuch Workflow Verification

| Component | Status | Notes |
|-----------|--------|-------|
| 3-step wizard | PASS | Focus → Review/Edit → Submit |
| AI auto-draft | PASS | Generates foundationBridge + anschreiben.opening + themeAlignment |
| AI system prompt | PASS | Assembled from ORG_PROFILE.missionAreas (no hardcoded metrics) |
| Pipeline auto-creation | PASS | Draft application created on first gesuch save |
| Override persistence | PASS | Auto-save with activity logging |
| Version history | PASS | Activity log snapshots with rollback support |
| Readiness scoring | PASS | 6 checks, 0-100 score, ready threshold at 60% |
| Submission checklist | PASS | 4 local-state checkboxes |
| Required fields | PASS | Status transitions validate submissionDate/awardedAmount/rejectionReason |
| Share links | PASS | Schwerpunkt preserved via `?s=` query param |
| PDF generation | PASS | Full gesuch + one-pager with overrides applied |
| "Meine Gesuche" | PASS | Lists all foundations with overrides, status, field count |

### API Routes

| Check | Status | Notes |
|-------|--------|-------|
| Structured responses | PASS | All routes return `{ success, data/error }` |
| Input validation | PASS | Zod schemas validate request bodies |
| Required fields enforcement | PASS | 422 response with `missingFields` array on invalid transitions |
| Activity logging | PASS | Override saves logged with full snapshot |
| Auth coverage | PASS | All internal routes protected |

### Remaining Findings

| Severity | Finding | File |
|----------|---------|------|
| MEDIUM | Silent `.catch(() => {})` swallows errors | `hooks/useGesuchOverrides.ts` |
| MEDIUM | `alert()` used for errors | `hooks/useApplicationForm.ts:153,159` |
| MEDIUM | Applications DELETE is hard delete | `app/api/applications/[id]/route.ts:228` |
| LOW | No rate limiting on AI rewrite | `app/api/ai/gesuch-section/route.ts` |
| LOW | ILIKE search unescaped wildcards | `app/api/foundations/route.ts:70` |

---

## Phase 6: UI/UX & Responsive Design

### Responsive Design: 8.5/10

**Strengths:**
- Mobile-first approach with proper breakpoint escalation (`sm:` → `md:` → `lg:` → `xl:`)
- Grid layouts: consistently `grid-cols-1` base → responsive columns
- Navigation: mobile drawer + desktop nav at `lg:` breakpoint
- Foundation detail: mobile quick actions (`lg:hidden`) + desktop sidebar (`lg:grid-cols-[1fr_300px]`)
- Financial tables: mobile card view + desktop table (`hidden sm:block`)
- Typography scales: `text-2xl md:text-3xl`, `text-3xl md:text-5xl`
- Layout constraint: `max-w-7xl` with `px-4` padding throughout

**Gaps:**
- WhyThisMatters uses hardcoded blue colors instead of design tokens
- No "0 results" empty state when foundation filters match nothing
- Some dashboard child components lack individual loading states

### Touch Targets: 9/10

- All buttons use `min-h-11 min-w-11` (44px minimum)
- MobileAccordion items: `min-h-11`
- Tabs: `min-h-11 px-4 py-2.5`
- Button component: 3 size variants (sm: 32px, md: 40px, lg: 48px)
- Minor: Badge text (`text-xs px-2.5 py-0.5`) is small but badges are non-interactive

### Accessibility: 8/10

**Good:**
- Semantic HTML: `<nav>`, `<main>`, `<footer>`, `<table>`, proper heading hierarchy
- ARIA: `aria-expanded`, `aria-controls`, `aria-label`, `aria-hidden`, `aria-current`, `aria-selected`, `aria-valuemin/max/now`
- Focus management: focus trap in Modal (Tab cycling + focus restoration), `focus-visible` outlines
- Keyboard navigation: tabs, accordions, modals all accessible
- `lang="de-CH"` on `<html>` element

**Needs improvement:**
- RequiredFieldsModal missing `role="dialog"`, `aria-modal`, `aria-labelledby`
- ErrorAlert missing `aria-live="polite"` for dynamic announcements
- Some newer components (OverrideHistory drawer) could use more ARIA markup
- Only 1 `sr-only` text in entire codebase

### States Coverage: 7.5/10

| State | Coverage | Notes |
|-------|----------|-------|
| Loading | ~70% | `LoadingState` component exists. Used in "Meine Gesuche", gesuch page, applications. Some dashboard children lack it. |
| Empty | ~60% | "Meine Gesuche" has good empty state. Foundation list missing "0 results" state. |
| Error | ~50% | ErrorAlert exists. Not used in all data-fetching components. Silent error swallowing in hook. |
| Success | ~80% | Copy-to-clipboard confirmation, status change feedback, save confirmation. |

### Design Tokens: 9/10

- Comprehensive token system in `globals.css` (@theme)
- Semantic colors: primary, success, warning, danger
- Theme colors for foundation categorization
- Gradient utility classes for hero sections
- Print styles for Gesuch PDF output
- One violation: WhyThisMatters uses hardcoded `border-blue-200`/`bg-blue-50`

---

## Changes Since Last Audit (2026-03-11)

### New Features (10 Gesuch Improvements)

| # | Feature | Files | Lines |
|---|---------|-------|-------|
| 1 | AI system prompt from config | org-profile.ts, gesuch-section/route.ts | +30 |
| 2 | Pipeline auto-creation on gesuch save | useGesuchOverrides.ts, gesuch-overrides/[slug]/route.ts | +45 |
| 3 | Activity log API + timeline component | api/activity-log/route.ts (new), ActivityTimeline.tsx (new) | +130 |
| 4 | Override version history + rollback | OverrideHistory.tsx (new), StepReview.tsx | +120 |
| 5 | AI auto-draft (1-click) | useGesuchOverrides.ts, StepReview.tsx, GesuchPageClient.tsx | +40 |
| 6 | Gesuch readiness scoring | gesuch-readiness.ts (new), GesuchReadinessChecklist.tsx (new) | +130 |
| 7 | Submission checklist + enhanced submit | SubmissionChecklist.tsx (new), StepSubmit.tsx, GesuchStatusWidget.tsx, GesuchSubmitSection.tsx | +70 |
| 8 | Required fields on status transitions | application-statuses.ts, applications/[id]/route.ts, RequiredFieldsModal.tsx (new), ApplicationBoard.tsx | +120 |
| 9 | Schwerpunkt-aware share links | gesuch/share/[token]/page.tsx, StepSubmit.tsx | +15 |
| 10 | "Meine Gesuche" dashboard | api/gesuch-overrides/route.ts (new), fundraising/gesuche/page.tsx (new), nav.ts | +130 |

### Improved Metrics

| Metric | Previous | Current | Delta |
|--------|----------|---------|-------|
| Gesuch workflow features | 7 | 17 | +10 |
| API routes | 19 | 22 | +3 |
| ARIA attributes | 40 | 45+ | +5 |
| God components (>300 lines) | 8 | 8 | = |
| TypeScript errors | 0 | 0 | = |
| `any` types | 0 | 0 | = |
| Overall health score | 8.3 | 8.5 | +0.2 |

### Verified Fixes from Previous Audit

| Previous Action Item | Status |
|---------------------|--------|
| Modal focus trapping | VERIFIED PRESENT (was listed as missing — Tab cycling + focus restoration confirmed) |
| Gesuch ↔ Pipeline disconnected | FIXED (auto-creates draft on first save) |
| No activity logging | FIXED (override saves + status changes logged) |
| No version history | FIXED (activity log snapshots with rollback) |
| No readiness checks | FIXED (6-check scoring system) |
| No submission workflow | FIXED (checklist + required fields + enhanced mailto) |

---

## Action Items (Prioritized)

### Immediate (This Week)

1. [ ] Fix silent `.catch(() => {})` in useGesuchOverrides → add error state feedback
2. [ ] Add `role="dialog"`, `aria-modal`, `aria-labelledby` to RequiredFieldsModal
3. [ ] Add `aria-live="polite"` to ErrorAlert for screen reader announcements
4. [ ] Add empty state UI for foundation list when filters return 0 results
5. [ ] Replace `alert()`/`confirm()` in useApplicationForm and GesuchEditPanel with Modal
6. [ ] Fix WhyThisMatters hardcoded blue colors → use design tokens
7. [ ] Add ShareButton clipboard error handler

### Short Term (Next Sprint)

8. [ ] **Test suite setup** — Jest for scoring engine, format utils, readiness checks, API validation
9. [ ] **Structured logging** — Request IDs + error context across API routes
10. [ ] Add error.tsx + not-found.tsx boundaries for dynamic route segments
11. [ ] Foundation data build-time Zod validation
12. [ ] Extract duplicated script types to scripts/lib/
13. [ ] Add `.catch()` to 13 script `main()` calls
14. [ ] Add individual loading states to dashboard child components

### Medium Term (April 2026)

15. [ ] E2E test suite with Playwright (gesuch workflow, pipeline, PDF, share pages)
16. [ ] Comprehensive accessibility audit with axe DevTools
17. [ ] API rate limiting on sensitive routes
18. [ ] List virtualization for 1,300+ foundation items
19. [ ] Split methodik/components.tsx (589 lines)

### Long Term (Q2 2026)

20. [ ] Pitch deck generation (Phase 2)
21. [ ] Impact report from live data (Phase 2)
22. [ ] Multi-tenant architecture preparation (Phase 3)
23. [ ] Full E2E test suite with screen reader testing

---

*Report generated by Claude Code (Opus 4.6) on 2026-03-19*
