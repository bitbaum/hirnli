# Data Consistency Report
**Generated:** 2026-02-13
**Status:** ✅ PASSING (Build successful, no critical errors)

> ⚠️ **HISTORICAL SNAPSHOT** — this report reflects state as of
> 2026-02-13. The codebase has changed substantially since (foundation
> count grew from 37 to 1,684, the `geo`-field issue called out below
> was resolved, the document set has expanded). Run `npm run audit`
> for the current pipeline state. Kept as historical context.

---

## ✅ Verified Correct

### 1. Source Files
All referenced source files exist in `public/documents/sources/`:
- ✅ `kontenplan_chart_of_accounts.csv` (6.4 KB)
- ✅ `summen_saldenliste_trial_balance.csv` (7.8 KB)
- ✅ `revamp-it_finanzen_anonymisiert.xlsx` (54 KB)
- ✅ `README_FINANZEN_EXCEL.txt` (11 KB)

### 2. Foundation Export
- ✅ Pulls directly from `STIFTUNGEN_DATA` (SSOT)
- ✅ Always current (no stale data)
- ✅ Exports 37 foundations with all metadata

### 3. Budget Data
- ✅ `budget-scenarios.ts` exists and is properly imported
- ✅ `data.ts` correctly pulls from budget scenarios
- ✅ Build passes without TypeScript errors

### 4. Navigation
- ✅ All internal links valid
- ✅ Hub and Bildung now appear in both Revamp 2030 and Fundraising menus
- ✅ No broken hrefs detected

### 5. Code Quality
- ✅ No TODO/FIXME comments (clean codebase)
- ✅ TypeScript strict mode passing
- ✅ All 248 routes generate successfully

---

## ⚠️ Minor Issues (Non-Critical)

### 1. Hardcoded CHF Amounts
Found hardcoded CHF amounts in presentation pages. These appear to be **intentional** for readability (rounded summary numbers), but should be documented:

**Files with hardcoded amounts:**
- `src/app/revamp-2030/page.tsx` - "CHF 500k-1M für Hub, CHF 525k für Bildung" (summary)
- `src/app/fundraising/FundraisingClient.tsx` - Multiple amounts (dashboard summary cards)
- `src/app/fundraising/bildung/page.tsx` - "CHF 525k bis Selbsttragung", "CHF 175k/Jahr" (repeated)
- `src/app/fundraising/hub/page.tsx` - Badge amounts
- `src/app/team/page.tsx` - "CHF 175k/Jahr für 2× BPL" (multiplication effect example)

**Assessment:**
- These are mostly **rounded summary numbers** for presentation
- Exact amounts are in `budget-scenarios.ts`
- **Recommendation:** Add comments indicating these are summary approximations

**Example fix:**
```tsx
{/* Summary approximation - exact: CHF 525'000 from budget-scenarios.ts */}
<div>CHF 525k bis Selbsttragung</div>
```

### 2. Unused Schema Field
The foundation exporter (`data-exporters.ts` line 82) tries to export `foundation.geo` field, but:
- ❌ Field doesn't exist in schema
- ❌ Field doesn't exist in foundation data
- ✅ Uses safe optional chaining (`geo?.join(', ') || 'CH'`)
- ✅ Doesn't cause errors (defaults to 'CH')

**Recommendation:**
Either:
1. Remove the geo column from CSV export (unused)
2. Add geo field to schema and populate data (if geographic filtering is planned)

---

## 📊 Document Stats

**Total Documents:** 56
- Stiftungsgesuche: 49 (personalized applications)
- Gesuch-Vorlagen: 6 (templates A/B/C/D/network/generisch)
- Generierte Exporte: 3 (financial, foundations, revenue - live generated)
- Quelldateien: 4 (Kivitendo sources - anonymized)

**Document Categories:**
- ✅ `gesuch` - Foundation-specific applications
- ✅ `vorlage` - Template applications
- ✅ `export` - Generated CSV exports
- ✅ `quelle` - Source files (NEW - added 2026-02-13)

---

## 🔄 Recent Changes (2026-02-13)

### Fixed Issues
1. ✅ **Gesuch-Vorlagen card display** - Now shows proper names (e.g., "Gesuch Professionalisierte Förderstiftung")
2. ✅ **"Warum wir langsam sind" section** - Rewritten to be constructive, removed individual blame
3. ✅ **README document** - Added to documents page for Excel file documentation
4. ✅ **Navigation restructure** - Hub/Bildung now in Fundraising menu (in addition to Revamp 2030)
5. ✅ **Documents page** - Separated source files into dedicated section with metadata

### Added Features
- Last updated dates on document cards
- Better document categorization (4 categories instead of 3)
- Improved descriptions emphasizing what each document is for

---

## 🎯 Recommendations

### Priority: LOW
These are presentation/documentation improvements, not data integrity issues.

1. **Add source comments to hardcoded CHF amounts**
   - Helps future maintainers understand which numbers are summaries
   - Example: `{/* Rounded from CHF 525'000 in budget-scenarios.ts */}`

2. **Consider removing unused `geo` field from exporter**
   - Or add to schema if geographic filtering is planned
   - Currently defaults to 'CH' for all foundations

3. **Add data validation script** (optional)
   - Script to verify budget numbers match across pages
   - Run as pre-commit hook or CI check

---

## ✅ Conclusion

**Overall Assessment: EXCELLENT**

The site maintains strong data consistency:
- All data flows from SSOT configs
- No critical bugs or broken links
- Build passes successfully
- Minor presentation layer hardcoding is acceptable for UX (rounded numbers for readability)

The only "issues" found are minor documentation/presentation concerns, not actual data consistency problems.

**Action Required:** None (site is production-ready)
**Optional Improvements:** Add source comments to hardcoded summary numbers
