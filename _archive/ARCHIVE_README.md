# Archived Documentation

**Archive Date:** 2026-02-13
**Reason:** KNOWLEDGE_ARCHITECTURE.md governance - preventing stale data and SSOT violations

---

## Why These Files Were Archived

According to **KNOWLEDGE_ARCHITECTURE.md**, documentation should follow a 3-tier architecture:

- **Tier 1 (SSOT):** Data lives in code (`numbers.ts`, `stories.ts`, etc.)
- **Tier 2 (Derived):** Components read from Tier 1
- **Tier 3 (Documentation):** Explains WHY/HOW, but never stores data

These files violated the 3-tier architecture by containing:
- Specific numbers that should be in `numbers.ts`
- Implementation details that are now complete
- Progress tracking that went stale after completion

---

## Archived Files

### 1. `CONTENT_CORRECTIONS.md`
**Archived:** 2026-02-13
**Reason:** Contains specific numbers (285 kg CO₂, 1,200 laptops, etc.) that duplicate Tier 1 SSOT

**What was preserved:**
- All corrections were applied to code and config files
- Metrics added to `src/lib/config/numbers.ts` with full source metadata
- Content accuracy principles integrated into CLAUDE.md

**Action taken:**
- Data moved to `numbers.ts`
- Corrections applied to all pages
- File archived to prevent future SSOT violations

---

### 2. `IMPLEMENTATION_SUMMARY.md`
**Archived:** 2026-02-13
**Reason:** Implementation is complete - document is now historical record only

**What was preserved:**
- All implementation details are in the codebase
- Architecture decisions documented in CLAUDE.md
- Specific patterns visible in code itself

**Action taken:**
- Verified all mentioned features exist in code
- Moved to archive as historical reference

---

### 3. `FUNDRAISING_AUTOMATION_PROGRESS.md`
**Archived:** 2026-02-13
**Reason:** All 7 phases are complete (see COMPLETE.md) - progress tracking is obsolete

**What was preserved:**
- Final status documented in `COMPLETE.md` (also archived)
- All features implemented and working
- See `/api/`, `/components/fundraising/`, `/lib/db/` for live code

**Action taken:**
- Verified 100% completion
- Archived as historical record of development process

---

### 4. `COMPLETE.md`
**Archived:** 2026-02-13
**Reason:** Completion documentation that served its purpose - now historical

**What was preserved:**
- All systems are operational
- Documentation exists in code comments and README.md
- Setup instructions in DATABASE_SETUP.md (still active)

**Action taken:**
- Verified all 7 phases operational
- Archived as project completion record

---

### 5. `STORYTELLING_IMPLEMENTATION_PLAN.md`
**Archived:** 2026-02-13
**Reason:** Plan is largely implemented - numbers registry and components exist

**What was preserved:**
- `numbers.ts` created with 70+ entries (Phase 1.1 ✅)
- `NumberWithSource` component created (Phase 1.3 ✅)
- Document library structure established (Phase 1.2 ✅)
- Remaining phases (ProcessStep component, Growth mechanics) can be built from plan

**Action taken:**
- Core infrastructure complete
- Archived as reference for remaining phases
- Future work can reference this plan but shouldn't modify it

---

## What Remains Active

These documentation files are still **Tier 3** compliant and remain in project root:

### ✅ Active Documentation

**CLAUDE.md**
- Purpose: Engineering principles and first principles
- Status: Active reference document
- Why keep: Explains WHY, not WHAT - always relevant

**KNOWLEDGE_ARCHITECTURE.md**
- Purpose: SSOT governance rules
- Status: Active policy document
- Why keep: Prevents future violations - living policy

**DATABASE_SETUP.md**
- Purpose: Setup instructions for database
- Status: Active guide
- Why keep: Procedural knowledge - doesn't contain data

**UX_CONSISTENCY_GUIDE.md**
- Purpose: Design patterns and component usage
- Status: Active guide
- Why keep: Explains design principles, not data

**DATA_STORYTELLING_GUIDE.md**
- Purpose: How to present data transparently
- Status: Active guide (extracted from STORYTELLING_IMPLEMENTATION_PLAN)
- Why keep: Ongoing reference for content creation

**README.md**
- Purpose: Project overview and getting started
- Status: Active
- Why keep: Entry point for new developers

---

## Archive Policy

### When to Archive:
1. **Data in documentation** - Move data to code, archive the doc
2. **Implementation complete** - Archive progress/completion docs
3. **Goes stale** - Archive anything that becomes outdated
4. **Duplicates code** - If it's better expressed in code, archive it

### When NOT to Archive:
1. **Explains principles** - Architectural reasoning stays
2. **Setup guides** - Procedural knowledge remains active
3. **Design patterns** - Reusable patterns stay active
4. **Living policies** - Governance docs stay active

### How to Archive:
1. Move file to `_archive/`
2. Update `ARCHIVE_README.md` with reason
3. Verify data/knowledge is preserved elsewhere
4. Commit with message: `chore: archive [filename] - [reason]`

---

## Accessing Archived Files

Archived files remain in git history and are accessible:

```bash
# Read archived file
cat _archive/CONTENT_CORRECTIONS.md

# See when it was archived
git log --follow _archive/CONTENT_CORRECTIONS.md

# Restore if needed (not recommended)
git checkout <commit-hash> CONTENT_CORRECTIONS.md
```

---

## Summary

**5 files archived** to maintain SSOT governance and prevent documentation drift.

**Result:**
- ✅ No data duplication
- ✅ No stale progress docs
- ✅ Active docs focus on principles, not data
- ✅ Codebase is source of truth

**If you're reading this:**
- These files are historical references only
- Do NOT update them - data lives in code
- Do NOT restore them to project root
- DO refer to them for historical context if needed

---

**Last Updated:** 2026-02-13
**Policy:** KNOWLEDGE_ARCHITECTURE.md
